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
  writeAllResultsToJson,
} from "./output";
import path from "path";
import fs from "fs";
import type { DirectoryMetrics, FileMetrics } from "./types";
import { getSubdirectories, handleCancel } from "./metrics/utils";
import { computeAggregate } from "./parser/generateFileMetrics";
import type { Mode } from "./parser/shaper";

type OutputFormat = "table" | "json" | "csv";

type OutputStrategy = (data: DirectoryMetrics[], outDir?: string) => void;

async function main() {
  intro(pc.cyan("📊 Code Compass"));

  const useCase = await select({
    message: "🔍 Was möchtest du analysieren?",
    options: [
      { label: "Projektvergleich (Verzeichnisse)", value: "projects" },
      { label: "Dateivergleich", value: "files" },
    ],
  });

  handleCancel(useCase);

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

    handleCancel(dirs);

    const mode = await select({
      message: "🧾 Welche Art der Ausgabe willst du?",
      options: [
        { value: "aggregate", label: "Nur aggregierte Werte" },
        { value: "detailed", label: "Nur detaillierte Werte" },
        { value: "both", label: "Beides anzeigen" },
      ],
    });

    handleCancel(mode);

    const format = await select<OutputFormat>({
      message: "📤 Wie willst du das Ergebnis ausgeben?",
      options: [
        { value: "table", label: "Tabelle im Terminal" },
        { value: "json", label: "Als JSON-Datei speichern" },
        { value: "csv", label: "Als CSV-Datei speichern (bald verfügbar)" },
      ],
    });

    handleCancel(format);

    let outputFolder = "";
    if (format !== "table") {
      const folder = (await text({
        message:
          "📁 In welchem Ordner sollen die Ergebnisse gespeichert werden?",
        placeholder: "z. B. results/",
        validate: (input) =>
          input.trim() === "" ? "Bitte gib einen Ordnernamen an." : undefined,
      })) as string;

      handleCancel(folder);

      outputFolder = folder;
    }

    const results = (dirs as string[]).map((dir) =>
      analyzeDirectory(path.resolve(dir), mode as Mode)
    );

    // const strategiesByFormat: Record<
    //   OutputFormat,
    //   Record<Mode, OutputStrategy>
    // > = {
    //   table: tableStrategies,
    //   json: jsonStrategies,
    //   csv: csvStrategies,
    // };

    // const strat =
    //   strategiesByFormat[format as OutputFormat][mode as DirectoryMode];

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

    cleanedDirectories.forEach((dir) => {
      dir.files.forEach((file) => {
        file.functions.sort((a, b) => b.mccabe - a.mccabe);
      });
    });

    switch (format) {
      case "table":
        if (mode === "aggregate" || mode === "both")
          printComparisonTable(cleanedDirectories);
        if (mode === "detailed" || mode === "both")
          printDetailedBreakdown(cleanedDirectories);
        break;
      case "json":
        console.log(results);
        break;
      case "csv":
        console.log("🚧 CSV-Export ist bald verfügbar.");
        break;
    }
  } else {
    const firstProject = (await select({
      message: "📁 Wähle ein Projekt:",
      options: availableDirs.map((dir) => ({
        label: path.basename(dir),
        value: dir,
      })),
    })) as string;

    handleCancel(firstProject);

    function getAllTsFilesRecursively(dir: string): string[] {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      const files = entries.flatMap((entry) => {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) return getAllTsFilesRecursively(fullPath);
        if (entry.isFile() && entry.name.endsWith(".ts")) return [fullPath];
        return [];
      });
      return files;
    }

    const firstProjectFiles = getAllTsFilesRecursively(firstProject).map(
      (filePath) => ({
        label: path.relative(firstProject, filePath),
        value: filePath,
      })
    );

    const selectedFiles = (await multiselect({
      message: "📄 Welche Datei(en) willst du analysieren?",
      options: firstProjectFiles,
      required: true,
    })) as string[];

    handleCancel(selectedFiles);

    let allFiles: FileMetrics[] = [];

    function analyzeFiles(filePaths: string[]): FileMetrics[] {
      return filePaths
        .map((filePath) => {
          const functions = analyzeFile(path.resolve(filePath));
          if (!functions || functions.length === 0) return null;

          return {
            filePath,
            functions,
            aggregate: {
              mccabe: computeAggregate(functions.map((f) => f.mccabe)),
              halstead: {
                effort: computeAggregate(
                  functions.map((f) => f.halstead.effort)
                ),
                volume: computeAggregate(
                  functions.map((f) => f.halstead.volume)
                ),
                difficulty: computeAggregate(
                  functions.map((f) => f.halstead.difficulty)
                ),
              },
              functionCount: functions.length,
            },
          };
        })
        .filter((f): f is FileMetrics => f !== null);
    }

    allFiles.push(...analyzeFiles(selectedFiles));

    // 📁 Optional zweites Projekt
    const addSecond = await select({
      message: "📁 Möchtest du Dateien aus einem zweiten Projekt analysieren?",
      options: [
        { label: "Ja", value: "yes" },
        { label: "Nein", value: "no" },
      ],
    });

    if (addSecond === "yes") {
      const secondProject = (await select({
        message: "📁 Wähle das zweite Projekt:",
        options: availableDirs
          .filter((dir) => dir !== firstProject)
          .map((dir) => ({
            label: path.basename(dir),
            value: dir,
          })),
      })) as string;

      handleCancel(secondProject);

      const secondProjectFiles = getAllTsFilesRecursively(secondProject).map(
        (filePath) => ({
          label: path.relative(secondProject, filePath),
          value: filePath,
        })
      );

      const selectedSecondFiles = await multiselect({
        message: "📄 Welche Datei(en) willst du zusätzlich analysieren?",
        options: secondProjectFiles,
        required: true,
      });

      if (!isCancel(selectedSecondFiles)) {
        allFiles.push(...analyzeFiles(selectedSecondFiles as string[]));
      }
    }

    // 📋 Ausgabeoptionen
    const mode = await select({
      message: "🧾 Welche Art der Ausgabe willst du?",
      options: [
        { value: "aggregate", label: "Nur aggregierte Werte" },
        { value: "detailed", label: "Nur detaillierte Werte" },
        { value: "both", label: "Beides anzeigen" },
      ],
    });

    const format = await select<OutputFormat>({
      message: "📤 Wie willst du das Ergebnis ausgeben?",
      options: [
        { value: "table", label: "Tabelle im Terminal" },
        { value: "json", label: "Als JSON-Datei speichern" },
        { value: "csv", label: "Als CSV-Datei speichern (bald verfügbar)" },
      ],
    });

    let outputFolder = "";
    if (format !== "table") {
      const folder = (await text({
        message:
          "📁 In welchem Ordner sollen die Ergebnisse gespeichert werden?",
        placeholder: "z. B. results/",
        validate: (input) =>
          input.trim() === "" ? "Bitte gib einen Ordnernamen an." : undefined,
      })) as string;

      handleCancel(folder);

      outputFolder = folder;
    }

    allFiles.forEach((file) => {
      file.functions.sort((a, b) => b.mccabe - a.mccabe);
    });

    // 📦 Ergebnisse verpacken
    const directoryObj: DirectoryMetrics = {
      directoryPath: "Dateivergleich",
      files: allFiles,
      aggregate: {
        mccabe: computeAggregate(
          allFiles.map((f) => f.aggregate?.mccabe.avg ?? 0)
        ),
        halstead: {
          effort: computeAggregate(
            allFiles.map((f) => f.aggregate?.halstead.effort.avg ?? 0)
          ),
          volume: computeAggregate(
            allFiles.map((f) => f.aggregate?.halstead.volume.avg ?? 0)
          ),
          difficulty: computeAggregate(
            allFiles.map((f) => f.aggregate?.halstead.difficulty.avg ?? 0)
          ),
        },
        functionCount: allFiles.reduce(
          (sum, f) => sum + (f.aggregate?.functionCount ?? 0),
          0
        ),
        fileCount: allFiles.length,
      },
    };

    if (mode === "detailed" || mode === "both") {
      directoryObj.files.forEach((file) => {
        file.functions.sort((a, b) => b.mccabe - a.mccabe);
      });
    }

    // 📊 Ausgabe
    switch (format) {
      case "table":
        if (mode === "aggregate" || mode === "both")
          printComparisonTable([directoryObj]);
        if (mode === "detailed" || mode === "both")
          printDetailedBreakdown([directoryObj]);
        break;
      case "json":
        // writeResultsToJson([directoryObj], outputFolder);
        break;
      case "csv":
        console.log("🚧 CSV-Export ist bald verfügbar.");
        break;
    }

    outro(pc.green("✅ Analyse abgeschlossen!"));
  }
}
main().catch((err) => {
  console.error(pc.red("❌ Fehler beim Ausführen:"), err);
  process.exit(1);
});
