export const MAX_FILE_BYTES = 25 * 1024 * 1024;

export function formatFileSizeLabel(bytes: number): string {
  const kb = Math.round(bytes / 1024);
  if (kb > 1024) {
    return `${(kb / 1024).toFixed(1)} MB`;
  }
  return `${kb} KB`;
}

export function fileExtensionLabel(fileName: string): string {
  return (fileName.split(".").pop() ?? "?").toUpperCase().slice(0, 4);
}
