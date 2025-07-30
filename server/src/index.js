import express from "express";
import cors from "cors";
import router from "./routes-module/route.js";

const app = express();
const port = 8000;

app.use(express.json());
app.use(cors());

app.use("", router);

app.listen(port, () => {
  console.log("running on port 8000");
});
