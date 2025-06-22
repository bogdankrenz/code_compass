#!/usr/bin/env bun

import { analyzeDirectory, analyzeFile } from "./parser/analyzer";
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
import fs from "fs";
import type { DirectoryMetrics } from "./types";
import { getSubdirectories } from "./metrics/utils";

type OutputFormat = "table" | "json" | "csv" | "all";

async function main() {
  intro(pc.cyan("📊 Code Compass"));

  const useCase = await select({
    message: "🔍 Was möchtest du analysieren?",
    options: [
      { label: "Projektvergleich (Verzeichnisse)", value: "projects" },
      { label: "Dateivergleich", value: "files" },
    ],
  });

  if (isCancel(useCase)) {
    cancel("Abgebrochen.");
    process.exit(1);
  }

  const basePath = "./projectsToAnalyse";
  const availableDirs = getSubdirectories(basePath);

  if (availableDirs.length === 0) {
    console.log(pc.red("❌ Keine Projekte gefunden im Verzeichnis:"), basePath);
    process.exit(1);
  }

  if (useCase === "projects") {
    const dirs = await multiselect({
      message: "📁 Welche Projekte willst du analysieren?",
      options: availableDirs.map((dir) => ({
        label: path.basename(dir),
        value: dir,
      })),
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

    if (isCancel(mode)) {
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
        message:
          "📁 In welchem Ordner sollen die Ergebnisse gespeichert werden?",
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

    const cleanedDirectories = results
      .map((dir) => {
        const validFiles = dir?.files.filter(
          (file) =>
            file.functions.length > 0 &&
            file.aggregate.functionCount > 0 &&
            file.aggregate.mccabe.avg !== null &&
            file.aggregate.mccabe.avg !== 0 &&
            file.aggregate.halstead.effort.avg !== null &&
            file.aggregate.halstead.effort.avg !== 0
        );

        if (validFiles?.length === 0) return null;

        return {
          ...dir,
          files: validFiles,
        };
      })
      .filter((dir): dir is DirectoryMetrics => dir !== null);

    switch (format) {
      case "table":
        if (mode === "aggregate" || mode === "both")
          printComparisonTable(cleanedDirectories);
        if (mode === "detailed" || mode === "both")
          printDetailedBreakdown(cleanedDirectories);
        break;
      case "json":
        writeResultsToJson(cleanedDirectories, outputFolder);
        break;
      case "csv":
        console.log("🚧 CSV-Export ist bald verfügbar.");
        break;
    }
  } else {
    console.log(
      pc.yellow(
        "🚧 Der Datei-Vergleich wird im nächsten Schritt implementiert."
      )
    );
    // TODO: Datei-Vergleich interaktiv implementieren
  }

  outro(pc.green("✅ Analyse abgeschlossen!"));
}

main().catch((err) => {
  console.error(pc.red("❌ Fehler beim Ausführen:"), err);
  process.exit(1);
});
