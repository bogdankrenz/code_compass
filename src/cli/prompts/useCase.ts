import { cancel, isCancel, select } from "@clack/prompts";
import { handleCancel } from "../utils";

export default async function promptUseCase() {
  const useCase = await select({
    message: "🔍 Was möchtest du analysieren?",
    options: [
      { label: "Projektvergleich (Verzeichnisse)", value: "projects" },
      { label: "Dateivergleich", value: "files" },
    ],
  });

  handleCancel(useCase);
  return useCase;
}
