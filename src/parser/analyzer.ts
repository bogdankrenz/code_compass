import { Project } from "ts-morph";

export function analyzeFile(filePath: string) {
  const project = new Project();
  const sourceFile = project.addSourceFileAtPath(filePath);

  const functions = sourceFile.getFunctions();
  console.log(`📄 Datei: ${filePath}`);
  console.log(`🔍 Gefundene Funktionen: ${functions.length}`);

  for (const func of functions) {
    console.log("—", func.getName() || "<anonymous>");
    // Hier kannst du Halstead / McCabe aufrufen
  }
}
