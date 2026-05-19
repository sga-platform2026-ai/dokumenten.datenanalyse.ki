export interface QueuedFile {
  id: string;
  file: File;
  name: string;
  sizeLabel: string;
  ext: string;
}

export type ProcessingStatus =
  | "idle"
  | "selected"
  | "reading"
  | "checking"
  | "readable"
  | "analyzing"
  | "done"
  | "error";

export type SupportedMime =
  | "application/pdf"
  | "image/jpeg"
  | "image/png"
  | "image/tiff"
  | "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

export type ExtractionMethod = "pdf" | "docx" | "ocr" | "unsupported";

export interface ExtractionResult {
  text: string;
  readable: boolean;
  method: ExtractionMethod;
  charCount: number;
}

export interface AnalyzeRequest {
  documentText: string;
  fileName?: string;
}

export interface AnalyzeMetadata {
  model: string;
  provider: "grok" | "mock";
  timestamp: string;
  mock?: boolean;
  /** Gleiches Dokument aus Server-Cache (identischer Text-Hash). */
  cached?: boolean;
}

export interface AnalyzeResponse {
  analysis: string;
  letter: string;
  metadata: AnalyzeMetadata;
}

export interface ParsedAnalysis {
  authority?: string;
  clerk?: string;
  leader?: string;
  articles: Array<{ article: string; reason: string }>;
  raw: string;
}

export interface WorkflowState {
  status: ProcessingStatus;
  fileName: string | null;
  errorMessage: string | null;
  result: AnalyzeResponse | null;
}
