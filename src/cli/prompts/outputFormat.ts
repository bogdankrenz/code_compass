import { cancel, isCancel, select } from "@clack/prompts";

export type OutputFormat = "table" | "json" | "csv" | "all";

export default async function promptOutputFormat() {
  const format = await select<OutputFormat>({
    message: "📤 Wie willst du das Ergebnis ausgeben?",
    options: [
      { value: "table", label: "Tabelle im Terminal" },
      { value: "json", label: "Als JSON-Datei speichern" },
      {
        value: "csv",
        label: "Als CSV-Datei speichern (bald verfügbar)",
      },
    ],
  });

  if (isCancel(format)) {
    cancel("Abgebrochen.");
    process.exit();
  }

  return format;
}
