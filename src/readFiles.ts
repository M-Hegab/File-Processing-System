import * as fs from "node:fs/promises";
import path from "node:path";
import {
  incomingFiles,
  countFiles,
  moveFiles,
  createJsonFile,
} from "./helpers.js";

const FILES_FOLDER: string = "./Files";
const INCOMING_FOLDER: string = path.join(FILES_FOLDER, "/incoming");
// const FAILED_FOLDER: string = path.join(FILES_FOLDER, "/failed");
const PROCESSING_FOLDER: string = path.join(FILES_FOLDER, "/processing");
const PROCESSED_FOLDER: string = path.join(FILES_FOLDER, "/processed");
const JSON_FOLDER: string = path.join(FILES_FOLDER, "/json");
interface processingResult {
  id: number;
  name: string;
  content: string;
  sizeBytes: number;
  characters: number;
  words: number;
  lines: number;
  processedAt: string;
}

async function readFiles(dirPath: string): Promise<void> {
  //   let PocessSucceeded: number = 0;
  //   let PocessFailed: number = 0;
  const files2Process: number = await countFiles(INCOMING_FOLDER);
  let index: number = 1;
  while (index <= files2Process) {
    let file: string = await incomingFiles(dirPath);
    console.log(`Processing now: ${path.basename(file)}`);
    const content: string = await fs.readFile(file, "utf-8");
    file = await moveFiles(INCOMING_FOLDER, PROCESSING_FOLDER, file);
    const processingResult: processingResult = {
      id: index + 1,
      name: path.basename(file),
      content: content,
      sizeBytes: (await fs.stat(file)).size,
      characters: content.length,
      words: content.trim().split(/\s+/).length,
      lines: content.split(/\r?\n/).length,
      processedAt: new Date().toISOString(),
    };
    await createJsonFile(JSON_FOLDER, file, processingResult);
    await moveFiles(PROCESSING_FOLDER, PROCESSED_FOLDER, file);
    console.log(`Processed Sucessfully: ${path.basename(file)}`);
    index++;
  }
}

async function processingFiles(): Promise<void> {
  const files2Process: number = await countFiles(INCOMING_FOLDER);
  console.log(files2Process, "Files waiting for processing");
  if (files2Process !== 0) {
    await readFiles(INCOMING_FOLDER);
  }
}

export { processingFiles };
