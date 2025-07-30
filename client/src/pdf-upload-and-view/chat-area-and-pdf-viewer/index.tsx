import { Stack } from "@mui/material";
import ChatArea from "./chat-area";
import PdfViewer from "./pdf-viewer";

interface IPdfViewer {
  file: any;
  onClear: () => void;
  savedFileName: string | null;
}

const ChatAndPDFViewer = ({ file, onClear, savedFileName }: IPdfViewer) => {
  return (
    <Stack
      direction={"row"}
      gap={2}
      sx={{
        height: "95vh",
        boxSizing: "border-box",
      }}
      padding={"20px"}
    >
      <ChatArea savedFileName={savedFileName} />
      <PdfViewer file={file} onClear={onClear} />
    </Stack>
  );
};

export default ChatAndPDFViewer;
