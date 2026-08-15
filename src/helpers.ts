import * as fs from "node:fs/promises";
import path from "node:path";

async function createFolder(dirPath: string): Promise<void> {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch (err) {
    console.error("Error creating folder:", err);
  }
}

async function incomingFiles(dirPath: string): Promise<string[]> {
  await createFolder(dirPath);
  const items = await fs.readdir(dirPath);
  const incomingFiles: string[] = [];

  for (const item of items) {
    const fullPath = path.join(dirPath, item);
    const stats = await fs.stat(fullPath);

    if (stats.isFile() && path.extname(item).toLowerCase() === ".txt") {
      incomingFiles.push(fullPath);
    } else {
      console.warn(`Skipping unsupported file: ${path.basename(item)}`);
    }
  }

  return incomingFiles;
}

async function countFiles(dirPath: string): Promise<number> {
  const totalFiles = await incomingFiles(dirPath);
  return totalFiles.length;
}

async function moveFiles(
  firstDirPath: string,
  secDirPath: string,
  filePath?: string,
): Promise<void> {
  await createFolder(firstDirPath);
  await createFolder(secDirPath);
  if (filePath) {
    const fileName = path.basename(filePath);
    const dest = path.join(secDirPath, fileName);

    await fs.rename(filePath, dest);
  } else {
    const processedFiles = await incomingFiles(firstDirPath);
    for (const file of processedFiles) {
      const fileName = path.basename(file);
      const dest = path.join(secDirPath, fileName);

      await fs.rename(file, dest);
    }
  }
}

async function createJsonFile(
  dirPath: string,
  filePath: string,
  data: object = {},
): Promise<void> {
  await createFolder(dirPath);
  const fileName: string = path.basename(filePath);
  const jsonFile = path.join(dirPath, fileName.replace(".txt", ".json"));
  return await fs.writeFile(jsonFile, JSON.stringify(data), "utf-8");
}

export { incomingFiles, countFiles, moveFiles, createJsonFile };
