/**
 * Thin client for the remediation backend.
 *
 * In dev, Vite proxies /pdf to the FastAPI server (see vite.config.ts), so these
 * are same-origin requests. The backend speaks camelCase, matching these types.
 */

export type TagStatus = 'TAGGED' | 'UNTAGGED' | 'TAGGED_NO_FIGURES'

export type DocumentRoute = 'ALT_TEXT_REMEDIATION' | 'OCR_RECONSTRUCTION' | 'UNSUPPORTED'

export type UnsupportedReason =
  | 'BORN_DIGITAL_UNTAGGED'
  | 'PARTIALLY_TAGGED'
  | 'INTERACTIVE_FORMS'
  | 'DIGITALLY_SIGNED'
  | 'MIXED_NATIVE_SCANNED'
  | 'NON_ENGLISH_LANGUAGE'
  | 'SENSITIVE_COMPLETED_FORM'
  | 'FILE_TOO_LARGE'
  | 'TOO_MANY_PAGES'
  | 'CORRUPT_PDF'
  | 'ENCRYPTED_PDF'
  | 'NO_PROCESSABLE_CONTENT'

export type JobStatus =
  | 'UPLOADED'
  | 'ANALYZING'
  | 'NEEDS_REVIEW'
  | 'APPLYING'
  | 'COMPLETE'
  | 'FAILED'

export type IssueStatus = 'DETECTED' | 'SUGGESTED' | 'APPROVED' | 'REJECTED' | 'APPLIED'

export interface ApiDocument {
  docId: string
  filename: string
  department: string
  tagStatus: TagStatus
  figuresMissingAlt: number
  sizeBytes: number
  updatedAt: string
  route: DocumentRoute
  unsupportedReason: UnsupportedReason | null
  isScanDominant: boolean
}

export interface ApiScan {
  tagStatus: TagStatus
  pageCount: number
  figureCount: number
  figuresMissingAlt: number
  imageCount: number
  route: DocumentRoute
  unsupportedReason: UnsupportedReason | null
  sizeBytes: number
  isScanDominant: boolean
}

export interface ApiIssue {
  issueId: string
  pageNumber: number
  imageIndex: number
  hasAltText: boolean
  imageLocation: string | null
  severity: string
  suggestedAltText: string | null
  approvedAltText: string | null
  status: IssueStatus
}

export interface ApiJob {
  jobId: string
  docId: string
  status: JobStatus
  issues: ApiIssue[]
  remediatedPdfLocation: string | null
  createdAt: string
  updatedAt: string
  errorMessage: string | null
}

export interface ApiOcrTextBlock {
  text: string
  type: string
  confidence: number
}

export interface ApiOcrTextRegion {
  page: number
  blocks: ApiOcrTextBlock[]
}

export interface ApiOcrDetectedImage {
  imageId: string
  pageNumber: number
  bbox: [number, number, number, number]
  suggestedAltText: string
  imageLocation: string
}

export interface ApiOcrStructureElement {
  type: string
  count: number
}

export interface ApiOcrPreview {
  jobId: string
  pagesProcessed: number
  textRegions: ApiOcrTextRegion[]
  imagesDetected: number
  detectedImages: ApiOcrDetectedImage[]
  structureElements: ApiOcrStructureElement[]
  confidenceScore: number
}

// ── WCAG 2.1 AA compliance ────────────────────────────────────────────

export type WcagSeverity = 'BLOCKER' | 'MAJOR' | 'MINOR'
export type WcagLevel = 'A' | 'AA' | 'AAA'

export interface WcagFinding {
  ruleId: string
  wcagSc: string
  wcagLevel: WcagLevel
  title: string
  description: string
  severity: WcagSeverity
  passed: boolean
  autoFixable: boolean
  fixAction: string | null
  location: string | null
  count: number
  manualReview: boolean
}

export interface WcagReport {
  findings: WcagFinding[]
  score: number
  isCompliant: boolean
  totalRules: number
  passedRules: number
  blockerCount: number
  majorCount: number
  minorCount: number
  autoFixableCount: number
  summary: string
}

export interface ModernizeResult {
  actions: string[]
  before: WcagReport
  after: WcagReport
  scan: ApiScan
}

/** A domain error carrying the backend's stable code (e.g. NOT_TAGGED). */
export class ApiError extends Error {
  constructor(
    message: string,
    readonly code: string,
    readonly status: number,
  ) {
    super(message)
  }
}

async function unwrap<T>(res: Response): Promise<T> {
  if (res.ok) return res.json() as Promise<T>
  let code = 'HTTP_ERROR'
  let message = res.statusText
  try {
    const body = await res.json()
    code = body?.error?.code ?? code
    message = body?.error?.message ?? message
  } catch {
    /* non-JSON error body */
  }
  throw new ApiError(message, code, res.status)
}

const json = { 'Content-Type': 'application/json' }

export const api = {
  async uploadDocument(file: File, department = 'Unknown'): Promise<{ document: ApiDocument; scan: ApiScan }> {
    const form = new FormData()
    form.append('file', file)
    form.append('department', department)
    return unwrap(await fetch('/pdf/documents', { method: 'POST', body: form }))
  },

  /** Register a listed corpus form straight from the source bucket (no upload). */
  async ingestFromCorpus(department: string, file: string): Promise<{ document: ApiDocument; scan: ApiScan }> {
    return unwrap(
      await fetch('/pdf/documents/from-corpus', {
        method: 'POST',
        headers: json,
        body: JSON.stringify({ department, file }),
      }),
    )
  },

  async createJob(docId: string): Promise<{ job: ApiJob }> {
    return unwrap(await fetch('/pdf/jobs', { method: 'POST', headers: json, body: JSON.stringify({ docId }) }))
  },

  async analyze(jobId: string): Promise<{ job: ApiJob }> {
    return unwrap(await fetch(`/pdf/jobs/${jobId}/analyze`, { method: 'POST' }))
  },

  async getJob(jobId: string): Promise<{ job: ApiJob }> {
    return unwrap(await fetch(`/pdf/jobs/${jobId}`))
  },

  async approve(jobId: string, issueId: string, approved: boolean, altText?: string): Promise<{ issue: ApiIssue }> {
    return unwrap(
      await fetch(`/pdf/jobs/${jobId}/alt-text/${issueId}/approve`, {
        method: 'POST',
        headers: json,
        body: JSON.stringify({ approved, altText }),
      }),
    )
  },

  async apply(jobId: string): Promise<{ job: ApiJob }> {
    return unwrap(await fetch(`/pdf/jobs/${jobId}/apply`, { method: 'POST' }))
  },

  imageUrl(jobId: string, issueId: string): string {
    return `/pdf/jobs/${jobId}/issues/${issueId}/image`
  },

  downloadUrl(jobId: string): string {
    return `/pdf/jobs/${jobId}/remediated.pdf`
  },

  // ── OCR reconstruction workflow ──────────────────────────────────

  async createOcrJob(docId: string): Promise<{ job: ApiJob }> {
    return unwrap(await fetch('/pdf/ocr-jobs', { method: 'POST', headers: json, body: JSON.stringify({ docId }) }))
  },

  async getOcrJob(jobId: string): Promise<{ job: ApiJob }> {
    return unwrap(await fetch(`/pdf/ocr-jobs/${jobId}`))
  },

  async reconstructOcr(jobId: string): Promise<{ job: ApiJob }> {
    return unwrap(await fetch(`/pdf/ocr-jobs/${jobId}/reconstruct`, { method: 'POST' }))
  },

  async completeOcrReview(jobId: string): Promise<{ job: ApiJob }> {
    return unwrap(await fetch(`/pdf/ocr-jobs/${jobId}/review-complete`, { method: 'POST' }))
  },

  async getOcrPreview(jobId: string): Promise<{ preview: ApiOcrPreview }> {
    return unwrap(await fetch(`/pdf/ocr-jobs/${jobId}/preview`))
  },

  ocrImageUrl(jobId: string, imageId: string): string {
    return `/pdf/ocr-jobs/${jobId}/images/${imageId}`
  },

  ocrDownloadUrl(jobId: string): string {
    return `/pdf/ocr-jobs/${jobId}/reconstructed.pdf`
  },

  // ── WCAG + tag + modernize ────────────────────────────────────────

  /** Run WCAG 2.1 AA checker on an uploaded PDF (no persistence). */
  async wcagCheckUpload(file: File): Promise<WcagReport> {
    const form = new FormData()
    form.append('file', file)
    return unwrap(await fetch('/pdf/wcag/check', { method: 'POST', body: form }))
  },

  /** Run WCAG check on a persisted document (uses its current stored bytes). */
  async wcagCheckDocument(docId: string): Promise<WcagReport> {
    return unwrap(await fetch(`/pdf/documents/${docId}/wcag`))
  },

  /** Inject a structure tree into an untagged PDF. */
  async tagDocument(docId: string): Promise<{ scan: ApiScan; message: string }> {
    return unwrap(await fetch(`/pdf/documents/${docId}/tag`, { method: 'POST' }))
  },

  /** One-click accessibility modernization: applies every deterministic fixer. */
  async modernizeDocument(docId: string): Promise<ModernizeResult> {
    return unwrap(await fetch(`/pdf/documents/${docId}/modernize`, { method: 'POST' }))
  },

  /** Infer /TU tooltip labels for AcroForm fields lacking one (WCAG 4.1.2). */
  async inferLabels(docId: string): Promise<{
    labelsWritten: number
    writes: { fieldName: string; inferredLabel: string; confidence: string }[]
  }> {
    return unwrap(await fetch(`/pdf/documents/${docId}/infer-labels`, { method: 'POST' }))
  },

  /** URL for inline preview in an <iframe> (Content-Disposition: inline). */
  originalUrl(docId: string): string {
    return `/pdf/documents/${docId}/original.pdf`
  },

  /** URL that forces a browser Save As dialog (Content-Disposition: attachment). */
  originalDownloadUrl(docId: string): string {
    return `/pdf/documents/${docId}/original.pdf?download=1`
  },

  /** Copy an existing doc into a new doc_id so the Workbench can apply fixes
   *  to the clone without mutating the original row. */
  async cloneDocument(docId: string): Promise<{ document: ApiDocument; scan: ApiScan }> {
    return unwrap(await fetch(`/pdf/documents/${docId}/clone`, { method: 'POST' }))
  },
}

/** Poll a job until it reaches a terminal status for the current phase. */
export async function pollJob(
  jobId: string,
  until: (job: ApiJob) => boolean,
  { intervalMs = 1500, timeoutMs = 180_000 }: { intervalMs?: number; timeoutMs?: number } = {},
): Promise<ApiJob> {
  const deadline = Date.now() + timeoutMs
  for (;;) {
    const { job } = await api.getJob(jobId)
    if (job.status === 'FAILED') {
      throw new ApiError(job.errorMessage ?? 'Job failed.', 'JOB_FAILED', 500)
    }
    if (until(job)) return job
    if (Date.now() > deadline) throw new ApiError('Timed out waiting for the job.', 'TIMEOUT', 504)
    await new Promise((r) => setTimeout(r, intervalMs))
  }
}

/** Poll an OCR job until it reaches a terminal status for the current phase. */
export async function pollOcrJob(
  jobId: string,
  until: (job: ApiJob) => boolean,
  { intervalMs = 2000, timeoutMs = 300_000 }: { intervalMs?: number; timeoutMs?: number } = {},
): Promise<ApiJob> {
  const deadline = Date.now() + timeoutMs
  for (;;) {
    const { job } = await api.getOcrJob(jobId)
    if (job.status === 'FAILED') {
      throw new ApiError(job.errorMessage ?? 'OCR job failed.', 'JOB_FAILED', 500)
    }
    if (until(job)) return job
    if (Date.now() > deadline) throw new ApiError('Timed out waiting for the OCR job.', 'TIMEOUT', 504)
    await new Promise((r) => setTimeout(r, intervalMs))
  }
}
