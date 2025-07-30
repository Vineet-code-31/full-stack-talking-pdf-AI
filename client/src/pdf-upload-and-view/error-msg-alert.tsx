import { Alert, Box, Collapse } from "@mui/material";
import { useEffect } from "react";

export interface TerrorDetails {
  error: boolean;
  errorMsg: string;
}

interface IErrorMsgModal {
  errorDetails: TerrorDetails;
  setErrorDetails: React.Dispatch<React.SetStateAction<TerrorDetails>>;
}
const ErrorMsgModal = ({ errorDetails, setErrorDetails }: IErrorMsgModal) => {
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setErrorDetails({ error: false, errorMsg: "" });
      }, 5000);
    }
  }, [open]);
  return (
    <Box
      width={"100%"}
      sx={{
        display: "flex",
        position: "absolute",
        justifyContent: "center",
      }}
    >
      <Collapse in={errorDetails.error}>
        <Alert variant="filled" severity="error">
          {errorDetails?.errorMsg}
        </Alert>
      </Collapse>
    </Box>
  );
};

export default ErrorMsgModal;
