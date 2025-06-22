import { analyzeFile } from "./analyzer";
import type { AggregateMetrics, FileMetrics, FunctionMetrics } from "../types";

export function computeAggregate(values: number[]): AggregateMetrics {
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
  const functions = analyzeFile(filePath);

  const mccabeValues = functions.map((value) => value.mccabe);
  const effortValues = functions.map((value) => value.halstead.effort);
  const volumeValues = functions.map((value) => value.halstead.volume);
  const difficultyValues = functions.map((value) => value.halstead.difficulty);

  return {
    filePath,
    functions,
    aggregate: {
      mccabe: computeAggregate(mccabeValues),
      halstead: {
        effort: computeAggregate(effortValues),
        volume: computeAggregate(volumeValues),
        difficulty: computeAggregate(difficultyValues),
      },
      functionCount: functions.length,
    },
  };
}
