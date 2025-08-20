import { directoryShapers } from "./parser/shaper";
import type { DirectoryMetrics } from "./types";

// 1) Erzeuge einen kleinsten DirectoryMetrics-Stub
const stubMetrics: DirectoryMetrics = {
  directoryPath: "/some/path",
  files: [
    {
      filePath: "/some/path/foo.ts",
      functions: [
        {
          name: "a",
          mccabe: 3,
          halstead: { effort: 10, volume: 20, difficulty: 2 },
          location: {
            startLine: 0,
            endLine: 0,
          },
        },
      ],
      aggregate: {
        mccabe: { total: 0, avg: 0, median: 0 },
        halstead: {
          effort: { total: 0, avg: 0, median: 0 },
          volume: { total: 0, avg: 0, median: 0 },
          difficulty: { total: 0, avg: 0, median: 0 },
        },
        functionCount: 1,
      },
    },
  ],
  aggregate: {
    mccabe: { total: 0, avg: 0, median: 0 },
    halstead: {
      effort: { total: 0, avg: 0, median: 0 },
      volume: { total: 0, avg: 0, median: 0 },
      difficulty: { total: 0, avg: 0, median: 0 },
    },
    fileCount: 1,
    functionCount: 1,
  },
};

// 2) Teste jeden Mode
for (const mode of ["aggregate", "detailed", "both"] as const) {
  const shaped = directoryShapers[mode](stubMetrics);
  console.log(`\n--- Mode: ${mode} ---`);
  console.dir(shaped, { depth: 5 });
}
