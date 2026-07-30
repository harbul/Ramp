import { forwardRef } from 'react'
import type { Issue, IssueState } from '../types'
import { Badge, SeverityBadge } from './Badge'
import { Check, Cross } from './Icons'

/** WCAG guidance: alt text should stay short enough for assistive tech to read comfortably. */
const ALT_LIMIT = 125

interface IssueCardProps {
  issue: Issue
  /** 1-based position, matching the viewer's marker numbers. */
  index: number
  state: IssueState
  onChange: (patch: Partial<IssueState>) => void
  isActive: boolean
}

export const IssueCard = forwardRef<HTMLLIElement, IssueCardProps>(function IssueCard(
  { issue, index, state, onChange, isActive },
  ref,
) {
  const checkboxId = `apply-${issue.id}`
  const altId = `alt-${issue.id}`
  const isRejected = state.verdict === 'rejected'

  const className = [
    'issue',
    state.selected && 'is-selected',
    state.verdict === 'approved' && 'is-approved',
    isRejected && 'is-rejected',
    isActive && 'is-flash',
  ]
    .filter(Boolean)
    .join(' ')

  const title = issue.type === 'alt' ? 'Image missing alternative text' : 'Broken bookmark'
  const altLength = state.altText.trim().length
  const isOverLimit = altLength > ALT_LIMIT

  return (
    <li className={className} ref={ref} id={`issue-card-${issue.id}`}>
      <div className="issue__head">
        <div className="check">
          <input
            type="checkbox"
            id={checkboxId}
            checked={state.selected}
            disabled={isRejected}
            onChange={(event) => onChange({ selected: event.target.checked })}
          />
        </div>

        <div className="issue__main">
          <div className="issue__tags">
            <span className="issue__num" aria-hidden="true">
              {index}
            </span>
            <SeverityBadge severity={issue.severity} />
            <Badge tone="neutral">Page {issue.page}</Badge>
          </div>

          <h3 className="issue__title">
            <label htmlFor={checkboxId}>
              <span className="visually-hidden">Apply fix for issue {index}: </span>
              {title}
            </label>
          </h3>

          <p className="issue__where">
            {issue.type === 'alt' ? issue.imageLabel : `Bookmark: “${issue.bookmarkLabel}”`} · Page{' '}
            {issue.page}
          </p>
        </div>
      </div>

      <div className="issue__body">
        {issue.type === 'alt' ? (
          <div className="field-group">
            <label className="field-group__label" htmlFor={altId}>
              <span className="ai">AI-suggested alt text</span>
            </label>
            <textarea
              id={altId}
              value={state.altText}
              onChange={(event) => onChange({ altText: event.target.value })}
              aria-describedby={`${altId}-counter`}
            />
            <p className={`counter${isOverLimit ? ' is-over' : ''}`} id={`${altId}-counter`}>
              {altLength} of {ALT_LIMIT} characters
              {isOverLimit && ' — consider shortening for screen reader users'}
            </p>
          </div>
        ) : (
          <dl className="detail">
            <dt>Problem</dt>
            <dd>{issue.problem}</dd>
            <dt>
              <span className="ai">AI-suggested fix</span>
            </dt>
            <dd>
              <p className="quote">{issue.suggestedFix}</p>
            </dd>
          </dl>
        )}

        <div className="issue__actions">
          <button
            type="button"
            className="btn btn--approve btn--sm"
            onClick={() => onChange({ verdict: 'approved', selected: true })}
            disabled={state.verdict === 'approved'}
          >
            <Check />
            Approve
            <span className="visually-hidden"> fix for issue {index}</span>
          </button>
          <button
            type="button"
            className="btn btn--reject btn--sm"
            onClick={() => onChange({ verdict: 'rejected', selected: false })}
            disabled={isRejected}
          >
            <Cross />
            Reject
            <span className="visually-hidden"> fix for issue {index}</span>
          </button>

          {state.verdict === 'approved' && (
            <span className="issue__verdict issue__verdict--ok">
              <Check />
              Approved
            </span>
          )}
          {isRejected && (
            <span className="issue__verdict issue__verdict--no">
              Rejected —{' '}
              <button
                type="button"
                className="linkbtn"
                onClick={() => onChange({ verdict: null, selected: true })}
              >
                undo
              </button>
            </span>
          )}
        </div>
      </div>
    </li>
  )
})
