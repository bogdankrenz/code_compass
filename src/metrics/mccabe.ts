import * as ts from "typescript";

export function calculateMcCabeComplexityAST(code: string): number {
  const sourceFile = ts.createSourceFile(
    "temp.ts",
    code,
    ts.ScriptTarget.ES2015,
    true
  );
  let edges = 0; // Anzahl der Kanten im Kontrollflussgraphen

  function visit(node: ts.Node) {
    const syntaxKind = ts.SyntaxKind[node.kind];

    if (
      ts.isIfStatement(node) ||
      ts.isForStatement(node) ||
      ts.isWhileStatement(node) ||
      ts.isDoStatement(node) ||
      ts.isCaseClause(node) ||
      ts.isDefaultClause(node) ||
      ts.isConditionalExpression(node) ||
      ts.isAwaitExpression(node) ||
      (ts.isBinaryExpression(node) &&
        (node.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken ||
          node.operatorToken.kind === ts.SyntaxKind.BarBarToken))
    ) {
      edges++;
    }

    if (ts.isTryStatement(node)) {
      if (node.catchClause) {
        edges++;
      }
      if (node.finallyBlock) {
        edges++;
      }
    }

    ts.forEachChild(node, visit);
  }

  ts.forEachChild(sourceFile, visit);
  return edges + 1; // McCabe V(G) = E - N + 2 (vereinfachte Formel: E + 1)
}
