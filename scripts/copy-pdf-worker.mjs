import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const source = path.join(
  root,
  "node_modules",
  "pdfjs-dist",
  "build",
  "pdf.worker.min.mjs",
);
const targetDir = path.join(root, "public");
const target = path.join(targetDir, "pdf.worker.min.mjs");

if (!fs.existsSync(source)) {
  console.warn("[copy-pdf-worker] pdfjs worker not found, skipping:", source);
  process.exit(0);
}

fs.mkdirSync(targetDir, { recursive: true });
fs.copyFileSync(source, target);
console.log("[copy-pdf-worker] copied to public/pdf.worker.min.mjs");
