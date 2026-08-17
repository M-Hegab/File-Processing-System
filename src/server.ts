import dotenv from "dotenv";
import { app } from "./app.js";
import { processingFiles } from "./readFiles.js";
dotenv.config();
const port = process.env.PORT || 3000;

try {
  await processingFiles();
} catch (err) {
  console.error("Fatal error during file processing:", err);
  process.exit(1);
}

app.listen(port, () => {
  console.log(`File Processing System listening on port ${port}`);
});
