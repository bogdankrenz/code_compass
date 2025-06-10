import { extractFunctionsFromFile } from "../metrics/utils";
import { calculateMcCabeComplexityAST } from "../metrics/mccabe";
import {
  calculateHalsteadMetricsAST,
  type HalsteadMetrics,
} from "../metrics/halstead";

type FunctionType = {
  name: string;
  code: string;
};

type MetricsResult = {
  name: string;
  mccabe: number;
  halstead: HalsteadMetrics;
};

export function analyzeFile(filePath: string) {
  const functions = extractFunctionsFromFile(filePath);

  return functions.map(
    ({ name, code }: FunctionType): MetricsResult => ({
      name,
      mccabe: calculateMcCabeComplexityAST(code),
      halstead: calculateHalsteadMetricsAST(code),
    })
  );
}
