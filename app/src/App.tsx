import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { FORM_INVENTORY } from './dashboardData'
import { DUBBOT_INVENTORY } from './dubbotData'
import { fetchUploadedForms } from './lib/inventory'
import type { FormInventoryItem, View } from './types'
import { Banner } from './components/Banner'
import { DashboardPage } from './components/DashboardPage'
import { LibraryPage } from './components/LibraryPage'
import { RemediateFlow } from './components/RemediateFlow'

/**
 * Three tabs over the same campus form inventory:
 * 1. Dashboard    - overview metrics + live upload/triage (the real remediation
 *    path: upload a PDF, it is classified and its alt text auto-added).
 * 2. Review Queue - every form with its recommended action and a review decision.
 * 3. Remediate    - the interactive alt-text flow: upload a PDF, review each
 *    AI-suggested description, approve/edit, then download the fixed file.
 *
 * The static Review Queue lists the analyzed corpus (no uploaded PDF bytes), so
 * remediation itself always happens through an upload (Dashboard or Remediate).
 */
export default function App() {
  const [view, setView] = useState<View>('dashboard')

  // Persisted uploads from the backend, merged ahead of the static corpus.
  // Fetched on load and after each upload, so uploads survive a reload.
  const [uploaded, setUploaded] = useState<FormInventoryItem[]>([])

  const refreshUploaded = useCallback(() => {
    fetchUploadedForms().then(setUploaded)
  }, [])

  useEffect(() => {
    refreshUploaded()
  }, [refreshUploaded])

  // Uploaded (triaged) forms first, then the static corpus, then a sampled
  // slice of the campus-wide DubBot inventory. All three de-duplicated by
  // department/file so a re-upload or a corpus/DubBot overlap never renders twice.
  const forms = useMemo(() => {
    const seen = new Set<string>()
    const merged: FormInventoryItem[] = []
    for (const form of [...uploaded, ...FORM_INVENTORY, ...DUBBOT_INVENTORY]) {
      const key = `${form.department}/${form.file}`
      if (seen.has(key)) continue
      seen.add(key)
      merged.push(form)
    }
    return merged
  }, [uploaded])

  const mainRef = useRef<HTMLElement>(null)
  const isFirstRender = useRef(true)

  // Moving focus to <main> on a tab change keeps keyboard and screen-reader
  // users oriented; preventScroll stops it from hiding the banner.
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    mainRef.current?.focus({ preventScroll: true })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [view])

  // How the Workbench should populate itself when the user lands there:
  //  - `corpus`      : pull the PDF from the corpus bucket (Review Queue Remediate button)
  //  - `docId`       : clone this backend doc so fixes hit the clone, not the parent
  //  - `sourceUrl`   : fetch this external URL, upload to backend, then Workbench uses it
  //  - null          : plain upload flow, prompt the reviewer to pick a file
  type WorkbenchTarget =
    | { kind: 'corpus'; department: string; file: string }
    | { kind: 'docId'; docId: string; filename: string }
    | { kind: 'sourceUrl'; sourceUrl: string; filename: string; department: string }
    | null
  const [workbenchTarget, setWorkbenchTarget] = useState<WorkbenchTarget>(null)

  const goToLibrary = useCallback(() => setView('library'), [])
  const goToDashboard = useCallback(() => setView('dashboard'), [])
  const goToRemediate = useCallback(() => {
    setWorkbenchTarget(null)
    setView('remediate')
  }, [])
  const remediateForm = useCallback((department: string, file: string) => {
    setWorkbenchTarget({ kind: 'corpus', department, file })
    setView('remediate')
  }, [])
  // "Fix Issues" from Review Queue: clone the backend doc so the fix runs on a
  // copy and the parent row stays byte-identical.
  const fixByDocId = useCallback((docId: string, filename: string) => {
    setWorkbenchTarget({ kind: 'docId', docId, filename })
    setView('remediate')
  }, [])
  // "Fix Issues" for a DubBot row: hand the source URL to the Workbench which
  // fetches + uploads + then treats it as a normal working doc.
  const fixByUrl = useCallback((sourceUrl: string, filename: string, department: string) => {
    setWorkbenchTarget({ kind: 'sourceUrl', sourceUrl, filename, department })
    setView('remediate')
  }, [])

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to main content
      </a>

      <Banner
        onHome={goToLibrary}
        onDashboard={goToDashboard}
        onRemediate={goToRemediate}
        currentView={view}
      />

      <main id="main" ref={mainRef} tabIndex={-1}>
        {view === 'dashboard' && <DashboardPage forms={forms} onUploaded={refreshUploaded} />}
        {view === 'library' && (
          <LibraryPage
            forms={forms}
            onRemediate={remediateForm}
            onFixByDocId={fixByDocId}
            onFixByUrl={fixByUrl}
            onFixApplied={refreshUploaded}
          />
        )}
        {view === 'remediate' && (
          <RemediateFlow target={workbenchTarget} onFixApplied={refreshUploaded} />
        )}
      </main>

      <footer className="footer">
        <div className="footer__inner">
          <p className="footer__org">California State University, Sacramento · Office of Web Services</p>
          <p className="footer__note">
            Prototype - AI-suggested fixes require human review before publication.
          </p>
        </div>
      </footer>
    </>
  )
}
