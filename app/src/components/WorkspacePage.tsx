import { useEffect, useRef, useState } from 'react'
import type { IssueStateMap, PdfDoc } from '../types'
import { Badge } from './Badge'
import { ChevronLeft } from './Icons'
import { IssueCard } from './IssueCard'
import { PdfViewer } from './PdfViewer'

interface WorkspacePageProps {
  doc: PdfDoc
  issueState: IssueStateMap
  onIssueChange: (issueId: string, patch: Partial<IssueStateMap[string]>) => void
  onSelectAll: (selected: boolean) => void
  onRemediate: () => void
  onCancel: () => void
}

const NO_FIXES: ReadonlySet<string> = new Set()

export function WorkspacePage({
  doc,
  issueState,
  onIssueChange,
  onSelectAll,
  onRemediate,
  onCancel,
}: WorkspacePageProps) {
  const [page, setPage] = useState(1)
  const [activeIssueId, setActiveIssueId] = useState<string | null>(null)

  const cardRefs = useRef(new Map<string, HTMLLIElement>())
  const selectAllRef = useRef<HTMLInputElement>(null)

  const selectedCount = doc.issues.filter((issue) => issueState[issue.id]?.selected).length
  const selectableCount = doc.issues.filter((issue) => issueState[issue.id]?.verdict !== 'rejected').length
  const allSelected = selectableCount > 0 && selectedCount === selectableCount

  // "Select all" reflects a partial selection rather than silently reading as unchecked.
  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = selectedCount > 0 && !allSelected
    }
  }, [selectedCount, allSelected])

  // Jumping from a viewer marker should land on the matching card, not just scroll near it.
  useEffect(() => {
    if (!activeIssueId) return
    const card = cardRefs.current.get(activeIssueId)
    if (!card) return

    // Scroll the issues panel itself. A plain scrollIntoView would also scroll the
    // window, dragging the banner and the viewer out of view — the reviewer needs to
    // keep seeing the marker they just came from.
    const panel = card.closest<HTMLElement>('.panel__body--issues')
    const isPanelScrollable = panel && panel.scrollHeight > panel.clientHeight

    if (panel && isPanelScrollable) {
      const panelRect = panel.getBoundingClientRect()
      const cardRect = card.getBoundingClientRect()
      const delta = cardRect.top - panelRect.top - (panelRect.height - cardRect.height) / 2
      panel.scrollBy({ top: delta, behavior: 'smooth' })
    } else {
      // Stacked layout: the panel scrolls with the page, so the window is the scroller.
      card.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }

    card.querySelector<HTMLInputElement>('input[type="checkbox"]')?.focus({ preventScroll: true })

    const timer = window.setTimeout(() => setActiveIssueId(null), 1200)
    return () => window.clearTimeout(timer)
  }, [activeIssueId])

  const handleMarkerActivate = (issueId: string) => setActiveIssueId(issueId)

  const clampPage = (next: number) => setPage(Math.min(Math.max(next, 1), doc.pages.length))

  return (
    <section className="view" aria-labelledby="workspace-title">
      <div className="wrap">
        <button type="button" className="backlink" onClick={onCancel}>
          <ChevronLeft />
          Back to PDF Library
        </button>

        <div className="pagehead">
          <h1 className="pagehead__title" id="workspace-title">
            Review Accessibility Issues
          </h1>
          <p className="pagehead__sub">Approve AI-suggested fixes before generating a remediated PDF.</p>
          <p className="pagehead__file">{doc.name}</p>
        </div>

        <div className="split">
          {/* Original PDF */}
          <section className="panel" aria-labelledby="original-title">
            <div className="panel__head">
              <h2 className="panel__title" id="original-title">
                Original PDF
              </h2>
              <Badge tone="warn">
                {doc.issues.length} {doc.issues.length === 1 ? 'issue' : 'issues'} detected
              </Badge>
            </div>

            <PdfViewer
              doc={doc}
              page={page}
              onPageChange={clampPage}
              issueState={issueState}
              fixedIssueIds={NO_FIXES}
              activeIssueId={activeIssueId}
              onMarkerActivate={handleMarkerActivate}
              idPrefix="original"
            />

            <p className="pager__hint">
              Numbered markers show where each issue occurs. Select a marker to jump to its fix.
            </p>
          </section>

          {/* Issues */}
          <section className="panel" aria-labelledby="issues-title">
            <div className="panel__head">
              <h2 className="panel__title" id="issues-title">
                Accessibility Issues
              </h2>
              <Badge tone="neutral">{doc.issues.length} total</Badge>
            </div>

            <div className="issuebar">
              <div className="check check--all">
                <input
                  type="checkbox"
                  id="select-all"
                  ref={selectAllRef}
                  checked={allSelected}
                  onChange={(event) => onSelectAll(event.target.checked)}
                />
                <label htmlFor="select-all">Select all issues</label>
              </div>

              <p className="issuebar__status" role="status">
                {selectedCount} of {doc.issues.length} selected
              </p>

              <div className="issuebar__actions">
                <button
                  type="button"
                  className="btn btn--primary"
                  onClick={onRemediate}
                  disabled={selectedCount === 0}
                >
                  Remediate Selected Issues
                </button>
                <button type="button" className="btn btn--ghost" onClick={onCancel}>
                  Cancel
                </button>
              </div>
            </div>

            <div className="panel__body panel__body--issues">
              <ul className="issues">
                {doc.issues.map((issue, index) => {
                  const state = issueState[issue.id]
                  if (!state) return null

                  return (
                    <IssueCard
                      key={issue.id}
                      issue={issue}
                      index={index + 1}
                      state={state}
                      isActive={activeIssueId === issue.id}
                      onChange={(patch) => onIssueChange(issue.id, patch)}
                      ref={(node) => {
                        if (node) cardRefs.current.set(issue.id, node)
                        else cardRefs.current.delete(issue.id)
                      }}
                    />
                  )
                })}
              </ul>

              {selectedCount === 0 && (
                <p className="hint hint--warn" role="status">
                  Select at least one issue to generate a remediated PDF.
                </p>
              )}
            </div>
          </section>
        </div>
      </div>
    </section>
  )
}
