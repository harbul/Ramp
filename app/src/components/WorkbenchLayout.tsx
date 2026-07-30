import { useState } from 'react'
import type { WcagReport } from '../lib/api'
import type { Section, SectionKey } from '../lib/wcagSections'
import { Check, Download } from './Icons'

// ────────────────────────────────────────────────────────────────────
// Header strip — big score tile + severity chips + primary actions
// ────────────────────────────────────────────────────────────────────

interface WcagHeaderStripProps {
  report: WcagReport
  beforeScore?: number
  autoFixableCount: number
  onFixAllAutoFixable: () => void
  onDownload: () => void
  canDownload: boolean
  busy?: string | null  // action currently running (disables its button)
}

export function WcagHeaderStrip({
  report,
  beforeScore,
  autoFixableCount,
  onFixAllAutoFixable,
  onDownload,
  canDownload,
  busy,
}: WcagHeaderStripProps) {
  const delta = beforeScore !== undefined ? report.score - beforeScore : null
  const tone = report.score >= 90 ? 'ok' : report.score >= 60 ? 'warn' : 'alert'
  return (
    <section className={`wbench-header wbench-header--${tone}`} aria-label="WCAG 2.1 AA overview">
      <div className="wbench-header__score">
        <div className="wbench-header__num">
          {report.score}
          <span className="wbench-header__of">/100</span>
        </div>
        {delta !== null && delta !== 0 && (
          <div className={`wbench-header__delta ${delta > 0 ? 'wbench-header__delta--up' : 'wbench-header__delta--down'}`}>
            {delta > 0 ? '▲' : '▼'} {Math.abs(delta)} pts
          </div>
        )}
      </div>
      <div className="wbench-header__body">
        <div className="wbench-header__meta">
          <h2 className="wbench-header__title">WCAG 2.1 Level AA</h2>
          <p className="wbench-header__summary">{report.summary}</p>
        </div>
        <div className="wbench-header__chips">
          {report.blockerCount > 0 && <span className="wcag-pill wcag-pill--alert">{report.blockerCount} blocker</span>}
          {report.majorCount > 0 && <span className="wcag-pill wcag-pill--warn">{report.majorCount} major</span>}
          {report.minorCount > 0 && <span className="wcag-pill wcag-pill--info">{report.minorCount} advisory</span>}
          <span className="wcag-pill wcag-pill--ok">{report.passedRules} passing</span>
          {autoFixableCount > 0 && (
            <span className="wcag-pill wcag-pill--auto">{autoFixableCount} auto-fixable</span>
          )}
        </div>
      </div>
      <div className="wbench-header__actions">
        <button
          type="button"
          className="btn btn--secondary"
          onClick={onFixAllAutoFixable}
          disabled={!!busy || autoFixableCount === 0}
          title="One-click: apply every deterministic fix (tag structure, language, title, PDF/UA, form labels)"
        >
          {busy === 'fix_all' ? 'Fixing…' : 'Fix all auto-fixable'}
        </button>
        <button
          type="button"
          className="btn btn--primary"
          onClick={onDownload}
          disabled={!canDownload}
          title={canDownload ? 'Download the modernized PDF' : 'Apply at least one fix before downloading'}
        >
          <Download />
          Download PDF
        </button>
      </div>
    </section>
  )
}

// ────────────────────────────────────────────────────────────────────
// Section card — one per category (Modernization / Remediation /
// Compliance / Other). Header, description, action button, expandable
// findings list.
// ────────────────────────────────────────────────────────────────────

interface IssueSectionCardProps {
  section: Section
  /** Section-scoped busy state; e.g. 'modernization' or 'remediation'. */
  busy?: SectionKey | null
  /** Renders the primary action for this section. */
  onApply?: (section: SectionKey) => void
  /** Optional inline reviewer JSX to unfold below the section header. */
  inlineReviewer?: React.ReactNode
  /** Force-open the details (used to expand a section mid-review). */
  forceOpen?: boolean
  /** For Compliance-style sections: per-finding "Mark reviewed" callback.
   *  Findings already reviewed are hidden from the failing list. */
  onFindingReviewed?: (ruleId: string) => void
  /** Set of ruleIds the user has already marked reviewed (Compliance flow). */
  reviewedFindings?: Set<string>
  /** Per-rule recommendation text: shown under the finding description as
   *  "What to do." The dictionary is keyed by rule_id. */
  recommendations?: Record<string, string>
}

const ICONS: Record<SectionKey, string> = {
  modernization: '⚙',
  remediation: '✎',
  compliance: '☑',
  other: '⚠',
}

const APPLY_LABELS: Record<SectionKey, string> = {
  modernization: 'Apply all fixes',
  remediation: 'Review',
  compliance: 'Review',
  other: 'See details',
}

export function IssueSectionCard({
  section,
  busy,
  onApply,
  inlineReviewer,
  forceOpen,
  onFindingReviewed,
  reviewedFindings,
  recommendations,
}: IssueSectionCardProps) {
  const [open, setOpen] = useState(false)
  const isOpen = forceOpen || open
  // Filter out findings the reviewer has already marked done (Compliance flow).
  const stillFailing = section.failing.filter(
    (f) => !reviewedFindings?.has(f.ruleId),
  )
  const failingCount = stillFailing.length
  const totalCount = section.findings.length
  const noIssues = totalCount === 0
  const allPassing = totalCount > 0 && failingCount === 0
  const canApply = !!onApply && failingCount > 0 && section.key !== 'other'

  // Tone drives the card color scheme.
  let tone: 'ok' | 'warn' | 'alert' | 'info' = 'info'
  if (allPassing || noIssues) tone = 'ok'
  else if (section.blockerCount > 0) tone = 'alert'
  else if (section.majorCount > 0) tone = 'warn'

  if (noIssues) {
    // Compact "not applicable" strip.
    return (
      <section className={`wbench-section wbench-section--${tone} wbench-section--empty`}>
        <span className="wbench-section__icon" aria-hidden>{ICONS[section.key]}</span>
        <span className="wbench-section__title">{section.title}</span>
        <span className="wbench-section__meta">No {section.title.toLowerCase()} issues in this document.</span>
      </section>
    )
  }

  if (allPassing) {
    return (
      <section className={`wbench-section wbench-section--${tone} wbench-section--empty`}>
        <span className="wbench-section__icon" aria-hidden>✓</span>
        <span className="wbench-section__title">{section.title}</span>
        <span className="wbench-section__meta">
          {totalCount} check{totalCount === 1 ? '' : 's'} passing
        </span>
      </section>
    )
  }

  return (
    <section className={`wbench-section wbench-section--${tone}`}>
      <header className="wbench-section__head">
        <span className="wbench-section__icon" aria-hidden>{ICONS[section.key]}</span>
        <div className="wbench-section__lead">
          <h3 className="wbench-section__title">{section.title}</h3>
          <p className="wbench-section__desc">{section.description}</p>
        </div>
        <div className="wbench-section__stats">
          {section.blockerCount > 0 && (
            <span className="wcag-pill wcag-pill--alert">{section.blockerCount} blocker</span>
          )}
          {section.majorCount > 0 && (
            <span className="wcag-pill wcag-pill--warn">{section.majorCount} major</span>
          )}
          {section.minorCount > 0 && (
            <span className="wcag-pill wcag-pill--info">{section.minorCount} advisory</span>
          )}
        </div>
        <div className="wbench-section__actions">
          {canApply ? (
            <button
              type="button"
              className="btn btn--primary btn--sm"
              onClick={() => onApply?.(section.key)}
              disabled={busy === section.key}
            >
              {busy === section.key ? 'Applying…' : APPLY_LABELS[section.key]}
            </button>
          ) : (
            <span className="wbench-section__hint">
              {section.key === 'compliance' ? 'Manual review only' : ''}
            </span>
          )}
          <button
            type="button"
            className="wbench-section__toggle"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={isOpen}
            aria-label={isOpen ? 'Collapse details' : 'Expand details'}
          >
            {isOpen ? '▾' : '▸'}
          </button>
        </div>
      </header>

      {isOpen && (
        <div className="wbench-section__body">
          {stillFailing.length > 0 && (
            <ul className="wbench-section__findings">
              {stillFailing.map((f) => (
                <li key={f.ruleId} className={`wbench-finding wbench-finding--${f.severity.toLowerCase()}`}>
                  <span className="wbench-finding__badge" aria-hidden>
                    {f.severity === 'BLOCKER' ? '✕' : f.severity === 'MAJOR' ? '!' : 'i'}
                  </span>
                  <div className="wbench-finding__text">
                    <div className="wbench-finding__title">{f.title}</div>
                    <div className="wbench-finding__desc">{f.description}</div>
                    {f.location && (
                      <div className="wbench-finding__loc">
                        <strong>Where:</strong> {f.location}
                      </div>
                    )}
                    {recommendations?.[f.ruleId] && (
                      <div className="wbench-finding__rec">
                        <strong>What to do:</strong> {recommendations[f.ruleId]}
                      </div>
                    )}
                    <div className="wbench-finding__meta-row">
                      <span className="wbench-finding__sc">
                        WCAG {f.wcagSc} · Level {f.wcagLevel}
                      </span>
                      {onFindingReviewed && (
                        <button
                          type="button"
                          className="btn btn--ghost btn--sm"
                          onClick={() => onFindingReviewed(f.ruleId)}
                        >
                          <Check /> Mark reviewed
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {stillFailing.length === 0 && reviewedFindings && reviewedFindings.size > 0 && (
            <p className="wbench-section__all-clear">
              <Check /> All {section.failing.length} finding{section.failing.length === 1 ? '' : 's'} reviewed.
              Section will collapse into a success strip.
            </p>
          )}
          {inlineReviewer && <div className="wbench-section__reviewer">{inlineReviewer}</div>}
        </div>
      )}
    </section>
  )
}

// ────────────────────────────────────────────────────────────────────
// Section success strip — replaces a section card once all its issues
// are resolved so the reviewer sees the win.
// ────────────────────────────────────────────────────────────────────

interface SectionSuccessProps {
  title: string
  actions: string[]
}

export function SectionSuccess({ title, actions }: SectionSuccessProps) {
  return (
    <section className="wbench-section wbench-section--done">
      <span className="wbench-section__icon" aria-hidden>
        <Check />
      </span>
      <div className="wbench-section__lead">
        <h3 className="wbench-section__title">{title} · fixed</h3>
        <ul className="wbench-section__actions-list">
          {actions.slice(0, 4).map((a, i) => (
            <li key={i}>{a}</li>
          ))}
          {actions.length > 4 && <li>and {actions.length - 4} more</li>}
        </ul>
      </div>
    </section>
  )
}
