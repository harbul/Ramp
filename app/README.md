# Sac State PDF Remediation Assistant - Frontend

The React + TypeScript + Vite frontend. A **three-tab app** wired to the live
backend:

- **Dashboard** (`DashboardPage.tsx`, landing): campus-wide accessibility overview
  - key metrics, recommended-action breakdown, department summary, and an upload
  control that calls `POST /pdf/triage` (classify -> recommend -> auto alt-text).
- **Review Queue** (`LibraryPage.tsx`): the full form inventory (static 90-form
  corpus merged with persisted uploads from `GET /pdf/documents`), with search,
  action/department filters, an expandable detail panel, a per-form review
  decision (To review / Approved / Flagged, saved in the browser), and CSV export.
  Forms with describable images (see `lib/corpusRemediable.ts`) show a **Remediate
  alt text** button that opens the Remediate tab on that form.
- **Remediate** (`RemediateFlow.tsx`): the interactive alt-text flow. Upload a PDF,
  or arrive from a Review Queue form (ingested from the corpus bucket via
  `POST /pdf/documents/from-corpus`), review each AI suggestion, edit it, then
  apply and download the remediated file.

`App.tsx` fetches persisted uploads on load and merges them ahead of the static
corpus, so an uploaded form survives a page reload.

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

`WorkspacePage.tsx`, `CompletePage.tsx`, `Steps.tsx`, `data.ts`,
`lib/remediation.ts`, and `lib/pdf.ts` are the earlier fixture-driven design
prototype (a mock three-page Library -> Workspace -> Complete flow). They are kept
for reference but are not imported by the current app. (`RemediateFlow.tsx` is no
longer legacy: it is now the live **Remediate** tab, wired to the backend.)

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

The Review Queue and Dashboard render a merged list: the static 90-form corpus
in `src/dashboardData.ts` (real analysis output, not backend-served) plus live
uploads fetched from `GET /pdf/documents` via `src/lib/inventory.ts`. Uploaded
forms are persisted server-side (S3 + DynamoDB) and survive a reload; the corpus
is still static. See `Docs/status.md` for the plan to serve the whole inventory
from the backend.

## Structure

```
src/
  App.tsx              three-view app; fetch + merge persisted uploads; focus mgmt
  dashboardData.ts     static 90-form corpus (analyzed data)
  types.ts             domain types
  lib/
    inventory.ts       fetch /pdf/documents -> FormInventoryItem
    useInView.ts       scroll-reveal hook (IntersectionObserver)
    useMediaQuery.ts   breakpoint hook (collapsible filters on narrow screens)
    lib/corpusRemediable.ts corpus forms with describable images (queue button gate)
  components/
    Banner             top nav (Dashboard / Review Queue / Remediate)
    DashboardPage      overview metrics + upload/triage
    LibraryPage        the Review Queue (full inventory + decisions + Remediate button)
    RemediateFlow      interactive alt-text flow (upload/ingest -> review -> apply -> download)
    Badge, Icons, Toast
  styles.css           design tokens + all component styles

  (legacy, not wired: WorkspacePage, CompletePage, Steps,
   PdfViewer, data.ts, lib/remediation.ts, lib/pdf.ts)
```
