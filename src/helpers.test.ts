import { vi, describe, it, expect, beforeEach } from "vitest";
import * as path from "node:path";

const { mkdir, readdir, stat, rename, writeFile } = vi.hoisted(() => ({
  mkdir: vi.fn(),
  readdir: vi.fn(),
  stat: vi.fn(),
  rename: vi.fn(),
  writeFile: vi.fn(),
}));

vi.mock("node:fs/promises", () => ({
  mkdir,
  readdir,
  stat,
  rename,
  writeFile,
}));

import {
  createFolder,
  incomingFiles,
  countFiles,
  moveFiles,
  createJsonFile,
} from "./helpers.js";

type fsStat = { isFile: () => boolean; size: number };

const mockStat = (isFile: boolean = true, size: number = 100) =>
  ({
    isFile: () => isFile,
    size,
  }) as fsStat;


describe("createFolder", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mkdir.mockResolvedValue(undefined);
  });

  it("calls fs.mkdir with recursive: true", async () => {
    await createFolder("/some/path");
    expect(mkdir).toHaveBeenCalledWith("/some/path", { recursive: true });
  });

  it("does not throw when mkdir succeeds", async () => {
    await expect(createFolder("/some/path")).resolves.toBeUndefined();
  });

  it("catches and logs errors without throwing", async () => {
    const error = new Error("mkdir failed");
    mkdir.mockRejectedValue(error);
    const consoleSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    await expect(createFolder("/some/path")).resolves.toBeUndefined();
    expect(consoleSpy).toHaveBeenCalledWith("Error creating folder:", error);
    consoleSpy.mockRestore();
  });
});

describe("countFiles", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mkdir.mockResolvedValue(undefined);
  });

  it("returns count of .txt files only", async () => {
    readdir.mockResolvedValue(["a.txt", "b.csv", "c.txt"]);
    const result = await countFiles("/incoming");
    expect(result).toBe(2);
  });

  it("returns 0 when directory has no .txt files", async () => {
    readdir.mockResolvedValue(["a.csv", "b.json"]);
    const result = await countFiles("/incoming");
    expect(result).toBe(0);
  });

  it("returns 0 when directory is empty", async () => {
    readdir.mockResolvedValue([]);
    const result = await countFiles("/incoming");
    expect(result).toBe(0);
  });

  it("returns 0 on readdir error", async () => {
    readdir.mockRejectedValue(new Error("readdir failed"));
    const consoleSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const result = await countFiles("/incoming");
    expect(result).toBe(0);
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});

describe("incomingFiles", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mkdir.mockResolvedValue(undefined);
  });

  it("returns the path of the last .txt file found", async () => {
    readdir.mockResolvedValue(["a.txt", "b.txt"]);
    stat.mockResolvedValue(mockStat(true));
    const result = await incomingFiles("/incoming");
    expect(result).toBe(path.join("/incoming", "b.txt"));
  });

  it("returns empty string when no .txt files exist", async () => {
    readdir.mockResolvedValue(["a.csv", "b.json"]);
    const result = await incomingFiles("/incoming");
    expect(result).toBe("");
  });

  it("skips non-.txt files with a warning", async () => {
    readdir.mockResolvedValue(["a.csv"]);
    stat.mockResolvedValue(mockStat(true));
    const warnSpy = vi
      .spyOn(console, "warn")
      .mockImplementation(() => undefined);
    const result = await incomingFiles("/incoming");
    expect(result).toBe("");
    expect(warnSpy).toHaveBeenCalledWith(
      "Skipping unsupported file: a.csv",
    );
    warnSpy.mockRestore();
  });

  it("skips subdirectories", async () => {
    readdir.mockResolvedValue(["subdir"]);
    stat.mockResolvedValue(mockStat(false));
    const warnSpy = vi
      .spyOn(console, "warn")
      .mockImplementation(() => undefined);
    const result = await incomingFiles("/incoming");
    expect(result).toBe("");
    expect(warnSpy).toHaveBeenCalledWith(
      "Skipping unsupported file: subdir",
    );
    warnSpy.mockRestore();
  });

  it("catches stat errors per-file and continues", async () => {
    readdir.mockResolvedValue(["a.txt", "b.txt"]);
    stat
      .mockResolvedValueOnce(mockStat(true))
      .mockRejectedValueOnce(new Error("stat failed"));
    const errorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const result = await incomingFiles("/incoming");
    expect(result).toBe(path.join("/incoming", "a.txt"));
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });

  it("returns empty string on readdir error", async () => {
    readdir.mockRejectedValue(new Error("readdir failed"));
    const consoleSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const result = await incomingFiles("/incoming");
    expect(result).toBe("");
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});

describe("moveFiles", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mkdir.mockResolvedValue(undefined);
  });

  it("moves a file to the destination when filePath is provided", async () => {
    rename.mockResolvedValue(undefined);
    const result = await moveFiles("/src", "/dst", "/src/file.txt");
    expect(rename).toHaveBeenCalledWith(
      "/src/file.txt",
      path.join("/dst", "file.txt"),
    );
    expect(result).toBe(path.join("/dst", "file.txt"));
  });

  it("calls createFolder on both directories", async () => {
    rename.mockResolvedValue(undefined);
    await moveFiles("/src", "/dst", "/src/file.txt");
    expect(mkdir).toHaveBeenCalledWith("/src", { recursive: true });
    expect(mkdir).toHaveBeenCalledWith("/dst", { recursive: true });
  });

  it("rethrows when rename fails", async () => {
    const error = new Error("rename failed");
    rename.mockRejectedValue(error);
    const consoleSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    await expect(
      moveFiles("/src", "/dst", "/src/file.txt"),
    ).rejects.toThrow(error);
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it("returns empty string when filePath omitted and no .txt files exist", async () => {
    readdir.mockResolvedValue(["a.csv"]);
    stat.mockResolvedValue(mockStat(true));
    const result = await moveFiles("/src", "/dst");
    expect(result).toBe("");
    expect(rename).not.toHaveBeenCalled();
  });
});

describe("createJsonFile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mkdir.mockResolvedValue(undefined);
  });

  it.each([
    ["/processing/file.txt", "file.json"],
    ["/processing/File.TXT", "file.json"],
  ])(
    "writes JSON to %s as %s",
    async (inputPath: string, expectedName: string) => {
      writeFile.mockResolvedValue(undefined);
      await createJsonFile("/json", inputPath, { id: 1 });
      expect(writeFile).toHaveBeenCalledWith(
        path.join("/json", expectedName),
        JSON.stringify({ id: 1 }),
        "utf-8",
      );
    },
  );

  it("rethrows when writeFile fails", async () => {
    const error = new Error("writeFile failed");
    writeFile.mockRejectedValue(error);
    const consoleSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    await expect(
      createJsonFile("/json", "/processing/file.txt", {}),
    ).rejects.toThrow(error);
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
