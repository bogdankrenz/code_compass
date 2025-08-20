import { cancel, isCancel, text } from "@clack/prompts";
import { handleCancel } from "../utils";

export default async function promptOutputDirectory() {
  const folder = await text({
    message: "📁 In welchem Ordner sollen die Ergebnisse gespeichert werden?",
    placeholder: "z. B. results/",
    validate: (input) =>
      input.trim() === "" ? "Bitte gib einen Ordnernamen an." : undefined,
  });

  handleCancel(folder);
  return folder;
}
