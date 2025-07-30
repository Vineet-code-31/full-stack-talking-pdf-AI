import express from "express";
import { savePDF } from "../modules/uplaod_pdf.js";
import multer from "multer";
import { processQuery } from "../modules/ask-question.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file?.originalname}`);
  },
});

const upload = multer({ storage: storage });

router.post("/query", processQuery);
router.post("/upload", upload.single("pdf"), savePDF);

export default router;
