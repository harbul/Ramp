import { useMemo, useState } from 'react'
import type { IssueStateMap, PdfDoc, RemediationResult } from '../types'
import { buildRemediationPdf, downloadBlob } from '../lib/pdf'
import { Badge } from './Badge'
import { Check, CheckLarge, Cross, Download } from './Icons'
import { PdfViewer } from './PdfViewer'

interface CompletePageProps {
  doc: PdfDoc
  result: RemediationResult
  issueState: IssueStateMap
  onBackToLibrary: () => void
  onRemediateAnother: () => void
  onDownloaded: () => void
}

export function CompletePage({
  doc,
  result,
  issueState,
  onBackToLibrary,
  onRemediateAnother,
  onDownloaded,
}: CompletePageProps) {
  // Open on the first page carrying an applied fix — the reviewer wants to see the change.
  const firstFixedPage = useMemo(() => {
    const fixed = doc.issues.find((issue) => result.fixedIssueIds.includes(issue.id))
    return fixed?.page ?? 1
  }, [doc, result])

  const [page, setPage] = useState(firstFixedPage)
  const [hasDownloaded, setHasDownloaded] = useState(false)

  const fixedIssueIds = useMemo(() => new Set(result.fixedIssueIds), [result])

  const handleDownload = () => {
    downloadBlob(buildRemediationPdf(result), result.newName)
    setHasDownloaded(true)
    onDownloaded()
  }

  return (
    <section className="view" aria-labelledby="complete-title">
      <div className="wrap">
        <div className="pagehead pagehead--center">
          <span className="tick" aria-hidden="true">
            <CheckLarge />
          </span>
          <h1 className="pagehead__title" id="complete-title">
            Remediation Complete
          </h1>
          <p className="pagehead__sub">Your selected accessibility fixes have been applied.</p>
        </div>

        <div className="split">
          {/* Remediated PDF */}
          <section className="panel" aria-labelledby="remediated-title">
            <div className="panel__head">
              <h2 className="panel__title" id="remediated-title">
                Remediated PDF
              </h2>
              <Badge tone="ok">
                <Check />
                Accessibility fixes applied
              </Badge>
            </div>

            <PdfViewer
              doc={doc}
              page={page}
              onPageChange={(next) => setPage(Math.min(Math.max(next, 1), doc.pages.length))}
              issueState={issueState}
              fixedIssueIds={fixedIssueIds}
              idPrefix="remediated"
            />

            <p className="pager__hint">
              Repaired bookmarks now resolve to the correct pages. Images marked{' '}
              <span className="alttag alttag--inline">ALT</span> carry approved alternative text.
            </p>
          </section>

          {/* Summary */}
          <section className="panel" aria-labelledby="summary-title">
            <div className="panel__head">
              <h2 className="panel__title" id="summary-title">
                Remediation Summary
              </h2>
              <Badge tone="ok">Completed</Badge>
            </div>

            <div className="panel__body panel__body--summary">
              <h3 className="subhead">Completed fixes</h3>
              {result.fixed.length > 0 ? (
                <ul className="fixes">
                  {result.fixed.map((fix) => (
                    <li key={fix}>
                      <Check />
                      {fix}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="hint">No fixes were applied.</p>
              )}

              {result.skipped.length > 0 && (
                <>
                  <h3 className="subhead">Skipped — still require review</h3>
                  <ul className="fixes fixes--skipped">
                    {result.skipped.map((item) => (
                      <li key={item}>
                        <Cross />
                        {item}
                      </li>
                    ))}
                  </ul>
                </>
              )}

              <h3 className="subhead">Document details</h3>
              <dl className="meta">
                <dt>Original file name</dt>
                <dd className="is-file">{result.originalName}</dd>

                <dt>New file name</dt>
                <dd className="is-file">{result.newName}</dd>

                <dt>Date remediated</dt>
                <dd>{result.remediatedOn}</dd>

                <dt>Total issues fixed</dt>
                <dd>{result.fixed.length}</dd>

                <dt>Issues skipped</dt>
                <dd>{result.skipped.length}</dd>
              </dl>

              <div className="actions">
                <button type="button" className="btn btn--primary btn--lg" onClick={handleDownload}>
                  <Download />
                  Download Remediated PDF
                </button>
                <div className="actions__row">
                  <button type="button" className="btn btn--ghost" onClick={onBackToLibrary}>
                    Back to PDF Library
                  </button>
                  <button type="button" className="btn btn--ghost" onClick={onRemediateAnother}>
                    Remediate Another PDF
                  </button>
                </div>
              </div>

              <p className="downloaded" role="status">
                {hasDownloaded ? `Downloaded ${result.newName}` : ''}
              </p>
            </div>
          </section>
        </div>
      </div>
    </section>
  )
}
