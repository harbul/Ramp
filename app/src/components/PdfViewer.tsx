import type { Block, IssueStateMap, PdfDoc } from '../types'
import { BookmarkIcon, ChevronLeft, ChevronRight, ImagePlaceholder } from './Icons'

interface PdfViewerProps {
  doc: PdfDoc
  /** 1-based page number. */
  page: number
  onPageChange: (page: number) => void
  issueState: IssueStateMap
  /** Issues whose fix has been applied — markers render as resolved. */
  fixedIssueIds: ReadonlySet<string>
  activeIssueId?: string | null
  onMarkerActivate?: (issueId: string) => void
  /** Distinguishes the two viewers' element ids when both are mounted. */
  idPrefix: string
}

export function PdfViewer({
  doc,
  page,
  onPageChange,
  issueState,
  fixedIssueIds,
  activeIssueId = null,
  onMarkerActivate,
  idPrefix,
}: PdfViewerProps) {
  const pageCount = doc.pages.length
  const current = doc.pages[page - 1]

  /** Marker numbers match the issue list ordering the reviewer sees. */
  const issueNumber = (issueId: string) => doc.issues.findIndex((issue) => issue.id === issueId) + 1

  const markerClass = (issueId: string) =>
    [
      'marker',
      fixedIssueIds.has(issueId) && 'marker--fixed',
      activeIssueId === issueId && 'is-active',
    ]
      .filter(Boolean)
      .join(' ')

  const renderBlock = (block: Block, index: number) => {
    switch (block.kind) {
      case 'line':
        return <div key={index} className={`line line--${block.width}`} />

      case 'field':
        return <div key={index} className="field" />

      case 'gap':
        return <div key={index} className="gap" />

      case 'image': {
        const issue = doc.issues.find(
          (candidate) =>
            candidate.type === 'alt' && candidate.imageId === block.imageId && candidate.page === page,
        )
        const isFixed = issue ? fixedIssueIds.has(issue.id) : false
        const altText = issue ? issueState[issue.id]?.altText.trim() : undefined

        return (
          <div key={index} className={`imgbox${isFixed ? ' imgbox--fixed' : ''}`}>
            <ImagePlaceholder />

            {issue && !isFixed && (
              <button
                type="button"
                className={markerClass(issue.id)}
                onClick={() => onMarkerActivate?.(issue.id)}
                aria-label={`Issue ${issueNumber(issue.id)}: image missing alternative text on page ${page}. Go to fix.`}
              >
                <span aria-hidden="true">{issueNumber(issue.id)}</span>
              </button>
            )}

            {issue && isFixed && (
              <>
                <span className="alttag" aria-hidden="true">
                  ALT
                </span>
                <span className="visually-hidden">{altText || 'Alternative text applied.'}</span>
              </>
            )}
          </div>
        )
      }
    }
  }

  return (
    <>
      <div className="panel__body panel__body--viewer">
        <div className="viewer">
          {/* Bookmarks rail — where broken-bookmark issues actually live. */}
          <div className="rail" aria-labelledby={`${idPrefix}-rail-title`}>
            <h3 className="rail__title" id={`${idPrefix}-rail-title`}>
              <BookmarkIcon className="rail__icon" />
              Bookmarks
            </h3>
            <ul className="rail__list">
              {doc.bookmarks.map((bookmark) => {
                const issue = doc.issues.find(
                  (candidate) => candidate.type === 'bookmark' && candidate.bookmarkId === bookmark.id,
                )
                const isFixed = issue ? fixedIssueIds.has(issue.id) : false
                const isBroken = Boolean(issue) && !isFixed
                const target = isFixed ? bookmark.correctTarget : bookmark.target

                return (
                  <li key={bookmark.id} className="rail__item">
                    <button
                      type="button"
                      className={[
                        'rail__link',
                        isBroken && 'is-broken',
                        target === page && 'is-current',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      onClick={() => target && onPageChange(target)}
                      disabled={target === null}
                    >
                      <span className="rail__label">{bookmark.label}</span>
                      <span className="rail__target">
                        {target === null ? 'No target' : `p. ${target}`}
                      </span>
                    </button>

                    {issue && isBroken && (
                      <button
                        type="button"
                        className={`${markerClass(issue.id)} marker--rail`}
                        onClick={() => onMarkerActivate?.(issue.id)}
                        aria-label={`Issue ${issueNumber(issue.id)}: bookmark ${bookmark.label} is broken. Go to fix.`}
                      >
                        <span aria-hidden="true">{issueNumber(issue.id)}</span>
                      </button>
                    )}
                  </li>
                )
              })}
            </ul>
          </div>

          {/* Page */}
          <div className="viewer__page">
            {current ? (
              // Remount on page change so the reveal animation replays.
              <div className="page" key={page}>
                <p className="page__kicker">{current.kicker}</p>
                <h4 className="page__title">{current.title}</h4>
                {current.blocks.map(renderBlock)}
                <span className="page__folio" aria-hidden="true">
                  {page}
                </span>
              </div>
            ) : (
              <p className="empty">Page not available.</p>
            )}
          </div>
        </div>
      </div>

      <div className="pager">
        <button
          type="button"
          className="btn btn--ghost btn--sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
        >
          <ChevronLeft />
          Previous
        </button>
        <p className="pager__count" role="status">
          Page {page} of {pageCount}
        </p>
        <button
          type="button"
          className="btn btn--ghost btn--sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= pageCount}
        >
          Next
          <ChevronRight />
        </button>
      </div>
    </>
  )
}
