// Wir haben unterschiedliche Ebenen auf welche wir die Metriken anwenden können

import type { HalsteadMetrics } from "./metrics/halstead";

export type FunctionLocation = {
  startLine: number;
  endLine: number;
};

// Funktions-Ebene (Func <-> Func)
export type FunctionMetrics = {
  name: string;
  location: FunctionLocation;
  halstead: HalsteadMetrics;
  mccabe: number;
  // Optional weitere Metriken in Zukunft
  [key: string]: number | string | FunctionLocation | HalsteadMetrics;
};

// Datei-Ebene (File <-> File)
export type FileMetrics = {
  filePath: string;
  functions: FunctionMetrics[];
  aggregate: {
    halstead: Partial<HalsteadMetrics>;
    mccabe: number;
    functionCount: number;
  };
};

// Programm-Ebene (Multiple Files <-> Multiple Files)
export type DirectoryMetrics = {
  directoryPath: string;
  files: FileMetrics[];
  aggregate: {
    halstead: HalsteadMetrics;
    mccabe: number;
    fileCount: number;
    functionCount: number;
  };
};

// Vergleich von Funktion zu Funktion
export type FunctionComparison = {
  functionA: FunctionMetrics;
  functionB: FunctionMetrics;
  diff: {
    halstead: HalsteadMetrics;
    mccabe: number;
  };
};

// Vergleich von Datei zu Dateien
export type FileComparison = {
  fileA: FileMetrics;
  fileB: FileMetrics;
  comparison: {
    aggregateDiff: {
      halstead: HalsteadMetrics;
      mccabe: number;
    };
    matchedFunctions?: FunctionComparison[];
  };
};

// Vergleich von Ordner zu Ordner
export type DirectoryComparison = {
  dirA: DirectoryMetrics;
  dirB: DirectoryMetrics;
  comparison: {
    aggregateDiff: {
      halstead: HalsteadMetrics;
      mccabe: number;
      fileCount: number;
      functionCount: number;
    };
    matchedFiles?: FileComparison[];
  };
};
