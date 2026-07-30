import type { FormAction, FormInventoryItem } from '../types'

/**
 * Maps a persisted backend document (from GET /pdf/documents) to the
 * FormInventoryItem the dashboard and review queue render. Uploaded documents
 * carry a `triage` block (classification + recommendation); older records
 * without it fall back to the thin fields.
 */
function toInventoryItem(doc: any): FormInventoryItem {
  const t = doc.triage
  return {
    file: doc.filename,
    department: doc.department || 'Uploaded',
    pages: t.pages ?? 1,
    fieldCount: t.fieldCount ?? 0,
    missingLabelCount: t.missingLabelCount ?? 0,
    hasSignatureField: t.hasSignatureField ?? false,
    classification: t.category ?? 'UNKNOWN',
    recommendedAction: (t.recommendedAction ?? 'no_action_needed') as FormAction,
    workItems: t.workItems ?? [],
    rationale: t.rationale ?? '',
    platforms: t.platforms ?? [],
    platformCaveats: t.platformCaveats ?? [],
    platformMigrationRequired: t.platformMigrationRequired ?? false,
    signals: t.signals ?? [],
    docId: doc.docId,
    tagStatus: doc.tagStatus,
  }
}

/**
 * Fetches the persisted uploads from the backend. Returns an empty list if the
 * backend is unreachable, so the static corpus still renders.
 *
 * Only documents carrying triage metadata (genuine Dashboard uploads) are
 * surfaced as inventory rows. Documents without it are remediation working
 * copies (corpus ingests from the Review Queue, direct uploads via the
 * Remediate tab) that would otherwise show as blank "Why / Work" rows.
 */
export async function fetchUploadedForms(): Promise<FormInventoryItem[]> {
  try {
    const response = await fetch('/pdf/documents')
    if (!response.ok) return []
    const data = await response.json()
    return (data.documents ?? []).filter((doc: any) => doc.triage).map(toInventoryItem)
  } catch {
    return []
  }
}
