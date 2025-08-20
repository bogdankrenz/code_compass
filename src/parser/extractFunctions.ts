import * as fs from "fs";
import * as ts from "typescript";
import type { FunctionLocation } from "../core/analysis/models/types";

type FunctionExtraction = {
  name: string;
  code: string;
  location: FunctionLocation;
};

function getFunctionLocationFromSourceFile(
  node: ts.Node,
  sourceFile: ts.SourceFile
) {
  const start = sourceFile.getLineAndCharacterOfPosition(node.getStart());
  const end = sourceFile.getLineAndCharacterOfPosition(node.getEnd());

  return {
    startLine: start.line + 1,
    endLine: end.line + 1,
  };
}

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
      const location = getFunctionLocationFromSourceFile(node, sourceFile);

      functions.push({ name, code, location });
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
          const location = getFunctionLocationFromSourceFile(node, sourceFile);

          functions.push({ name, code, location });
        }
      });
    }

    // Methoden in Klassen
    if (ts.isMethodDeclaration(node) && node.name) {
      const name = node.name.getText(sourceFile);
      const code = node.getText(sourceFile);
      const location = getFunctionLocationFromSourceFile(node, sourceFile);

      functions.push({ name, code, location });
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return functions;
}
