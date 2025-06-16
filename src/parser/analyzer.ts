import { calculateMcCabeComplexityAST } from "../metrics/mccabe";
import { extractFunctionsFromFile, getAllFiles } from "../metrics/utils";
import type {
  FileMetrics,
  DirectoryMetrics,
  FunctionLocation,
  FunctionMetrics,
} from "../types";
import {
  calculateHalsteadMetricsAST,
  type HalsteadMetrics,
} from "../metrics/halstead";

type FunctionType = {
  name: string;
  code: string;
  location: {
    start: number;
    end: number;
  };
};

type MetricsResult = {
  name: string;
  mccabe: number;
  halstead: HalsteadMetrics;
  location: FunctionLocation;
};

type AggregateMetrics = {
  avg: number;
  median: number;
};

type FileAnalysis = {
  results: MetricsResult[];
  aggregate: {
    mccabe: AggregateMetrics;
    halstead: {
      effort: AggregateMetrics;
      volume: AggregateMetrics;
      difficulty: AggregateMetrics;
      // optional: weitere Felder
    };
  };
  location?: FunctionLocation;
};

function median(numbers: number[]): number {
  if (numbers.length === 0) return 0;

  const sorted = [...numbers].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1]! + sorted[mid]!) / 2
    : sorted[mid]!;
}

function average(numbers: number[]): number {
  const sum = numbers.reduce((sum, val) => sum + val, 0);
  return numbers.length === 0 ? 0 : sum / numbers.length;
}

function aggregateMetric(values: number[]): AggregateMetrics {
  return {
    avg: average(values),
    median: median(values),
  };
}

export function analyzeFile(filePath: string): FileAnalysis {
  const functions = extractFunctionsFromFile(filePath);

  if (!functions || functions.length === 0) {
    return {
      results: [],
      aggregate: {
        mccabe: { avg: 0, median: 0 },
        halstead: {
          effort: { avg: 0, median: 0 },
          volume: { avg: 0, median: 0 },
          difficulty: { avg: 0, median: 0 },
        },
      },
    };
  }

  const results: MetricsResult[] = functions.map(
    ({ name, code, location }): MetricsResult => ({
      name,
      mccabe: calculateMcCabeComplexityAST(code),
      halstead: calculateHalsteadMetricsAST(code),
      location,
    })
  );

  const halsteadDifficulty = results.map((res) => res.halstead.difficulty);
  const halsteadEffort = results.map((res) => res.halstead.effort);
  const halsteadVolume = results.map((res) => res.halstead.volume);
  const mccabeValues = results.map((res) => res.mccabe);

  const aggregate = {
    mccabe: aggregateMetric(mccabeValues),
    halstead: {
      effort: aggregateMetric(halsteadEffort),
      volume: aggregateMetric(halsteadVolume),
      difficulty: aggregateMetric(halsteadDifficulty),
    },
  };

  return { results, aggregate };
}

export function analyzeDirectory(directoryPath: string): DirectoryMetrics {
  const filePaths = getAllFiles(directoryPath);
  const files: FileMetrics[] = filePaths.map((filePath) => {
    const analysis = analyzeFile(filePath);
    return {
      filePath,
      functions: analysis.results,
      aggregate: {
        mccabe: analysis.aggregate.mccabe.avg,
        halstead: {
          effort: analysis.aggregate.halstead.effort,
          volume: analysis.aggregate.halstead.volume,
          difficulty: analysis.aggregate.halstead.difficulty,
        },
        functionCount: analysis.results.length,
      },
    };
  });

  const allFunctions = files.flatMap((file) => file.functions);
  const allMccabe = allFunctions.map((f) => f.mccabe);
  const allEffort = allFunctions.map((f) => f.halstead.effort);
  const allVolume = allFunctions.map((f) => f.halstead.volume);
  const allDifficulty = allFunctions.map((f) => f.halstead.difficulty);

  return {
    directoryPath,
    files,
    aggregate: {
      mccabe: {
        avg: average(allMccabe),
        median: median(allMccabe),
      },
      halstead: {
        effort: {
          avg: average(allEffort),
          median: median(allEffort),
        },
        volume: {
          avg: average(allVolume),
          median: median(allVolume),
        },
        difficulty: {
          avg: average(allDifficulty),
          median: median(allDifficulty),
        },
      },
      fileCount: files.length,
      functionCount: allFunctions.length,
    },
  };
}
