import { Box, CircularProgress, Paper, Stack, Typography } from "@mui/material";
import { useRef, useState } from "react";
import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined";
import ErrorMsgModal, { type TerrorDetails } from "./error-msg-alert";

interface IPdfUpload {
  setFile: React.Dispatch<React.SetStateAction<File | null>>;
  setSavedFileName: React.Dispatch<React.SetStateAction<string | null>>;
}

const PdfUpload = ({ setFile, setSavedFileName }: IPdfUpload) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [errorDetails, setErrorDetails] = useState<TerrorDetails>({
    error: false,
    errorMsg: "",
  });
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const handleDrop = async (event: {
    preventDefault: () => void;
    dataTransfer: { files: Iterable<unknown> | ArrayLike<unknown> };
  }) => {
    event.preventDefault();
    setIsDragging(false);
    setUploadingFile(true);
    const files = Array.from(event.dataTransfer.files) as File[];
    const file = files[0];

    if (file.type !== "application/pdf") {
      setErrorDetails({
        error: true,
        errorMsg: "Not a valid file. Only accepts .pdf",
      });
      setUploadingFile(false);
      return;
    }
    const formData = new FormData();
    formData.append("pdf", file);

    try {
      const response = await fetch("http://localhost:8000/upload", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      if (result.status === 200) {
        setFile(file);
        setSavedFileName(result.fileName);
      } else {
        throw new Error(result.msg);
      }
    } catch (error) {
      console.log(error);
      setSavedFileName(null);
      setErrorDetails({
        error: true,
        errorMsg: "Some Error Occured",
      });
    }
    setUploadingFile(false);
  };

  const handleAreaClick = () => {
    fileInputRef.current?.click();
  };
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFile(file);
      const formData = new FormData();
      formData.append("pdf", file);

      try {
        const response = await fetch("http://localhost:8000/upload", {
          method: "POST",
          body: formData,
        });
        const result = await response.json();
        console.log(result);
        if (result.status === 200) {
          setSavedFileName(result.fileName);
        }
      } catch (error) {
        console.log(error);
        setSavedFileName(null);
        setUploadingFile(false);
        setErrorDetails({
          error: true,
          errorMsg: "Some Error Occured",
        });
      }
    }
  };
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <ErrorMsgModal
        errorDetails={errorDetails}
        setErrorDetails={setErrorDetails}
      ></ErrorMsgModal>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "95vh",
        }}
      >
        {uploadingFile ? (
          <CircularProgress />
        ) : (
          <Paper
            variant="outlined"
            sx={{
              borderStyle: "dashed",
              backgroundColor: isDragging ? "grey.70" : "grey.50",
              p: 4,
              textAlign: "center",
              cursor: "pointer",
              "&:hover": {
                borderColor: "primary.dark",
                backgroundColor: "primary.A100",
              },
              borderRadius: "12px",
              alignItems: "center",
              justifyContent: "center",
              display: "flex",
            }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleAreaClick}
          >
            <input
              name="pdf_file"
              type="file"
              ref={fileInputRef}
              accept="application/pdf"
              onChange={handleFileSelect}
              style={{ display: "none" }}
              multiple={false}
            />
            <Stack
              direction={"column"}
              spacing={1}
              justifyContent={"center"}
              alignItems={"center"}
            >
              <FileUploadOutlinedIcon
                fontSize="large"
                htmlColor={isDragging ? "primary" : "#757575"}
              />
              <Typography
                variant="h6"
                sx={{
                  fontWeight: "semibold",
                  color: isDragging ? "primary.dark" : "#757575",
                }}
              >
                Drag & Drop your files here
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: isDragging ? "primary.main" : "#757575" }}
              >
                or click to browse
              </Typography>
            </Stack>
          </Paper>
        )}
      </Box>
    </>
  );
};

export default PdfUpload;
