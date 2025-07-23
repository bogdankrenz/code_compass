// Shapes the data to the desired output
// Currently supporting: 'aggregate', 'detailed', 'both';
import type { DirectoryMetrics, FileMetrics } from "../types";

export type FullDirectoryMetrics = DirectoryMetrics;

export type Mode = "aggregate" | "detailed" | "both";

export interface DetailedDirectoryMetrics {
  directoryPath: string;
  files: Array<Pick<FileMetrics, "filePath" | "functions">>;
}

export interface AggregateDirectoryMetrics {
  directoryPath: string;
  aggregate: DirectoryMetrics["aggregate"];
}

type ShaperMap = {
  aggregate: AggregateDirectoryMetrics;
  detailed: DetailedDirectoryMetrics;
  both: FullDirectoryMetrics;
};

export type DirectoryShaper<M extends Mode> = (
  raw: DirectoryMetrics
) => ShaperMap[M];

function shapeAggregate(raw: DirectoryMetrics): AggregateDirectoryMetrics {
  return {
    directoryPath: raw.directoryPath,
    aggregate: raw.aggregate,
  };
}

export function shapeDetailed(raw: DirectoryMetrics): DetailedDirectoryMetrics {
  return {
    directoryPath: raw.directoryPath,
    files: raw.files.map(({ filePath, functions }) => ({
      filePath,
      functions,
    })),
  };
}

function shapeBoth(raw: DirectoryMetrics): DirectoryMetrics {
  return raw;
}

export const directoryShapers: { [M in Mode]: DirectoryShaper<M> } = {
  aggregate: shapeAggregate,
  detailed: shapeDetailed,
  both: shapeBoth,
};
