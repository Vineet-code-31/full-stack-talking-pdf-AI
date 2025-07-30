import {
  Box,
  Button,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import { useCallback, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = "../../public/pdf.worker.min.mjs";

interface IPdfViewer {
  file: any;
  onClear: () => void;
}

const PdfViewer = ({ file, onClear }: IPdfViewer) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDocumentLoadSuccess = (numPages: number) => {
    setNumPages(numPages);
    setLoading(false);
    setError(null);
  };

  const onDocumentLoadError = useCallback((error: any) => {
    console.error("Error loading PDF:", error);
    setError("Failed to load PDF. Please try a different file.");
    setLoading(false);
  }, []);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "50%",
      }}
    >
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}
      <Box
        sx={{
          overflowY: "scroll",
          height: "80vh",
          minWidth: "90vh",
          justifyContent: "center",
          display: "flex",
        }}
      >
        {loading && (
          <CircularProgress
            sx={{
              position: "flex",
              top: "50%",
              left: "50%",
              mt: "-25px",
              ml: "-25px",
            }}
          />
        )}
        <Document
          file={file}
          onLoadSuccess={({ numPages }) => onDocumentLoadSuccess(numPages)}
          onLoadError={onDocumentLoadError}
          loading={
            <Box sx={{ p: 4 }}>
              <CircularProgress />
            </Box>
          }
          error={<Typography color="error">Failed to load PDF.</Typography>}
          noData={<Typography>No PDF file selected.</Typography>}
        >
          <Stack gap={1} alignItems={"center"}>
            {Array.from(new Array(numPages), (_, index) => (
              <Box
                key={`page_${index + 1}`}
                sx={{
                  border: "1px solid #0000001a",
                  boxShadow: "2px 4px 8px #0000001a",
                }}
              >
                <Page
                  pageNumber={index + 1}
                  width={550}
                  height={850}
                  loading={<CircularProgress />}
                  renderAnnotationLayer={false}
                  renderTextLayer={false}
                />
              </Box>
            ))}
          </Stack>
        </Document>
      </Box>
      <Stack direction={"row"} gap={1}>
        <Button
          variant="contained"
          color="secondary"
          onClick={onClear}
          sx={{ mt: 2 }}
        >
          Clear PDF
        </Button>
      </Stack>
    </Box>
  );
};

export default PdfViewer;
