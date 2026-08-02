# Ramp — Frontend

React + TypeScript single-page app for [Ramp](../../tree/main). This branch holds **only the frontend code** — `app/` and this README. For backend and AWS adapters see the [`backend`](../../tree/backend) and [`ExternalIntegration`](../../tree/ExternalIntegration) branches.

---

## What lives here

```
app/
  index.html
  package.json / package-lock.json
  vite.config.ts
  tsconfig.json
  public/
    sample_inaccessible.pdf     demo PDF served for browser upload tests
    untagged_scanned.pdf
  src/
    App.tsx                     three-view state machine, merges uploaded + corpus + DubBot
    main.tsx                    Vite entry
    types.ts                    FormInventoryItem, FormAction, view enum
    styles.css                  design tokens + all component styles (no CSS framework)
    dashboardData.ts            curated 90-form ABA-forms inventory
    dubbotData.ts               250 real Sac State PDFs sampled from 2026 DubBot scan
    components/
      Banner.tsx                top nav (Dashboard / Review Queue / Remediate)
      DashboardPage.tsx         metrics + upload/triage control + action bar
      LibraryPage.tsx           Review Queue: filters, department sidebar, per-row review
      RemediateFlow.tsx         upload → WCAG scorecard → Tag/Modernize/Remediate/InferLabels
      WcagScorecard.tsx         score tile + findings grouped by severity + fix buttons
      Icons.tsx                 inline SVG icons
      Badge.tsx                 status badges
    lib/
      api.ts                    typed backend client (fetch + camelCase types)
      inventory.ts              GET /pdf/documents → FormInventoryItem
      corpusRemediable.ts       gates the 10 corpus forms with pixel images
      useMediaQuery.ts / useInView.ts
```

---

## Tech stack

- **React 18** + **TypeScript 5** + **Vite 5**
- Hand-rolled CSS on the Sac State palette; every text pair verified ≥ 4.5:1 contrast
- No CSS framework, no state library beyond React hooks
- **localStorage** for per-form review decisions
- **Vite dev proxy** routes `/pdf` and `/api` to `localhost:8000` — same-origin in dev, no CORS

---

## Run

```bash
cd app
npm install
npm run dev             # http://localhost:5173
npm run build           # production build to app/dist
npm run typecheck       # tsc --noEmit
```

The dev server assumes a backend on `:8000`. Boot that from the [`backend`](../../tree/backend) branch (defaults to offline / stub providers).

---

## Backend endpoints called

| Method | Path | Client method |
| --- | --- | --- |
| POST | `/pdf/documents` (multipart) | `api.uploadDocument` |
| POST | `/pdf/documents/from-corpus` | `api.ingestFromCorpus` |
| POST | `/pdf/triage` (multipart) | (Dashboard upload) |
| GET | `/pdf/documents` | `fetchUploadedForms` |
| POST | `/pdf/jobs` / `.../analyze` / `.../apply` | `api.createJob / analyze / apply` |
| POST | `/pdf/jobs/.../alt-text/.../approve` | `api.approve` |
| POST | `/pdf/wcag/check` (multipart) | `api.wcagCheckUpload` |
| GET | `/pdf/documents/{id}/wcag` | `api.wcagCheckDocument` |
| POST | `/pdf/documents/{id}/tag` | `api.tagDocument` |
| POST | `/pdf/documents/{id}/modernize` | `api.modernizeDocument` |
| POST | `/pdf/documents/{id}/infer-labels` | `api.inferLabels` |
| POST | `/pdf/ocr-jobs` / `.../reconstruct` / `.../review-complete` | `api.createOcrJob / reconstructOcr / completeOcrReview` |
| GET | `/pdf/ocr-jobs/{id}/preview` | `api.getOcrPreview` |

All calls are typed in `src/lib/api.ts`; response types mirror the backend's `models.py` in camelCase.

---

## Design system tokens (from `styles.css`)

```
Brand
  --green         #043927   (primary)
  --green-050     #eef4f1   (background wash)
  --gold          #c4b581   (structural accent, non-text)
  --gold-deep     #8a7842   (readable gold, 4.6:1 on white)

Neutrals
  --ink           #1c2321
  --ink-soft      #4a5350   (7.2:1 on white)
  --line          #d9dedb
  --bg            #f4f6f5
  --surface       #ffffff

Status (all pairs ≥ 4.5:1)
  --ok-bg / --ok-ink        (positive)
  --warn-bg / --warn-ink    (advisory)
  --alert-bg / --alert-ink  (blocker)
  --info-bg / --info-ink    (neutral info)
```

---


