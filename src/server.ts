import dotenv from "dotenv";
import { app } from "./app.js";
import { processingFiles } from "./readFiles.js";
dotenv.config();
const port = process.env.PORT || 3000;

await processingFiles();

app.listen(port, () => {
  console.log(`File Processing System listening on port ${port}`);
});
