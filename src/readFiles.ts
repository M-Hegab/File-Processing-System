import * as fs from "node:fs/promises";
import path from "node:path";
import {
  incomingFiles,
  countFiles,
  moveFiles,
  createJsonFile,
  createFolder,
} from "./helpers.js";

const FILES_FOLDER: string = "./Files";
const INCOMING_FOLDER: string = path.join(FILES_FOLDER, "/incoming");
const FAILED_FOLDER: string = path.join(FILES_FOLDER, "/failed");
const PROCESSING_FOLDER: string = path.join(FILES_FOLDER, "/processing");
const PROCESSED_FOLDER: string = path.join(FILES_FOLDER, "/processed");
const JSON_FOLDER: string = path.join(FILES_FOLDER, "/json");
interface ProcessingResult {
  id: number;
  name: string;
  content: string;
  sizeBytes: number;
  characters: number;
  words: number;
  lines: number;
  processedAt: string;
}

async function buildProcessingResult(
  file: string,
  content: string,
  index: number,
): Promise<ProcessingResult> {
  return {
    id: index,
    name: path.basename(file),
    content: content,
    sizeBytes: (await fs.stat(file)).size,
    characters: content.length,
    words: content.trim() === "" ? 0 : content.trim().split(/\s+/).length,
    lines: content === "" ? 0 : content.split(/\r?\n/).length,
    processedAt: new Date().toISOString(),
  };
}

async function moveToFailed(file: string): Promise<void> {
  try {
    await createFolder(FAILED_FOLDER);
    await fs.rename(file, path.join(FAILED_FOLDER, path.basename(file)));
  } catch (moveErr) {
    console.error(
      `Failed to move ${path.basename(file)} to failed folder:`,
      moveErr,
    );
  }
}

async function cleanupJsonArtifact(filePath: string): Promise<void> {
  const jsonFile = path.join(
    JSON_FOLDER,
    path.basename(filePath).toLowerCase().replace(".txt", ".json"),
  );
  try {
    await fs.unlink(jsonFile);
  } catch (err) {
    const nodeErr = err as NodeJS.ErrnoException;
    if (nodeErr.code !== "ENOENT") {
      console.error(
        `Error cleaning up JSON artifact for ${path.basename(filePath)}:`,
        err,
      );
    }
  }
}

async function readFiles(dirPath: string): Promise<void> {
  const files2Process: number = await countFiles(INCOMING_FOLDER);
  let index: number = 1;
  while (index <= files2Process) {
    let file: string = await incomingFiles(dirPath);
    if (!file) {
      console.warn(`No .txt file found to process, stopping.`);
      break;
    }
    console.log(`Processing now: ${path.basename(file)}`);
    try {
      const content: string = await fs.readFile(file, "utf-8");
      file = await moveFiles(INCOMING_FOLDER, PROCESSING_FOLDER, file);
      const processingResult = await buildProcessingResult(file, content, index);
      await createJsonFile(JSON_FOLDER, file, processingResult);
      await moveFiles(PROCESSING_FOLDER, PROCESSED_FOLDER, file);
      console.log(`Processed Sucessfully: ${path.basename(file)}`);
    } catch (err) {
      console.error(`Error processing ${path.basename(file)}:`, err);
      await moveToFailed(file);
      await cleanupJsonArtifact(file);
    }
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

export {
  readFiles,
  processingFiles,
  FILES_FOLDER,
  INCOMING_FOLDER,
  FAILED_FOLDER,
  PROCESSING_FOLDER,
  PROCESSED_FOLDER,
  JSON_FOLDER,
};
