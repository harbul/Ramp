import { Fragment, useEffect, useMemo, useState } from 'react'
import { useInView } from '../lib/useInView'
import { useMediaQuery } from '../lib/useMediaQuery'
import type { FormAction, FormInventoryItem } from '../types'
import { isCorpusRemediable, remediableImageCount } from '../lib/corpusRemediable'
import { Cross, Eye, Search } from './Icons'
import { PdfPreviewModal } from './PdfPreviewModal'

interface LibraryPageProps {
  forms: FormInventoryItem[]
  /** Open the alt-text flow for a listed form (remediates from the corpus bucket). */
  onRemediate?: (department: string, file: string) => void
}

type ReviewStatus = 'pending' | 'approved' | 'flagged'

const CYCLE: ReviewStatus[] = ['pending', 'approved', 'flagged']
const STATUS_LABEL: Record<ReviewStatus, string> = {
  pending: 'To review',
  approved: 'Approved',
  flagged: 'Flagged',
}
const STORAGE_KEY = 'pdf-review-status-v2'

const ACTION_META: Record<FormAction, { label: string; color: string }> = {
  remediate_in_place: { label: 'Remediate', color: 'blue' },
  recreate_accessible_pdf: { label: 'Recreate', color: 'red' },
  migrate: { label: 'Migrate', color: 'yellow' },
  no_action_needed: { label: 'OK', color: 'green' },
}

const ACTION_FILTERS: { value: FormAction | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'remediate_in_place', label: 'Remediate' },
  { value: 'recreate_accessible_pdf', label: 'Recreate' },
  { value: 'migrate', label: 'Migrate' },
  { value: 'no_action_needed', label: 'OK' },
]

type TagFilter = 'all' | 'tagged' | 'untagged'
const TAG_FILTERS: { value: TagFilter; label: string }[] = [
  { value: 'all', label: 'Any' },
  { value: 'tagged', label: 'Tagged' },
  { value: 'untagged', label: 'Untagged' },
]

const KNOWN_SIGNALS = [
  { value: 'signature_required', label: 'Signature' },
  { value: 'workflow', label: 'Workflow' },
  { value: 'external_submission', label: 'External submission' },
  { value: 'sensitive_data', label: 'Sensitive data' },
] as const

const rid = (form: FormInventoryItem) => `${form.department}/${form.file}`
const deptLabel = (slug: string) => slug.replace(/-/g, ' ')

/**
 * URL a "View" button can open for this row.
 *   - live uploads (docId set): stream from backend at /pdf/documents/{id}/original.pdf
 *   - DubBot rows (sourceUrl set): the real Sac State URL
 *   - curated ABA corpus rows: no URL available (return null; button renders as em-dash)
 */
function viewUrlFor(form: FormInventoryItem): string | null {
  if (form.docId) return `/pdf/documents/${form.docId}/original.pdf`
  if (form.sourceUrl) return form.sourceUrl
  return null
}

function loadStatuses(): Record<string, ReviewStatus> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
  } catch {
    return {}
  }
}

export function LibraryPage({ forms, onRemediate }: LibraryPageProps) {
  const [query, setQuery] = useState('')
  const [actionFilter, setActionFilter] = useState<FormAction | 'all'>('all')
  const [tagFilter, setTagFilter] = useState<TagFilter>('all')
  const [signalFilter, setSignalFilter] = useState<ReadonlySet<string>>(new Set())
  const [departments, setDepartments] = useState<ReadonlySet<string>>(new Set())
  const [openId, setOpenId] = useState<string | null>(null)
  const [statuses, setStatuses] = useState<Record<string, ReviewStatus>>(loadStatuses)
  const [previewing, setPreviewing] = useState<FormInventoryItem | null>(null)

  const table = useInView<HTMLDivElement>()

  // On a phone the department list would bury the queue, so collapse it there.
  const isNarrow = useMediaQuery('(max-width: 1080px)')
  const [filtersOpen, setFiltersOpen] = useState(!isNarrow)
  useEffect(() => setFiltersOpen(!isNarrow), [isNarrow])

  // Persist review decisions per browser; the CSV export is how they're shared.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(statuses))
    } catch {
      // ignore quota / private-mode failures - decisions just won't persist
    }
  }, [statuses])

  const deptCounts = useMemo(() => {
    const map = new Map<string, number>()
    for (const form of forms) map.set(form.department, (map.get(form.department) ?? 0) + 1)
    return map
  }, [forms])

  const deptList = useMemo(
    () => [...deptCounts.keys()].sort((a, b) => a.localeCompare(b)),
    [deptCounts],
  )

  const visible = useMemo(
    () =>
      forms.filter((form) => {
        if (departments.size > 0 && !departments.has(form.department)) return false
        if (actionFilter !== 'all' && form.recommendedAction !== actionFilter) return false
        if (query && !form.file.toLowerCase().includes(query.toLowerCase())) return false
        if (tagFilter === 'tagged' && form.tagStatus === 'UNTAGGED') return false
        // Static-corpus rows have no tagStatus; treat them as "unknown" and
        // exclude them from the Untagged filter so the results are unambiguous.
        if (tagFilter === 'untagged' && form.tagStatus !== 'UNTAGGED') return false
        if (signalFilter.size > 0 && !form.signals.some((s) => signalFilter.has(s))) return false
        return true
      }),
    [forms, departments, actionFilter, query, tagFilter, signalFilter],
  )

  const toggleSignal = (signal: string) => {
    setSignalFilter((prev) => {
      const next = new Set(prev)
      if (next.has(signal)) next.delete(signal)
      else next.add(signal)
      return next
    })
    setOpenId(null)
  }

  const decidedCount = useMemo(
    () => visible.filter((form) => (statuses[rid(form)] ?? 'pending') !== 'pending').length,
    [visible, statuses],
  )

  const toggleDepartment = (department: string) => {
    setDepartments((previous) => {
      const next = new Set(previous)
      if (next.has(department)) next.delete(department)
      else next.add(department)
      return next
    })
    setOpenId(null)
  }

  const cycleStatus = (form: FormInventoryItem) => {
    setStatuses((previous) => {
      const id = rid(form)
      const current = previous[id] ?? 'pending'
      const next = CYCLE[(CYCLE.indexOf(current) + 1) % CYCLE.length] ?? 'pending'
      return { ...previous, [id]: next }
    })
  }

  const clearFilters = () => {
    setQuery('')
    setActionFilter('all')
    setDepartments(new Set())
    setTagFilter('all')
    setSignalFilter(new Set())
    setOpenId(null)
  }

  const hasFilters =
    query !== '' ||
    actionFilter !== 'all' ||
    departments.size > 0 ||
    tagFilter !== 'all' ||
    signalFilter.size > 0

  const exportCsv = () => {
    const header = ['department', 'file', 'recommended_action', 'status']
    const rows = forms.map((form) =>
      [
        form.department,
        form.file,
        form.recommendedAction,
        STATUS_LABEL[statuses[rid(form)] ?? 'pending'],
      ]
        .map((value) => `"${String(value).replace(/"/g, '""')}"`)
        .join(','),
    )
    const blob = new Blob([[header.join(','), ...rows].join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'form-review-decisions.csv'
    anchor.click()
    URL.revokeObjectURL(url)
  }

  const activeFilters = [...departments]

  const filterBadge =
    departments.size > 0 ? (
      <span className="sidebar__badge">
        {departments.size}
        <span className="visually-hidden">
          {departments.size === 1 ? ' filter active' : ' filters active'}
        </span>
      </span>
    ) : null

  return (
    <section className="view" aria-labelledby="library-title">
      <div className="layout">
        {/* Department filters */}
        <aside className="sidebar" aria-labelledby="filter-title">
          <h2 className="sidebar__title" id="filter-title">
            {isNarrow ? (
              <button
                type="button"
                className="sidebar__toggle"
                onClick={() => setFiltersOpen((open) => !open)}
                aria-expanded={filtersOpen}
                aria-controls="dept-filters"
              >
                Departments
                {filterBadge}
                <span className="sidebar__caret" aria-hidden="true" />
              </button>
            ) : (
              <span className="sidebar__heading">
                Departments
                {filterBadge}
              </span>
            )}
          </h2>

          <div id="dept-filters" className="sidebar__filters" data-open={filtersOpen}>
            <button
              type="button"
              className="sidebar__clear"
              onClick={() => setDepartments(new Set())}
              disabled={departments.size === 0}
            >
              Clear all filters
            </button>

            <ul className="deptlist">
              {deptList.map((department) => {
                const id = `dept-${department}`
                const count = deptCounts.get(department) ?? 0

                return (
                  <li key={department}>
                    <div className="check dept">
                      <input
                        type="checkbox"
                        id={id}
                        checked={departments.has(department)}
                        onChange={() => toggleDepartment(department)}
                      />
                      <label className="dept__name" htmlFor={id}>
                        {deptLabel(department)}
                      </label>
                      <span className="dept__count" aria-hidden="true">
                        {count}
                      </span>
                      <span className="visually-hidden">{count} forms</span>
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        </aside>

        {/* Review queue */}
        <div className="content">
          <div className="pagehead">
            <h1 className="pagehead__title" id="library-title">
              Review queue
            </h1>
          </div>

          <div className="toolbar">
            <div className="search">
              <label className="search__label" htmlFor="search">
                Search forms
              </label>
              <div className="search__field">
                <Search className="search__icon" />
                <input
                  type="search"
                  id="search"
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value)
                    setOpenId(null)
                  }}
                  placeholder="Search forms by file name…"
                  autoComplete="off"
                />
              </div>
            </div>
            <button type="button" className="btn btn--ghost btn--sm queue__export" onClick={exportCsv}>
              Export decisions (CSV)
            </button>
          </div>

          <div className="filterbar" role="group" aria-label="Filter forms">
            <label className="filterbar__field">
              <span className="filterbar__label">Recommended action</span>
              <select
                className="filterbar__select"
                value={actionFilter}
                onChange={(event) => {
                  setActionFilter(event.target.value as FormAction | 'all')
                  setOpenId(null)
                }}
              >
                {ACTION_FILTERS.map((filter) => (
                  <option key={filter.value} value={filter.value}>
                    {filter.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="filterbar__field">
              <span className="filterbar__label">Tag status</span>
              <select
                className="filterbar__select"
                value={tagFilter}
                onChange={(event) => {
                  setTagFilter(event.target.value as TagFilter)
                  setOpenId(null)
                }}
              >
                {TAG_FILTERS.map((filter) => (
                  <option key={filter.value} value={filter.value}>
                    {filter.label}
                  </option>
                ))}
              </select>
            </label>

            <details className="filterbar__field filterbar__multi">
              <summary className="filterbar__select filterbar__multi-summary">
                <span className="filterbar__label">Process signals</span>
                <span className="filterbar__multi-value">
                  {signalFilter.size === 0 ? 'Any' : `${signalFilter.size} selected`}
                </span>
              </summary>
              <div className="filterbar__multi-panel">
                {KNOWN_SIGNALS.map((s) => (
                  <label key={s.value} className="filterbar__multi-option">
                    <input
                      type="checkbox"
                      checked={signalFilter.has(s.value)}
                      onChange={() => toggleSignal(s.value)}
                    />
                    <span>{s.label}</span>
                  </label>
                ))}
                {signalFilter.size > 0 && (
                  <button
                    type="button"
                    className="filterbar__multi-clear"
                    onClick={() => {
                      setSignalFilter(new Set())
                      setOpenId(null)
                    }}
                  >
                    Clear signal filters
                  </button>
                )}
              </div>
            </details>
          </div>

          {signalFilter.size > 0 && (
            <div className="chips" aria-live="polite">
              {[...signalFilter].map((signal) => {
                const label = KNOWN_SIGNALS.find((s) => s.value === signal)?.label ?? signal
                return (
                  <span className="chip" key={signal}>
                    {label}
                    <button
                      type="button"
                      onClick={() => toggleSignal(signal)}
                      aria-label={`Remove ${label} filter`}
                    >
                      <Cross />
                    </button>
                  </span>
                )
              })}
            </div>
          )}

          {activeFilters.length > 0 && (
            <div className="chips" aria-live="polite">
              {activeFilters.map((department) => (
                <span className="chip" key={department}>
                  {deptLabel(department)}
                  <button
                    type="button"
                    onClick={() => toggleDepartment(department)}
                    aria-label={`Remove ${deptLabel(department)} filter`}
                  >
                    <Cross />
                  </button>
                </span>
              ))}
            </div>
          )}

          <p className="toolbar__count" role="status">
            <strong>{visible.length}</strong> forms shown, <strong>{decidedCount}</strong> decided
          </p>
          <p className="queue__help">
            Click a form's status to cycle it. <strong>To review</strong>: not yet looked at.{' '}
            <strong>Approved</strong>: you accept the recommended action. <strong>Flagged</strong>:
            needs follow-up.
          </p>

          <div ref={table.ref} className={`tablewrap reveal-up ${table.inView ? 'is-in' : ''}`}>
            <table className="table queue">
              <caption className="visually-hidden">
                Campus PDF forms with recommended action and review status
              </caption>
              <thead>
                <tr>
                  <th scope="col">Form</th>
                  <th scope="col">Department</th>
                  <th scope="col">Action</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((form) => {
                  const id = rid(form)
                  const status = statuses[id] ?? 'pending'
                  const meta = ACTION_META[form.recommendedAction]
                  const isOpen = openId === id

                  return (
                    <Fragment key={id}>
                      <tr
                        className="queue__row"
                        role="button"
                        tabIndex={0}
                        aria-expanded={isOpen}
                        onClick={() => setOpenId(isOpen ? null : id)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault()
                            setOpenId(isOpen ? null : id)
                          }
                        }}
                      >
                        <td className="cell-doc" data-label="Form">
                          <div className="doc">
                            <span className="doc__icon" aria-hidden="true">
                              PDF
                            </span>
                            <span className="doc__name">{form.file}</span>
                            {viewUrlFor(form) ? (
                              <button
                                type="button"
                                className="doc__eye"
                                onClick={(event) => {
                                  event.stopPropagation()
                                  setPreviewing(form)
                                }}
                                aria-label={`Preview ${form.file} in a modal`}
                                title="Preview PDF"
                              >
                                <Eye />
                              </button>
                            ) : (
                              <span
                                className="doc__eye doc__eye--disabled"
                                aria-hidden="true"
                                title="Preview isn't available for corpus rows in the demo."
                              >
                                <Eye />
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="cell-dept" data-label="Department">
                          {deptLabel(form.department)}
                        </td>
                        <td data-label="Action">
                          <span className={`StatusBadge StatusBadge--${meta.color}`}>{meta.label}</span>
                        </td>
                        <td data-label="Status">
                          <button
                            type="button"
                            className={`review-status review-status--${status}`}
                            aria-label={`Review status for ${form.file}: ${STATUS_LABEL[status]}. Click to change.`}
                            onClick={(event) => {
                              event.stopPropagation()
                              cycleStatus(form)
                            }}
                          >
                            {STATUS_LABEL[status]}
                          </button>
                        </td>
                      </tr>

                      {isOpen && (
                        <tr className="queue__detail">
                          <td colSpan={4}>
                            <div className="queue-detail">
                              <h4>Why</h4>
                              <p>{form.rationale}</p>

                              <h4>Work items</h4>
                              <ul>
                                {form.workItems.map((item, index) => (
                                  <li key={index}>{item}</li>
                                ))}
                              </ul>

                              {form.platformMigrationRequired && (
                                <>
                                  <h4>Destination</h4>
                                  <ul>
                                    {form.platforms.map((platform, index) => (
                                      <li key={`p-${index}`}>{platform}</li>
                                    ))}
                                    {form.platformCaveats.map((caveat, index) => (
                                      <li key={`c-${index}`} className="queue-detail__caveat">
                                        {caveat}
                                      </li>
                                    ))}
                                  </ul>
                                </>
                              )}

                              {form.signals.length > 0 && (
                                <>
                                  <h4>Signals</h4>
                                  <p className="queue-detail__signals">{form.signals.join('; ')}</p>
                                </>
                              )}

                              {onRemediate && isCorpusRemediable(form.department, form.file) && (
                                <div className="queue-detail__action">
                                  <button
                                    type="button"
                                    className="btn btn--primary btn--sm"
                                    onClick={(event) => {
                                      event.stopPropagation()
                                      onRemediate(form.department, form.file)
                                    }}
                                  >
                                    Remediate
                                  </button>
                                  <span className="queue-detail__action-note">
                                    {remediableImageCount(form.department, form.file)} image
                                    {remediableImageCount(form.department, form.file) === 1 ? '' : 's'} can
                                    get AI-generated alternative text.
                                  </span>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  )
                })}
              </tbody>
            </table>

            {visible.length === 0 && (
              <div className="queue-empty">
                <p className="queue-empty__title">No forms match</p>
                <p className="queue-empty__hint">
                  {hasFilters
                    ? `Nothing matches the current filters. Clear them to see all ${forms.length} forms.`
                    : 'The inventory is empty.'}
                </p>
                {hasFilters && (
                  <button type="button" className="btn btn--ghost btn--sm" onClick={clearFilters}>
                    Clear filters
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {previewing && viewUrlFor(previewing) && (
        <PdfPreviewModal
          url={viewUrlFor(previewing)!}
          filename={previewing.file}
          onClose={() => setPreviewing(null)}
        />
      )}
    </section>
  )
}
