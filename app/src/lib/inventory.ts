import type { FormAction, FormInventoryItem } from '../types'

/**
 * Maps a persisted backend document (from GET /pdf/documents) to the
 * FormInventoryItem the dashboard and review queue render. Uploaded documents
 * carry a `triage` block (classification + recommendation); older records
 * without it fall back to the thin fields.
 */
function toInventoryItem(doc: any): FormInventoryItem {
  const t = doc.triage ?? {}
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
    fixedByRamp: !!doc.fixedByRamp,
    parentDocId: doc.parentDocId ?? undefined,
  }
}

/**
 * Fetches the persisted uploads from the backend. Returns an empty list if the
 * backend is unreachable, so the static corpus still renders.
 *
 * Filters:
 *  - documents without triage metadata are remediation working copies
 *    (corpus ingests, direct Workbench uploads) — they'd render as blank
 *    "Why / Work" rows so we hide them.
 *  - documents with a parentDocId are clones created by /clone (the Fix
 *    Issues flow). They're kept in the backend for downloads + a future
 *    "Fixed by Ramp" filter, but hidden from the main Review Queue.
 */
export async function fetchUploadedForms(): Promise<FormInventoryItem[]> {
  try {
    const response = await fetch('/pdf/documents')
    if (!response.ok) return []
    const data = await response.json()
    return (data.documents ?? [])
      .filter((doc: any) => doc.triage && !doc.parentDocId)
      .map(toInventoryItem)
  } catch {
    return []
  }
}

/** Fetch just the "fixed by Ramp" clones (docs with a parent). Used by the
 *  Review Queue to mark a parent row as "Issues Fixed" when a clone exists. */
export async function fetchFixedClones(): Promise<{ docId: string; parentDocId: string; fixedByRamp: boolean }[]> {
  try {
    const response = await fetch('/pdf/documents')
    if (!response.ok) return []
    const data = await response.json()
    return (data.documents ?? [])
      .filter((doc: any) => doc.parentDocId)
      .map((doc: any) => ({
        docId: doc.docId,
        parentDocId: doc.parentDocId,
        fixedByRamp: !!doc.fixedByRamp,
      }))
  } catch {
    return []
  }
}
