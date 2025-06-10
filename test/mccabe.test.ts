import { describe, it, expect } from "bun:test";
import { calculateMcCabeComplexityAST } from "../src/metrics/mccabe";
import {
  basicFunction,
  ifElseFunction,
  forLoopFunction,
  arrowFunction,
  nestedConditions,
  switchCaseFunction,
  ternaryExpression,
  tryCatchBlock,
  complexLogicalExpression,
  nestedTernary,
  tryCatchFinally,
  asyncFunction,
} from "./fixtures/mccabeCases";

describe("McCabe Complexity", () => {
  it("should return 1 for a basic function", () => {
    expect(calculateMcCabeComplexityAST(basicFunction)).toBe(1);
  });

  it("should return 2 for an if-else function", () => {
    expect(calculateMcCabeComplexityAST(ifElseFunction)).toBe(2);
  });

  it("should return 2 for a for loop", () => {
    expect(calculateMcCabeComplexityAST(forLoopFunction)).toBe(2);
  });

  it("should return 1 for a simple arrow function", () => {
    expect(calculateMcCabeComplexityAST(arrowFunction)).toBe(1);
  });

  it("should return 3 for nested conditions", () => {
    expect(calculateMcCabeComplexityAST(nestedConditions)).toBe(3);
  });

  it("should return 5 for switch-case with 3 cases + default", () => {
    expect(calculateMcCabeComplexityAST(switchCaseFunction)).toBe(5);
  });

  it("should return 2 for ternary expression", () => {
    expect(calculateMcCabeComplexityAST(ternaryExpression)).toBe(2);
  });

  it("should return 2 for try and catch block", () => {
    expect(calculateMcCabeComplexityAST(tryCatchBlock)).toBe(2);
  });

  it("should return 3 for complex logical expression", () => {
    expect(calculateMcCabeComplexityAST(complexLogicalExpression)).toBe(3);
  });

  it("should return 3 for nested ternary", () => {
    expect(calculateMcCabeComplexityAST(nestedTernary)).toBe(3);
  });

  it("should return 3 for try catch finally", () => {
    expect(calculateMcCabeComplexityAST(tryCatchFinally)).toBe(3);
  });

  it("should return 5 for async/await with try/catch and if", () => {
    expect(calculateMcCabeComplexityAST(asyncFunction)).toBe(5);
  });
});
