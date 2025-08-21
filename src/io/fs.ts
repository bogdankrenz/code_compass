// File reading/parsing
import * as fs from "fs";
import path from "path";

// TODO: Weitere Datei Endungen checken und ggf. ergänzen
const allowedExtensions = [".ts", ".js", ".tsx", ".jsx"];

const isDesiredPathEnding = (path: string) => {
  return allowedExtensions.some((ext) => path.endsWith(ext));
};

export function getAllFiles(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  const files = entries.flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      return getAllFiles(fullPath);
    }
    if (entry.isFile() && isDesiredPathEnding(fullPath)) {
      return [fullPath];
    }
    return [];
  });

  return files;
}

export function getSubdirectories(rootPath: string): string[] {
  if (!fs.existsSync(rootPath)) return [];
  return fs
    .readdirSync(rootPath, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(rootPath, entry.name));
}
