# Ramp — Frontend

The React + TypeScript + Vite frontend. A **three-tab app** wired to the live
backend — see [`../Docs/QUICKSTART.md`](../Docs/QUICKSTART.md) for full setup
including AWS-backed vs. offline backend config.

- **Dashboard** (`DashboardPage.tsx`, landing): campus-wide accessibility overview
  - key metrics, recommended-action breakdown, department summary, and an
  **Analyze new PDF** upload control that calls `POST /pdf/triage`
  (classify -> recommend -> auto alt-text).
- **Review Queue** (`LibraryPage.tsx`): the full form inventory (static corpus
  merged with persisted uploads from `GET /pdf/documents`), with dropdown
  filters (recommended action, tag status, process signals), a department
  sidebar, an expandable detail panel, a per-form review decision (To review /
  Approved / Flagged, saved in the browser), CSV export, an inline **preview**
  (eye icon, opens `PdfPreviewModal`), and a **Fix Issues** button per row
  that clones the document (`POST /pdf/documents/{id}/clone`) and opens the
  clone in the Workbench — the original row is never mutated. Once fixed, the
  button becomes **Issues Fixed ✓**.
- **Workbench** (`RemediateFlow.tsx`): upload a PDF, or arrive from a Review
  Queue form (ingested from the corpus bucket, or a Fix Issues clone), click
  **Find Issues** to run the WCAG 2.1 AA scan, then work through three
  sectioned cards (`components/WorkbenchLayout.tsx`):
  - **Modernization** — one click, no review (tag structure, `/Lang`,
    `/Title`, heading promotion/repair, bookmarks, PDF/UA metadata)
  - **Remediation** — AI-drafted alt text and form labels, reviewed inline per
    item; a figure can be approved with edited text, rejected, or marked
    **decorative** (writes an explicit empty `/Alt`, disables that figure's
    textarea)
  - **Compliance** — findings that need a human decision, with Ramp's
    recommendation and a mark-as-reviewed control
  Apply a section's fixes and it collapses into a success recap; once every
  applicable section is done, a terminal download panel appears.

`App.tsx` fetches persisted uploads on load and merges them ahead of the static
corpus, so an uploaded form survives a page reload. It also accepts a
Workbench "target" (a specific `docId`, a `sourceUrl` to ingest, or a corpus
reference) so the Review Queue's **Fix Issues** button can hand off a
specific document instead of landing on a blank upload screen.

In dev, Vite proxies `/pdf` and `/api` to the backend on `:8000` (see
`vite.config.ts`), so there's no CORS to configure.

## Run

```bash
npm install
npm run dev        # http://localhost:5173
npm run typecheck  # tsc --noEmit
npm run build      # production build
```

## Legacy (in-repo, not wired into the app)

`WorkspacePage.tsx`, `CompletePage.tsx`, `Steps.tsx`, `IssueCard.tsx`,
`WcagScorecard.tsx`, `data.ts`, `lib/remediation.ts`, and `lib/pdf.ts` are the
earlier fixture-driven design prototype (a mock three-page Library ->
Workspace -> Complete flow, and a first-pass scorecard superseded by
`WorkbenchLayout.tsx`'s sectioned view). They are kept for reference but are
not imported by the current app. (`RemediateFlow.tsx` is no longer legacy: it
is now the live **Workbench** tab, wired to the backend.)

## Design notes

- **Brand.** Sac State Green `#043927` dominant, Sac State Gold `#C4B581` as a structural
  accent (rules, markers, focus rings). Gold is never used for text on white - it measures
  ~1.9:1, well under the 4.5:1 minimum. `--gold-deep` (`#8a7842`, 4.6:1) covers the cases
  that need readable gold.
- **Type.** Source Serif 4 for headings, Public Sans for body - the latter is the US Web
  Design System typeface, drawn for legibility in government interfaces.
- **Markers are anchored, not positioned.** Alt-text markers render inside the image block
  they describe, and broken-bookmark markers render in a bookmarks rail that mirrors a real
  PDF reader's outline panel. Nothing depends on hardcoded page coordinates, so markers stay
  aligned at any viewport size.
- **Accessibility.** Skip link, focus moved to `<main>` on each step change, visible focus
  rings throughout, status badges paired with a dot or icon so colour never carries meaning
  alone, live regions on result counts and selection state, and a `prefers-reduced-motion`
  block that disables animation.
- **CSS owns layout, JS only enhances.** The department filters collapse below 1080px, but
  visibility is decided by the stylesheet (`[data-open]` inside a media query), not by the
  `hidden` attribute. A stale or missed media-query event cannot leave the desktop layout
  without its filters.

## Inventory data

The Review Queue and Dashboard render a merged list: the static 90-form ABA
corpus (`src/dashboardData.ts`) plus the 250-row DubBot campus scan sample
(`src/dubbotData.ts`, each row carrying a `sourceUrl` for the preview/download
button) plus live uploads fetched from `GET /pdf/documents` via
`src/lib/inventory.ts`. Uploaded and Fix-Issues-cloned forms are persisted
server-side (S3 + DynamoDB by default) and survive a reload; the two static
corpora are still static data files. See `Docs/status.md` for the plan to
serve the whole inventory from the backend.

## Structure

```
src/
  App.tsx              three-view app; fetch + merge persisted uploads; focus mgmt;
                        accepts a Workbench target (docId / sourceUrl / corpus ref)
  dashboardData.ts     static 90-form ABA corpus (analyzed data)
  dubbotData.ts        static 250-row DubBot campus scan sample (incl. sourceUrl)
  types.ts             domain types
  lib/
    api.ts             typed client for every backend route (see Docs/QUICKSTART.md)
    inventory.ts       fetch /pdf/documents -> FormInventoryItem
    wcagSections.ts    classify each WcagFinding into Modernization / Remediation /
                        Compliance / Other, by how it gets fixed
    useInView.ts       scroll-reveal hook (IntersectionObserver)
    useMediaQuery.ts   breakpoint hook (collapsible filters on narrow screens)
    corpusRemediable.ts corpus forms with describable images (queue button gate)
  components/
    Banner             top nav: Ramp wordmark (left) + tab switcher (center) +
                        Sac State name/seal (right)
    DashboardPage      overview metrics + upload/triage
    LibraryPage        the Review Queue (filters, decisions, preview, Fix Issues)
    RemediateFlow      the Workbench (upload/ingest -> Find Issues -> sectioned
                        review -> apply -> download)
    WorkbenchLayout     WcagHeaderStrip / IssueSectionCard / SectionSuccess -
                        the sectioned findings UI RemediateFlow renders into
    PdfPreviewModal     inline PDF preview (iframe) opened from the Review Queue
    Badge, Icons, Toast
  styles.css           design tokens + all component styles

  (legacy, not wired: WorkspacePage, CompletePage, Steps, IssueCard,
   WcagScorecard, PdfViewer, data.ts, lib/remediation.ts, lib/pdf.ts)
```
