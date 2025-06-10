import * as fs from "fs";
import * as ts from "typescript";

type FunctionExtraction = {
  name: string;
  code: string;
};

export function extractFunctionsFromFile(
  filePath: string
): FunctionExtraction[] {
  const sourceCode = fs.readFileSync(filePath, "utf8");
  const sourceFile = ts.createSourceFile(
    filePath,
    sourceCode,
    ts.ScriptTarget.Latest,
    true
  );

  const functions: FunctionExtraction[] = [];

  function visit(node: ts.Node) {
    // Klassische Funktionsdeklaration
    if (ts.isFunctionDeclaration(node) && node.name) {
      const name = node.name.text;
      const code = node.getText(sourceFile);
      functions.push({ name, code });
    }

    // Arrow Functions in Variablen
    if (ts.isVariableStatement(node)) {
      node.declarationList.declarations.forEach((decl) => {
        if (
          ts.isVariableDeclaration(decl) &&
          decl.initializer &&
          ts.isArrowFunction(decl.initializer)
        ) {
          const name = decl.name.getText(sourceFile);
          const code = decl.getText(sourceFile);
          functions.push({ name, code });
        }
      });
    }

    // Methoden in Klassen
    if (ts.isMethodDeclaration(node) && node.name) {
      const name = node.name.getText(sourceFile);
      const code = node.getText(sourceFile);
      functions.push({ name, code });
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return functions;
}
