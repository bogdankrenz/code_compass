import { describe, it, expect } from "bun:test";
import * as Fixtures from "../test/fixtures/halsteadCases";
import { calculateHalsteadMetricsAST } from "../src/metrics/halstead";

describe("Halstead: Operator/Operand coverage per snippet", () => {
  for (const [name, code] of Object.entries(Fixtures)) {
    it(`should compute Halstead metrics for: ${name}`, () => {
      const result = calculateHalsteadMetricsAST(code);

      // Grundchecks
      expect(result.n1).toBeGreaterThanOrEqual(1);
      expect(result.n2).toBeGreaterThanOrEqual(1);
      expect(result.N1).toBeGreaterThanOrEqual(1);
      expect(result.N2).toBeGreaterThanOrEqual(1);
      expect(result.volume).toBeGreaterThanOrEqual(0);

      // Debug Output optional:
      console.log(`${name}:`, {
        operators: result.uniqueOperators,
        operands: result.uniqueOperands,
        volume: result.volume.toFixed(2),
        effort: result.effort.toFixed(2),
      });
    });
  }
});
