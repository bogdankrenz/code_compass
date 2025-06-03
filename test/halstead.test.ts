import { calculateHalsteadMetricsAST } from "../src/metrics/halstead";
import * as Examples from "./fixtures/halsteadCases";
import { describe, it, expect } from "bun:test";

describe("Halstead Metrics", () => {
  for (const [name, code] of Object.entries(Examples)) {
    it(`should calculate metrics for: ${name}`, () => {
      const result = calculateHalsteadMetricsAST(code);

      expect(result.n1).toBeGreaterThanOrEqual(0);
      expect(result.n2).toBeGreaterThanOrEqual(0);
      expect(result.N1).toBeGreaterThanOrEqual(0);
      expect(result.N2).toBeGreaterThanOrEqual(0);
      expect(result.vocabulary).toBe(result.n1 + result.n2);
      expect(result.length).toBe(result.N1 + result.N2);
      expect(result.volume).toBeGreaterThanOrEqual(0);
      expect(result.difficulty).toBeGreaterThanOrEqual(0);
      expect(result.effort).toBeGreaterThanOrEqual(0);
    });
  }
});
