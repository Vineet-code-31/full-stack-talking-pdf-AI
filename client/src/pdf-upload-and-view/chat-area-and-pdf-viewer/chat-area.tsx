import { Send } from "@mui/icons-material";
import {
  Stack,
  TextareaAutosize,
  Typography,
  Box,
  IconButton,
} from "@mui/material";
import { useState } from "react";

const ChatArea = ({ savedFileName }: { savedFileName: string | null }) => {
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hi, Your document is ready. You can now ask questions about your document",
    },
  ]);
  const [textValue, setTextValue] = useState<string>("");

  const handleMessages = async () => {
    if (textValue.trim() === "") return;
    setMessages((prev: any) => [
      ...prev,
      { sender: "user", text: textValue },
      { sender: "bot", text: "Processing your request..." },
    ]);
    try {
      let response = await fetch(`http://localhost:8000/query`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileName: savedFileName ?? "1753795100421-Vineet Chauhan Web Dev.pdf",
          query: textValue,
        }),
      });
      // let data = await response.json();
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to start AI stream.");
      }
      console.log(response);
      if (!response.body) {
        return;
      }
      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let accumulatedText = "";

      // Loop to read the stream
      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          console.log("Stream complete.");
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        // Process each chunk for SSE format (data: {JSON}\n\n)
        const lines = chunk.split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.substring(6));
              if (data.event === "end") {
                console.log("End event received from AI stream.");
                reader.cancel(); // Close the stream
                break; // Exit the loop
              }
              accumulatedText += data.text;
              setMessages((prev: any) => {
                const old = [...prev];
                const updatedText = { ...old.at(-1), text: accumulatedText };
                old.pop();
                return [...old, updatedText];
              });
            } catch (e) {
              console.error("Error parsing SSE data:", e, "Line:", line);
            }
          }
        }
      }
    } catch (error) {
      setMessages((prev: any) => {
        const old = [...prev];
        const updatedText = {
          ...old.at(-1),
          text: "Unable to procees your query",
        };
        old.pop();
        return [...old, updatedText];
      });
    }
    setTextValue("");
  };

  return (
    <Stack direction={"column"} width={"50%"} height={"100%"}>
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          mb: 2,
          p: 2,
          background: "#f9f9f9",
        }}
      >
        <Stack gap={1}>
          {messages.map((msg, idx) => (
            <Stack
              key={idx}
              direction={"row"}
              justifyContent={msg.sender === "user" ? "flex-end" : "flex-start"}
            >
              <Box
                sx={{
                  maxWidth: "80%",
                  padding: 0.5,
                  bgcolor: "#E8E8E8",
                  borderRadius: "4px",
                }}
              >
                <Typography variant="body2">{msg.text}</Typography>
              </Box>
            </Stack>
          ))}
        </Stack>
      </Box>
      <Stack
        direction={"row"}
        sx={{
          gap: 2,
          paddingRight: 2,
          alignItems: "center",
          justifyContent: "center",
          border: "1px solid #0000001a",
          borderRadius: "5px",
        }}
      >
        <TextareaAutosize
          minRows={1}
          maxRows={6}
          placeholder="Ask about the document..."
          style={{
            flex: 1,
            border: "none",
            outline: "none",
            fontSize: 16,
            padding: 12,
            borderRadius: 4,
          }}
          value={textValue}
          onChange={(e) => setTextValue(e.target.value)}
        />
        <IconButton onClick={handleMessages}>
          <Send fontSize="large" htmlColor="grey" />
        </IconButton>
      </Stack>
    </Stack>
  );
};

export default ChatArea;
