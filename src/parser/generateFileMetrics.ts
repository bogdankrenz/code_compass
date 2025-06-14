import { analyzeFile } from "./analyzer";
import type { FileMetrics, FunctionMetrics } from "../types";
import fs from "fs";
import path from "path";
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

  const aggregate = {
    mccabe: functions.reduce((sum, fn) => sum + fn.mccabe, 0),
    halstead: functions.reduce(
      (acc, fn) => ({
        ...acc,
        volume: ((acc.volume as number) + fn.halstead.volume) as number,
        difficulty: ((acc.difficulty as number) +
          fn.halstead.difficulty) as number,
        effort: ((acc.effort as number) + fn.halstead.effort) as number,
      }),
      {
        volume: 0,
        difficulty: 0,
        effort: 0,
      } as HalsteadMetrics
    ),
    functionCount: functions.length,
  };

  return {
    filePath,
    functions,
    aggregate,
  };
}
