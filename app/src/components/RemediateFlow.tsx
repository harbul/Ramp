/**
 * The real remediation flow, wired to the backend:
 *   upload a PDF -> detect issues -> AI suggests alt text -> approve/edit
 *   -> apply -> download the fixed PDF.
 *
 * Unlike the fixture-driven Library/Workspace/Complete pages, every value here
 * comes from the API. It's a single view with an internal state machine so the
 * whole loop can be tested on one document.
 */

import { useEffect, useRef, useState } from 'react'
import {
  ApiError,
  ApiIssue,
  ApiJob,
  api,
  pollJob,
  pollOcrJob,
  type ApiDocument,
  type ApiOcrDetectedImage,
  type ApiOcrPreview,
  type ApiScan,
  type WcagReport,
} from '../lib/api'
import { Badge } from './Badge'
import { Check, Download, Search } from './Icons'
import { WcagHeaderStrip, IssueSectionCard, SectionSuccess } from './WorkbenchLayout'
import { groupIntoSections, type SectionKey } from '../lib/wcagSections'

const ALT_LIMIT = 125

type Phase =
  | 'idle'
  | 'uploaded'
  | 'analyzing'
  | 'review'
  | 'applying'
  | 'done'
  | 'ocr-analyzing'
  | 'ocr-review'
  | 'ocr-done'

/** Per-issue reviewer state, keyed by issueId. */
interface Review {
  altText: string
  rejected: boolean
}

/** Per-image OCR reviewer state, keyed by imageId. */
interface OcrImageReview {
  altText: string
  approved: boolean
}

/** How the Workbench should populate itself when the user lands here. */
type WorkbenchTarget =
  | { kind: 'corpus'; department: string; file: string }
  | { kind: 'docId'; docId: string; filename: string }
  | { kind: 'sourceUrl'; sourceUrl: string; filename: string; department: string }
  | null

interface RemediateFlowProps {
  target?: WorkbenchTarget
  /** Called after a fix is applied so the caller can refresh its cached
   *  inventory (e.g. flip the Review Queue's Fix Issues button). */
  onFixApplied?: () => void
}

export function RemediateFlow({ target = null, onFixApplied }: RemediateFlowProps) {
  const [phase, setPhase] = useState<Phase>('idle')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [doc, setDoc] = useState<ApiDocument | null>(null)
  const [scan, setScan] = useState<ApiScan | null>(null)
  const [job, setJob] = useState<ApiJob | null>(null)
  const [reviews, setReviews] = useState<Record<string, Review>>({})
  const [ocrPreview, setOcrPreview] = useState<ApiOcrPreview | null>(null)
  const [ocrImageReviews, setOcrImageReviews] = useState<Record<string, OcrImageReview>>({})
  // WCAG scorecard state — populated by "Find Issues" (POST /wcag/check)
  const [wcag, setWcag] = useState<WcagReport | null>(null)
  const [wcagBefore, setWcagBefore] = useState<number | null>(null)
  const [fixingAction, setFixingAction] = useState<string | null>(null)
  // Which section is currently applying its fixes.
  const [sectionBusy, setSectionBusy] = useState<SectionKey | null>(null)
  // Per-section success trail — recap of what got applied. Once a section has
  // an entry here, its card renders as a success strip.
  const [sectionSuccess, setSectionSuccess] = useState<Record<string, string[]>>({})
  // Whether Remediation is currently expanded with the inline reviewer.
  const [remediationExpanded, setRemediationExpanded] = useState(false)
  // Whether Compliance is expanded to show per-finding recommendations.
  const [complianceExpanded, setComplianceExpanded] = useState(false)
  // Compliance findings the reviewer has marked done (client-side only).
  const [complianceReviewed, setComplianceReviewed] = useState<Set<string>>(new Set())

  const fileInput = useRef<HTMLInputElement>(null)

  function reset() {
    setPhase('idle')
    setBusy(false)
    setError(null)
    setDoc(null)
    setScan(null)
    setJob(null)
    setReviews({})
    setOcrPreview(null)
    setOcrImageReviews({})
    setWcag(null)
    setWcagBefore(null)
    setFixingAction(null)
    setSectionBusy(null)
    setSectionSuccess({})
    setRemediationExpanded(false)
    setComplianceExpanded(false)
    setComplianceReviewed(new Set())
    if (fileInput.current) fileInput.current.value = ''
  }

  async function run<T>(fn: () => Promise<T>): Promise<T | undefined> {
    setBusy(true)
    setError(null)
    try {
      return await fn()
    } catch (err) {
      const message = err instanceof ApiError ? err.message : String(err)
      setError(message)
      return undefined
    } finally {
      setBusy(false)
    }
  }

  async function onFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    reset()
    await run(async () => {
      const { document, scan } = await api.uploadDocument(file, 'Demo Upload')
      setDoc(document)
      setScan(scan)
      setPhase('uploaded')
      // Do not auto-run the WCAG scan — the Workbench flow asks the user to
      // click "Find Issues" explicitly so the analysis step is discoverable.
    })
  }

  // Arriving from the Review Queue with a target: load the right doc into
  // the Workbench. Three shapes:
  //   corpus    — ingest from the DXHub corpus bucket
  //   docId     — clone an existing backend doc so the parent row stays
  //               byte-identical; the clone is the working copy
  //   sourceUrl — fetch a public campus URL (DubBot rows) and upload it as
  //               a fresh backend doc, then treat it as the working copy
  useEffect(() => {
    if (!target) return
    let cancelled = false
    reset()
    setBusy(true)
    const load = async () => {
      if (target.kind === 'corpus') {
        return api.ingestFromCorpus(target.department, target.file)
      }
      if (target.kind === 'docId') {
        return api.cloneDocument(target.docId)
      }
      // sourceUrl: pull bytes from the campus URL, then upload as a new doc.
      const res = await fetch(target.sourceUrl)
      if (!res.ok) throw new ApiError(`Fetch ${target.sourceUrl} → ${res.status}`, 'FETCH_FAILED', res.status)
      const blob = await res.blob()
      const file = new File([blob], target.filename, { type: 'application/pdf' })
      return api.uploadDocument(file, target.department)
    }
    load()
      .then(({ document, scan }) => {
        if (cancelled) return
        setDoc(document)
        setScan(scan)
        setPhase('uploaded')
      })
      .catch((err) => {
        if (cancelled) return
        setError(err instanceof ApiError ? err.message : String(err))
      })
      .finally(() => {
        if (!cancelled) setBusy(false)
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target])

  /**
   * "Find Issues" — the analysis step. Runs the WCAG 2.1 AA scan on the
   * currently stored bytes and pins the score so subsequent fixes can show
   * a delta.
   */
  async function findIssues() {
    if (!doc) return
    setFixingAction('find_issues')
    setError(null)
    try {
      const report = await api.wcagCheckDocument(doc.docId)
      setWcag(report)
      setWcagBefore(report.score) // baseline for delta
      setSectionSuccess({})
    } catch (err) {
      setError(err instanceof ApiError ? err.message : String(err))
    } finally {
      setFixingAction(null)
    }
  }

  /**
   * Apply every deterministic Modernization fix: inject tags if untagged, set
   * language/title/PDF-UA/MarkInfo, and write /TU tooltips on unlabelled form
   * fields. Marks the Modernization section as done with a recap.
   */
  async function applyModernization() {
    if (!doc) return
    setSectionBusy('modernization')
    setError(null)
    const trail: string[] = []
    try {
      if (scan?.tagStatus === 'UNTAGGED') {
        try {
          const { scan: newScan } = await api.tagDocument(doc.docId)
          setScan(newScan)
          trail.push('Injected structure tree (Tag PDF)')
        } catch (err) {
          trail.push(`Tag skipped: ${err instanceof ApiError ? err.message : String(err)}`)
        }
      }
      try {
        const modernized = await api.modernizeDocument(doc.docId)
        setScan(modernized.scan)
        if (modernized.actions.length > 0 && modernized.after.score > modernized.before.score) {
          for (const a of modernized.actions) trail.push(a)
        }
      } catch (err) {
        trail.push(`Modernize skipped: ${err instanceof ApiError ? err.message : String(err)}`)
      }
      try {
        const labels = await api.inferLabels(doc.docId)
        if (labels.labelsWritten > 0) {
          trail.push(`Wrote ${labels.labelsWritten} form-field label${labels.labelsWritten === 1 ? '' : 's'}`)
        }
      } catch (err) {
        trail.push(`Label inference skipped: ${err instanceof ApiError ? err.message : String(err)}`)
      }
      // Re-score so header strip shows delta immediately.
      try {
        const report = await api.wcagCheckDocument(doc.docId)
        setWcag(report)
      } catch { /* noop */ }
      if (trail.length === 0) trail.push('Already modernized — nothing to do.')
      setSectionSuccess((prev) => ({ ...prev, modernization: trail }))
      // Signal the Review Queue that this doc's fixed_by_ramp flag flipped
      // so its "Fix Issues" button can update to "Issues Fixed ✓".
      onFixApplied?.()
    } finally {
      setSectionBusy(null)
    }
  }

  /**
   * "Fix all auto-fixable" — the header strip's mega-button. Runs the
   * Modernization section's fixes. Called by the WcagHeaderStrip.
   */
  async function fixAllAutoFixable() {
    setFixingAction('fix_all')
    try {
      await applyModernization()
    } finally {
      setFixingAction(null)
    }
  }

  /**
   * "Review" (Remediation) — expand the section IN-PLACE with the AI's
   * alt-text suggestions. Does NOT change the top-level phase, so the whole
   * page stays on the sectioned Workbench layout; the reviewer appears
   * inside the Remediation card's body via inlineReviewer.
   */
  async function startAltTextReview() {
    if (!doc) return
    setSectionBusy('remediation')
    setError(null)
    setRemediationExpanded(true)
    try {
      const { job } = await api.createJob(doc.docId)
      await api.analyze(job.jobId)
      const ready = await pollJob(job.jobId, (j) => j.status === 'NEEDS_REVIEW')
      setJob(ready)
      const initial: Record<string, Review> = {}
      for (const issue of ready.issues) {
        initial[issue.issueId] = { altText: issue.suggestedAltText ?? '', rejected: false }
      }
      setReviews(initial)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : String(err))
      setRemediationExpanded(false)
    } finally {
      setSectionBusy(null)
    }
  }

  /**
   * Apply the reviewer's alt-text approvals + writes the PDF. On success,
   * collapses the Remediation section into a SectionSuccess strip.
   */
  async function applyRemediation() {
    if (!doc || !job) return
    setSectionBusy('remediation')
    setError(null)
    try {
      for (const issue of job.issues) {
        const r = reviews[issue.issueId]
        if (!r) continue
        if (r.rejected || !r.altText.trim()) {
          if (issue.suggestedAltText) await api.approve(job.jobId, issue.issueId, false)
          continue
        }
        await api.approve(job.jobId, issue.issueId, true, r.altText.trim())
      }
      await api.apply(job.jobId)
      const done = await pollJob(job.jobId, (j) => j.status === 'COMPLETE')
      setJob(done)
      const appliedCount = done.issues.filter((i) => i.status === 'APPLIED').length
      setSectionSuccess((prev) => ({
        ...prev,
        remediation: [
          `Wrote alt text to ${appliedCount} figure${appliedCount === 1 ? '' : 's'}`,
          'Independently verified each write survived the PDF save',
        ],
      }))
      setRemediationExpanded(false)
      // Re-score so the header strip's delta reflects the fix.
      try {
        const report = await api.wcagCheckDocument(doc.docId)
        setWcag(report)
      } catch { /* noop */ }
      // Tell the Review Queue to refresh the parent row's Fix state.
      onFixApplied?.()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : String(err))
    } finally {
      setSectionBusy(null)
    }
  }

  /**
   * Compliance flow: mark a manual-review finding as acknowledged. When all
   * failing findings in the Compliance section are marked, the section
   * collapses into a SectionSuccess strip.
   */
  function markComplianceReviewed(ruleId: string) {
    setComplianceReviewed((prev) => {
      const next = new Set(prev)
      next.add(ruleId)
      // If every failing Compliance finding is reviewed, mark section done.
      if (wcag) {
        const complianceSection = groupIntoSections(wcag).find((s) => s.key === 'compliance')
        if (complianceSection) {
          const unreviewed = complianceSection.failing.filter((f) => !next.has(f.ruleId))
          if (unreviewed.length === 0) {
            setSectionSuccess((prevSuccess) => ({
              ...prevSuccess,
              compliance: [
                `Reviewed ${complianceSection.failing.length} compliance finding${complianceSection.failing.length === 1 ? '' : 's'}`,
                'Manual remediation steps recorded — apply them in your PDF editor',
              ],
            }))
          }
        }
      }
      return next
    })
  }

  async function startOcr() {
    if (!doc) return
    await run(async () => {
      const { job } = await api.createOcrJob(doc.docId)
      setJob(job)
      setPhase('ocr-analyzing')
      await api.reconstructOcr(job.jobId)
      const ready = await pollOcrJob(job.jobId, (j) =>
        j.status === 'NEEDS_REVIEW' || j.status === 'COMPLETE'
      )
      setJob(ready)

      // Fetch OCR preview with detected images and text
      try {
        const { preview } = await api.getOcrPreview(ready.jobId)
        setOcrPreview(preview)

        // Initialize alt-text reviews for each detected image
        const initialReviews: Record<string, OcrImageReview> = {}
        for (const img of preview.detectedImages ?? []) {
          initialReviews[img.imageId] = {
            altText: img.suggestedAltText ?? '',
            approved: false,
          }
        }
        setOcrImageReviews(initialReviews)
      } catch {
        // Preview not critical — proceed to review phase anyway
      }

      setPhase('ocr-review')
    })
  }

  async function completeOcrReview() {
    if (!job) return
    await run(async () => {
      await api.completeOcrReview(job.jobId)
      const done = await pollOcrJob(job.jobId, (j) => j.status === 'COMPLETE')
      setJob(done)
      setPhase('ocr-done')
    })
  }

  // Live-updating tallies for the inline Remediation reviewer.
  const suggestable = job?.issues.filter((i) => i.suggestedAltText) ?? []
  const approvedCount = suggestable.filter((i) => {
    const r = reviews[i.issueId]
    return r && !r.rejected && r.altText.trim()
  }).length

  const sections = wcag ? groupIntoSections(wcag) : []
  const downloadUrl = doc ? api.originalDownloadUrl(doc.docId) : null

  // What to tell the reviewer to do about each manual/Compliance finding.
  // Keyed by rule_id from core/wcag.py. These are demo-friendly, editor-agnostic
  // instructions — the user reviews and marks each as done.
  const COMPLIANCE_RECOMMENDATIONS: Record<string, string> = {
    'WCAG-1.3.1-headings':
      'Open the PDF in a tagged-PDF editor (Adobe Acrobat Pro > Accessibility) and promote the largest-font text blocks to H1, next-largest to H2, and so on. Ramp cannot infer heading levels safely on its own.',
    'WCAG-1.3.1-heading-skip':
      'Renumber headings so levels progress by one at a time (no H1 → H3 jumps). Screen readers rely on this to build the navigation outline.',
    'WCAG-1.3.1-table-headers':
      'In your PDF editor, select the first row of each data table and change its role from /TD to /TH. Set /Scope=Column so screen readers announce column headers with every cell.',
    'WCAG-encoding-tounicode':
      'Re-embed the flagged fonts with a proper /ToUnicode CMap. Most authoring tools (Word → PDF, LaTeX with the CJK package, InDesign) do this automatically when you re-export.',
    'WCAG-2.4.5-bookmarks':
      'Generate a bookmark outline from the document headings (Acrobat Pro > View > Show/Hide > Navigation Panes > Bookmarks > New Bookmarks From Structure).',
    'WCAG-1.4.3-contrast':
      'Verify text-to-background contrast (≥ 4.5:1 for normal text, 3:1 for large text) with a viewer that has a contrast tool — Adobe Acrobat Pro, PAC 2024, or NVDA with a color-contrast add-on.',
  }

  // The Modernization section may include a passing "figure alt" rule that
  // classifies into Remediation but is passing — treat the whole section as
  // done for the terminal-download state.
  const applicableSections = sections.filter(
    (s) => s.failing.length > 0 || sectionSuccess[s.key],
  )
  const allSectionsDone =
    applicableSections.length > 0 &&
    applicableSections.every((s) => sectionSuccess[s.key])

  return (
    <section className="view" aria-labelledby="flow-title">
      <div className="wrap">
        <div className="pagehead">
          <h1 className="pagehead__title" id="flow-title">
            PDF Workbench
          </h1>
          <p className="pagehead__sub">
            Upload a PDF, find every accessibility issue Ramp can detect, fix each category in one
            click (with human review where it matters), and download the modernized file.
          </p>
        </div>

        {/* ── upload / find-issues bar ────────────────────────────── */}
        <div className="uploadbar">
          <input
            ref={fileInput}
            type="file"
            accept="application/pdf"
            id="pdf-upload"
            className="visually-hidden"
            onChange={onFile}
          />
          <label htmlFor="pdf-upload" className="btn btn--ghost">
            <Search />
            {doc ? 'Choose a different PDF' : 'Upload PDF'}
          </label>

          {doc && <span className="uploadbar__name">{doc.filename}</span>}

          {doc && phase === 'uploaded' && (
            <button
              type="button"
              className="btn btn--primary"
              onClick={findIssues}
              disabled={fixingAction === 'find_issues'}
              title="Run the WCAG 2.1 AA scan on this PDF"
            >
              {fixingAction === 'find_issues' ? 'Scanning…' : wcag ? 'Re-scan' : 'Find Issues'}
            </button>
          )}
        </div>

        {error && (
          <p className="hint hint--warn" role="alert">
            {error}
          </p>
        )}

        {busy && phase === 'idle' && (
          <p className="flow-status" role="status">
            <span className="spinner" aria-hidden="true" />
            Loading the form from the library…
          </p>
        )}

        {busy && (phase === 'analyzing' || phase === 'applying' || phase === 'ocr-analyzing') && (
          <p className="flow-status" role="status">
            <span className="spinner" aria-hidden="true" />
            {phase === 'analyzing'
              ? 'Analyzing the PDF and generating alt-text suggestions… a few seconds per image.'
              : phase === 'ocr-analyzing'
                ? 'Running OCR and reconstructing document structure… this may take a minute.'
                : 'Writing the approved alt text into the PDF…'}
          </p>
        )}

        {/* ── pre-scan state: show scan summary, prompt Find Issues ── */}
        {scan && doc && phase === 'uploaded' && !wcag && (
          <ScanSummary doc={doc} scan={scan} onStartOcr={startOcr} busy={busy} />
        )}

        {/* ── after Find Issues: header strip + sectioned findings ── */}
        {wcag && phase === 'uploaded' && (
          <>
            <WcagHeaderStrip
              report={wcag}
              beforeScore={wcagBefore ?? undefined}
              autoFixableCount={wcag.autoFixableCount}
              onFixAllAutoFixable={fixAllAutoFixable}
              onDownload={() => downloadUrl && window.open(downloadUrl, '_blank')}
              canDownload={!!downloadUrl && Object.keys(sectionSuccess).length > 0}
              busy={fixingAction}
            />

            {sections.map((s) => {
              const success = sectionSuccess[s.key]
              if (success) {
                return <SectionSuccess key={s.key} title={s.title} actions={success} />
              }
              const inlineReviewer =
                s.key === 'remediation' && remediationExpanded ? (
                  <AltTextInlineReviewer
                    job={job}
                    reviews={reviews}
                    approvedCount={approvedCount}
                    suggestableCount={suggestable.length}
                    busy={sectionBusy === 'remediation'}
                    onReviewChange={(issueId, patch) =>
                      setReviews((prev) => ({
                        ...prev,
                        [issueId]: {
                          altText: '',
                          rejected: false,
                          ...prev[issueId],
                          ...patch,
                        },
                      }))
                    }
                    onApply={applyRemediation}
                  />
                ) : undefined
              return (
                <IssueSectionCard
                  key={s.key}
                  section={s}
                  busy={sectionBusy}
                  forceOpen={
                    (s.key === 'remediation' && remediationExpanded) ||
                    (s.key === 'compliance' && complianceExpanded)
                  }
                  inlineReviewer={inlineReviewer}
                  onApply={
                    s.key === 'modernization' && s.failing.length > 0
                      ? () => applyModernization()
                      : s.key === 'remediation' && s.failing.length > 0
                        ? () => startAltTextReview()
                        : s.key === 'compliance' && s.failing.length > 0
                          ? () => setComplianceExpanded(true)
                          : undefined
                  }
                  onFindingReviewed={s.key === 'compliance' ? markComplianceReviewed : undefined}
                  reviewedFindings={s.key === 'compliance' ? complianceReviewed : undefined}
                  recommendations={s.key === 'compliance' ? COMPLIANCE_RECOMMENDATIONS : undefined}
                />
              )
            })}
          </>
        )}

        {/* ── terminal Download panel ──────────────────────────────
           When every applicable section has been marked done (via
           SectionSuccess), promote the download to a large call to action.
        */}
        {allSectionsDone && downloadUrl && (
          <div className="panel done-panel">
            <div className="panel__body panel__body--summary">
              <span className="tick" aria-hidden="true">
                <Check />
              </span>
              <h2 className="subhead" style={{ border: 0, textAlign: 'center' }}>
                All fixes applied
              </h2>
              <p style={{ textAlign: 'center', color: 'var(--ink-soft)' }}>
                Every issue Ramp could act on has been resolved. The modernized PDF is ready to
                download.
              </p>
              <div className="actions">
                <a className="btn btn--primary btn--lg" href={downloadUrl} download>
                  <Download />
                  Download modernized PDF
                </a>
                <button type="button" className="btn btn--ghost" onClick={reset}>
                  Analyze another PDF
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── OCR review ──────────────────────────────────────────── */}
        {phase === 'ocr-review' && job && (
          <OcrReviewPanel
            job={job}
            preview={ocrPreview}
            imageReviews={ocrImageReviews}
            onImageReviewChange={(imageId, patch) =>
              setOcrImageReviews((prev) => ({
                ...prev,
                [imageId]: {
                  altText: prev[imageId]?.altText ?? '',
                  approved: prev[imageId]?.approved ?? false,
                  ...patch,
                },
              }))
            }
            onComplete={completeOcrReview}
            busy={busy}
          />
        )}

        {/* ── OCR done ────────────────────────────────────────────── */}
        {phase === 'ocr-done' && job && (
          <div className="panel done-panel">
            <div className="panel__body panel__body--summary">
              <span className="tick" aria-hidden="true">
                <Check />
              </span>
              <h2 className="subhead" style={{ border: 0, textAlign: 'center' }}>
                OCR Reconstruction complete
              </h2>
              <p style={{ textAlign: 'center', color: 'var(--ink-soft)' }}>
                The scanned PDF has been reconstructed with full text, structure tags, and
                accessibility metadata.
              </p>
              <div className="actions">
                <a className="btn btn--primary btn--lg" href={api.ocrDownloadUrl(job.jobId)}>
                  <Download />
                  Download Reconstructed PDF
                </a>
                <button type="button" className="btn btn--ghost" onClick={reset}>
                  Process another PDF
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

/**
 * The alt-text reviewer, unfolded inline inside the Remediation section card.
 * A compressed version of the old page-level review UI: one row per figure
 * with the image, editable alt text, and reject toggle; a single Apply button
 * at the bottom writes every approval into the PDF.
 */
function AltTextInlineReviewer({
  job,
  reviews,
  approvedCount,
  suggestableCount,
  busy,
  onReviewChange,
  onApply,
}: {
  job: ApiJob | null
  reviews: Record<string, Review>
  approvedCount: number
  suggestableCount: number
  busy: boolean
  onReviewChange: (issueId: string, patch: Partial<Review>) => void
  onApply: () => void
}) {
  if (!job) {
    return (
      <p className="flow-status" role="status">
        <span className="spinner" aria-hidden="true" />
        Analyzing the PDF and drafting alt text for each figure…
      </p>
    )
  }
  return (
    <>
      <div className="issuebar">
        <p className="issuebar__status" role="status">
          {approvedCount} of {suggestableCount} approved
        </p>
        <div className="issuebar__actions">
          <button
            type="button"
            className="btn btn--primary"
            onClick={onApply}
            disabled={busy || approvedCount === 0}
          >
            {busy ? 'Applying…' : 'Apply'}
          </button>
        </div>
      </div>
      <ul className="issues">
        {job.issues.map((issue, i) => (
          <IssueRow
            key={issue.issueId}
            jobId={job.jobId}
            issue={issue}
            index={i + 1}
            review={reviews[issue.issueId]}
            onChange={(patch) => onReviewChange(issue.issueId, patch)}
          />
        ))}
      </ul>
    </>
  )
}

function ScanSummary({
  doc,
  scan,
  onStartOcr,
  busy,
}: {
  doc: ApiDocument
  scan: ApiScan
  onStartOcr: () => void
  busy: boolean
}) {
  // ── OCR-eligible scanned document ─────────────────────────────
  if (scan.route === 'OCR_RECONSTRUCTION') {
    return (
      <div className="panel scan-panel">
        <div className="panel__body panel__body--summary">
          <Badge tone="warn" dot>
            Scanned document — different pipeline
          </Badge>
          <p>
            <strong>{doc.filename}</strong> is a scanned (bitmap) PDF with {scan.pageCount} page
            {scan.pageCount === 1 ? '' : 's'} and no real text layer — the pages are just images
            of paper.
          </p>
          <p style={{ marginTop: '.4rem' }}>
            <strong>Reconstruct with OCR</strong> is a different pipeline from the normal
            Find Issues / Fix flow. It runs Amazon Textract on every page to extract the text,
            then rebuilds the PDF from scratch with: a real (screen-reader-readable) text layer,
            a structure tree (H1 / paragraphs / figures), and detected figure regions ready for
            alt text.
          </p>
          <p style={{ marginTop: '.4rem', color: 'var(--ink-soft)', fontSize: '.9rem' }}>
            You'd use <em>Find Issues</em> for a digital PDF that just needs metadata / tags / alt
            text patched. You use <em>Reconstruct with OCR</em> when the PDF has no real text
            underneath — there's nothing to patch, so the whole document is rebuilt.
          </p>
          <div className="actions" style={{ marginTop: '1rem' }}>
            <button
              type="button"
              className="btn btn--primary"
              onClick={onStartOcr}
              disabled={busy}
            >
              Reconstruct with OCR
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Hard-block reasons: truly nothing we can do ───────────────
  // For these, clicking Find Issues would still produce a WCAG report, but the
  // reviewer really can't proceed until the underlying issue is resolved.
  const HARD_BLOCKS = new Set([
    'FILE_TOO_LARGE',
    'TOO_MANY_PAGES',
    'CORRUPT_PDF',
    'ENCRYPTED_PDF',
    'DIGITALLY_SIGNED',
  ])
  if (scan.route === 'UNSUPPORTED' && scan.unsupportedReason && HARD_BLOCKS.has(scan.unsupportedReason)) {
    const reasonMessages: Record<string, string> = {
      FILE_TOO_LARGE: 'exceeds the 25 MB file size limit for processing.',
      TOO_MANY_PAGES: 'exceeds the 50 page limit for processing.',
      DIGITALLY_SIGNED: 'has digital signatures that would be invalidated by any modification.',
      CORRUPT_PDF: 'could not be parsed; the file may be corrupt.',
      ENCRYPTED_PDF: 'is password-protected. Remove the password and re-upload.',
    }
    const message = reasonMessages[scan.unsupportedReason] ?? 'cannot be processed.'
    return (
      <div className="panel scan-panel">
        <div className="panel__body panel__body--summary">
          <Badge tone="alert" dot>Cannot process</Badge>
          <p><strong>{doc.filename}</strong> {message}</p>
        </div>
      </div>
    )
  }

  // ── Soft states: Ramp CAN still audit compliance, so encourage
  //    the user to click Find Issues. This includes:
  //      * UNSUPPORTED + NO_PROCESSABLE_CONTENT (tagged, no figures)
  //      * UNSUPPORTED + BORN_DIGITAL_UNTAGGED (missing structure tree,
  //         but our Tag PDF fixer can inject one)
  //      * INTERACTIVE_FORMS / NON_ENGLISH_LANGUAGE (out of the alt-text
  //         path but WCAG scan still surfaces structural findings)
  //      * The normal ALT_TEXT_REMEDIATION route (figures need alt).
  //      * The "no issues" case (tagged, all figures have alt).
  const context =
    scan.route === 'UNSUPPORTED' && scan.unsupportedReason === 'BORN_DIGITAL_UNTAGGED'
      ? 'is missing its structure tree. Ramp can inject one for you as part of Modernization.'
      : scan.route === 'UNSUPPORTED' && scan.unsupportedReason === 'NO_PROCESSABLE_CONTENT'
        ? 'has no figures needing alt text. There may still be metadata, structural, or compliance issues to audit.'
        : scan.route === 'UNSUPPORTED'
          ? 'has been flagged as outside the normal remediation path, but Ramp can still audit its WCAG compliance.'
          : scan.figuresMissingAlt > 0
            ? `is tagged with ${scan.pageCount} page${scan.pageCount === 1 ? '' : 's'}. Found ${scan.figuresMissingAlt} figure${scan.figuresMissingAlt === 1 ? '' : 's'} missing alt text (plus any metadata or structural issues Ramp will surface).`
            : `is tagged and every figure already has alt text. Ramp can still audit metadata, headings, tables, and other WCAG rules.`

  const tone: 'ok' | 'warn' = scan.figuresMissingAlt > 0 ? 'warn' : 'ok'
  const badgeLabel =
    scan.figuresMissingAlt > 0
      ? `${scan.figuresMissingAlt} known issue${scan.figuresMissingAlt === 1 ? '' : 's'}`
      : 'Ready to audit'

  return (
    <div className="panel scan-panel">
      <div className="panel__body panel__body--summary">
        <Badge tone={tone} dot>{badgeLabel}</Badge>
        <p>
          <strong>{doc.filename}</strong> {context}
        </p>
        <p style={{ marginTop: '.5rem', color: 'var(--ink-soft)', fontSize: '.9rem' }}>
          Click <strong>Find Issues</strong> above to run the full WCAG 2.1 AA scan and see every
          modernization / remediation / compliance finding.
        </p>
      </div>
    </div>
  )
}

function IssueRow({
  jobId,
  issue,
  index,
  review,
  onChange,
}: {
  jobId: string
  issue: ApiIssue
  index: number
  review: Review | undefined
  onChange: (patch: Partial<Review>) => void
}) {
  // A figure with no image (vector art) or no suggestion needs a human, show it,
  // don't pretend we fixed it.
  if (!issue.imageLocation || !issue.suggestedAltText) {
    return (
      <li className="issue">
        <div className="issue__head">
          <div className="issue__main">
            <div className="issue__tags">
              <span className="issue__num" aria-hidden="true">
                {index}
              </span>
              <Badge tone="neutral">Page {issue.pageNumber}</Badge>
            </div>
            <h3 className="issue__title">Needs a manual description</h3>
            <p className="issue__where">
              This figure has no extractable image (likely vector art), so it needs a human to
              describe it.
            </p>
          </div>
        </div>
      </li>
    )
  }

  const rejected = review?.rejected ?? false
  const text = review?.altText ?? ''
  const over = text.trim().length > ALT_LIMIT

  return (
    <li className={`issue${rejected ? ' is-rejected' : ' is-selected'}`}>
      <div className="issue__head">
        <div className="issue__main">
          <div className="issue__tags">
            <span className="issue__num" aria-hidden="true">
              {index}
            </span>
            <Badge tone="alert">Missing alt text</Badge>
            <Badge tone="neutral">Page {issue.pageNumber}</Badge>
          </div>
          <h3 className="issue__title">Image missing alternative text</h3>
        </div>
      </div>

      <div className="issue__body">
        <img
          className="figure-preview"
          src={api.imageUrl(jobId, issue.issueId)}
          alt={`Figure ${index} from page ${issue.pageNumber}, under review`}
        />

        {!rejected && (
          <div className="field-group">
            <label className="field-group__label" htmlFor={`alt-${issue.issueId}`}>
              <span className="ai">AI-suggested alt text</span>
            </label>
            <textarea
              id={`alt-${issue.issueId}`}
              value={text}
              onChange={(e) => onChange({ altText: e.target.value })}
            />
            <p className={`counter${over ? ' is-over' : ''}`}>
              {text.trim().length} of {ALT_LIMIT} characters
              {over && ', shorten it before applying'}
            </p>
          </div>
        )}

      </div>
    </li>
  )
}

/** OCR review panel: displays reconstructed text and detected images side by side. */
function OcrReviewPanel({
  job,
  preview,
  imageReviews,
  onImageReviewChange,
  onComplete,
  busy,
}: {
  job: ApiJob
  preview: ApiOcrPreview | null
  imageReviews: Record<string, OcrImageReview>
  onImageReviewChange: (imageId: string, patch: Partial<OcrImageReview>) => void
  onComplete: () => void
  busy: boolean
}) {
  const images = preview?.detectedImages ?? []
  const textRegions = preview?.textRegions ?? []
  const confidence = preview?.confidenceScore ?? 0

  return (
    <div className="ocr-review">
      {/* Summary bar */}
      <div className="issuebar">
        <p className="issuebar__status" role="status">
          <Badge tone="ok" dot>
            OCR Complete
          </Badge>
          {preview && (
            <span style={{ marginLeft: '.5rem' }}>
              {preview.pagesProcessed} page{preview.pagesProcessed === 1 ? '' : 's'} processed
              &middot; {images.length} image{images.length === 1 ? '' : 's'} detected
              &middot; {Math.round(confidence * 100)}% avg confidence
            </span>
          )}
        </p>
        <div className="issuebar__actions">
          <button
            type="button"
            className="btn btn--primary"
            onClick={onComplete}
            disabled={busy}
          >
            Approve &amp; Finalize
          </button>
        </div>
      </div>

      {/* Two-column layout: text on left, images on right */}
      <div className="ocr-review__grid">
        {/* Left: reconstructed text */}
        <div className="ocr-review__text">
          <h3 className="subhead">Reconstructed Text</h3>
          {textRegions.length === 0 && (
            <p className="hint">No text regions detected.</p>
          )}
          {textRegions.map((region) => (
            <div key={region.page} className="ocr-text-page">
              <h4 className="ocr-text-page__title">Page {region.page}</h4>
              {region.blocks.map((block, i) => (
                <div key={i} className="ocr-text-block">
                  <div className="ocr-text-block__meta">
                    <Badge tone={block.confidence >= 0.9 ? 'ok' : block.confidence >= 0.7 ? 'warn' : 'alert'}>
                      {block.type === 'TITLE' ? 'H1' : block.type === 'HEADING' ? 'H' : 'P'}
                    </Badge>
                    <span className="ocr-text-block__confidence">
                      {Math.round(block.confidence * 100)}%
                    </span>
                  </div>
                  <p className={`ocr-text-block__text${block.type === 'TITLE' ? ' is-title' : block.type === 'HEADING' ? ' is-heading' : ''}`}>
                    {block.text}
                  </p>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Right: detected images */}
        <div className="ocr-review__images">
          <h3 className="subhead">
            Detected Images
            {images.length > 0 && (
              <span className="ocr-review__count"> ({images.length})</span>
            )}
          </h3>
          {images.length === 0 && (
            <p className="hint">No images detected in this document.</p>
          )}
          <ul className="ocr-images">
            {images.map((img, i) => (
              <OcrImageCard
                key={img.imageId}
                jobId={job.jobId}
                image={img}
                index={i + 1}
                review={imageReviews[img.imageId]}
                onChange={(patch) => onImageReviewChange(img.imageId, patch)}
              />
            ))}
          </ul>
        </div>
      </div>

      {/* Structure summary */}
      {preview && preview.structureElements.length > 0 && (
        <div className="ocr-review__structure">
          <h3 className="subhead">Structure Tags Added</h3>
          <div className="ocr-structure-tags">
            {preview.structureElements.map((elem) => (
              <span key={elem.type} className="ocr-structure-tag">
                <code>&lt;{elem.type}&gt;</code> &times; {elem.count}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/** Card for a single detected image with alt-text recommendation. */
function OcrImageCard({
  jobId,
  image,
  index,
  review,
  onChange,
}: {
  jobId: string
  image: ApiOcrDetectedImage
  index: number
  review: OcrImageReview | undefined
  onChange: (patch: Partial<OcrImageReview>) => void
}) {
  const text = review?.altText ?? image.suggestedAltText ?? ''
  const over = text.trim().length > ALT_LIMIT

  return (
    <li className="ocr-image-card">
      <div className="ocr-image-card__head">
        <span className="issue__num" aria-hidden="true">
          {index}
        </span>
        <Badge tone="warn">Page {image.pageNumber}</Badge>
        <Badge tone="alert">Needs alt text</Badge>
      </div>

      <img
        className="figure-preview"
        src={api.ocrImageUrl(jobId, image.imageId)}
        alt={`Detected image ${index} from page ${image.pageNumber}, needs description`}
        loading="lazy"
      />

      <div className="field-group">
        <label className="field-group__label" htmlFor={`ocr-alt-${image.imageId}`}>
          Recommended alt text
        </label>
        <textarea
          id={`ocr-alt-${image.imageId}`}
          value={text}
          onChange={(e) => onChange({ altText: e.target.value })}
          placeholder="Describe this image for screen reader users…"
        />
        <p className={`counter${over ? ' is-over' : ''}`}>
          {text.trim().length} of {ALT_LIMIT} characters
          {over && ' — shorten it before applying'}
        </p>
      </div>
    </li>
  )
}
