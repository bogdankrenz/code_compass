import { calculateMcCabeComplexityAST } from "../core/analysis/mccabe";
import { extractFunctionsFromFile, getAllFiles } from "../core/utils";
import type {
  DirectoryMetrics,
  FunctionMetrics,
} from "../core/analysis/models/types";
import { calculateHalsteadMetricsAST } from "../core/analysis/halstead";
import { computeAggregate, generateFileMetrics } from "./generateFileMetrics";

export function analyzeFile(filePath: string): FunctionMetrics[] {
  const functions = extractFunctionsFromFile(filePath);

  if (!functions || functions.length === 0) return [];

  return functions.map(({ name, code, location }) => ({
    name,
    mccabe: calculateMcCabeComplexityAST(code),
    halstead: calculateHalsteadMetricsAST(code),
    location,
  }));
}

export function analyzeDirectory(directoryPath: string): DirectoryMetrics {
  const filePaths = getAllFiles(directoryPath);
  const files = filePaths.map(generateFileMetrics).filter((files) => !!files);

  const allFunctions = files.flatMap((file) => {
    if (
      file.aggregate.halstead.volume.avg > 0 &&
      file.aggregate.mccabe.avg > 0
    ) {
      return file.functions;
    } else {
      return [];
    }
  });
  const allMccabe = allFunctions.map((f) => f.mccabe);
  const allEffort = allFunctions.map((f) => f.halstead.effort);
  const allVolume = allFunctions.map((f) => f.halstead.volume);
  const allDifficulty = allFunctions.map((f) => f.halstead.difficulty);

  return {
    directoryPath,
    files,
    aggregate: {
      mccabe: computeAggregate(allMccabe),
      halstead: {
        effort: computeAggregate(allEffort),
        volume: computeAggregate(allVolume),
        difficulty: computeAggregate(allDifficulty),
      },
      fileCount: files.length,
      functionCount: allFunctions.length,
    },
  };
}
