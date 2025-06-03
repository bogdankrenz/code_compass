import * as ts from "typescript";

type HalsteadMetrics = {
  n1: number;
  n2: number;
  N1: number;
  N2: number;
  vocabulary: number;
  length: number;
  volume: number;
  difficulty: number;
  effort: number;
};

export function calculateHalsteadMetricsAST(code: string): HalsteadMetrics {
  const sourceFile = ts.createSourceFile(
    "temp.ts",
    code,
    ts.ScriptTarget.ES2015,
    true
  );

  const uniqueOperators = new Set<string>();
  const uniqueOperands = new Set<string>();
  const allOperators: string[] = [];
  const allOperands: string[] = [];

  function visit(node: ts.Node) {
    if (ts.isBinaryExpression(node)) {
      allOperators.push(ts.tokenToString(node.operatorToken.kind) || "");
      allOperands.push(node.left.getText());
      allOperands.push(node.right.getText());
    } else if (
      ts.isPrefixUnaryExpression(node) ||
      ts.isPostfixUnaryExpression(node)
    ) {
      allOperators.push(ts.tokenToString(node.operator) || "");
      allOperands.push(node.operand.getText());
    } else if (ts.isCallExpression(node)) {
      allOperators.push("call");
      allOperands.push(node.expression.getText());
      node.arguments.forEach((arg) => allOperands.push(arg.getText()));
    } else if (ts.isVariableDeclaration(node) && node.initializer) {
      allOperators.push("=");
      allOperands.push(node.name.getText());
      allOperands.push(node.initializer.getText());
    }
    ts.forEachChild(node, visit);
  }

  ts.forEachChild(sourceFile, visit);

  const n1 = new Set(allOperators).size;
  const n2 = new Set(allOperands).size;
  const N1 = allOperators.length;
  const N2 = allOperands.length;

  const vocabulary = n1 + n2;
  const length = N1 + N2;
  const volume = length * Math.log2(vocabulary || 1);
  const difficulty = (n1 / 2) * (N2 / (n2 || 1));
  const effort = volume * difficulty;

  return { n1, n2, N1, N2, vocabulary, length, volume, difficulty, effort };
}
