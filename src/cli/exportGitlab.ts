import { analyzeDirectory } from "../service/analyzer";
import { toGitlabIssues } from "../service/gitlabExporter";
import { writeFileSync } from "fs";

async function main() {
  const metrics = await analyzeDirectory("./src");
  const issues = metrics.files.flatMap((file) => toGitlabIssues(file));

  writeFileSync("gl-code-quality-report.json", JSON.stringify(issues, null, 2));
  console.log("✅ GitLab report written to gl-code-quality-report.json");
}

main();
