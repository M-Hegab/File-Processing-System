import { vi, describe, it, expect, beforeEach } from "vitest";
import * as path from "node:path";

const { readFile, readdir, stat, mkdir, rename, writeFile } = vi.hoisted(
  () => ({
    readFile: vi.fn(),
    readdir: vi.fn(),
    stat: vi.fn(),
    mkdir: vi.fn(),
    rename: vi.fn(),
    writeFile: vi.fn(),
  }),
);

vi.mock("node:fs/promises", () => ({
  readFile,
  readdir,
  stat,
  mkdir,
  rename,
  writeFile,
}));

import {
  processingFiles,
  readFiles,
  INCOMING_FOLDER,
  FAILED_FOLDER,
  PROCESSING_FOLDER,
  PROCESSED_FOLDER,
  JSON_FOLDER,
} from "../readFiles.js";

const mockStat = (isFile: boolean = true, size: number = 100) => ({
  isFile: () => isFile,
  size,
});

describe("processingFiles", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mkdir.mockResolvedValue(undefined);
  });

  it("logs the number of .txt files waiting for processing", async () => {
    readdir.mockResolvedValue(["test.txt"]);
    stat.mockResolvedValue(mockStat(true, 7));
    readFile.mockResolvedValue("hello world");
    rename.mockResolvedValue(undefined);
    writeFile.mockResolvedValue(undefined);

    const logSpy = vi
      .spyOn(console, "log")
      .mockImplementation(() => undefined);

    await processingFiles();

    expect(logSpy).toHaveBeenCalledWith(1, "Files waiting for processing");
    logSpy.mockRestore();
  });

  it("does not process when directory has no .txt files", async () => {
    readdir.mockResolvedValue([]);
    await processingFiles();
    expect(readFile).not.toHaveBeenCalled();
  });
});

describe("readFiles", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mkdir.mockResolvedValue(undefined);
  });

  it("processes a .txt file end-to-end: read, move to processing, create JSON, move to processed", async () => {
    readdir.mockResolvedValue(["test.txt"]);
    stat.mockResolvedValue(mockStat(true, 11));
    readFile.mockResolvedValue("hello world");
    rename.mockResolvedValue(undefined);
    writeFile.mockResolvedValue(undefined);

    await readFiles(INCOMING_FOLDER);

    const fileName = "test.txt";
    const processingPath = path.join(PROCESSING_FOLDER, fileName);

    expect(readFile).toHaveBeenCalledWith(
      path.join(INCOMING_FOLDER, fileName),
      "utf-8",
    );
    expect(rename).toHaveBeenCalledTimes(2);
    expect(rename).toHaveBeenNthCalledWith(
      1,
      path.join(INCOMING_FOLDER, fileName),
      processingPath,
    );
    expect(writeFile).toHaveBeenCalledTimes(1);
    expect(writeFile).toHaveBeenCalledWith(
      path.join(JSON_FOLDER, "test.json"),
      expect.any(String),
      "utf-8",
    );
    expect(rename).toHaveBeenNthCalledWith(
      2,
      processingPath,
      path.join(PROCESSED_FOLDER, fileName),
    );
  });

  it("breaks loop when incomingFiles finds no .txt files", async () => {
    readdir
      .mockResolvedValueOnce(["test.txt"])
      .mockResolvedValueOnce([]);

    await readFiles(INCOMING_FOLDER);

    expect(readFile).not.toHaveBeenCalled();
    expect(rename).not.toHaveBeenCalled();
  });

  it("moves file to failed folder on read error and continues loop", async () => {
    readdir.mockResolvedValue(["bad.txt"]);
    stat.mockResolvedValue(mockStat(true, 7));
    readFile.mockRejectedValue(new Error("read error"));
    rename.mockResolvedValue(undefined);

    await readFiles(INCOMING_FOLDER);

    expect(mkdir).toHaveBeenCalledWith(FAILED_FOLDER, { recursive: true });
    expect(rename).toHaveBeenCalledWith(
      path.join(INCOMING_FOLDER, "bad.txt"),
      path.join(FAILED_FOLDER, "bad.txt"),
    );
  });

  it("processes N files matching countFiles result", async () => {
    readdir
      .mockResolvedValueOnce(["a.txt", "b.txt"])
      .mockResolvedValueOnce(["a.txt"])
      .mockResolvedValueOnce(["b.txt"]);
    stat.mockResolvedValue(mockStat(true, 10));
    readFile.mockResolvedValue("content");
    rename.mockResolvedValue(undefined);
    writeFile.mockResolvedValue(undefined);

    await readFiles(INCOMING_FOLDER);

    expect(readFile).toHaveBeenCalledTimes(2);
    expect(rename).toHaveBeenCalledTimes(4);
  });

  it("does not iterate extra times for non-.txt files in directory", async () => {
    readdir.mockResolvedValue(["test.txt", "data.csv", "other.csv"]);
    stat.mockResolvedValue(mockStat(true, 7));
    readFile.mockResolvedValue("content");
    rename.mockResolvedValue(undefined);
    writeFile.mockResolvedValue(undefined);

    await readFiles(INCOMING_FOLDER);

    expect(readFile).toHaveBeenCalledTimes(1);
  });
});
