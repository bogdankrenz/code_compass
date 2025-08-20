import { cancel, isCancel, select } from "@clack/prompts";
import { handleCancel } from "../utils";

export default async function promptOutputType() {
  const mode = await select({
    message: "🧾 Welche Art der Ausgabe willst du?",
    options: [
      { value: "aggregate", label: "Nur aggregierte Werte" },
      { value: "detailed", label: "Nur detaillierte Werte" },
      { value: "both", label: "Beides anzeigen" },
    ],
  });

  handleCancel(mode);
  return mode;
}
