#!/usr/bin/env bun

import { analyzeDirectory } from "./parser/analyzer";
import {
  intro,
  outro,
  select,
  multiselect,
  isCancel,
  cancel,
  text,
} from "@clack/prompts";
import pc from "picocolors";
import {
  printComparisonTable,
  printDetailedBreakdown,
  writeResultsToJson,
} from "./output";
import path from "path";
import type { DirectoryMetrics } from "./types";

type OutputFormat = "table" | "json" | "csv" | "all";

/*
  TODO:
    - Stress testing with multiple big directories
    - Improve UX
    - Update README
    - Additional Options:
      - Dynamic Dir/File parsing/choosing
      - Function Comparison only
      - File Comparison only
    - CSV/Excel exports
    - Visualizer
*/
async function main() {
  intro(pc.cyan("📊 Code Compass"));

  const dirs = await multiselect({
    message: "📁 Welche Verzeichnisse willst du analysieren?",
    options: [
      { label: "strapi-fork", value: "strapiv4" },
      { label: "strapi v5", value: "strapiv5" },
      { label: "src", value: "src" },
    ],
    required: true,
  });

  if (isCancel(dirs)) {
    cancel("Abgebrochen.");
    process.exit();
  }
  const mode = await select({
    message: "🧾 Welche Art der Ausgabe willst du?",
    options: [
      { value: "aggregate", label: "Nur aggregierte Werte" },
      { value: "detailed", label: "Nur detaillierte Werte" },
      { value: "both", label: "Beides anzeigen" },
    ],
  });

  if (isCancel(dirs)) {
    cancel("Abgebrochen.");
    process.exit();
  }
  const format = await select<OutputFormat>({
    message: "📤 Wie willst du das Ergebnis ausgeben?",
    options: [
      { value: "table", label: "Tabelle im Terminal" },
      { value: "json", label: "Als JSON-Datei speichern" },
      { value: "csv", label: "Als CSV-Datei speichern (bald verfügbar)" },
    ],
  });

  if (isCancel(format)) {
    cancel("Abgebrochen.");
    process.exit();
  }

  let outputFolder = "";

  if (format !== "table") {
    const folder = await text({
      message: "📁 In welchem Ordner sollen die Ergebnisse gespeichert werden?",
      placeholder: "z. B. results/",
      validate: (input) =>
        input.trim() === "" ? "Bitte gib einen Ordnernamen an." : undefined,
    });

    if (isCancel(folder)) {
      cancel("Abgebrochen.");
      process.exit();
    }

    outputFolder = folder;
  }

  const results = (dirs as string[]).map((dir) =>
    analyzeDirectory(path.resolve(dir))
  );
  const filtered: DirectoryMetrics[] = results.filter(
    (res) => res !== null && (res.aggregate.mccabe.avg !== null || 0)
  );

  // Ausgabe
  switch (format) {
    case "table":
      if (mode === "aggregate" || mode === "both")
        printComparisonTable(filtered);
      if (mode === "detailed" || mode === "both")
        printDetailedBreakdown(filtered);
      break;
    case "json":
      writeResultsToJson(filtered, outputFolder);
      break;
    case "csv":
      console.log("🚧 CSV-Export ist bald verfügbar.");
      break;
  }

  outro(pc.green("✅ Analyse abgeschlossen!"));
}

main().catch((err) => {
  console.error(pc.red("❌ Fehler beim Ausführen:"), err);
  process.exit(1);
});
