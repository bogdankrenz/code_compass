// Wir haben unterschiedliche Ebenen auf welche wir die Metriken anwenden können

import type { HalsteadMetrics } from "./core/analysis/halstead";

export type FunctionLocation = {
  startLine: number;
  endLine: number;
};

export type AggregateMetrics = {
  total: number;
  avg: number;
  median: number;
};

export type HalsteadAggregate = {
  effort: AggregateMetrics;
  volume: AggregateMetrics;
  difficulty: AggregateMetrics;
};

// Funktions-Ebene (Func <-> Func)
export type FunctionMetrics = {
  name: string;
  mccabe: number;
  halstead: Pick<HalsteadMetrics, "difficulty" | "volume" | "effort">;
  location: FunctionLocation;
};

// Datei-Ebene (File <-> File)
export type FileMetrics = {
  filePath: string;
  functions: FunctionMetrics[];
  aggregate: {
    halstead: HalsteadAggregate;
    mccabe: AggregateMetrics;
    functionCount: number;
  };
};

// Programm-Ebene (Multiple Files <-> Multiple Files)
export type DirectoryMetrics = {
  directoryPath: string;
  files: FileMetrics[];
  aggregate: {
    halstead: {
      effort: AggregateMetrics;
      volume: AggregateMetrics;
      difficulty: AggregateMetrics;
    };
    mccabe: AggregateMetrics;
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
