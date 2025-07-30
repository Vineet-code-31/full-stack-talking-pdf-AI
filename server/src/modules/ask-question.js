import fs from "fs/promises";
import path from "path";
import pdf from "pdf-parse";
import { pipeline, cos_sim } from "@xenova/transformers";
import ollama from "ollama";

export const processQuery = async (req, res) => {
  try {
    const filename = req.body.fileName;
    const prompt = req.body.query;
    await processAndCachePdf(filename);

    if (!prompt) {
      return res.status(400).send("Prompt is required.");
    }

    const fullResponse = await runOllama(prompt, filename);

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");

    const words = fullResponse?.answer?.split(" ");

    let index = 0;
    const interval = setInterval(() => {
      if (index < words.length) {
        const chunk = words[index] + " ";
        res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
        index++;
      } else {
        res.write(`data: ${JSON.stringify({ event: "end" })}\n\n`);
        clearInterval(interval);
        res.end();
      }
    }, 100);

    req.on("close", () => {
      clearInterval(interval);
    });
  } catch (error) {
    console.error(error);
    res.status(401).json({
      status: 410,
      msg: "Unable to process the query",
    });
  }
};

const pdfCache = new Map();
export async function processAndCachePdf(filename) {
  if (pdfCache.has(filename) && pdfCache.get(filename).status !== "failed") {
    return;
  }

  pdfCache.set(filename, { status: "processing", chunks: [] });

  try {
    const filePath = path.join(process.cwd(), "uploads", filename);
    const dataBuffer = await fs.readFile(filePath);

    const options = {
      pagerender: (pageData) => {
        const textContent = pageData.getTextContent();
        return textContent.then((text) =>
          text.items.map((item) => item.str).join(" ")
        );
      },
    };
    const pdfData = await pdf(dataBuffer, options);

    const chunks = [];
    for (let i = 0; i < pdfData.numpages; i++) {
      const pageText = pdfData.text.split(/\n \n/)[i];
      if (pageText && pageText.trim().length > 50) {
        chunks.push({
          pageNum: i + 1,
          text: pageText.trim().replace(/\s+/g, " "),
        });
      }
    }

    const embedder = await getEmbeddingPipeline();
    for (const chunk of chunks) {
      const embedding = await embedder(chunk.text, {
        pooling: "mean",
        normalize: true,
      });
      chunk.embedding = Array.from(embedding.data);
    }

    pdfCache.set(filename, { status: "processed", chunks });
  } catch (error) {
    console.error(`[${filename}] Failed to process PDF:`, error);
    pdfCache.set(filename, { status: "failed", chunks: [] });
  }
}

let embeddingPipeline = null;
const getEmbeddingPipeline = async () => {
  if (embeddingPipeline === null) {
    embeddingPipeline = await pipeline(
      "feature-extraction",
      "Xenova/all-MiniLM-L6-v2"
    );
  }
  return embeddingPipeline;
};

async function runOllama(question, filename) {
  const cachedData = pdfCache.get(filename);
  if (!cachedData || cachedData.status !== "processed")
    return {
      answer: "Document not available for querying.",
    };

  const { chunks } = cachedData;

  const embedder = await getEmbeddingPipeline();

  const questionEmbedding = await embedder(question, {
    pooling: "mean",
    normalize: true,
  });
  const questionVector = Array.from(questionEmbedding.data);
  for (const chunk of chunks) {
    chunk.similarity = cos_sim(questionVector, chunk.embedding);
  }

  chunks.sort((a, b) => b.similarity - a.similarity);
  const topK = 5;
  const relevantChunks = chunks
    .slice(0, topK)
    .filter((c) => c.similarity > 0.1);

  if (relevantChunks.length === 0) {
    return {
      answer:
        "I couldn't find any relevant information in the document to answer your question.",
    };
  }

  const context = relevantChunks
    .map((c) => `Citation from Page ${c.pageNum}:\n"${c.text}"`)
    .join("\n\n---\n\n");

  const prompt = `
        You are an intelligent assistant. Answer the user's question based *only* on the provided context from a PDF document.
        Your response must be concise.
        Do not use any information outside of the provided context.
        If the context does not contain the answer, say so.

        CONTEXT FROM DOCUMENT:
        ---
        ${context}
        ---

        USER'S QUESTION:
        ${question}

        ANSWER:
    `;

  const response = await ollama.chat({
    model: "llama3.2",
    messages: [{ role: "user", content: prompt }],
  });
  return {
    answer: response.message.content,
  };
}
