import { cancel, isCancel, select } from "@clack/prompts";

export default async function promptUseCase() {
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
  return useCase;
}
