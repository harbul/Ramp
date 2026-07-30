import { useMemo, useState } from 'react'
import type { WcagFinding, WcagReport, WcagSeverity } from '../lib/api'

interface WcagScorecardProps {
  report: WcagReport
  beforeScore?: number      // if set, we show delta vs. current
  compact?: boolean         // dashboard variant — hides finding list
  onFixAction?: (action: string, ruleId: string) => void
  fixingAction?: string | null   // action currently in progress (disables the buttons)
}

const SEVERITY_ORDER: WcagSeverity[] = ['BLOCKER', 'MAJOR', 'MINOR']
const SEVERITY_LABEL: Record<WcagSeverity, string> = {
  BLOCKER: 'Blocker',
  MAJOR: 'Major',
  MINOR: 'Advisory',
}

function scoreTone(score: number): 'ok' | 'warn' | 'alert' {
  if (score >= 90) return 'ok'
  if (score >= 60) return 'warn'
  return 'alert'
}

function FixButton({
  action,
  ruleId,
  disabled,
  onClick,
}: {
  action: string
  ruleId: string
  disabled: boolean
  onClick: (action: string, ruleId: string) => void
}) {
  const label = FIX_LABELS[action] ?? 'Fix'
  return (
    <button
      type="button"
      className="wcag-finding__fix-btn"
      onClick={() => onClick(action, ruleId)}
      disabled={disabled}
    >
      {disabled ? 'Fixing…' : label}
    </button>
  )
}

const FIX_LABELS: Record<string, string> = {
  tag_pdf: 'Tag PDF',
  generate_alt_text: 'Generate alt text',
  infer_labels: 'Infer field labels',
  set_language: 'Set language',
  set_title: 'Set title',
  set_pdfua_metadata: 'Declare PDF/UA',
  set_marked_info: 'Set tagging flag',
}

function FindingRow({
  f,
  fixingAction,
  onFixAction,
}: {
  f: WcagFinding
  fixingAction: string | null | undefined
  onFixAction?: (action: string, ruleId: string) => void
}) {
  const [open, setOpen] = useState(false)
  const tone = f.passed ? 'ok' : f.severity === 'BLOCKER' ? 'alert' : f.severity === 'MAJOR' ? 'warn' : 'info'
  return (
    <li className={`wcag-finding wcag-finding--${tone}`}>
      <button
        type="button"
        className="wcag-finding__header"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className="wcag-finding__mark" aria-hidden>
          {f.passed ? '✓' : f.severity === 'BLOCKER' ? '✕' : '!'}
        </span>
        <span className="wcag-finding__title">
          <span className="wcag-finding__label">{f.title}</span>
          <span className="wcag-finding__sc">
            WCAG {f.wcagSc} · Level {f.wcagLevel}
          </span>
        </span>
        <span className="wcag-finding__meta">
          {!f.passed && f.autoFixable && !f.manualReview ? (
            <span className="wcag-finding__badge wcag-finding__badge--auto">Auto-fixable</span>
          ) : null}
          {f.manualReview ? <span className="wcag-finding__badge">Manual review</span> : null}
        </span>
        <span className="wcag-finding__caret" aria-hidden>{open ? '▾' : '▸'}</span>
      </button>
      {open ? (
        <div className="wcag-finding__body">
          <p className="wcag-finding__desc">{f.description}</p>
          {f.location ? (
            <p className="wcag-finding__loc">
              <strong>Where:</strong> {f.location}
            </p>
          ) : null}
          {!f.passed && f.autoFixable && f.fixAction && onFixAction ? (
            <FixButton
              action={f.fixAction}
              ruleId={f.ruleId}
              disabled={fixingAction === f.fixAction}
              onClick={onFixAction}
            />
          ) : null}
        </div>
      ) : null}
    </li>
  )
}

export function WcagScorecard({
  report,
  beforeScore,
  compact,
  onFixAction,
  fixingAction,
}: WcagScorecardProps) {
  const tone = scoreTone(report.score)
  const grouped = useMemo(() => {
    const failing = report.findings.filter((f) => !f.passed)
    const passing = report.findings.filter((f) => f.passed)
    const bySeverity: Record<WcagSeverity, WcagFinding[]> = {
      BLOCKER: [],
      MAJOR: [],
      MINOR: [],
    }
    for (const f of failing) bySeverity[f.severity].push(f)
    return { bySeverity, passing }
  }, [report])

  const delta = beforeScore !== undefined ? report.score - beforeScore : null

  return (
    <section className="wcag-scorecard" aria-label="WCAG 2.1 AA compliance">
      <header className={`wcag-scorecard__header wcag-scorecard__header--${tone}`}>
        <div className="wcag-scorecard__score-wrap">
          <div className="wcag-scorecard__score" aria-label={`Score ${report.score} of 100`}>
            <span className="wcag-scorecard__score-num">{report.score}</span>
            <span className="wcag-scorecard__score-of">/100</span>
          </div>
          {delta !== null && delta !== 0 ? (
            <div className={`wcag-scorecard__delta ${delta > 0 ? 'wcag-scorecard__delta--up' : 'wcag-scorecard__delta--down'}`}>
              {delta > 0 ? '↑' : '↓'} {Math.abs(delta)} pts
            </div>
          ) : null}
        </div>
        <div className="wcag-scorecard__title">
          <h3>WCAG 2.1 Level AA</h3>
          <p>{report.summary}</p>
          <div className="wcag-scorecard__pills">
            {report.blockerCount > 0 ? <span className="wcag-pill wcag-pill--alert">{report.blockerCount} blocker</span> : null}
            {report.majorCount > 0 ? <span className="wcag-pill wcag-pill--warn">{report.majorCount} major</span> : null}
            {report.minorCount > 0 ? <span className="wcag-pill wcag-pill--info">{report.minorCount} advisory</span> : null}
            <span className="wcag-pill wcag-pill--ok">{report.passedRules} passing</span>
            {report.autoFixableCount > 0 ? (
              <span className="wcag-pill wcag-pill--auto">{report.autoFixableCount} auto-fixable</span>
            ) : null}
          </div>
        </div>
      </header>

      {!compact ? (
        <div className="wcag-scorecard__body">
          {SEVERITY_ORDER.map((sev) => {
            const items = grouped.bySeverity[sev]
            if (items.length === 0) return null
            return (
              <section key={sev} className="wcag-scorecard__group">
                <h4 className="wcag-scorecard__group-title">
                  {SEVERITY_LABEL[sev]} <span className="wcag-scorecard__group-count">({items.length})</span>
                </h4>
                <ul className="wcag-finding-list">
                  {items.map((f) => (
                    <FindingRow key={f.ruleId} f={f} fixingAction={fixingAction} onFixAction={onFixAction} />
                  ))}
                </ul>
              </section>
            )
          })}
          {grouped.passing.length > 0 ? (
            <section className="wcag-scorecard__group wcag-scorecard__group--passing">
              <h4 className="wcag-scorecard__group-title">
                Passing <span className="wcag-scorecard__group-count">({grouped.passing.length})</span>
              </h4>
              <ul className="wcag-finding-list">
                {grouped.passing.map((f) => (
                  <FindingRow key={f.ruleId} f={f} fixingAction={fixingAction} onFixAction={onFixAction} />
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      ) : null}
    </section>
  )
}
