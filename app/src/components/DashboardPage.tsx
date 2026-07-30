import { useMemo, useRef, useState } from 'react'
import { useInView } from '../lib/useInView'
import type { DashboardStats, FormAction, FormInventoryItem } from '../types'

interface DashboardPageProps {
  forms: FormInventoryItem[]
  /** Called after a successful upload so the parent re-fetches persisted docs. */
  onUploaded: () => void
}

const ACTION_META: Record<FormAction, { label: string; color: string }> = {
  remediate_in_place: { label: 'Remediate', color: 'blue' },
  recreate_accessible_pdf: { label: 'Recreate', color: 'red' },
  migrate: { label: 'Migrate', color: 'yellow' },
  no_action_needed: { label: 'OK', color: 'green' },
}

// Estimated minutes of manual work saved per auto-drafted field label.
// Conservative: locating a field, writing a /TU label, and verifying it by
// hand is a couple of minutes each; the tiered inference drafts most of them.
const MIN_PER_LABEL = 2

export function DashboardPage({ forms, onUploaded }: DashboardPageProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadMessage, setUploadMessage] = useState<string | null>(null)
  const [messageTone, setMessageTone] = useState<'ok' | 'warn'>('ok')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)
    setUploadMessage(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('department', 'Dashboard Upload')

      const response = await fetch('/pdf/triage', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Upload failed')
      }

      const result = await response.json()

      // Confident, plain copy from the real remediation outcome. No emoji,
      // no exclamation, active voice (per the redesign skill's content rules).
      let message: string
      let tone: 'ok' | 'warn' = 'ok'
      if (result.autoRemediated && result.fixedCount > 0) {
        const n = result.fixedCount
        message = `Added alt text to ${n} image${n === 1 ? '' : 's'} in ${file.name}.`
      } else if (result.remediationStatus === 'failed') {
        message = `${file.name} was analyzed, but auto-remediation did not complete.`
        tone = 'warn'
      } else if (result.hasImages && result.classification.tagStatus !== 'TAGGED') {
        message = `${file.name} has images but is untagged, so alt text cannot be added until it is tagged.`
        tone = 'warn'
      } else {
        message = `${file.name} analyzed. Recommended action: ${result.recommendation.action.replace(/_/g, ' ')}.`
      }
      setUploadMessage(message)
      setMessageTone(tone)

      // Persisted server-side by /pdf/triage. Ask the parent to re-fetch so the
      // new form appears in the merged inventory and survives a reload.
      onUploaded()
    } catch (err) {
      setUploadMessage(err instanceof Error ? err.message : 'Upload failed')
      setMessageTone('warn')
    } finally {
      setUploading(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const stats = useMemo<DashboardStats>(() => {
    const actionCounts: Record<FormAction, number> = {
      remediate_in_place: 0,
      recreate_accessible_pdf: 0,
      migrate: 0,
      no_action_needed: 0,
    }

    let formsWithNoFields = 0
    let totalMissingLabels = 0
    let formsMigrationRequired = 0

    forms.forEach((form) => {
      actionCounts[form.recommendedAction]++
      if (form.fieldCount === 0) formsWithNoFields++
      totalMissingLabels += form.missingLabelCount
      if (form.platformMigrationRequired) formsMigrationRequired++
    })

    return {
      totalForms: forms.length,
      formsWithNoFields,
      totalMissingLabels,
      formsMigrationRequired,
      actionCounts,
    }
  }, [forms])

  const departments = useMemo(() => {
    const deptSet = new Set(forms.map((f) => f.department))
    return Array.from(deptSet).sort()
  }, [forms])

  // Leadership metrics. "Needs remediation" = anything not already accessible;
  // "hours saved" is an estimate: automation drafts the field labels a human
  // would otherwise write by hand (see MIN_PER_LABEL).
  const needsAction =
    stats.actionCounts.remediate_in_place +
    stats.actionCounts.recreate_accessible_pdf +
    stats.actionCounts.migrate
  const accessibleCount = stats.actionCounts.no_action_needed
  const estHoursSaved = Math.round((stats.totalMissingLabels * MIN_PER_LABEL) / 60)

  // Scroll-reveal each major block as it enters the viewport.
  const metrics = useInView<HTMLDivElement>()
  const breakdown = useInView<HTMLDivElement>()
  const deptSummary = useInView<HTMLDivElement>()

  return (
    <section className="view" aria-labelledby="dashboard-title">
      <div className="dashboard">
            <div className="pagehead">
              <h1 className="pagehead__title" id="dashboard-title">
                Accessibility overview
              </h1>

              <div className="dashboard-upload">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleFileSelect}
                  className="visually-hidden"
                  aria-label="Analyze a new PDF: classify, recommend an action, and auto-remediate alt text"
                />
                <button
                  type="button"
                  className="btn btn--primary"
                  onClick={handleUploadClick}
                  disabled={uploading}
                  title="Classify the PDF, recommend an action, and auto-fix alt text if it's tagged with images"
                >
                  {uploading ? 'Analyzing…' : 'Analyze new PDF'}
                </button>
                <p className="dashboard-upload__hint">
                  Adds the PDF to your inventory. Ramp classifies it, recommends an action, and
                  auto-fixes alt text if it's a tagged PDF with images.
                </p>

                {uploadMessage && (
                  <p className="dashboard-upload__msg" data-tone={messageTone} role="status">
                    {uploadMessage}
                  </p>
                )}
              </div>
            </div>

        {/* Key metrics (asymmetric bento; the impact metric anchors as the feature tile) */}
        <div ref={metrics.ref} className={`stat-grid reveal-group ${metrics.inView ? 'is-in' : ''}`}>
          <div className="stat-card stat-card--feature">
            <div className="stat-card__value">
              {estHoursSaved}
              <span className="stat-card__unit">hrs</span>
            </div>
            <div className="stat-card__label">Est. staff time saved</div>
            <div className="stat-card__note">~{MIN_PER_LABEL} min per field label, mostly auto-drafted</div>
          </div>
          <div className="stat-card">
            <div className="stat-card__value">{stats.totalForms}</div>
            <div className="stat-card__label">Forms in inventory</div>
          </div>
          <div className="stat-card">
            <div className="stat-card__value">{needsAction}</div>
            <div className="stat-card__label">Need remediation</div>
          </div>
          <div className="stat-card">
            <div className="stat-card__value">{accessibleCount}</div>
            <div className="stat-card__label">Already accessible</div>
          </div>
        </div>

        {/* Action Breakdown */}
        <div ref={breakdown.ref} className={`dashboard-section reveal-up ${breakdown.inView ? 'is-in' : ''}`}>
          <h2 className="dashboard-section__title">Recommended action breakdown</h2>

          {/* Action Bar */}
          <div className="action-bar" role="img" aria-label="Action breakdown visualization">
            {(Object.entries(ACTION_META) as [FormAction, { label: string; color: string }][]).map(
              ([action, { label, color }]) => {
                const count = stats.actionCounts[action]
                if (count === 0) return null
                const percentage = (count / stats.totalForms) * 100

                return (
                  <div
                    key={action}
                    className={`action-bar__segment action-bar__segment--${color}`}
                    style={{ width: `${percentage}%` }}
                    aria-label={`${label}: ${count} forms`}
                  >
                    {count}
                  </div>
                )
              },
            )}
          </div>

          {/* Legend */}
          <div className="action-legend">
            {(Object.entries(ACTION_META) as [FormAction, { label: string; color: string }][]).map(
              ([action, { label, color }]) => {
                const count = stats.actionCounts[action]
                return (
                  <div key={action} className="action-legend__item">
                    <span className={`action-legend__dot action-legend__dot--${color}`} aria-hidden="true" />
                    <span>
                      {label} ({count})
                    </span>
                  </div>
                )
              },
            )}
          </div>
        </div>

        {/* Department Summary */}
        <div ref={deptSummary.ref} className={`dashboard-section reveal-up ${deptSummary.inView ? 'is-in' : ''}`}>
          <h2 className="dashboard-section__title">Department summary</h2>
          <div className="dept-grid">
            {departments.map((dept) => {
              const deptForms = forms.filter((f) => f.department === dept)
              const deptActionCounts: Record<FormAction, number> = {
                remediate_in_place: 0,
                recreate_accessible_pdf: 0,
                migrate: 0,
                no_action_needed: 0,
              }
              deptForms.forEach((f) => deptActionCounts[f.recommendedAction]++)

              return (
                <div key={dept} className="dept-card">
                  <div className="dept-card__header">
                    <h3 className="dept-card__name">{dept.replace(/-/g, ' ')}</h3>
                    <div className="dept-card__count">{deptForms.length}</div>
                  </div>
                  <div className="dept-card__actions">
                    {(Object.entries(ACTION_META) as [FormAction, { label: string; color: string }][])
                      .filter(([action]) => deptActionCounts[action] > 0)
                      .map(([action, { label, color }]) => (
                        <div key={action} className="dept-card__action">
                          <span className={`StatusBadge StatusBadge--${color}`}>{label}</span>
                          <span className="dept-card__action-count">{deptActionCounts[action]}</span>
                        </div>
                      ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
