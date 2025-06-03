#!/usr/bin/env bun

import { analyzeFile } from "./parser/analyzer";

const [, , filePath] = process.argv;

if (!filePath) {
  console.error("❌ Bitte gib den Pfad zu einer Datei an.");
  process.exit(1);
}

analyzeFile(filePath);
