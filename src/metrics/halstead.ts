import * as ts from "typescript";

export type HalsteadMetrics = {
  n1: number;
  n2: number;
  N1: number;
  N2: number;
  vocabulary: number;
  length: number;
  volume: number;
  difficulty: number;
  effort: number;
  uniqueOperators: string[]; // Debugging purposes
  uniqueOperands: string[]; // Debugging purposes
};

export function calculateHalsteadMetricsAST(code: string): HalsteadMetrics {
  const sourceFile = ts.createSourceFile(
    "temp.ts",
    code,
    ts.ScriptTarget.ES2015,
    true
  );

  const allOperators: string[] = [];
  const allOperands: string[] = [];

  function visit(node: ts.Node) {
    switch (node.kind) {
      case ts.SyntaxKind.BinaryExpression: {
        const binary = node as ts.BinaryExpression;
        allOperators.push(ts.tokenToString(binary.operatorToken.kind) || "");
        allOperands.push(binary.left.getText(), binary.right.getText());
        break;
      }
      case ts.SyntaxKind.PrefixUnaryExpression:
      case ts.SyntaxKind.PostfixUnaryExpression: {
        const unary = node as
          | ts.PrefixUnaryExpression
          | ts.PostfixUnaryExpression;
        allOperators.push(ts.tokenToString(unary.operator) || "");
        allOperands.push(unary.operand.getText());
        break;
      }
      case ts.SyntaxKind.CallExpression: {
        const call = node as ts.CallExpression;
        allOperators.push("call");
        allOperands.push(
          call.expression.getText(),
          ...call.arguments.map((arg) => arg.getText())
        );
        break;
      }
      case ts.SyntaxKind.VariableDeclaration: {
        const decl = node as ts.VariableDeclaration;
        if (decl.initializer) {
          allOperators.push("=");
          allOperands.push(decl.name.getText(), decl.initializer.getText());
        }
        break;
      }
      case ts.SyntaxKind.FunctionDeclaration: {
        const fn = node as ts.FunctionDeclaration;
        if (fn.name) {
          allOperators.push("function");
          allOperands.push(fn.name.getText());
        }
        break;
      }
      case ts.SyntaxKind.ReturnStatement: {
        const ret = node as ts.ReturnStatement;
        if (ret.expression) {
          allOperators.push("return");
          allOperands.push(ret.expression.getText());
        }
        break;
      }
      case ts.SyntaxKind.TemplateExpression: {
        allOperators.push("template");
        allOperands.push(node.getText());
        break;
      }
      case ts.SyntaxKind.IfStatement:
        allOperators.push("if");
        break;
      case ts.SyntaxKind.ConditionalExpression:
        allOperators.push("?", ":");
        break;
      case ts.SyntaxKind.ForStatement:
        allOperators.push("for");
        break;
      case ts.SyntaxKind.WhileStatement:
        allOperators.push("while");
        break;
      case ts.SyntaxKind.SwitchStatement:
        allOperators.push("switch");
        break;
      case ts.SyntaxKind.CaseClause:
        allOperators.push("case");
        break;
      case ts.SyntaxKind.PropertyAccessExpression: {
        const prop = node as ts.PropertyAccessExpression;
        allOperators.push(".");
        allOperands.push(prop.name.getText());
        break;
      }
      case ts.SyntaxKind.ElementAccessExpression: {
        const elem = node as ts.ElementAccessExpression;
        allOperators.push("[]");
        allOperands.push(elem.argumentExpression.getText());
        break;
      }
      case ts.SyntaxKind.SpreadElement: {
        const spread = node as ts.SpreadElement;
        allOperators.push("...");
        allOperands.push(spread.expression.getText());
        break;
      }
      case ts.SyntaxKind.NumericLiteral:
      case ts.SyntaxKind.StringLiteral: {
        allOperands.push(node.getText());
        break;
      }
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
  const safeLog2 = (n: number) => Math.log2(Math.max(1, n));
  const volume = length * safeLog2(vocabulary);
  const difficulty = (n1 / 2) * (N2 / (n2 || 1));
  const effort = volume * difficulty;

  return {
    n1,
    n2,
    N1,
    N2,
    vocabulary,
    length,
    volume,
    difficulty,
    effort,
    uniqueOperators: [...new Set(allOperators)],
    uniqueOperands: [...new Set(allOperands)],
  };
}
