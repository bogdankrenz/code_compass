import { isCancel, cancel } from "@clack/prompts";

export function handleCancel(value: unknown) {
  if (isCancel(value)) {
    cancel("Abgebrochen.");
    process.exit(1);
  }
}
