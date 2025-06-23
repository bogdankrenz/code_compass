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
import type { DirectoryMetrics, FileMetrics } from "./types";
import { getSubdirectories } from "./metrics/utils";
import { computeAggregate } from "./parser/generateFileMetrics";

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
    const firstProject = await select({
      message: "📁 Wähle ein Projekt:",
      options: availableDirs.map((dir) => ({
        label: path.basename(dir),
        value: dir,
      })),
    });

    if (isCancel(firstProject)) {
      cancel("Abgebrochen.");
      process.exit(1);
    }
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

    const selectedFiles = await multiselect({
      message: "📄 Welche Datei(en) willst du analysieren?",
      options: firstProjectFiles,
      required: true,
    });

    if (isCancel(selectedFiles)) {
      cancel("Abgebrochen.");
      process.exit(1);
    }

    const analyzedFiles: FileMetrics[] = (selectedFiles as string[])
      .map((filePath) => {
        const functions = analyzeFile(path.resolve(filePath)); // returns FunctionMetrics[] | null
        if (!functions || functions.length === 0) return null;

        const numbers = functions.map((fn) => fn.mccabe); // oder fn.halstead.volume etc.
        const aggregate = computeAggregate(numbers); // deine bestehende Funktion

        return {
          filePath,
          functions,
          aggregate: {
            mccabe: computeAggregate(functions.map((f) => f.mccabe)),
            halstead: {
              effort: computeAggregate(functions.map((f) => f.halstead.effort)),
              volume: computeAggregate(functions.map((f) => f.halstead.volume)),
              difficulty: computeAggregate(
                functions.map((f) => f.halstead.difficulty)
              ),
            },
            functionCount: functions.length,
          },
        };
      })
      .filter((f): f is FileMetrics => f !== null);

    printDetailedBreakdown([
      {
        directoryPath: firstProject,
        files: analyzedFiles,
      },
    ]);
    //   // TODO: Datei-Vergleich interaktiv implementieren
    //   const firstProject = await select({
    //     message: "📁 Wähle das erste Projekt:",
    //     options: availableDirs.map((dir) => ({
    //       label: path.basename(dir),
    //       value: dir,
    //     })),
    //   });

    //   if (isCancel(firstProject)) {
    //     cancel("Abgebrochen.");
    //     process.exit(1);
    //   }

    //   const firstProjectFiles = fs
    //     .readdirSync(firstProject, { withFileTypes: true })
    //     .filter((f) => f.isFile() && f.name.endsWith(".ts"))
    //     .map((f) => ({
    //       label: f.name,
    //       value: path.join(firstProject, f.name),
    //     }));

    //   const selectedFiles1 = await multiselect({
    //     message: "📄 Welche Datei(en) willst du im ersten Projekt analysieren?",
    //     options: firstProjectFiles,
    //     required: true,
    //   });

    //   if (isCancel(selectedFiles1)) {
    //     cancel("Abgebrochen.");
    //     process.exit(1);
    //   }

    //   const compareSecond = await select({
    //     message: "📁 Möchtest du Dateien aus einem zweiten Projekt vergleichen?",
    //     options: [
    //       { label: "Ja", value: "yes" },
    //       { label: "Nein", value: "no" },
    //     ],
    //   });

    //   if (isCancel(compareSecond)) {
    //     cancel("Abgebrochen.");
    //     process.exit(1);
    //   }

    //   let selectedFiles2: symbol | string[] = [];
    //   if (compareSecond === "yes") {
    //     const secondProject = await select({
    //       message: "📁 Wähle das zweite Projekt:",
    //       options: availableDirs
    //         .filter((dir) => dir !== firstProject)
    //         .map((dir) => ({
    //           label: path.basename(dir),
    //           value: dir,
    //         })),
    //     });

    //     if (isCancel(secondProject)) {
    //       cancel("Abgebrochen.");
    //       process.exit(1);
    //     }

    //     const secondProjectFiles = fs
    //       .readdirSync(secondProject, { withFileTypes: true })
    //       .filter((f) => f.isFile() && f.name.endsWith(".ts"))
    //       .map((f) => ({
    //         label: f.name,
    //         value: path.join(secondProject, f.name),
    //       }));

    //     selectedFiles2 = await multiselect({
    //       message:
    //         "📄 Welche Datei(en) willst du im zweiten Projekt analysieren?",
    //       options: secondProjectFiles,
    //       required: true,
    //     });

    //     if (isCancel(selectedFiles2)) {
    //       cancel("Abgebrochen.");
    //       process.exit(1);
    //     }
    //   }

    //   const format = await select<OutputFormat>({
    //     message: "📤 Wie willst du das Ergebnis ausgeben?",
    //     options: [
    //       { value: "table", label: "Tabelle im Terminal" },
    //       { value: "json", label: "Als JSON-Datei speichern" },
    //       { value: "csv", label: "Als CSV-Datei speichern (bald verfügbar)" },
    //     ],
    //   });

    //   if (isCancel(format)) {
    //     cancel("Abgebrochen.");
    //     process.exit(1);
    //   }

    //   let outputFolder = "";
    //   if (format !== "table") {
    //     const folder = await text({
    //       message:
    //         "📁 In welchem Ordner sollen die Ergebnisse gespeichert werden?",
    //       placeholder: "z. B. results/",
    //       validate: (input) =>
    //         input.trim() === "" ? "Bitte gib einen Ordnernamen an." : undefined,
    //     });

    //     if (isCancel(folder)) {
    //       cancel("Abgebrochen.");
    //       process.exit(1);
    //     }

    //     outputFolder = folder;
    //   }

    //   const filesToAnalyze = [...(selectedFiles1 as string[]), ...selectedFiles2];
    //   const analyzedFiles = filesToAnalyze
    //     .map((file) => analyzeFile(path.resolve(file)))
    //     .filter((file) => file !== null);

    //   switch (format) {
    //     case "table":
    //       printDetailedBreakdown([{ directoryPath: "", files: analyzedFiles }]);
    //       break;
    //     case "json":
    //       writeResultsToJson(
    //         [{ directoryPath: "", files: analyzedFiles }],
    //         outputFolder
    //       );
    //       break;
    //     case "csv":
    //       console.log("🚧 CSV-Export ist bald verfügbar.");
    //       break;
    //   }
    // }

    outro(pc.green("✅ Analyse abgeschlossen!"));
  }
}
main().catch((err) => {
  console.error(pc.red("❌ Fehler beim Ausführen:"), err);
  process.exit(1);
});
