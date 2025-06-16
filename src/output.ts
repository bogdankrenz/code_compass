import fs from "fs";
import path from "path";
import pc from "picocolors";
import type { FileMetrics, AggregateMetrics, DirectoryMetrics } from "./types";

export function printComparisonTable(results: DirectoryMetrics[]) {
  console.log(pc.bold("\n📁 Vergleich der aggregierten Werte:"));
  console.log(
    "──────────────────────────────────────────────────────────────────────────────"
  );
  console.log(
    "Verzeichnis".padEnd(40) +
      " | " +
      "Funktionen".padStart(10) +
      " | " +
      "McCabe Ø".padStart(10) +
      " | " +
      "Volume Ø".padStart(10) +
      " | " +
      "Effort Ø".padStart(10)
  );
  console.log(
    "──────────────────────────────────────────────────────────────────────────────"
  );

  for (const dir of results) {
    const { functionCount, fileCount, halstead, mccabe } = dir.aggregate;

    console.log(
      path.basename(dir.directoryPath).padEnd(40) +
        " | " +
        String(functionCount).padStart(10) +
        " | " +
        mccabe.avg.toFixed(2).padStart(10) +
        " | " +
        halstead.volume.avg.toFixed(2).padStart(10) +
        " | " +
        halstead.effort.avg.toFixed(2).padStart(10)
    );
  }

  console.log(
    "──────────────────────────────────────────────────────────────────────────────"
  );
}

// TODO: Fix directoryPath/file
export function printDetailedBreakdown(results: DirectoryMetrics[]) {
  for (const dir of results) {
    console.log(pc.bold(`\n📄 Datei: ${path.basename(dir.directoryPath)}:`));
    for (const file of dir.files) {
      console.log(pc.italic(`  🔧 ${file.filePath}`));
      for (const fn of file.functions) {
        console.log(`     • Funktion: ${fn.name}`);
        console.log(`       - McCabe:             ${fn.mccabe}`);
        console.log(
          `       - Halstead Volume:    ${fn.halstead.volume.toFixed(2)}`
        );
        console.log(
          `       - Halstead Effort:    ${fn.halstead.effort.toFixed(2)}`
        );
        console.log(
          `       - Halstead Difficulty:${fn.halstead.difficulty.toFixed(2)}\n`
        );
      }
    }
  }
}

export function writeResultsToJson(
  results: DirectoryMetrics[],
  outDir: string
) {
  const absPath = path.resolve(outDir as string);
  if (!fs.existsSync(absPath)) {
    fs.mkdirSync(absPath, { recursive: true });
  }

  const outputPath = path.join(absPath, "metrics.json");
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2), "utf-8");
  console.log(pc.green(`\n💾 Ergebnisse wurden gespeichert unter:`));
  console.log(pc.bold(outputPath));
}
