import type { FileMetrics } from "../core/analysis/models/types";
import crypto from "crypto";

export interface GitLabIssue {
  description: string;
  fingerprint: string;
  severity: "info" | "minor" | "major" | "critical" | "blocker";
  location: {
    path: string;
    lines: {
      begin: number;
      end: number;
    };
  };
}

function createFingerprint(
  file: string,
  line: number,
  message: string
): string {
  return crypto
    .createHash("sha256")
    .update(`${file}:${line}:${message}`)
    .digest("hex");
}

export function toGitlabIssues(file: FileMetrics): GitLabIssue[] {
  return file.functions.map((fn) => {
    // TODO: Come up with more descriptions for more use cases, how can we extend it?
    // TODO: Come up with more severity cases and threshhold
    const description = `Function "${fn.name}" has complexity ${fn.mccabe}`;
    return {
      description,
      fingerprint: createFingerprint(
        fn.name,
        fn.location.startLine,
        description
      ),
      severity: fn.mccabe > 15 ? "major" : "minor",
      location: {
        path: file.filePath,
        lines: {
          begin: fn.location.startLine,
          end: fn.location.endLine,
        },
      },
    };
  });
}
