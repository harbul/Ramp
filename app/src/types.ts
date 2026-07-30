/**
 * Domain types for the PDF Remediation Assistant.
 *
 * The shape here mirrors the campus workflow: a document carries a page
 * layout, a bookmark tree, and a list of detected accessibility issues.
 * Each issue anchors to something real in the render (an image, a bookmark)
 * so markers stay aligned without hardcoded coordinates.
 */

export type View = 'library' | 'workspace' | 'complete' | 'dashboard' | 'remediate'

export type DocStatus = 'needs-review' | 'issues-found' | 'remediated'

export type Severity = 'High' | 'Medium' | 'Low'

/** A reviewer's decision on an AI suggestion. `null` means still pending. */
export type Verdict = 'approved' | 'rejected' | null

/* ── Page content ──────────────────────────────────────────────── */

export type LineWidth = 'full' | 'mid' | 'short'

export type Block =
  | { kind: 'line'; width: LineWidth }
  | { kind: 'field' }
  | { kind: 'image'; imageId: string }
  | { kind: 'gap' }

export interface PdfPage {
  kicker: string
  title: string
  blocks: Block[]
}

/* ── Bookmarks ─────────────────────────────────────────────────── */

export interface Bookmark {
  id: string
  label: string
  /** Page the bookmark currently resolves to; `null` when the target is missing. */
  target: number | null
  /** Page the bookmark should resolve to once repaired. */
  correctTarget: number
}

/* ── Issues ────────────────────────────────────────────────────── */

interface IssueBase {
  id: string
  page: number
  severity: Severity
}

export interface AltTextIssue extends IssueBase {
  type: 'alt'
  /** Matches a `Block` of kind `image` on the page, so the marker can anchor to it. */
  imageId: string
  imageLabel: string
  suggestedAlt: string
}

export interface BookmarkIssue extends IssueBase {
  type: 'bookmark'
  /** Matches a `Bookmark.id` on the document. */
  bookmarkId: string
  bookmarkLabel: string
  problem: string
  suggestedFix: string
}

export type Issue = AltTextIssue | BookmarkIssue

/* ── Documents ─────────────────────────────────────────────────── */

export interface PdfDoc {
  id: string
  name: string
  department: string
  updated: string
  size: string
  status: DocStatus
  pages: PdfPage[]
  bookmarks: Bookmark[]
  issues: Issue[]
}

/* ── Review state ──────────────────────────────────────────────── */

/** Per-issue reviewer state, keyed by issue id. */
export interface IssueState {
  /** Whether the fix will be applied when the reviewer generates the PDF. */
  selected: boolean
  verdict: Verdict
  /** Editable alt text; empty for bookmark issues. */
  altText: string
}

export type IssueStateMap = Record<string, IssueState>

export interface RemediationResult {
  docId: string
  originalName: string
  newName: string
  remediatedOn: string
  /** Human-readable descriptions of each applied fix. */
  fixed: string[]
  skipped: string[]
  fixedIssueIds: string[]
}

/* ── Dashboard (Form Inventory) ────────────────────────────────── */

export type FormAction = 'remediate_in_place' | 'recreate_accessible_pdf' | 'migrate' | 'no_action_needed'

export interface FormInventoryItem {
  file: string
  department: string
  pages: number
  fieldCount: number
  missingLabelCount: number
  hasSignatureField: boolean
  classification: string
  recommendedAction: FormAction
  workItems: string[]
  rationale: string
  platforms: string[]
  platformCaveats: string[]
  platformMigrationRequired: boolean
  signals: string[]
  /** Populated for live uploads (from GET /pdf/documents); undefined for the static corpus. */
  docId?: string
  /** Populated for live uploads; undefined for the static corpus (which is assumed tagged). */
  tagStatus?: 'TAGGED' | 'UNTAGGED' | 'TAGGED_NO_FIGURES'
  /** External URL to the PDF (for DubBot-sampled campus PDFs) — used by the "View" button. */
  sourceUrl?: string
}

export interface DashboardStats {
  totalForms: number
  formsWithNoFields: number
  totalMissingLabels: number
  formsMigrationRequired: number
  actionCounts: Record<FormAction, number>
}
