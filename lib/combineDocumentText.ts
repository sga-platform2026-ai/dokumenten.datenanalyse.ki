export function combineDocumentTexts(
  parts: { fileName: string; text: string }[],
): string {
  return parts
    .filter((part) => part.text.trim().length > 0)
    .map(
      (part) =>
        `=== Dokument: ${part.fileName} ===\n${part.text.trim()}`,
    )
    .join("\n\n");
}

export function formatFileNamesLabel(fileNames: string[]): string {
  if (fileNames.length === 0) {
    return "";
  }
  if (fileNames.length === 1) {
    return fileNames[0];
  }
  if (fileNames.length === 2) {
    return `${fileNames[0]}; ${fileNames[1]}`;
  }
  return `${fileNames[0]} (+${fileNames.length - 1} weitere)`;
}
