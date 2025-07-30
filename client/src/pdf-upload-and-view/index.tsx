import { useState } from "react";
import PdfUpload from "./pdf-upload";
import ChatAndPDFViewer from "./chat-area-and-pdf-viewer";

const Index = () => {
  const [file, setFile] = useState<File | null>(null);
  const [savedFileName, setSavedFileName] = useState<string | null>(null);
  const onClear = () => setFile(null);
  return (
    <>
      {file ? (
        <ChatAndPDFViewer
          file={file}
          onClear={onClear}
          savedFileName={savedFileName}
        />
      ) : (
        <PdfUpload setFile={setFile} setSavedFileName={setSavedFileName} />
      )}
    </>
  );
};

export default Index;
