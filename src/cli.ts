#!/usr/bin/env bun

import { analyzeFile } from "./parser/analyzer";

const [, , filePath] = process.argv;

if (!filePath) {
  console.error("❌ Bitte gib den Pfad zu einer Datei an.");
  process.exit(1);
}

const results = analyzeFile(filePath);

console.log(`📄 Datei: ${filePath}`);
results.forEach(({ name, mccabe, halstead }) => {
  console.log(`🔧 Funktion: ${name}`);
  console.log(`   - McCabe-Komplexität: ${mccabe}`);
  console.log(`   - Halstead Volumen: ${halstead.volume.toFixed(2)}`);
  console.log(`   - Halstead Aufwand: ${halstead.effort.toFixed(2)}\n`);
});
