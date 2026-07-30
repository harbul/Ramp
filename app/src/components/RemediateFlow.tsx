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
import { WcagScorecard } from './WcagScorecard'

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

/** When opened from the Review Queue, the form to remediate straight from the
 * corpus bucket (no upload). Null/undefined means the plain upload flow. */
interface RemediateFlowProps {
  corpusRef?: { department: string; file: string } | null
}

export function RemediateFlow({ corpusRef = null }: RemediateFlowProps) {
  const [phase, setPhase] = useState<Phase>('idle')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [doc, setDoc] = useState<ApiDocument | null>(null)
  const [scan, setScan] = useState<ApiScan | null>(null)
  const [job, setJob] = useState<ApiJob | null>(null)
  const [reviews, setReviews] = useState<Record<string, Review>>({})
  const [ocrPreview, setOcrPreview] = useState<ApiOcrPreview | null>(null)
  const [ocrImageReviews, setOcrImageReviews] = useState<Record<string, OcrImageReview>>({})
  // WCAG scorecard state — populated from /pdf/documents/{id}/wcag
  const [wcag, setWcag] = useState<WcagReport | null>(null)
  const [wcagBefore, setWcagBefore] = useState<number | null>(null)
  const [fixingAction, setFixingAction] = useState<string | null>(null)
  const [modernizeActions, setModernizeActions] = useState<string[] | null>(null)

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
    setModernizeActions(null)
    if (fileInput.current) fileInput.current.value = ''
  }

  async function loadWcag(docId: string) {
    try {
      const report = await api.wcagCheckDocument(docId)
      setWcag(report)
      return report
    } catch (err) {
      setError(err instanceof ApiError ? err.message : String(err))
      return null
    }
  }

  async function tagPdf() {
    if (!doc) return
    setFixingAction('tag_pdf')
    setError(null)
    try {
      const { scan: newScan } = await api.tagDocument(doc.docId)
      setScan(newScan)
      const before = wcag?.score ?? null
      const report = await api.wcagCheckDocument(doc.docId)
      setWcag(report)
      if (before !== null) setWcagBefore(before)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : String(err))
    } finally {
      setFixingAction(null)
    }
  }

  async function modernizePdf() {
    if (!doc) return
    setFixingAction('modernize')
    setError(null)
    try {
      const result = await api.modernizeDocument(doc.docId)
      setScan(result.scan)
      setWcag(result.after)
      setWcagBefore(result.before.score)
      setModernizeActions(result.actions)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : String(err))
    } finally {
      setFixingAction(null)
    }
  }

  async function inferLabels() {
    if (!doc) return
    setFixingAction('infer_labels')
    setError(null)
    try {
      const result = await api.inferLabels(doc.docId)
      const before = wcag?.score ?? null
      const report = await api.wcagCheckDocument(doc.docId)
      setWcag(report)
      if (before !== null) setWcagBefore(before)
      // Reuse the modernize-recap surface to show which labels were written
      if (result.labelsWritten > 0) {
        setModernizeActions(
          result.writes.map(
            (w) => `Set /TU label on field '${w.fieldName}' → '${w.inferredLabel}' (${w.confidence})`,
          ),
        )
      } else {
        setModernizeActions(['No unlabelled AcroForm fields were found on this document.'])
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : String(err))
    } finally {
      setFixingAction(null)
    }
  }

  async function handleFixAction(action: string) {
    if (action === 'tag_pdf') return tagPdf()
    if (action === 'generate_alt_text') return remediate()
    if (action === 'infer_labels') return inferLabels()
    // Remaining actions (set_language, set_title, set_pdfua_metadata,
    // set_marked_info) are all rolled up into the one-click modernizer.
    return modernizePdf()
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
      // Fire-and-forget the WCAG check so the scorecard appears alongside the scan.
      loadWcag(document.docId)
    })
  }

  // Arriving from the Review Queue: pull the form from the corpus bucket and
  // land on the same scan summary an upload produces. A new corpusRef object
  // (one per row click) re-runs this; the plain Remediate tab passes null.
  useEffect(() => {
    if (!corpusRef) return
    let cancelled = false
    reset()
    setBusy(true)
    api.ingestFromCorpus(corpusRef.department, corpusRef.file)
      .then(({ document, scan }) => {
        if (cancelled) return
        setDoc(document)
        setScan(scan)
        setPhase('uploaded')
        loadWcag(document.docId)
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
  }, [corpusRef])

  /**
   * Comprehensive Remediate flow — the mega-button.
   *
   * Chains every applicable fix in order, only stopping for human review on
   * alt-text (the one thing an AI cannot ship unattended):
   *   1. If untagged → inject structure tree (Tag PDF)
   *   2. Modernize metadata (language / title / PDF-UA / MarkInfo) if any missing
   *   3. Infer form-field labels if the doc has AcroForm fields lacking /TU
   *   4. Kick the alt-text job → poll → land on the review UI
   *
   * Steps 1-3 run silently and are recapped in the modernization panel.
   * Step 4 shows the reviewer the AI suggestions to edit/approve before applying.
   * If the doc has no figures needing alt text, the flow stops after step 3 —
   * the reviewer can then click Download.
   */
  async function remediate() {
    if (!doc) return
    await run(async () => {
      const trail: string[] = []

      // 1. Tag PDF if untagged (creates /Figure elements around images)
      if (scan?.tagStatus === 'UNTAGGED') {
        try {
          const { scan: newScan } = await api.tagDocument(doc.docId)
          setScan(newScan)
          trail.push('Injected structure tree (Tag PDF)')
        } catch (err) {
          // Non-fatal — surface but continue to the next step
          trail.push(
            `Tag PDF skipped: ${err instanceof ApiError ? err.message : String(err)}`,
          )
        }
      }

      // 2. Modernize deterministic metadata (idempotent — safe to call always).
      // Only surface it as a trail entry if there was work to do.
      try {
        const modernized = await api.modernizeDocument(doc.docId)
        setScan(modernized.scan)
        if (modernized.actions.length > 0 && modernized.after.score > modernized.before.score) {
          for (const a of modernized.actions) trail.push(a)
        }
      } catch (err) {
        trail.push(
          `Modernize step skipped: ${err instanceof ApiError ? err.message : String(err)}`,
        )
      }

      // 3. Infer form-field labels (no-op if the PDF has no unlabelled fields)
      try {
        const labels = await api.inferLabels(doc.docId)
        if (labels.labelsWritten > 0) {
          for (const w of labels.writes) {
            trail.push(`Labelled field '${w.fieldName}' → '${w.inferredLabel}' (${w.confidence})`)
          }
        }
      } catch (err) {
        trail.push(
          `Label inference skipped: ${err instanceof ApiError ? err.message : String(err)}`,
        )
      }

      // Re-score WCAG so the scorecard reflects the pre-review state
      const before = wcag?.score ?? null
      try {
        const report = await api.wcagCheckDocument(doc.docId)
        setWcag(report)
        if (before !== null && before !== report.score) setWcagBefore(before)
      } catch {
        // Non-fatal; scorecard just won't update
      }
      if (trail.length > 0) setModernizeActions(trail)

      // 4. Alt-text remediation (only if the doc has figures missing alt).
      // After step 1, previously-untagged docs may now have Figure elements.
      const latestScan = await api
        .wcagCheckDocument(doc.docId)
        .catch(() => null)
      const stillNeedsAlt =
        latestScan?.findings?.some(
          (f) => f.ruleId === 'WCAG-1.1.1-figure-alt' && !f.passed,
        ) ?? true

      if (!stillNeedsAlt) {
        // Everything's done. Land on the modernization recap surface —
        // reviewer can download from the original.pdf link.
        return
      }

      const { job } = await api.createJob(doc.docId) // 422 NOT_TAGGED surfaces here
      setPhase('analyzing')
      await api.analyze(job.jobId)
      const ready = await pollJob(job.jobId, (j) => j.status === 'NEEDS_REVIEW')
      setJob(ready)
      // Opt-out review: every suggestion starts accepted, reviewer edits/rejects.
      const initial: Record<string, Review> = {}
      for (const issue of ready.issues) {
        initial[issue.issueId] = { altText: issue.suggestedAltText ?? '', rejected: false }
      }
      setReviews(initial)
      setPhase('review')
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

  async function applyFixes() {
    if (!job) return
    await run(async () => {
      for (const issue of job.issues) {
        const r = reviews[issue.issueId]
        if (!r) continue
        if (r.rejected || !r.altText.trim()) {
          if (issue.suggestedAltText) await api.approve(job.jobId, issue.issueId, false)
          continue
        }
        await api.approve(job.jobId, issue.issueId, true, r.altText.trim())
      }
      setPhase('applying')
      await api.apply(job.jobId)
      const done = await pollJob(job.jobId, (j) => j.status === 'COMPLETE')
      setJob(done)
      setPhase('done')
    })
  }

  const suggestable = job?.issues.filter((i) => i.suggestedAltText) ?? []
  const approvedCount = suggestable.filter((i) => {
    const r = reviews[i.issueId]
    return r && !r.rejected && r.altText.trim()
  }).length

  return (
    <section className="view" aria-labelledby="flow-title">
      <div className="wrap">
        <div className="pagehead">
          <h1 className="pagehead__title" id="flow-title">
            Remediate a PDF
          </h1>
          <p className="pagehead__sub">
            Upload a tagged PDF, review AI-suggested alternative text for its images, and download
            the remediated file.
          </p>
        </div>

        {/* ── action bar ──────────────────────────────────────────── */}
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

          {doc && scan && phase === 'uploaded' && scan.tagStatus === 'UNTAGGED' && (
            <button
              type="button"
              className="btn btn--ghost"
              onClick={tagPdf}
              disabled={busy || fixingAction === 'tag_pdf'}
              title="Inject a structure tree so the PDF becomes accessible"
            >
              {fixingAction === 'tag_pdf' ? 'Tagging…' : 'Tag PDF'}
            </button>
          )}

          {doc && phase === 'uploaded' && (
            <button
              type="button"
              className="btn btn--secondary"
              onClick={modernizePdf}
              disabled={busy || fixingAction === 'modernize'}
              title="One-click: tag structure, set language/title, declare PDF/UA"
            >
              {fixingAction === 'modernize' ? 'Modernizing…' : 'Modernize'}
            </button>
          )}

          <button
            type="button"
            className="btn btn--primary"
            onClick={remediate}
            disabled={busy || phase !== 'uploaded' || !scan}
            title="Comprehensive fix: tag if untagged, add missing metadata, infer form labels, then review AI-suggested alt text for figures. Applies every fix Ramp can make."
          >
            Remediate
          </button>
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
              ? 'Analyzing the PDF and generating alt text… this takes a few seconds per image.'
              : phase === 'ocr-analyzing'
                ? 'Running OCR and reconstructing document structure… this may take a minute for large documents.'
                : 'Writing the approved alt text into the PDF…'}
          </p>
        )}

        {/* ── after upload: what we found ─────────────────────────── */}
        {scan && doc && phase === 'uploaded' && (
          <ScanSummary doc={doc} scan={scan} onStartOcr={startOcr} busy={busy} />
        )}

        {/* ── modernize action recap ──────────────────────────────── */}
        {modernizeActions && (
          <div className="panel modernize-recap">
            <div className="panel__body">
              <h2 className="subhead">Modernization applied</h2>
              <p>Deterministic accessibility fixes now written into the document:</p>
              <ul className="modernize-recap__list">
                {modernizeActions.map((a) => (
                  <li key={a}>
                    <span className="modernize-recap__tick" aria-hidden>✓</span>
                    {a}
                  </li>
                ))}
              </ul>
              {doc && (
                <a
                  className="btn btn--primary btn--lg"
                  href={api.originalUrl(doc.docId)}
                  download
                >
                  <Download />
                  Download modernized PDF
                </a>
              )}
              <p className="hint" style={{ marginTop: '.75rem' }}>
                Alt text for figures still needs human review — click
                <strong> Remediate</strong> above to run the AI suggestions.
              </p>
            </div>
          </div>
        )}

        {/* ── WCAG scorecard: always visible once we have a document ─ */}
        {wcag && phase === 'uploaded' && (
          <WcagScorecard
            report={wcag}
            beforeScore={wcagBefore ?? undefined}
            fixingAction={fixingAction}
            onFixAction={(action) => handleFixAction(action)}
          />
        )}

        {/* ── review the suggestions ──────────────────────────────── */}
        {phase === 'review' && job && (
          <>
            <div className="issuebar">
              <p className="issuebar__status" role="status">
                {approvedCount} of {suggestable.length} approved
              </p>
              <div className="issuebar__actions">
                <button
                  type="button"
                  className="btn btn--primary"
                  onClick={applyFixes}
                  disabled={busy || approvedCount === 0}
                >
                  Apply & Download
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
                  onChange={(patch) =>
                    setReviews((prev) => ({
                      ...prev,
                      [issue.issueId]: {
                        altText: '',
                        rejected: false,
                        ...prev[issue.issueId],
                        ...patch,
                      },
                    }))
                  }
                />
              ))}
            </ul>
          </>
        )}

        {/* ── done ────────────────────────────────────────────────── */}
        {phase === 'done' && job && (
          <div className="panel done-panel">
            <div className="panel__body panel__body--summary">
              <span className="tick" aria-hidden="true">
                <Check />
              </span>
              <h2 className="subhead" style={{ border: 0, textAlign: 'center' }}>
                Remediation complete
              </h2>
              <p style={{ textAlign: 'center', color: 'var(--ink-soft)' }}>
                {job.issues.filter((i) => i.status === 'APPLIED').length} image(s) now have
                alternative text a screen reader can read.
              </p>
              <div className="actions">
                <a className="btn btn--primary btn--lg" href={api.downloadUrl(job.jobId)}>
                  <Download />
                  Download Remediated PDF
                </a>
                <button type="button" className="btn btn--ghost" onClick={reset}>
                  Remediate another PDF
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
  // OCR-eligible scanned document
  if (scan.route === 'OCR_RECONSTRUCTION') {
    return (
      <div className="panel scan-panel">
        <div className="panel__body panel__body--summary">
          <Badge tone="warn" dot>
            Scanned document
          </Badge>
          <p>
            <strong>{doc.filename}</strong> is a scanned PDF with {scan.pageCount} page
            {scan.pageCount === 1 ? '' : 's'}. It can be reconstructed using OCR to add text layers,
            structure tags, and accessibility metadata.
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

  // Unsupported document
  if (scan.route === 'UNSUPPORTED') {
    const reasonMessages: Record<string, string> = {
      BORN_DIGITAL_UNTAGGED:
        "has no structure tree, so alt text written into it wouldn\u2019t be reachable by a screen reader. It needs to be tagged (in Acrobat or an auto-tagger) before it can be remediated here.",
      FILE_TOO_LARGE: 'exceeds the 25 MB file size limit for processing.',
      TOO_MANY_PAGES: 'exceeds the 50 page limit for processing.',
      INTERACTIVE_FORMS: 'contains interactive form fields which are not supported.',
      DIGITALLY_SIGNED: 'has digital signatures that would be invalidated by modification.',
      NON_ENGLISH_LANGUAGE: 'appears to contain non-English text which is not yet supported.',
      CORRUPT_PDF: 'could not be read; the file may be corrupt.',
      ENCRYPTED_PDF: 'is password-protected and cannot be processed.',
      NO_PROCESSABLE_CONTENT: 'has no figures that need alt text.',
    }
    const reason = scan.unsupportedReason
    const message = reason ? reasonMessages[reason] ?? 'cannot be processed.' : 'cannot be processed.'

    return (
      <div className="panel scan-panel">
        <div className="panel__body panel__body--summary">
          <Badge tone="alert" dot>
            Cannot process
          </Badge>
          <p>
            <strong>{doc.filename}</strong> {message}
          </p>
        </div>
      </div>
    )
  }

  // Tagged document with no issues
  if (scan.figuresMissingAlt === 0) {
    return (
      <div className="panel scan-panel">
        <div className="panel__body panel__body--summary">
          <Badge tone="ok" dot>
            Nothing to fix
          </Badge>
          <p>
            <strong>{doc.filename}</strong> is tagged and every image already has alternative text.
          </p>
        </div>
      </div>
    )
  }

  // Tagged document with missing alt text (normal remediation path)
  return (
    <div className="panel scan-panel">
      <div className="panel__body panel__body--summary">
        <Badge tone="warn" dot>
          {scan.figuresMissingAlt} issue{scan.figuresMissingAlt === 1 ? '' : 's'} found
        </Badge>
        <p>
          <strong>{doc.filename}</strong> is tagged with {scan.pageCount} page
          {scan.pageCount === 1 ? '' : 's'}. Found <strong>{scan.figuresMissingAlt}</strong> image
          {scan.figuresMissingAlt === 1 ? '' : 's'} missing alternative text. Click{' '}
          <strong>Remediate</strong> to run the full remediation pass.
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
