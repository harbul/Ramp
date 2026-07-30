import type { Issue, IssueStateMap, PdfDoc, RemediationResult } from '../types'

/** Human-readable description of an applied fix, used in the summary and the PDF. */
export function describeFix(issue: Issue): string {
  return issue.type === 'alt'
    ? `Added alt text to ${issue.imageLabel} on Page ${issue.page}`
    : `Repaired bookmark “${issue.bookmarkLabel}”`
}

/** Description of an issue left unresolved. */
export function describeSkipped(issue: Issue): string {
  return issue.type === 'alt'
    ? `${issue.imageLabel} on Page ${issue.page} still missing alternative text`
    : `Bookmark “${issue.bookmarkLabel}” still broken`
}

/** `Travel Reimbursement Form.pdf` → `Travel-Reimbursement-Form-remediated.pdf` */
export function remediatedFileName(original: string): string {
  const base = original.replace(/\.pdf$/i, '')
  return `${base.trim().replace(/\s+/g, '-')}-remediated.pdf`
}

export function formatToday(date: Date = new Date()): string {
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

/** A fix is applied when the reviewer checked it and did not reject it. */
export function isApplied(issue: Issue, state: IssueStateMap): boolean {
  const entry = state[issue.id]
  return Boolean(entry?.selected) && entry?.verdict !== 'rejected'
}

export function buildResult(doc: PdfDoc, state: IssueStateMap): RemediationResult {
  const applied = doc.issues.filter((issue) => isApplied(issue, state))
  const skipped = doc.issues.filter((issue) => !isApplied(issue, state))

  return {
    docId: doc.id,
    originalName: doc.name,
    newName: remediatedFileName(doc.name),
    remediatedOn: formatToday(),
    fixed: applied.map(describeFix),
    skipped: skipped.map(describeSkipped),
    fixedIssueIds: applied.map((issue) => issue.id),
  }
}

/** Fresh review state: every suggestion checked, none judged yet. */
export function initialIssueState(doc: PdfDoc): IssueStateMap {
  const state: IssueStateMap = {}
  for (const issue of doc.issues) {
    state[issue.id] = {
      selected: true,
      verdict: null,
      altText: issue.type === 'alt' ? issue.suggestedAlt : '',
    }
  }
  return state
}
