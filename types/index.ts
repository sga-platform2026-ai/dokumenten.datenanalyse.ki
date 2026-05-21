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

export type ExtractionErrorCode =
  | "unsupported_type"
  | "pdf_parse_failed"
  | "pdf_empty"
  | "docx_parse_failed"
  | "ocr_failed";

export interface ExtractionResult {
  text: string;
  readable: boolean;
  method: ExtractionMethod;
  charCount: number;
  errorCode?: ExtractionErrorCode;
}

export interface AnalyzeRequest {
  documentText: string;
  fileName?: string;
}

export interface AnalyzeDiagnostics {
  rawAnalysisLength: number;
  rawAnalysisPreview?: string;
  hasJsonStart: boolean;
  hasJsonEnd: boolean;
  jsonValid: boolean;
  jsonRecovered?: boolean;
  structuredCount: number;
  proseCount: number;
  mergedCount: number;
  affectedCount: number;
  retried: boolean;
  retryReason?: string;
  documentLength: number;
}

export interface AnalyzeMetadata {
  model: string;
  provider: "grok" | "mock";
  timestamp: string;
  mock?: boolean;
  /** Gleiches Dokument aus Server-Cache (identischer Text-Hash). */
  cached?: boolean;
  diagnostics?: AnalyzeDiagnostics;
}

export interface AnalyzeResponse {
  analysis: string;
  letter: string;
  metadata: AnalyzeMetadata;
}

export interface ParsedAnalysis {
  recipient?: string;
  authority?: string;
  clerk?: string;
  leader?: string;
  caseNumber?: string;
  documentDate?: string;
  articles: Array<{ article: string; reason: string }>;
  affected: Array<{ article: string; note?: string }>;
  raw: string;
}

export interface WorkflowState {
  status: ProcessingStatus;
  fileName: string | null;
  errorMessage: string | null;
  result: AnalyzeResponse | null;
}
