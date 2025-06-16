import { analyzeFile, average } from "./analyzer";
import type { AggregateMetrics, FileMetrics, FunctionMetrics } from "../types";
import fs from "fs";
import type { HalsteadMetrics } from "../metrics/halstead";

// Helper Function zum Lokalisieren von Funktionen
const extractFunctionsFromFile = (code: string, fileContent: string) => {
  const lines = fileContent.split("\n");
  const codeSplitted = code.split("\n");
  const index = lines.findIndex((line) => line.includes(codeSplitted[0] ?? ""));
  return {
    startLine: index + 1,
    endLine: index + codeSplitted.length,
  };
};

function computeAggregate(values: number[]): AggregateMetrics {
  if (values.length === 0) {
    return { total: 0, avg: 0, median: 0 };
  }

  const total = values.reduce((sum, value) => sum + value, 0);
  const avg = total / values.length;

  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  const median =
    sorted.length % 2 === 0
      ? (sorted[middle - 1]! + sorted[middle]!) / 2
      : sorted[middle]!;

  return { total, avg, median };
}

export function generateFileMetrics(filePath: string): FileMetrics {
  const fileContent = fs.readFileSync(filePath, "utf-8");
  const analyzedFunctions = analyzeFile(filePath);

  const functions: FunctionMetrics[] = analyzedFunctions.results.map(
    ({ name, mccabe, halstead }) => {
      const code = ""; // Optional können wir uns den Code Snippet noch ausgeben lassen
      const location = extractFunctionsFromFile(code, fileContent);

      return {
        name,
        mccabe,
        halstead,
        location,
      };
    }
  );
  const volumeValues = functions.map((value) => value.halstead.volume);
  const effortValues = functions.map((value) => value.halstead.effort);
  const difficultyValues = functions.map((value) => value.halstead.difficulty);
  const mccabeValues = functions.map((value) => value.mccabe);

  const aggregate = {
    mccabe: computeAggregate(mccabeValues),
    halstead: {
      volume: computeAggregate(volumeValues),
      effort: computeAggregate(effortValues),
      difficulty: computeAggregate(difficultyValues),
    },
    functionCount: functions.length,
  };

  return {
    filePath,
    functions,
    aggregate,
  };
}
