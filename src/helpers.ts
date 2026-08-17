import * as fs from "node:fs/promises";
import path from "node:path";

async function createFolder(dirPath: string): Promise<void> {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch (err) {
    console.error("Error creating folder:", err);
  }
}

async function incomingFiles(dirPath: string): Promise<string> {
  await createFolder(dirPath);
  let incomingFile: string = "";
  try {
    const items = await fs.readdir(dirPath);
    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      try {
        const stats = await fs.stat(fullPath);
        if (stats.isFile() && path.extname(item).toLowerCase() === ".txt") {
          incomingFile = fullPath;
        } else {
          console.warn(`Skipping unsupported file: ${path.basename(item)}`);
        }
      } catch (err) {
        console.error(`Error stating file ${path.basename(item)}:`, err);
      }
    }
  } catch (err) {
    console.error("Error reading directory:", err);
  }
  return incomingFile;
}

async function countFiles(dirPath: string): Promise<number> {
  await createFolder(dirPath);
  try {
    const totalFiles = await fs.readdir(dirPath);
    const txtFiles = totalFiles.filter(
      (file) => path.extname(file).toLowerCase() === ".txt",
    );
    return txtFiles.length;
  } catch (err) {
    console.error("Error counting files:", err);
    return 0;
  }
}

async function renameFile(srcPath: string, destPath: string): Promise<void> {
  try {
    await fs.rename(srcPath, destPath);
  } catch (err) {
    console.error(`Error moving file ${path.basename(srcPath)}:`, err);
    throw err;
  }
}

async function moveFiles(
  firstDirPath: string,
  secDirPath: string,
  filePath?: string,
): Promise<string> {
  await createFolder(firstDirPath);
  await createFolder(secDirPath);

  let dest: string = '';
  if (filePath) {
    const fileName = path.basename(filePath);
    dest = path.join(secDirPath, fileName);
    await renameFile(filePath, dest);
  } else {
    const foundFile = await incomingFiles(firstDirPath);
    if (foundFile) {
      const fileName = path.basename(foundFile);
      dest = path.join(secDirPath, fileName);
      await renameFile(foundFile, dest);
    }
  }
  return dest;
}

async function createJsonFile(
  dirPath: string,
  filePath: string,
  data: object = {},
): Promise<void> {
  await createFolder(dirPath);
  const fileName: string = path.basename(filePath);
  const jsonFile = path.join(dirPath, fileName.toLocaleLowerCase().replace(".txt", ".json"));
  try {
    return await fs.writeFile(jsonFile, JSON.stringify(data), "utf-8");
  } catch (err) {
    console.error(`Error writing JSON file ${path.basename(jsonFile)}:`, err);
    throw err;
  }
}

export { incomingFiles, countFiles, moveFiles, createJsonFile, createFolder };
