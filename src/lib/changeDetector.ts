import { diffWords } from "diff";

export interface ChangeDetectionResult {
  added: string;
  removed: string;
  changeRatio: number;
  diffText: string;
}

export function formatDiff(added: string, removed: string): string {
  const truncate = (text: string) => text.slice(0, 500);
  return `ADDED: ${truncate(added)}\nREMOVED: ${truncate(removed)}`;
}

export function detectChanges(
  oldText: string,
  newText: string
): ChangeDetectionResult | null {
  const diff = diffWords(oldText, newText);

  const addedParts: string[] = [];
  const removedParts: string[] = [];

  for (const part of diff) {
    if (part.added) addedParts.push(part.value);
    if (part.removed) removedParts.push(part.value);
  }

  const added = addedParts.join("").trim();
  const removed = removedParts.join("").trim();

  const oldLen = oldText.length || 1;
  const changeRatio = (added.length + removed.length) / oldLen;

  if (changeRatio < 0.02) {
    return null;
  }

  return {
    added,
    removed,
    changeRatio,
    diffText: formatDiff(added, removed),
  };
}

export function parseDiffText(diffText: string): {
  added: string;
  removed: string;
} {
  let added = "";
  let removed = "";

  for (const line of diffText.split("\n")) {
    if (line.startsWith("ADDED: ")) added = line.slice(7);
    if (line.startsWith("REMOVED: ")) removed = line.slice(9);
  }

  return { added, removed };
}
