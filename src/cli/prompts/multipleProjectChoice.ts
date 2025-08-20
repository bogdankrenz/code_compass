import { multiselect } from "@clack/prompts";
import path from "path";
import pc from "picocolors";
import { handleCancel } from "../utils";

export default async function promptMultipleProjectChoice(
  availableDirs: string[]
) {
  // TODO: basePath as config inside .env
  const basePath = "./projectsToAnalyse";
  if (availableDirs.length === 0) {
    console.log(pc.red("❌ Keine Projekte gefunden im Verzeichnis:"), basePath);
    process.exit(1);
  }

  const dirs = await multiselect({
    message: "📁 Welche Projekte willst du analysieren?",
    options: availableDirs.map((dir) => ({
      label: path.basename(dir),
      value: dir,
    })),
    required: true,
  });

  handleCancel(dirs);
  return dirs;
}
