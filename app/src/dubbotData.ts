import type { FormInventoryItem } from './types'

/**
 * A representative sample of Sac State PDFs from the DubBot campus
 * accessibility scan (2026-07-09 export, ~12k documents). Sampled
 * deterministically to give the Review Queue realistic distribution
 * of tag statuses, page counts, and accessibility issue counts across
 * campus departments. 250 rows.
 */
export const DUBBOT_INVENTORY: FormInventoryItem[] = [
  {
    "file": "adv-worksheet-minor-in-english-2024.06.12.pdf",
    "department": "arts-letters",
    "pages": 1,
    "fieldCount": 0,
    "missingLabelCount": 0,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "no_action_needed",
    "workItems": [
      "Periodic spot-check only"
    ],
    "rationale": "Tagged and clean per DubBot; periodic spot-check only.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [],
    "tagStatus": "TAGGED"
  },
  {
    "file": "kins-pe-teacher-education.pdf",
    "department": "health-human-services",
    "pages": 2,
    "fieldCount": 0,
    "missingLabelCount": 3,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 3 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "3 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "thesis-bank-2018-stumpf.pdf",
    "department": "social-sciences-interdisciplinary-studies",
    "pages": 99,
    "fieldCount": 0,
    "missingLabelCount": 5,
    "hasSignatureField": false,
    "classification": "UNTAGGED",
    "recommendedAction": "recreate_accessible_pdf",
    "workItems": [
      "Recreate as a fillable, accessible PDF (or move to a web form)",
      "Fix the 5 DubBot findings"
    ],
    "rationale": "Untagged and 5 accessibility issues flagged; alt text written into it would be unreachable.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "untagged",
      "5 DubBot findings"
    ],
    "tagStatus": "UNTAGGED"
  },
  {
    "file": "copy-of-week-4-problem-set-1.pdf",
    "department": "natural-sciences-mathematics",
    "pages": 2,
    "fieldCount": 0,
    "missingLabelCount": 2,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 2 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "2 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "ellison_report.pdf",
    "department": "academic-affairs",
    "pages": 3,
    "fieldCount": 0,
    "missingLabelCount": 3,
    "hasSignatureField": false,
    "classification": "UNTAGGED",
    "recommendedAction": "recreate_accessible_pdf",
    "workItems": [
      "Recreate as a fillable, accessible PDF (or move to a web form)",
      "Fix the 3 DubBot findings"
    ],
    "rationale": "Untagged and 3 accessibility issues flagged; alt text written into it would be unreachable.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "untagged",
      "3 DubBot findings"
    ],
    "tagStatus": "UNTAGGED"
  },
  {
    "file": "ray-s26.pdf",
    "department": "natural-sciences-mathematics",
    "pages": 1,
    "fieldCount": 0,
    "missingLabelCount": 3,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 3 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "3 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "15-16-ba-history.pdf",
    "department": "academic-affairs",
    "pages": 35,
    "fieldCount": 0,
    "missingLabelCount": 5,
    "hasSignatureField": false,
    "classification": "UNTAGGED",
    "recommendedAction": "recreate_accessible_pdf",
    "workItems": [
      "Recreate as a fillable, accessible PDF (or move to a web form)",
      "Fix the 5 DubBot findings"
    ],
    "rationale": "Untagged and 5 accessibility issues flagged; alt text written into it would be unreachable.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "untagged",
      "5 DubBot findings"
    ],
    "tagStatus": "UNTAGGED"
  },
  {
    "file": "fieldwork-handbook_edc_20251.pdf",
    "department": "education",
    "pages": 64,
    "fieldCount": 0,
    "missingLabelCount": 3,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 3 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "3 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "phys-252_-nuclear-and-particle-physics.pdf",
    "department": "academic-affairs",
    "pages": 4,
    "fieldCount": 0,
    "missingLabelCount": 2,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 2 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "2 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "12.04.25.sr.proj.alejandro.wallace.pdf",
    "department": "natural-sciences-mathematics",
    "pages": 1,
    "fieldCount": 0,
    "missingLabelCount": 1,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 1 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "1 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "david-turner-training-2020-2023.pdf",
    "department": "title-ix",
    "pages": 226,
    "fieldCount": 0,
    "missingLabelCount": 7,
    "hasSignatureField": false,
    "classification": "UNTAGGED",
    "recommendedAction": "recreate_accessible_pdf",
    "workItems": [
      "Recreate as a fillable, accessible PDF (or move to a web form)",
      "Fix the 7 DubBot findings"
    ],
    "rationale": "Untagged and 7 accessibility issues flagged; alt text written into it would be unreachable.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "untagged",
      "7 DubBot findings"
    ],
    "tagStatus": "UNTAGGED"
  },
  {
    "file": "nurs-219_-healthcare-policy-and-advocacy.pdf",
    "department": "academic-affairs",
    "pages": 4,
    "fieldCount": 0,
    "missingLabelCount": 2,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 2 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "2 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "psyc-104_-learning-theories.pdf",
    "department": "academic-affairs",
    "pages": 21,
    "fieldCount": 0,
    "missingLabelCount": 3,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 3 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "3 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "bes-erg.pdf",
    "department": "academic-affairs",
    "pages": 8,
    "fieldCount": 0,
    "missingLabelCount": 2,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 2 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "2 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "csad-org-chart-2024-2025.pdf",
    "department": "health-human-services",
    "pages": 4,
    "fieldCount": 0,
    "missingLabelCount": 2,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 2 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "2 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "th-111_-science-of-disability.pdf",
    "department": "academic-affairs",
    "pages": 21,
    "fieldCount": 0,
    "missingLabelCount": 3,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 3 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "3 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "15-16-bsba-chem.pdf",
    "department": "academic-affairs",
    "pages": 31,
    "fieldCount": 0,
    "missingLabelCount": 6,
    "hasSignatureField": false,
    "classification": "UNTAGGED",
    "recommendedAction": "recreate_accessible_pdf",
    "workItems": [
      "Recreate as a fillable, accessible PDF (or move to a web form)",
      "Fix the 6 DubBot findings"
    ],
    "rationale": "Untagged and 6 accessibility issues flagged; alt text written into it would be unreachable.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "untagged",
      "6 DubBot findings"
    ],
    "tagStatus": "UNTAGGED"
  },
  {
    "file": "community-engagement-showcase-poster-fulton.pdf",
    "department": "community-engagement-center",
    "pages": 1,
    "fieldCount": 0,
    "missingLabelCount": 0,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "no_action_needed",
    "workItems": [
      "Periodic spot-check only"
    ],
    "rationale": "Tagged and clean per DubBot; periodic spot-check only.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [],
    "tagStatus": "TAGGED"
  },
  {
    "file": "1718-ba-ethnic-std---full.pdf",
    "department": "academic-affairs",
    "pages": 32,
    "fieldCount": 0,
    "missingLabelCount": 5,
    "hasSignatureField": false,
    "classification": "UNTAGGED",
    "recommendedAction": "recreate_accessible_pdf",
    "workItems": [
      "Recreate as a fillable, accessible PDF (or move to a web form)",
      "Fix the 5 DubBot findings"
    ],
    "rationale": "Untagged and 5 accessibility issues flagged; alt text written into it would be unreachable.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "untagged",
      "5 DubBot findings"
    ],
    "tagStatus": "UNTAGGED"
  },
  {
    "file": "1819-ba-soc-wrk-full.pdf",
    "department": "academic-affairs",
    "pages": 26,
    "fieldCount": 0,
    "missingLabelCount": 6,
    "hasSignatureField": false,
    "classification": "UNTAGGED",
    "recommendedAction": "recreate_accessible_pdf",
    "workItems": [
      "Recreate as a fillable, accessible PDF (or move to a web form)",
      "Fix the 6 DubBot findings"
    ],
    "rationale": "Untagged and 6 accessibility issues flagged; alt text written into it would be unreachable.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "untagged",
      "6 DubBot findings"
    ],
    "tagStatus": "UNTAGGED"
  },
  {
    "file": "thesis-bank-2010-propheter.pdf",
    "department": "social-sciences-interdisciplinary-studies",
    "pages": 0,
    "fieldCount": 0,
    "missingLabelCount": 0,
    "hasSignatureField": false,
    "classification": "UNTAGGED",
    "recommendedAction": "migrate",
    "workItems": [
      "Publish equivalent as a web form",
      "Retire the PDF"
    ],
    "rationale": "Short untagged form; a modern web form is a cleaner replacement.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": true,
    "signals": [
      "migrate candidate"
    ],
    "tagStatus": "UNTAGGED"
  },
  {
    "file": "honr-199_-independent-study.pdf",
    "department": "academic-affairs",
    "pages": 4,
    "fieldCount": 0,
    "missingLabelCount": 2,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 2 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "2 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "m32_9.pdf",
    "department": "natural-sciences-mathematics",
    "pages": 1,
    "fieldCount": 0,
    "missingLabelCount": 4,
    "hasSignatureField": false,
    "classification": "UNTAGGED",
    "recommendedAction": "recreate_accessible_pdf",
    "workItems": [
      "Recreate as a fillable, accessible PDF (or move to a web form)",
      "Fix the 4 DubBot findings"
    ],
    "rationale": "Untagged and 4 accessibility issues flagged; alt text written into it would be unreachable.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "untagged",
      "4 DubBot findings"
    ],
    "tagStatus": "UNTAGGED"
  },
  {
    "file": "10.27.20_agenda.pdf",
    "department": "people-climate",
    "pages": 1,
    "fieldCount": 0,
    "missingLabelCount": 1,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 1 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "1 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "fs-standing-rules-f.pdf",
    "department": "academic-affairs",
    "pages": 11,
    "fieldCount": 0,
    "missingLabelCount": 1,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 1 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "1 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "csad-295p-01-fall-2024.pdf",
    "department": "health-human-services",
    "pages": 19,
    "fieldCount": 0,
    "missingLabelCount": 4,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 4 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "4 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "join-meet-android.pdf",
    "department": "social-sciences-interdisciplinary-studies",
    "pages": 2,
    "fieldCount": 0,
    "missingLabelCount": 2,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 2 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "2 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "24-25ex-115.pdf",
    "department": "academic-affairs",
    "pages": 4,
    "fieldCount": 0,
    "missingLabelCount": 2,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 2 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "2 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "subject-matter-program_german.pdf",
    "department": "academic-affairs",
    "pages": 3,
    "fieldCount": 0,
    "missingLabelCount": 2,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 2 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "2 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "travel-advance-authorization-0812.pdf",
    "department": "administration-business-affairs",
    "pages": 1,
    "fieldCount": 0,
    "missingLabelCount": 3,
    "hasSignatureField": false,
    "classification": "UNTAGGED",
    "recommendedAction": "recreate_accessible_pdf",
    "workItems": [
      "Recreate as a fillable, accessible PDF (or move to a web form)",
      "Fix the 3 DubBot findings"
    ],
    "rationale": "Untagged and 3 accessibility issues flagged; alt text written into it would be unreachable.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "untagged",
      "3 DubBot findings"
    ],
    "tagStatus": "UNTAGGED"
  },
  {
    "file": "annual-report-2019-2020.pdf",
    "department": "race-immigration-social-justice",
    "pages": 29,
    "fieldCount": 0,
    "missingLabelCount": 2,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 2 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "2 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "23-24-osa-f.pdf",
    "department": "academic-affairs",
    "pages": 3,
    "fieldCount": 0,
    "missingLabelCount": 3,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 3 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "3 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "using-the-zoom-chat.pdf",
    "department": "academic-affairs",
    "pages": 0,
    "fieldCount": 0,
    "missingLabelCount": 0,
    "hasSignatureField": false,
    "classification": "UNTAGGED",
    "recommendedAction": "migrate",
    "workItems": [
      "Publish equivalent as a web form",
      "Retire the PDF"
    ],
    "rationale": "Short untagged form; a modern web form is a cleaner replacement.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": true,
    "signals": [
      "migrate candidate"
    ],
    "tagStatus": "UNTAGGED"
  },
  {
    "file": "hhs_secondary-rtp-2004.pdf",
    "department": "health-human-services",
    "pages": 13,
    "fieldCount": 0,
    "missingLabelCount": 1,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 1 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "1 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "apf-curriculum-demo-program-for-may-25-26-2021.pdf",
    "department": "african-peace-conflict-resolution",
    "pages": 3,
    "fieldCount": 0,
    "missingLabelCount": 3,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 3 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "3 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "1617-ms-geol-pckt.pdf",
    "department": "academic-affairs",
    "pages": 40,
    "fieldCount": 0,
    "missingLabelCount": 5,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 5 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "5 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "maryjane-rees-center-speech-lancguage-clinic-required-documentation.pdf",
    "department": "health-human-services",
    "pages": 4,
    "fieldCount": 0,
    "missingLabelCount": 3,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 3 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "3 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "pubh-120_-social-marketing-in-health-promotion.pdf",
    "department": "academic-affairs",
    "pages": 4,
    "fieldCount": 0,
    "missingLabelCount": 2,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 2 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "2 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "PE%20and%20Preterm%20Birth.pdf",
    "department": "faculty",
    "pages": 8,
    "fieldCount": 0,
    "missingLabelCount": 5,
    "hasSignatureField": false,
    "classification": "UNTAGGED",
    "recommendedAction": "recreate_accessible_pdf",
    "workItems": [
      "Recreate as a fillable, accessible PDF (or move to a web form)",
      "Fix the 5 DubBot findings"
    ],
    "rationale": "Untagged and 5 accessibility issues flagged; alt text written into it would be unreachable.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "untagged",
      "5 DubBot findings"
    ],
    "tagStatus": "UNTAGGED"
  },
  {
    "file": "25-26ex-121.pdf",
    "department": "academic-affairs",
    "pages": 5,
    "fieldCount": 0,
    "missingLabelCount": 3,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 3 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "3 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "24-25fs-130.pdf",
    "department": "academic-affairs",
    "pages": 2,
    "fieldCount": 0,
    "missingLabelCount": 2,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 2 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "2 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "stipends-service-levels.pdf",
    "department": "people-climate",
    "pages": 1,
    "fieldCount": 0,
    "missingLabelCount": 1,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 1 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "1 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "eee-graduate-advising-form.pdf",
    "department": "engineering-computer-science",
    "pages": 2,
    "fieldCount": 0,
    "missingLabelCount": 3,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 3 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "3 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "template_-inclusive-mtg-practices-slide.pdf",
    "department": "president",
    "pages": 1,
    "fieldCount": 0,
    "missingLabelCount": 1,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 1 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "1 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "24-25fs-210.pdf",
    "department": "academic-affairs",
    "pages": 13,
    "fieldCount": 0,
    "missingLabelCount": 3,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 3 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "3 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "Wassmer%20on%20Rent%20Control.pdf",
    "department": "faculty",
    "pages": 13,
    "fieldCount": 0,
    "missingLabelCount": 3,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 3 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "3 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "ba-in-art.pdf",
    "department": "academic-affairs",
    "pages": 12,
    "fieldCount": 0,
    "missingLabelCount": 4,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 4 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "4 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "wgs-180_-seminar-in-feminist-theory.pdf",
    "department": "academic-affairs",
    "pages": 4,
    "fieldCount": 0,
    "missingLabelCount": 2,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 2 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "2 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "14-15-chemistry-assessment.pdf",
    "department": "academic-affairs",
    "pages": 22,
    "fieldCount": 0,
    "missingLabelCount": 3,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 3 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "3 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "bcsse19-nsse20-combined-report-sacramento-state.pdf",
    "department": "information-resources-technology",
    "pages": 13,
    "fieldCount": 0,
    "missingLabelCount": 4,
    "hasSignatureField": false,
    "classification": "UNTAGGED",
    "recommendedAction": "recreate_accessible_pdf",
    "workItems": [
      "Recreate as a fillable, accessible PDF (or move to a web form)",
      "Fix the 4 DubBot findings"
    ],
    "rationale": "Untagged and 4 accessibility issues flagged; alt text written into it would be unreachable.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "untagged",
      "4 DubBot findings"
    ],
    "tagStatus": "UNTAGGED"
  },
  {
    "file": "cv-1-2023.pdf",
    "department": "faculty",
    "pages": 13,
    "fieldCount": 0,
    "missingLabelCount": 2,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 2 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "2 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "summer_session_reg_form-2026.pdf",
    "department": "education",
    "pages": 1,
    "fieldCount": 0,
    "missingLabelCount": 1,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 1 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "1 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "24-25fsa-05-08-f.pdf",
    "department": "academic-affairs",
    "pages": 3,
    "fieldCount": 0,
    "missingLabelCount": 2,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 2 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "2 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "11.15.25-smith.pdf",
    "department": "arts-letters",
    "pages": 4,
    "fieldCount": 0,
    "missingLabelCount": 4,
    "hasSignatureField": false,
    "classification": "UNTAGGED",
    "recommendedAction": "recreate_accessible_pdf",
    "workItems": [
      "Recreate as a fillable, accessible PDF (or move to a web form)",
      "Fix the 4 DubBot findings"
    ],
    "rationale": "Untagged and 4 accessibility issues flagged; alt text written into it would be unreachable.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "untagged",
      "4 DubBot findings"
    ],
    "tagStatus": "UNTAGGED"
  },
  {
    "file": "kins-athletic-administration.pdf",
    "department": "health-human-services",
    "pages": 2,
    "fieldCount": 0,
    "missingLabelCount": 3,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 3 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "3 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "chemical-procurement-information.pdf",
    "department": "campus-safety",
    "pages": 0,
    "fieldCount": 0,
    "missingLabelCount": 0,
    "hasSignatureField": false,
    "classification": "UNTAGGED",
    "recommendedAction": "migrate",
    "workItems": [
      "Publish equivalent as a web form",
      "Retire the PDF"
    ],
    "rationale": "Short untagged form; a modern web form is a cleaner replacement.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": true,
    "signals": [
      "migrate candidate"
    ],
    "tagStatus": "UNTAGGED"
  },
  {
    "file": "quality-control.pdf",
    "department": "information-resources-technology",
    "pages": 0,
    "fieldCount": 0,
    "missingLabelCount": 0,
    "hasSignatureField": false,
    "classification": "UNTAGGED",
    "recommendedAction": "migrate",
    "workItems": [
      "Publish equivalent as a web form",
      "Retire the PDF"
    ],
    "rationale": "Short untagged form; a modern web form is a cleaner replacement.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": true,
    "signals": [
      "migrate candidate"
    ],
    "tagStatus": "UNTAGGED"
  },
  {
    "file": "ubac-meeting-notes04-30-2021_11am.pdf",
    "department": "administration-business-affairs",
    "pages": 1,
    "fieldCount": 0,
    "missingLabelCount": 2,
    "hasSignatureField": false,
    "classification": "UNTAGGED",
    "recommendedAction": "migrate",
    "workItems": [
      "Publish equivalent as a web form",
      "Retire the PDF"
    ],
    "rationale": "Short untagged form; a modern web form is a cleaner replacement.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": true,
    "signals": [
      "migrate candidate",
      "2 DubBot findings"
    ],
    "tagStatus": "UNTAGGED"
  },
  {
    "file": "alexis-arellano_spring-2023.pdf",
    "department": "natural-sciences-mathematics",
    "pages": 2,
    "fieldCount": 0,
    "missingLabelCount": 4,
    "hasSignatureField": false,
    "classification": "UNTAGGED",
    "recommendedAction": "recreate_accessible_pdf",
    "workItems": [
      "Recreate as a fillable, accessible PDF (or move to a web form)",
      "Fix the 4 DubBot findings"
    ],
    "rationale": "Untagged and 4 accessibility issues flagged; alt text written into it would be unreachable.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "untagged",
      "4 DubBot findings"
    ],
    "tagStatus": "UNTAGGED"
  },
  {
    "file": "financial-deadlines-spring_2026.pdf",
    "department": "administration-business-affairs",
    "pages": 0,
    "fieldCount": 0,
    "missingLabelCount": 0,
    "hasSignatureField": false,
    "classification": "UNTAGGED",
    "recommendedAction": "migrate",
    "workItems": [
      "Publish equivalent as a web form",
      "Retire the PDF"
    ],
    "rationale": "Short untagged form; a modern web form is a cleaner replacement.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": true,
    "signals": [
      "migrate candidate"
    ],
    "tagStatus": "UNTAGGED"
  },
  {
    "file": "2025-mri-guidelines-final.pdf",
    "department": "experience",
    "pages": 3,
    "fieldCount": 0,
    "missingLabelCount": 6,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 6 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "6 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "tae-faq.pdf",
    "department": "people-climate",
    "pages": 0,
    "fieldCount": 0,
    "missingLabelCount": 0,
    "hasSignatureField": false,
    "classification": "UNTAGGED",
    "recommendedAction": "migrate",
    "workItems": [
      "Publish equivalent as a web form",
      "Retire the PDF"
    ],
    "rationale": "Short untagged form; a modern web form is a cleaner replacement.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": true,
    "signals": [
      "migrate candidate"
    ],
    "tagStatus": "UNTAGGED"
  },
  {
    "file": "y-hope-brief.pdf",
    "department": "faculty",
    "pages": 1,
    "fieldCount": 0,
    "missingLabelCount": 1,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 1 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "1 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "23-24ex-36.pdf",
    "department": "academic-affairs",
    "pages": 86,
    "fieldCount": 0,
    "missingLabelCount": 7,
    "hasSignatureField": false,
    "classification": "UNTAGGED",
    "recommendedAction": "recreate_accessible_pdf",
    "workItems": [
      "Recreate as a fillable, accessible PDF (or move to a web form)",
      "Fix the 7 DubBot findings"
    ],
    "rationale": "Untagged and 7 accessibility issues flagged; alt text written into it would be unreachable.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "untagged",
      "7 DubBot findings"
    ],
    "tagStatus": "UNTAGGED"
  },
  {
    "file": "intro-to-molecular-cell-bio1.pdf",
    "department": "natural-sciences-mathematics",
    "pages": 2,
    "fieldCount": 0,
    "missingLabelCount": 3,
    "hasSignatureField": false,
    "classification": "UNTAGGED",
    "recommendedAction": "recreate_accessible_pdf",
    "workItems": [
      "Recreate as a fillable, accessible PDF (or move to a web form)",
      "Fix the 3 DubBot findings"
    ],
    "rationale": "Untagged and 3 accessibility issues flagged; alt text written into it would be unreachable.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "untagged",
      "3 DubBot findings"
    ],
    "tagStatus": "UNTAGGED"
  },
  {
    "file": "aanapisi_week_highlights_federal_grant_for_low-__sacramento_bee_the_ca___september_28_2019__p3a-1.pdf",
    "department": "faculty",
    "pages": 2,
    "fieldCount": 0,
    "missingLabelCount": 3,
    "hasSignatureField": false,
    "classification": "UNTAGGED",
    "recommendedAction": "recreate_accessible_pdf",
    "workItems": [
      "Recreate as a fillable, accessible PDF (or move to a web form)",
      "Fix the 3 DubBot findings"
    ],
    "rationale": "Untagged and 3 accessibility issues flagged; alt text written into it would be unreachable.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "untagged",
      "3 DubBot findings"
    ],
    "tagStatus": "UNTAGGED"
  },
  {
    "file": "intd-30_-beginning-autocad-and-sketchup.pdf",
    "department": "academic-affairs",
    "pages": 4,
    "fieldCount": 0,
    "missingLabelCount": 2,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 2 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "2 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "dangelo-cv-fall-2024.pdf",
    "department": "health-human-services",
    "pages": 17,
    "fieldCount": 0,
    "missingLabelCount": 3,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 3 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "3 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "award-notice-guide-24-251.pdf",
    "department": "apply",
    "pages": 13,
    "fieldCount": 0,
    "missingLabelCount": 4,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 4 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "4 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "capcrboardapplication.pdf",
    "department": "african-peace-conflict-resolution",
    "pages": 3,
    "fieldCount": 0,
    "missingLabelCount": 4,
    "hasSignatureField": false,
    "classification": "UNTAGGED",
    "recommendedAction": "recreate_accessible_pdf",
    "workItems": [
      "Recreate as a fillable, accessible PDF (or move to a web form)",
      "Fix the 4 DubBot findings"
    ],
    "rationale": "Untagged and 4 accessibility issues flagged; alt text written into it would be unreachable.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "untagged",
      "4 DubBot findings"
    ],
    "tagStatus": "UNTAGGED"
  },
  {
    "file": "15-16-ba-anth-pkt-final.pdf",
    "department": "academic-affairs",
    "pages": 22,
    "fieldCount": 0,
    "missingLabelCount": 5,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 5 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "5 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "how-to-access-concur-reporting1.pdf",
    "department": "administration-business-affairs",
    "pages": 4,
    "fieldCount": 0,
    "missingLabelCount": 2,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 2 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "2 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "mat_maset_credential_application_instructions_2025.pdf",
    "department": "education",
    "pages": 3,
    "fieldCount": 0,
    "missingLabelCount": 4,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 4 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "4 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "summer-online-grant-2025-flyerv2-1.pdf",
    "department": "academic-affairs",
    "pages": 1,
    "fieldCount": 0,
    "missingLabelCount": 2,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 2 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "2 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "student-service-learning-faq.pdf",
    "department": "community-engagement-center",
    "pages": 1,
    "fieldCount": 0,
    "missingLabelCount": 1,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 1 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "1 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "occupation-report-for-statisticians.pdf",
    "department": "natural-sciences-mathematics",
    "pages": 14,
    "fieldCount": 0,
    "missingLabelCount": 6,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 6 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "6 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "Little%20Manila_321_E_Main_St_MAP.pdf",
    "department": "faculty",
    "pages": 1,
    "fieldCount": 0,
    "missingLabelCount": 4,
    "hasSignatureField": false,
    "classification": "UNTAGGED",
    "recommendedAction": "recreate_accessible_pdf",
    "workItems": [
      "Recreate as a fillable, accessible PDF (or move to a web form)",
      "Fix the 4 DubBot findings"
    ],
    "rationale": "Untagged and 4 accessibility issues flagged; alt text written into it would be unreachable.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "untagged",
      "4 DubBot findings"
    ],
    "tagStatus": "UNTAGGED"
  },
  {
    "file": "23-24exm9-19-f.pdf",
    "department": "academic-affairs",
    "pages": 2,
    "fieldCount": 0,
    "missingLabelCount": 3,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 3 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "3 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "15-16-bs-cce-cj.pdf",
    "department": "academic-affairs",
    "pages": 46,
    "fieldCount": 0,
    "missingLabelCount": 5,
    "hasSignatureField": false,
    "classification": "UNTAGGED",
    "recommendedAction": "recreate_accessible_pdf",
    "workItems": [
      "Recreate as a fillable, accessible PDF (or move to a web form)",
      "Fix the 5 DubBot findings"
    ],
    "rationale": "Untagged and 5 accessibility issues flagged; alt text written into it would be unreachable.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "untagged",
      "5 DubBot findings"
    ],
    "tagStatus": "UNTAGGED"
  },
  {
    "file": "phys-235_-advanced-electromagnetism.pdf",
    "department": "academic-affairs",
    "pages": 22,
    "fieldCount": 0,
    "missingLabelCount": 3,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 3 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "3 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "phys-500_-masters-thesis.pdf",
    "department": "academic-affairs",
    "pages": 22,
    "fieldCount": 0,
    "missingLabelCount": 3,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 3 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "3 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "yuan-pfdg-2020-poster.pdf",
    "department": "academic-affairs",
    "pages": 1,
    "fieldCount": 0,
    "missingLabelCount": 0,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "no_action_needed",
    "workItems": [
      "Periodic spot-check only"
    ],
    "rationale": "Tagged and clean per DubBot; periodic spot-check only.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [],
    "tagStatus": "TAGGED"
  },
  {
    "file": "edc-252_-legal-and-ethical-issues-in-professional-counseling.pdf",
    "department": "academic-affairs",
    "pages": 22,
    "fieldCount": 0,
    "missingLabelCount": 3,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 3 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "3 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "envs-230_-environmental-policy-analysis.pdf",
    "department": "academic-affairs",
    "pages": 4,
    "fieldCount": 0,
    "missingLabelCount": 2,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 2 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "2 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "mktg-126_-professional-selling.pdf",
    "department": "academic-affairs",
    "pages": 21,
    "fieldCount": 0,
    "missingLabelCount": 3,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 3 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "3 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "sasaki-design-firm-talks-vision-for-sac._.pdf",
    "department": "academic-affairs",
    "pages": 0,
    "fieldCount": 0,
    "missingLabelCount": 0,
    "hasSignatureField": false,
    "classification": "UNTAGGED",
    "recommendedAction": "migrate",
    "workItems": [
      "Publish equivalent as a web form",
      "Retire the PDF"
    ],
    "rationale": "Short untagged form; a modern web form is a cleaner replacement.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": true,
    "signals": [
      "migrate candidate"
    ],
    "tagStatus": "UNTAGGED"
  },
  {
    "file": "maryjane-rees-center-speech-lancguage-clinic-observation-room.pdf",
    "department": "health-human-services",
    "pages": 1,
    "fieldCount": 0,
    "missingLabelCount": 2,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 2 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "2 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "ev-1-request-to-host-exchange-visitor-updated-10.24.19.pdf",
    "department": "international-programs-global-engagement",
    "pages": 3,
    "fieldCount": 0,
    "missingLabelCount": 4,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 4 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "4 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "ic_09.pdf",
    "department": "campus-safety",
    "pages": 0,
    "fieldCount": 0,
    "missingLabelCount": 0,
    "hasSignatureField": false,
    "classification": "UNTAGGED",
    "recommendedAction": "migrate",
    "workItems": [
      "Publish equivalent as a web form",
      "Retire the PDF"
    ],
    "rationale": "Short untagged form; a modern web form is a cleaner replacement.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": true,
    "signals": [
      "migrate candidate"
    ],
    "tagStatus": "UNTAGGED"
  },
  {
    "file": "access_lcd_dashboard.pdf",
    "department": "administration-business-affairs",
    "pages": 1,
    "fieldCount": 0,
    "missingLabelCount": 1,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 1 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "1 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "1819-bs-crim-just.pdf",
    "department": "academic-affairs",
    "pages": 210,
    "fieldCount": 0,
    "missingLabelCount": 9,
    "hasSignatureField": false,
    "classification": "UNTAGGED",
    "recommendedAction": "recreate_accessible_pdf",
    "workItems": [
      "Recreate as a fillable, accessible PDF (or move to a web form)",
      "Fix the 9 DubBot findings"
    ],
    "rationale": "Untagged and 9 accessibility issues flagged; alt text written into it would be unreachable.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "untagged",
      "9 DubBot findings"
    ],
    "tagStatus": "UNTAGGED"
  },
  {
    "file": "PA%20and%20Health%20Behaviors.pdf",
    "department": "faculty",
    "pages": 5,
    "fieldCount": 0,
    "missingLabelCount": 5,
    "hasSignatureField": false,
    "classification": "UNTAGGED",
    "recommendedAction": "recreate_accessible_pdf",
    "workItems": [
      "Recreate as a fillable, accessible PDF (or move to a web form)",
      "Fix the 5 DubBot findings"
    ],
    "rationale": "Untagged and 5 accessibility issues flagged; alt text written into it would be unreachable.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "untagged",
      "5 DubBot findings"
    ],
    "tagStatus": "UNTAGGED"
  },
  {
    "file": "basw-field-manual-accreditation-2025.pdf",
    "department": "health-human-services",
    "pages": 70,
    "fieldCount": 0,
    "missingLabelCount": 4,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 4 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "4 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "24-25ex-91.pdf",
    "department": "academic-affairs",
    "pages": 2,
    "fieldCount": 0,
    "missingLabelCount": 3,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 3 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "3 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "engl-190s_-literatures-of-disability.pdf",
    "department": "academic-affairs",
    "pages": 22,
    "fieldCount": 0,
    "missingLabelCount": 3,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 3 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "3 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "25-26fs-78.pdf",
    "department": "academic-affairs",
    "pages": 23,
    "fieldCount": 0,
    "missingLabelCount": 6,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 6 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "6 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "cec-wp-infographic.pdf",
    "department": "community-engagement-center",
    "pages": 2,
    "fieldCount": 0,
    "missingLabelCount": 4,
    "hasSignatureField": false,
    "classification": "UNTAGGED",
    "recommendedAction": "recreate_accessible_pdf",
    "workItems": [
      "Recreate as a fillable, accessible PDF (or move to a web form)",
      "Fix the 4 DubBot findings"
    ],
    "rationale": "Untagged and 4 accessibility issues flagged; alt text written into it would be unreachable.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "untagged",
      "4 DubBot findings"
    ],
    "tagStatus": "UNTAGGED"
  },
  {
    "file": "g-3953-cob-values.pdf",
    "department": "business-administration",
    "pages": 1,
    "fieldCount": 0,
    "missingLabelCount": 4,
    "hasSignatureField": false,
    "classification": "UNTAGGED",
    "recommendedAction": "recreate_accessible_pdf",
    "workItems": [
      "Recreate as a fillable, accessible PDF (or move to a web form)",
      "Fix the 4 DubBot findings"
    ],
    "rationale": "Untagged and 4 accessibility issues flagged; alt text written into it would be unreachable.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "untagged",
      "4 DubBot findings"
    ],
    "tagStatus": "UNTAGGED"
  },
  {
    "file": "War%20and%20Mental%20Disorders.pdf",
    "department": "faculty",
    "pages": 9,
    "fieldCount": 0,
    "missingLabelCount": 5,
    "hasSignatureField": false,
    "classification": "UNTAGGED",
    "recommendedAction": "recreate_accessible_pdf",
    "workItems": [
      "Recreate as a fillable, accessible PDF (or move to a web form)",
      "Fix the 5 DubBot findings"
    ],
    "rationale": "Untagged and 5 accessibility issues flagged; alt text written into it would be unreachable.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "untagged",
      "5 DubBot findings"
    ],
    "tagStatus": "UNTAGGED"
  },
  {
    "file": "csad-673-01-thomas-fall-2025.pdf",
    "department": "health-human-services",
    "pages": 13,
    "fieldCount": 0,
    "missingLabelCount": 4,
    "hasSignatureField": false,
    "classification": "UNTAGGED",
    "recommendedAction": "recreate_accessible_pdf",
    "workItems": [
      "Recreate as a fillable, accessible PDF (or move to a web form)",
      "Fix the 4 DubBot findings"
    ],
    "rationale": "Untagged and 4 accessibility issues flagged; alt text written into it would be unreachable.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "untagged",
      "4 DubBot findings"
    ],
    "tagStatus": "UNTAGGED"
  },
  {
    "file": "02.19.26.kim_color.pdf",
    "department": "natural-sciences-mathematics",
    "pages": 1,
    "fieldCount": 0,
    "missingLabelCount": 1,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 1 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "1 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "24-25exm-12-3-f.pdf",
    "department": "academic-affairs",
    "pages": 3,
    "fieldCount": 0,
    "missingLabelCount": 3,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 3 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "3 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "4.14.26-bryce.pdf",
    "department": "arts-letters",
    "pages": 7,
    "fieldCount": 0,
    "missingLabelCount": 6,
    "hasSignatureField": false,
    "classification": "UNTAGGED",
    "recommendedAction": "recreate_accessible_pdf",
    "workItems": [
      "Recreate as a fillable, accessible PDF (or move to a web form)",
      "Fix the 6 DubBot findings"
    ],
    "rationale": "Untagged and 6 accessibility issues flagged; alt text written into it would be unreachable.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "untagged",
      "6 DubBot findings"
    ],
    "tagStatus": "UNTAGGED"
  },
  {
    "file": "prefilled-payroll-deduction-form.pdf",
    "department": "president",
    "pages": 1,
    "fieldCount": 0,
    "missingLabelCount": 4,
    "hasSignatureField": false,
    "classification": "UNTAGGED",
    "recommendedAction": "recreate_accessible_pdf",
    "workItems": [
      "Recreate as a fillable, accessible PDF (or move to a web form)",
      "Fix the 4 DubBot findings"
    ],
    "rationale": "Untagged and 4 accessibility issues flagged; alt text written into it would be unreachable.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "untagged",
      "4 DubBot findings"
    ],
    "tagStatus": "UNTAGGED"
  },
  {
    "file": "community-agreements.pdf",
    "department": "academic-affairs",
    "pages": 1,
    "fieldCount": 0,
    "missingLabelCount": 2,
    "hasSignatureField": false,
    "classification": "UNTAGGED",
    "recommendedAction": "migrate",
    "workItems": [
      "Publish equivalent as a web form",
      "Retire the PDF"
    ],
    "rationale": "Short untagged form; a modern web form is a cleaner replacement.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": true,
    "signals": [
      "migrate candidate",
      "2 DubBot findings"
    ],
    "tagStatus": "UNTAGGED"
  },
  {
    "file": "2013-2014-gerontology-bs-appendix-d1.pdf",
    "department": "academic-affairs",
    "pages": 1,
    "fieldCount": 0,
    "missingLabelCount": 2,
    "hasSignatureField": false,
    "classification": "UNTAGGED",
    "recommendedAction": "migrate",
    "workItems": [
      "Publish equivalent as a web form",
      "Retire the PDF"
    ],
    "rationale": "Short untagged form; a modern web form is a cleaner replacement.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": true,
    "signals": [
      "migrate candidate",
      "2 DubBot findings"
    ],
    "tagStatus": "UNTAGGED"
  },
  {
    "file": "w-1.-worksheet-1.-introduction-to-nomenclature.pdf",
    "department": "natural-sciences-mathematics",
    "pages": 1,
    "fieldCount": 0,
    "missingLabelCount": 3,
    "hasSignatureField": false,
    "classification": "UNTAGGED",
    "recommendedAction": "recreate_accessible_pdf",
    "workItems": [
      "Recreate as a fillable, accessible PDF (or move to a web form)",
      "Fix the 3 DubBot findings"
    ],
    "rationale": "Untagged and 3 accessibility issues flagged; alt text written into it would be unreachable.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "untagged",
      "3 DubBot findings"
    ],
    "tagStatus": "UNTAGGED"
  },
  {
    "file": "2013-2014-business-assmt-rpt-cba-bsba.pdf",
    "department": "academic-affairs",
    "pages": 14,
    "fieldCount": 0,
    "missingLabelCount": 5,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 5 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "5 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "pec-cop-scale-overview.pdf",
    "department": "faculty",
    "pages": 4,
    "fieldCount": 0,
    "missingLabelCount": 4,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 4 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "4 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "23-24exm10-10-f.pdf",
    "department": "academic-affairs",
    "pages": 2,
    "fieldCount": 0,
    "missingLabelCount": 2,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 2 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "2 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "24-25fs-36.pdf",
    "department": "academic-affairs",
    "pages": 1,
    "fieldCount": 0,
    "missingLabelCount": 0,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "no_action_needed",
    "workItems": [
      "Periodic spot-check only"
    ],
    "rationale": "Tagged and clean per DubBot; periodic spot-check only.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [],
    "tagStatus": "TAGGED"
  },
  {
    "file": "vygodina_anna_bio.pdf",
    "department": "business-administration",
    "pages": 2,
    "fieldCount": 0,
    "missingLabelCount": 3,
    "hasSignatureField": false,
    "classification": "UNTAGGED",
    "recommendedAction": "recreate_accessible_pdf",
    "workItems": [
      "Recreate as a fillable, accessible PDF (or move to a web form)",
      "Fix the 3 DubBot findings"
    ],
    "rationale": "Untagged and 3 accessibility issues flagged; alt text written into it would be unreachable.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "untagged",
      "3 DubBot findings"
    ],
    "tagStatus": "UNTAGGED"
  },
  {
    "file": "2013-2014-art-ba-art-history-rpt.pdf",
    "department": "academic-affairs",
    "pages": 11,
    "fieldCount": 0,
    "missingLabelCount": 6,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 6 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "6 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "p-29735-cec-hands-on-year-in-review-2023-3.pdf",
    "department": "community-engagement-center",
    "pages": 20,
    "fieldCount": 0,
    "missingLabelCount": 5,
    "hasSignatureField": false,
    "classification": "UNTAGGED",
    "recommendedAction": "recreate_accessible_pdf",
    "workItems": [
      "Recreate as a fillable, accessible PDF (or move to a web form)",
      "Fix the 5 DubBot findings"
    ],
    "rationale": "Untagged and 5 accessibility issues flagged; alt text written into it would be unreachable.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "untagged",
      "5 DubBot findings"
    ],
    "tagStatus": "UNTAGGED"
  },
  {
    "file": "sleep-and-technology.pdf",
    "department": "faculty",
    "pages": 9,
    "fieldCount": 0,
    "missingLabelCount": 5,
    "hasSignatureField": false,
    "classification": "UNTAGGED",
    "recommendedAction": "recreate_accessible_pdf",
    "workItems": [
      "Recreate as a fillable, accessible PDF (or move to a web form)",
      "Fix the 5 DubBot findings"
    ],
    "rationale": "Untagged and 5 accessibility issues flagged; alt text written into it would be unreachable.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "untagged",
      "5 DubBot findings"
    ],
    "tagStatus": "UNTAGGED"
  },
  {
    "file": "e.morgan_curriculum-vitae_nov2021.pdf",
    "department": "faculty",
    "pages": 11,
    "fieldCount": 0,
    "missingLabelCount": 3,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 3 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "3 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "flowchart-thesis-project-fall-2021.pdf",
    "department": "arts-letters",
    "pages": 1,
    "fieldCount": 0,
    "missingLabelCount": 2,
    "hasSignatureField": false,
    "classification": "UNTAGGED",
    "recommendedAction": "migrate",
    "workItems": [
      "Publish equivalent as a web form",
      "Retire the PDF"
    ],
    "rationale": "Short untagged form; a modern web form is a cleaner replacement.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": true,
    "signals": [
      "migrate candidate",
      "2 DubBot findings"
    ],
    "tagStatus": "UNTAGGED"
  },
  {
    "file": "Media%20Violence%20Youth.pdf",
    "department": "faculty",
    "pages": 9,
    "fieldCount": 0,
    "missingLabelCount": 5,
    "hasSignatureField": false,
    "classification": "UNTAGGED",
    "recommendedAction": "recreate_accessible_pdf",
    "workItems": [
      "Recreate as a fillable, accessible PDF (or move to a web form)",
      "Fix the 5 DubBot findings"
    ],
    "rationale": "Untagged and 5 accessibility issues flagged; alt text written into it would be unreachable.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "untagged",
      "5 DubBot findings"
    ],
    "tagStatus": "UNTAGGED"
  },
  {
    "file": "current-student-information-center.pe-workshop-spring-2026.pdf",
    "department": "education",
    "pages": 1,
    "fieldCount": 0,
    "missingLabelCount": 1,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 1 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "1 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "subject-matter-advisor-list1.pdf",
    "department": "education",
    "pages": 1,
    "fieldCount": 0,
    "missingLabelCount": 0,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "no_action_needed",
    "workItems": [
      "Periodic spot-check only"
    ],
    "rationale": "Tagged and clean per DubBot; periodic spot-check only.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [],
    "tagStatus": "TAGGED"
  },
  {
    "file": "mary-ann-wong-biography.pdf",
    "department": "president",
    "pages": 1,
    "fieldCount": 0,
    "missingLabelCount": 1,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 1 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "1 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "thesis-bank-2019-myers.pdf",
    "department": "social-sciences-interdisciplinary-studies",
    "pages": 137,
    "fieldCount": 0,
    "missingLabelCount": 5,
    "hasSignatureField": false,
    "classification": "UNTAGGED",
    "recommendedAction": "recreate_accessible_pdf",
    "workItems": [
      "Recreate as a fillable, accessible PDF (or move to a web form)",
      "Fix the 5 DubBot findings"
    ],
    "rationale": "Untagged and 5 accessibility issues flagged; alt text written into it would be unreachable.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "untagged",
      "5 DubBot findings"
    ],
    "tagStatus": "UNTAGGED"
  },
  {
    "file": "how-to-upload-documents-to-mysacstate-updated.pdf",
    "department": "business-administration",
    "pages": 8,
    "fieldCount": 0,
    "missingLabelCount": 3,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 3 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "3 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "ma-in-education-equity-and-social-justice_ethnicity-and-race.pdf",
    "department": "academic-affairs",
    "pages": 12,
    "fieldCount": 0,
    "missingLabelCount": 4,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 4 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "4 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "sabbatical-workshop-powerpoint-presentation-april-24-2026.pdf",
    "department": "academic-affairs",
    "pages": 37,
    "fieldCount": 0,
    "missingLabelCount": 5,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 5 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "5 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "construction-management-academic-quality-plan.pdf",
    "department": "academic-affairs",
    "pages": 4,
    "fieldCount": 0,
    "missingLabelCount": 3,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 3 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "3 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "eee-allow-to-register-for-less-than-9-units.pdf",
    "department": "engineering-computer-science",
    "pages": 3,
    "fieldCount": 0,
    "missingLabelCount": 3,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 3 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "3 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "F13%20NSM%2021%20Syllabus.pdf",
    "department": "faculty",
    "pages": 7,
    "fieldCount": 0,
    "missingLabelCount": 3,
    "hasSignatureField": false,
    "classification": "UNTAGGED",
    "recommendedAction": "recreate_accessible_pdf",
    "workItems": [
      "Recreate as a fillable, accessible PDF (or move to a web form)",
      "Fix the 3 DubBot findings"
    ],
    "rationale": "Untagged and 3 accessibility issues flagged; alt text written into it would be unreachable.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "untagged",
      "3 DubBot findings"
    ],
    "tagStatus": "UNTAGGED"
  },
  {
    "file": "fixed-price-contracts_guidelines-october-2018-final.pdf",
    "department": "experience",
    "pages": 2,
    "fieldCount": 0,
    "missingLabelCount": 4,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 4 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "4 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "blue_slip-neil_andrews_1949.pdf",
    "department": "faculty",
    "pages": 1,
    "fieldCount": 0,
    "missingLabelCount": 4,
    "hasSignatureField": false,
    "classification": "UNTAGGED",
    "recommendedAction": "recreate_accessible_pdf",
    "workItems": [
      "Recreate as a fillable, accessible PDF (or move to a web form)",
      "Fix the 4 DubBot findings"
    ],
    "rationale": "Untagged and 4 accessibility issues flagged; alt text written into it would be unreachable.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "untagged",
      "4 DubBot findings"
    ],
    "tagStatus": "UNTAGGED"
  },
  {
    "file": "wgs-major-requirements-2026-27.pdf",
    "department": "social-sciences-interdisciplinary-studies",
    "pages": 1,
    "fieldCount": 0,
    "missingLabelCount": 2,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 2 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "2 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "hist-172b_-queer-black-histories.pdf",
    "department": "academic-affairs",
    "pages": 5,
    "fieldCount": 0,
    "missingLabelCount": 2,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 2 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "2 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "24-25fsa-10-17-f.pdf",
    "department": "academic-affairs",
    "pages": 2,
    "fieldCount": 0,
    "missingLabelCount": 3,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 3 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "3 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "csad-613-01-gaeta-fall-2025.pdf",
    "department": "health-human-services",
    "pages": 14,
    "fieldCount": 0,
    "missingLabelCount": 6,
    "hasSignatureField": false,
    "classification": "UNTAGGED",
    "recommendedAction": "recreate_accessible_pdf",
    "workItems": [
      "Recreate as a fillable, accessible PDF (or move to a web form)",
      "Fix the 6 DubBot findings"
    ],
    "rationale": "Untagged and 6 accessibility issues flagged; alt text written into it would be unreachable.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "untagged",
      "6 DubBot findings"
    ],
    "tagStatus": "UNTAGGED"
  },
  {
    "file": "packet-ms-counseling.pdf",
    "department": "academic-affairs",
    "pages": 11,
    "fieldCount": 0,
    "missingLabelCount": 6,
    "hasSignatureField": false,
    "classification": "UNTAGGED",
    "recommendedAction": "recreate_accessible_pdf",
    "workItems": [
      "Recreate as a fillable, accessible PDF (or move to a web form)",
      "Fix the 6 DubBot findings"
    ],
    "rationale": "Untagged and 6 accessibility issues flagged; alt text written into it would be unreachable.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "untagged",
      "6 DubBot findings"
    ],
    "tagStatus": "UNTAGGED"
  },
  {
    "file": "csad-ms-apip-policy.pdf",
    "department": "health-human-services",
    "pages": 1,
    "fieldCount": 0,
    "missingLabelCount": 1,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 1 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "1 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "thesis-bank-2017-cowgill.pdf",
    "department": "social-sciences-interdisciplinary-studies",
    "pages": 121,
    "fieldCount": 0,
    "missingLabelCount": 5,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 5 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "5 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "pfdg-report--ashtari-aug2020.pdf",
    "department": "academic-affairs",
    "pages": 2,
    "fieldCount": 0,
    "missingLabelCount": 4,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 4 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "4 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "worksheet-6-compositions-and-inverses.pdf",
    "department": "natural-sciences-mathematics",
    "pages": 2,
    "fieldCount": 0,
    "missingLabelCount": 5,
    "hasSignatureField": false,
    "classification": "UNTAGGED",
    "recommendedAction": "recreate_accessible_pdf",
    "workItems": [
      "Recreate as a fillable, accessible PDF (or move to a web form)",
      "Fix the 5 DubBot findings"
    ],
    "rationale": "Untagged and 5 accessibility issues flagged; alt text written into it would be unreachable.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "untagged",
      "5 DubBot findings"
    ],
    "tagStatus": "UNTAGGED"
  },
  {
    "file": "ibarra-m-s24-thesis.pdf",
    "department": "social-sciences-interdisciplinary-studies",
    "pages": 0,
    "fieldCount": 0,
    "missingLabelCount": 0,
    "hasSignatureField": false,
    "classification": "UNTAGGED",
    "recommendedAction": "migrate",
    "workItems": [
      "Publish equivalent as a web form",
      "Retire the PDF"
    ],
    "rationale": "Short untagged form; a modern web form is a cleaner replacement.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": true,
    "signals": [
      "migrate candidate"
    ],
    "tagStatus": "UNTAGGED"
  },
  {
    "file": "operating-fund-budget-allocation-summary-202526.pdf",
    "department": "academic-affairs",
    "pages": 1,
    "fieldCount": 0,
    "missingLabelCount": 2,
    "hasSignatureField": false,
    "classification": "UNTAGGED",
    "recommendedAction": "migrate",
    "workItems": [
      "Publish equivalent as a web form",
      "Retire the PDF"
    ],
    "rationale": "Short untagged form; a modern web form is a cleaner replacement.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": true,
    "signals": [
      "migrate candidate",
      "2 DubBot findings"
    ],
    "tagStatus": "UNTAGGED"
  },
  {
    "file": "1617-ba-ethnic-std-pckt-v3.pdf",
    "department": "academic-affairs",
    "pages": 41,
    "fieldCount": 0,
    "missingLabelCount": 5,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 5 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "5 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "thesis-bank-2015-blodgett.pdf",
    "department": "social-sciences-interdisciplinary-studies",
    "pages": 105,
    "fieldCount": 0,
    "missingLabelCount": 4,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 4 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "4 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "kins-concentrations.pdf",
    "department": "health-human-services",
    "pages": 1,
    "fieldCount": 0,
    "missingLabelCount": 1,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 1 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "1 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "ssaa_investment_policy.pdf",
    "department": "experience",
    "pages": 11,
    "fieldCount": 0,
    "missingLabelCount": 3,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 3 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "3 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "artp_chairsworkshop2024.pdf",
    "department": "arts-letters",
    "pages": 19,
    "fieldCount": 0,
    "missingLabelCount": 2,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 2 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "2 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "m30_13.pdf",
    "department": "natural-sciences-mathematics",
    "pages": 1,
    "fieldCount": 0,
    "missingLabelCount": 3,
    "hasSignatureField": false,
    "classification": "UNTAGGED",
    "recommendedAction": "recreate_accessible_pdf",
    "workItems": [
      "Recreate as a fillable, accessible PDF (or move to a web form)",
      "Fix the 3 DubBot findings"
    ],
    "rationale": "Untagged and 3 accessibility issues flagged; alt text written into it would be unreachable.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "untagged",
      "3 DubBot findings"
    ],
    "tagStatus": "UNTAGGED"
  },
  {
    "file": "lin_hao_bio.pdf",
    "department": "business-administration",
    "pages": 2,
    "fieldCount": 0,
    "missingLabelCount": 3,
    "hasSignatureField": false,
    "classification": "UNTAGGED",
    "recommendedAction": "recreate_accessible_pdf",
    "workItems": [
      "Recreate as a fillable, accessible PDF (or move to a web form)",
      "Fix the 3 DubBot findings"
    ],
    "rationale": "Untagged and 3 accessibility issues flagged; alt text written into it would be unreachable.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "untagged",
      "3 DubBot findings"
    ],
    "tagStatus": "UNTAGGED"
  },
  {
    "file": "california-state-university-sacramento_university-report_july-17-202315.pdf",
    "department": "title-ix",
    "pages": 61,
    "fieldCount": 0,
    "missingLabelCount": 2,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 2 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "2 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "pam-9-19-24.pdf",
    "department": "academic-affairs",
    "pages": 1,
    "fieldCount": 0,
    "missingLabelCount": 2,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 2 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "2 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "check-in-2---embedding-dei-into-the-position,-description-and-other-pre-posting-materials-.pdf",
    "department": "academic-affairs",
    "pages": 3,
    "fieldCount": 0,
    "missingLabelCount": 4,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 4 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "4 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "grs-2023-title-ix-training-materials1.pdf",
    "department": "title-ix",
    "pages": 28,
    "fieldCount": 0,
    "missingLabelCount": 4,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 4 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "4 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "25-26fs-46.pdf",
    "department": "academic-affairs",
    "pages": 7,
    "fieldCount": 0,
    "missingLabelCount": 5,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 5 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "5 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "wgs-50_-introduction-to-lgbtq-studies.pdf",
    "department": "academic-affairs",
    "pages": 6,
    "fieldCount": 0,
    "missingLabelCount": 2,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 2 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "2 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "ubac-meeting-minutes-5-24-2023-afternoon-final.pdf",
    "department": "administration-business-affairs",
    "pages": 2,
    "fieldCount": 0,
    "missingLabelCount": 1,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 1 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "1 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "faculty-office-hours-sp26.pdf",
    "department": "social-sciences-interdisciplinary-studies",
    "pages": 5,
    "fieldCount": 0,
    "missingLabelCount": 4,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 4 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "4 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "recordermay2024final.pdf",
    "department": "social-sciences-interdisciplinary-studies",
    "pages": 0,
    "fieldCount": 0,
    "missingLabelCount": 0,
    "hasSignatureField": false,
    "classification": "UNTAGGED",
    "recommendedAction": "migrate",
    "workItems": [
      "Publish equivalent as a web form",
      "Retire the PDF"
    ],
    "rationale": "Short untagged form; a modern web form is a cleaner replacement.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": true,
    "signals": [
      "migrate candidate"
    ],
    "tagStatus": "UNTAGGED"
  },
  {
    "file": "12-13-womens-studies-appendix-1.pdf",
    "department": "academic-affairs",
    "pages": 1,
    "fieldCount": 0,
    "missingLabelCount": 1,
    "hasSignatureField": false,
    "classification": "UNTAGGED",
    "recommendedAction": "migrate",
    "workItems": [
      "Publish equivalent as a web form",
      "Retire the PDF"
    ],
    "rationale": "Short untagged form; a modern web form is a cleaner replacement.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": true,
    "signals": [
      "migrate candidate",
      "1 DubBot findings"
    ],
    "tagStatus": "UNTAGGED"
  },
  {
    "file": "spring-2026-new-minor-advising-hours.pdf",
    "department": "social-sciences-interdisciplinary-studies",
    "pages": 1,
    "fieldCount": 0,
    "missingLabelCount": 3,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 3 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "3 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "pt-640_-physical-therapy-interventions-ii.pdf",
    "department": "academic-affairs",
    "pages": 5,
    "fieldCount": 0,
    "missingLabelCount": 2,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 2 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "2 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "m12pal_worksheet20.pdf",
    "department": "natural-sciences-mathematics",
    "pages": 1,
    "fieldCount": 0,
    "missingLabelCount": 2,
    "hasSignatureField": false,
    "classification": "UNTAGGED",
    "recommendedAction": "migrate",
    "workItems": [
      "Publish equivalent as a web form",
      "Retire the PDF"
    ],
    "rationale": "Short untagged form; a modern web form is a cleaner replacement.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": true,
    "signals": [
      "migrate candidate",
      "2 DubBot findings"
    ],
    "tagStatus": "UNTAGGED"
  },
  {
    "file": "184---problem-set-lecture-6-ch-18.pdf",
    "department": "natural-sciences-mathematics",
    "pages": 8,
    "fieldCount": 0,
    "missingLabelCount": 3,
    "hasSignatureField": false,
    "classification": "UNTAGGED",
    "recommendedAction": "recreate_accessible_pdf",
    "workItems": [
      "Recreate as a fillable, accessible PDF (or move to a web form)",
      "Fix the 3 DubBot findings"
    ],
    "rationale": "Untagged and 3 accessibility issues flagged; alt text written into it would be unreachable.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "untagged",
      "3 DubBot findings"
    ],
    "tagStatus": "UNTAGGED"
  },
  {
    "file": "CV.pdf",
    "department": "faculty",
    "pages": 20,
    "fieldCount": 0,
    "missingLabelCount": 3,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 3 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "3 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "ubac_meetingnotes_20200730.pdf",
    "department": "administration-business-affairs",
    "pages": 4,
    "fieldCount": 0,
    "missingLabelCount": 2,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 2 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "2 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "1617-govt-ma-assessment-plan.pdf",
    "department": "academic-affairs",
    "pages": 2,
    "fieldCount": 0,
    "missingLabelCount": 4,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 4 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "4 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "zoom-doc-podium-line-in.pdf",
    "department": "information-resources-technology",
    "pages": 1,
    "fieldCount": 0,
    "missingLabelCount": 2,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 2 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "2 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "2024-maryjane-rees-center-csad-ms-clinic-handbook.pdf",
    "department": "health-human-services",
    "pages": 116,
    "fieldCount": 0,
    "missingLabelCount": 7,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 7 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "7 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "covid-travel-checklist-domestic.pdf",
    "department": "administration-business-affairs",
    "pages": 1,
    "fieldCount": 0,
    "missingLabelCount": 2,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 2 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "2 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "2024.10.10.ufss.fundchanges.pdf",
    "department": "administration-business-affairs",
    "pages": 1,
    "fieldCount": 0,
    "missingLabelCount": 2,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 2 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "2 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "nsm-pdp-application-form.pdf",
    "department": "natural-sciences-mathematics",
    "pages": 2,
    "fieldCount": 0,
    "missingLabelCount": 2,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 2 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "2 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "opportunities_for_involvement.pdf",
    "department": "engineering-computer-science",
    "pages": 1,
    "fieldCount": 0,
    "missingLabelCount": 2,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 2 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "2 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "first-star-news-release.pdf",
    "department": "student-affairs",
    "pages": 2,
    "fieldCount": 0,
    "missingLabelCount": 3,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 3 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "3 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "23-24fs-107a.pdf",
    "department": "academic-affairs",
    "pages": 23,
    "fieldCount": 0,
    "missingLabelCount": 3,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 3 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "3 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "cs_numbers2015.pdf",
    "department": "academic-affairs",
    "pages": 5,
    "fieldCount": 0,
    "missingLabelCount": 2,
    "hasSignatureField": false,
    "classification": "UNTAGGED",
    "recommendedAction": "recreate_accessible_pdf",
    "workItems": [
      "Recreate as a fillable, accessible PDF"
    ],
    "rationale": "Untagged document; rebuild with structure so a screen reader can navigate it.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "untagged",
      "2 DubBot findings"
    ],
    "tagStatus": "UNTAGGED"
  },
  {
    "file": "mep-report-card-sp23newstudent-3-1.pdf",
    "department": "engineering-computer-science",
    "pages": 1,
    "fieldCount": 0,
    "missingLabelCount": 3,
    "hasSignatureField": false,
    "classification": "UNTAGGED",
    "recommendedAction": "recreate_accessible_pdf",
    "workItems": [
      "Recreate as a fillable, accessible PDF (or move to a web form)",
      "Fix the 3 DubBot findings"
    ],
    "rationale": "Untagged and 3 accessibility issues flagged; alt text written into it would be unreachable.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "untagged",
      "3 DubBot findings"
    ],
    "tagStatus": "UNTAGGED"
  },
  {
    "file": "mktg-140_-sports-marketing.pdf",
    "department": "academic-affairs",
    "pages": 21,
    "fieldCount": 0,
    "missingLabelCount": 3,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 3 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "3 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "ms-project-topic-form.pdf",
    "department": "engineering-computer-science",
    "pages": 2,
    "fieldCount": 0,
    "missingLabelCount": 3,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 3 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "3 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "th-114_-therapeutic-health-interventions-ii.pdf",
    "department": "academic-affairs",
    "pages": 21,
    "fieldCount": 0,
    "missingLabelCount": 3,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 3 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "3 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "xiong_yan_bio.pdf",
    "department": "business-administration",
    "pages": 2,
    "fieldCount": 0,
    "missingLabelCount": 3,
    "hasSignatureField": false,
    "classification": "UNTAGGED",
    "recommendedAction": "recreate_accessible_pdf",
    "workItems": [
      "Recreate as a fillable, accessible PDF (or move to a web form)",
      "Fix the 3 DubBot findings"
    ],
    "rationale": "Untagged and 3 accessibility issues flagged; alt text written into it would be unreachable.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "untagged",
      "3 DubBot findings"
    ],
    "tagStatus": "UNTAGGED"
  },
  {
    "file": "battery-management.pdf",
    "department": "faculty",
    "pages": 6,
    "fieldCount": 0,
    "missingLabelCount": 2,
    "hasSignatureField": false,
    "classification": "UNTAGGED",
    "recommendedAction": "recreate_accessible_pdf",
    "workItems": [
      "Recreate as a fillable, accessible PDF"
    ],
    "rationale": "Untagged document; rebuild with structure so a screen reader can navigate it.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "untagged",
      "2 DubBot findings"
    ],
    "tagStatus": "UNTAGGED"
  },
  {
    "file": "nsm-12a-syllabus-chem-4-fall-20.pdf",
    "department": "natural-sciences-mathematics",
    "pages": 2,
    "fieldCount": 0,
    "missingLabelCount": 3,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 3 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "3 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "arch-136a_-advanced-building-information-modeling-for-architecture.pdf",
    "department": "academic-affairs",
    "pages": 4,
    "fieldCount": 0,
    "missingLabelCount": 2,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 2 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "2 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "kneitel-cv_aug-2025.pdf",
    "department": "faculty",
    "pages": 17,
    "fieldCount": 0,
    "missingLabelCount": 4,
    "hasSignatureField": false,
    "classification": "UNTAGGED",
    "recommendedAction": "recreate_accessible_pdf",
    "workItems": [
      "Recreate as a fillable, accessible PDF (or move to a web form)",
      "Fix the 4 DubBot findings"
    ],
    "rationale": "Untagged and 4 accessibility issues flagged; alt text written into it would be unreachable.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "untagged",
      "4 DubBot findings"
    ],
    "tagStatus": "UNTAGGED"
  },
  {
    "file": "d-dc-4-9-26-scrp.pdf",
    "department": "academic-affairs",
    "pages": 2,
    "fieldCount": 0,
    "missingLabelCount": 3,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 3 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "3 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "factbook26_finalweb.pdf",
    "department": "experience",
    "pages": 25,
    "fieldCount": 0,
    "missingLabelCount": 6,
    "hasSignatureField": false,
    "classification": "UNTAGGED",
    "recommendedAction": "recreate_accessible_pdf",
    "workItems": [
      "Recreate as a fillable, accessible PDF (or move to a web form)",
      "Fix the 6 DubBot findings"
    ],
    "rationale": "Untagged and 6 accessibility issues flagged; alt text written into it would be unreachable.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "untagged",
      "6 DubBot findings"
    ],
    "tagStatus": "UNTAGGED"
  },
  {
    "file": "march20minutes.pdf",
    "department": "social-sciences-interdisciplinary-studies",
    "pages": 4,
    "fieldCount": 0,
    "missingLabelCount": 2,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 2 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "2 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "24-25ex-106.pdf",
    "department": "academic-affairs",
    "pages": 15,
    "fieldCount": 0,
    "missingLabelCount": 5,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 5 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "5 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "sociology-graduate-assessment.pdf",
    "department": "academic-affairs",
    "pages": 11,
    "fieldCount": 0,
    "missingLabelCount": 4,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 4 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "4 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "in_celebrating_king_we_must_overcome_divisive__sacramento_bee_the_ca___january_16_2017__p5b.pdf",
    "department": "faculty",
    "pages": 2,
    "fieldCount": 0,
    "missingLabelCount": 3,
    "hasSignatureField": false,
    "classification": "UNTAGGED",
    "recommendedAction": "recreate_accessible_pdf",
    "workItems": [
      "Recreate as a fillable, accessible PDF (or move to a web form)",
      "Fix the 3 DubBot findings"
    ],
    "rationale": "Untagged and 3 accessibility issues flagged; alt text written into it would be unreachable.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "untagged",
      "3 DubBot findings"
    ],
    "tagStatus": "UNTAGGED"
  },
  {
    "file": "getting-the-most-out-of-a-career-fair_digital.pdf",
    "department": "engineering-computer-science",
    "pages": 2,
    "fieldCount": 0,
    "missingLabelCount": 2,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 2 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "2 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "youngscholarsforum.pdf",
    "department": "faculty",
    "pages": 0,
    "fieldCount": 0,
    "missingLabelCount": 0,
    "hasSignatureField": false,
    "classification": "UNTAGGED",
    "recommendedAction": "migrate",
    "workItems": [
      "Publish equivalent as a web form",
      "Retire the PDF"
    ],
    "rationale": "Short untagged form; a modern web form is a cleaner replacement.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": true,
    "signals": [
      "migrate candidate"
    ],
    "tagStatus": "UNTAGGED"
  },
  {
    "file": "hardcopy_req20161.pdf",
    "department": "administration-business-affairs",
    "pages": 1,
    "fieldCount": 0,
    "missingLabelCount": 4,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 4 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "4 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "ssaa-hornet-alumni-champions-flyer-rev120221.pdf",
    "department": "experience",
    "pages": 1,
    "fieldCount": 0,
    "missingLabelCount": 2,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 2 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "2 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "fee-waiver-costs.pdf",
    "department": "people-climate",
    "pages": 2,
    "fieldCount": 0,
    "missingLabelCount": 3,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 3 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "3 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "9-16-2025_esc-agenda.pdf",
    "department": "people-climate",
    "pages": 1,
    "fieldCount": 0,
    "missingLabelCount": 1,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 1 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "1 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "s2e25_matching-diversity-of-educated-to-educators_mai_lam_building-justice-podcast-transcript1.pdf",
    "department": "race-immigration-social-justice",
    "pages": 9,
    "fieldCount": 0,
    "missingLabelCount": 3,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 3 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "3 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "1617-bs-enviro-std-pckt.pdf",
    "department": "academic-affairs",
    "pages": 41,
    "fieldCount": 0,
    "missingLabelCount": 5,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 5 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "5 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "soc135syllabus-2020.pdf",
    "department": "faculty",
    "pages": 7,
    "fieldCount": 0,
    "missingLabelCount": 2,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 2 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "2 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "sac-state-campus-sustainability-report-2012---2014.pdf",
    "department": "experience",
    "pages": 25,
    "fieldCount": 0,
    "missingLabelCount": 5,
    "hasSignatureField": false,
    "classification": "UNTAGGED",
    "recommendedAction": "recreate_accessible_pdf",
    "workItems": [
      "Recreate as a fillable, accessible PDF (or move to a web form)",
      "Fix the 5 DubBot findings"
    ],
    "rationale": "Untagged and 5 accessibility issues flagged; alt text written into it would be unreachable.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "untagged",
      "5 DubBot findings"
    ],
    "tagStatus": "UNTAGGED"
  },
  {
    "file": "ssaa-policy-conflict-of-interest.pdf",
    "department": "experience",
    "pages": 1,
    "fieldCount": 0,
    "missingLabelCount": 1,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 1 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "1 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "departmental-permit-purchase-form-july,-2020.pdf",
    "department": "administration-business-affairs",
    "pages": 1,
    "fieldCount": 0,
    "missingLabelCount": 2,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 2 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "2 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "chad-sc-factsheet24.pdf",
    "department": "education",
    "pages": 2,
    "fieldCount": 0,
    "missingLabelCount": 1,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 1 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "1 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "csad-223-all-sections-roseberry-fall-2025.pdf",
    "department": "health-human-services",
    "pages": 13,
    "fieldCount": 0,
    "missingLabelCount": 5,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 5 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "5 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "geol-100_-earth-materials-rocks-and-minerals.pdf",
    "department": "academic-affairs",
    "pages": 5,
    "fieldCount": 0,
    "missingLabelCount": 2,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 2 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "2 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "2013-2014-geography-undergrad-rpt.pdf",
    "department": "academic-affairs",
    "pages": 18,
    "fieldCount": 0,
    "missingLabelCount": 4,
    "hasSignatureField": false,
    "classification": "UNTAGGED",
    "recommendedAction": "recreate_accessible_pdf",
    "workItems": [
      "Recreate as a fillable, accessible PDF (or move to a web form)",
      "Fix the 4 DubBot findings"
    ],
    "rationale": "Untagged and 4 accessibility issues flagged; alt text written into it would be unreachable.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "untagged",
      "4 DubBot findings"
    ],
    "tagStatus": "UNTAGGED"
  },
  {
    "file": "acip-m.pdf",
    "department": "academic-affairs",
    "pages": 1,
    "fieldCount": 0,
    "missingLabelCount": 2,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 2 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "2 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "span-minor_roadmap_option-1_-span-47_fall-2023.pdf",
    "department": "arts-letters",
    "pages": 1,
    "fieldCount": 0,
    "missingLabelCount": 0,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "no_action_needed",
    "workItems": [
      "Periodic spot-check only"
    ],
    "rationale": "Tagged and clean per DubBot; periodic spot-check only.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [],
    "tagStatus": "TAGGED"
  },
  {
    "file": "agendasept22.pdf",
    "department": "social-sciences-interdisciplinary-studies",
    "pages": 5,
    "fieldCount": 0,
    "missingLabelCount": 3,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 3 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "3 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "25-26ex-106.pdf",
    "department": "academic-affairs",
    "pages": 14,
    "fieldCount": 0,
    "missingLabelCount": 4,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 4 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "4 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "pal-worksheet-9-supernodes-supermeshes-and-source-transformations.pdf",
    "department": "engineering-computer-science",
    "pages": 0,
    "fieldCount": 0,
    "missingLabelCount": 0,
    "hasSignatureField": false,
    "classification": "UNTAGGED",
    "recommendedAction": "migrate",
    "workItems": [
      "Publish equivalent as a web form",
      "Retire the PDF"
    ],
    "rationale": "Short untagged form; a modern web form is a cleaner replacement.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": true,
    "signals": [
      "migrate candidate"
    ],
    "tagStatus": "UNTAGGED"
  },
  {
    "file": "299_199_special-problems-petition.pdf",
    "department": "engineering-computer-science",
    "pages": 2,
    "fieldCount": 0,
    "missingLabelCount": 3,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 3 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "3 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "folsom-blvd-project-ceqa.pdf",
    "department": "administration-business-affairs",
    "pages": 1,
    "fieldCount": 0,
    "missingLabelCount": 4,
    "hasSignatureField": false,
    "classification": "UNTAGGED",
    "recommendedAction": "recreate_accessible_pdf",
    "workItems": [
      "Recreate as a fillable, accessible PDF (or move to a web form)",
      "Fix the 4 DubBot findings"
    ],
    "rationale": "Untagged and 4 accessibility issues flagged; alt text written into it would be unreachable.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "untagged",
      "4 DubBot findings"
    ],
    "tagStatus": "UNTAGGED"
  },
  {
    "file": "maximize-financial-aid.pdf",
    "department": "education",
    "pages": 1,
    "fieldCount": 0,
    "missingLabelCount": 1,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 1 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "1 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "psyc-183_-teaching-of-psychology.pdf",
    "department": "academic-affairs",
    "pages": 3,
    "fieldCount": 0,
    "missingLabelCount": 1,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 1 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "1 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "Body%20and%20Eating.pdf",
    "department": "faculty",
    "pages": 6,
    "fieldCount": 0,
    "missingLabelCount": 5,
    "hasSignatureField": false,
    "classification": "UNTAGGED",
    "recommendedAction": "recreate_accessible_pdf",
    "workItems": [
      "Recreate as a fillable, accessible PDF (or move to a web form)",
      "Fix the 5 DubBot findings"
    ],
    "rationale": "Untagged and 5 accessibility issues flagged; alt text written into it would be unreachable.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "untagged",
      "5 DubBot findings"
    ],
    "tagStatus": "UNTAGGED"
  },
  {
    "file": "engr-110-pal-ws12-oscillations-last-one.pdf",
    "department": "engineering-computer-science",
    "pages": 0,
    "fieldCount": 0,
    "missingLabelCount": 0,
    "hasSignatureField": false,
    "classification": "UNTAGGED",
    "recommendedAction": "migrate",
    "workItems": [
      "Publish equivalent as a web form",
      "Retire the PDF"
    ],
    "rationale": "Short untagged form; a modern web form is a cleaner replacement.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": true,
    "signals": [
      "migrate candidate"
    ],
    "tagStatus": "UNTAGGED"
  },
  {
    "file": "Apples%20and%20Diet.pdf",
    "department": "faculty",
    "pages": 10,
    "fieldCount": 0,
    "missingLabelCount": 7,
    "hasSignatureField": false,
    "classification": "UNTAGGED",
    "recommendedAction": "recreate_accessible_pdf",
    "workItems": [
      "Recreate as a fillable, accessible PDF (or move to a web form)",
      "Fix the 7 DubBot findings"
    ],
    "rationale": "Untagged and 7 accessibility issues flagged; alt text written into it would be unreachable.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "untagged",
      "7 DubBot findings"
    ],
    "tagStatus": "UNTAGGED"
  },
  {
    "file": "23-24ex-04a.pdf",
    "department": "academic-affairs",
    "pages": 2,
    "fieldCount": 0,
    "missingLabelCount": 2,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 2 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "2 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "m31_26.pdf",
    "department": "natural-sciences-mathematics",
    "pages": 1,
    "fieldCount": 0,
    "missingLabelCount": 3,
    "hasSignatureField": false,
    "classification": "UNTAGGED",
    "recommendedAction": "recreate_accessible_pdf",
    "workItems": [
      "Recreate as a fillable, accessible PDF (or move to a web form)",
      "Fix the 3 DubBot findings"
    ],
    "rationale": "Untagged and 3 accessibility issues flagged; alt text written into it would be unreachable.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "untagged",
      "3 DubBot findings"
    ],
    "tagStatus": "UNTAGGED"
  },
  {
    "file": "2026-cobra-rates.pdf",
    "department": "people-climate",
    "pages": 2,
    "fieldCount": 0,
    "missingLabelCount": 3,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 3 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "3 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "25-26-dfal-call.pdf",
    "department": "academic-affairs",
    "pages": 0,
    "fieldCount": 0,
    "missingLabelCount": 0,
    "hasSignatureField": false,
    "classification": "UNTAGGED",
    "recommendedAction": "migrate",
    "workItems": [
      "Publish equivalent as a web form",
      "Retire the PDF"
    ],
    "rationale": "Short untagged form; a modern web form is a cleaner replacement.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": true,
    "signals": [
      "migrate candidate"
    ],
    "tagStatus": "UNTAGGED"
  },
  {
    "file": "process-to-obtain-provost-office-signature-7.22.22.pdf",
    "department": "academic-affairs",
    "pages": 1,
    "fieldCount": 0,
    "missingLabelCount": 1,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 1 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "1 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "ETHN_114_Spr_2017.pdf",
    "department": "faculty",
    "pages": 10,
    "fieldCount": 0,
    "missingLabelCount": 5,
    "hasSignatureField": false,
    "classification": "UNTAGGED",
    "recommendedAction": "recreate_accessible_pdf",
    "workItems": [
      "Recreate as a fillable, accessible PDF (or move to a web form)",
      "Fix the 5 DubBot findings"
    ],
    "rationale": "Untagged and 5 accessibility issues flagged; alt text written into it would be unreachable.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "untagged",
      "5 DubBot findings"
    ],
    "tagStatus": "UNTAGGED"
  },
  {
    "file": "04.as.pdf",
    "department": "administration-business-affairs",
    "pages": 10,
    "fieldCount": 0,
    "missingLabelCount": 3,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 3 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "3 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "connor-leahy-thesis.pdf",
    "department": "social-sciences-interdisciplinary-studies",
    "pages": 0,
    "fieldCount": 0,
    "missingLabelCount": 0,
    "hasSignatureField": false,
    "classification": "UNTAGGED",
    "recommendedAction": "migrate",
    "workItems": [
      "Publish equivalent as a web form",
      "Retire the PDF"
    ],
    "rationale": "Short untagged form; a modern web form is a cleaner replacement.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": true,
    "signals": [
      "migrate candidate"
    ],
    "tagStatus": "UNTAGGED"
  },
  {
    "file": "15-16-bs-physics-pkt-final.pdf",
    "department": "academic-affairs",
    "pages": 23,
    "fieldCount": 0,
    "missingLabelCount": 5,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 5 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "5 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "handbook.engl-ma.2025-2026.pdf",
    "department": "arts-letters",
    "pages": 46,
    "fieldCount": 0,
    "missingLabelCount": 4,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 4 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "4 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "24-25exa-03-11-25-f.pdf",
    "department": "academic-affairs",
    "pages": 2,
    "fieldCount": 0,
    "missingLabelCount": 4,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 4 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "4 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "thesis-bank-2012-brooks.pdf",
    "department": "social-sciences-interdisciplinary-studies",
    "pages": 0,
    "fieldCount": 0,
    "missingLabelCount": 0,
    "hasSignatureField": false,
    "classification": "UNTAGGED",
    "recommendedAction": "migrate",
    "workItems": [
      "Publish equivalent as a web form",
      "Retire the PDF"
    ],
    "rationale": "Short untagged form; a modern web form is a cleaner replacement.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": true,
    "signals": [
      "migrate candidate"
    ],
    "tagStatus": "UNTAGGED"
  },
  {
    "file": "bs-in-fashion-merchandising-and-management.pdf",
    "department": "academic-affairs",
    "pages": 6,
    "fieldCount": 0,
    "missingLabelCount": 3,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 3 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "3 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "ssaa-brand-book.pdf",
    "department": "experience",
    "pages": 40,
    "fieldCount": 0,
    "missingLabelCount": 4,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 4 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "4 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "pasc-end-of-program.administrative-credential-application.pdf",
    "department": "education",
    "pages": 1,
    "fieldCount": 0,
    "missingLabelCount": 2,
    "hasSignatureField": false,
    "classification": "UNTAGGED",
    "recommendedAction": "migrate",
    "workItems": [
      "Publish equivalent as a web form",
      "Retire the PDF"
    ],
    "rationale": "Short untagged form; a modern web form is a cleaner replacement.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": true,
    "signals": [
      "migrate candidate",
      "2 DubBot findings"
    ],
    "tagStatus": "UNTAGGED"
  },
  {
    "file": "bio-oh-s25.pdf",
    "department": "natural-sciences-mathematics",
    "pages": 0,
    "fieldCount": 0,
    "missingLabelCount": 0,
    "hasSignatureField": false,
    "classification": "UNTAGGED",
    "recommendedAction": "migrate",
    "workItems": [
      "Publish equivalent as a web form",
      "Retire the PDF"
    ],
    "rationale": "Short untagged form; a modern web form is a cleaner replacement.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": true,
    "signals": [
      "migrate candidate"
    ],
    "tagStatus": "UNTAGGED"
  },
  {
    "file": "1617-ba-wl-spanish-pckt.pdf",
    "department": "academic-affairs",
    "pages": 41,
    "fieldCount": 0,
    "missingLabelCount": 5,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 5 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "5 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "cob-s-24-25.pdf",
    "department": "academic-affairs",
    "pages": 1,
    "fieldCount": 0,
    "missingLabelCount": 2,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 2 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "2 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "sabati_cv_vs.2021.09-cv.pdf",
    "department": "faculty",
    "pages": 2,
    "fieldCount": 0,
    "missingLabelCount": 4,
    "hasSignatureField": false,
    "classification": "UNTAGGED",
    "recommendedAction": "recreate_accessible_pdf",
    "workItems": [
      "Recreate as a fillable, accessible PDF (or move to a web form)",
      "Fix the 4 DubBot findings"
    ],
    "rationale": "Untagged and 4 accessibility issues flagged; alt text written into it would be unreachable.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "untagged",
      "4 DubBot findings"
    ],
    "tagStatus": "UNTAGGED"
  },
  {
    "file": "phys-290_-graduate-colloquium.pdf",
    "department": "academic-affairs",
    "pages": 22,
    "fieldCount": 0,
    "missingLabelCount": 3,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 3 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "3 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "lege-s26.pdf",
    "department": "natural-sciences-mathematics",
    "pages": 1,
    "fieldCount": 0,
    "missingLabelCount": 3,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 3 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "3 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "15-16-bs-bus-admin-pkt-final.pdf",
    "department": "academic-affairs",
    "pages": 23,
    "fieldCount": 0,
    "missingLabelCount": 5,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 5 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "5 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "pal-research-concept-map.pdf",
    "department": "natural-sciences-mathematics",
    "pages": 1,
    "fieldCount": 0,
    "missingLabelCount": 2,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 2 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "2 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "sustainability-policy-2022.pdf",
    "department": "experience",
    "pages": 7,
    "fieldCount": 0,
    "missingLabelCount": 4,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 4 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "4 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "thesis-bank-2019-costa.pdf",
    "department": "social-sciences-interdisciplinary-studies",
    "pages": 89,
    "fieldCount": 0,
    "missingLabelCount": 4,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 4 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "4 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "24-25fs-03-13.pdf",
    "department": "academic-affairs",
    "pages": 2,
    "fieldCount": 0,
    "missingLabelCount": 1,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 1 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "1 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "budget-process1.pdf",
    "department": "administration-business-affairs",
    "pages": 1,
    "fieldCount": 0,
    "missingLabelCount": 2,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 2 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "2 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "graduateassistanttimebasechange.pdf",
    "department": "graduate-studies",
    "pages": 0,
    "fieldCount": 0,
    "missingLabelCount": 0,
    "hasSignatureField": false,
    "classification": "UNTAGGED",
    "recommendedAction": "migrate",
    "workItems": [
      "Publish equivalent as a web form",
      "Retire the PDF"
    ],
    "rationale": "Short untagged form; a modern web form is a cleaner replacement.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": true,
    "signals": [
      "migrate candidate"
    ],
    "tagStatus": "UNTAGGED"
  },
  {
    "file": "1617-ba-woms.pdf",
    "department": "academic-affairs",
    "pages": 19,
    "fieldCount": 0,
    "missingLabelCount": 4,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "remediate_in_place",
    "workItems": [
      "Auto-generate alt text for missing figures",
      "Confirm structure order"
    ],
    "rationale": "Tagged PDF with 4 DubBot finding(s); fixable with AI-assisted review.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "4 DubBot findings"
    ],
    "tagStatus": "TAGGED"
  },
  {
    "file": "1718-2nd-bs-comm-sci-and-disorders---full.pdf",
    "department": "academic-affairs",
    "pages": 186,
    "fieldCount": 0,
    "missingLabelCount": 7,
    "hasSignatureField": false,
    "classification": "UNTAGGED",
    "recommendedAction": "recreate_accessible_pdf",
    "workItems": [
      "Recreate as a fillable, accessible PDF (or move to a web form)",
      "Fix the 7 DubBot findings"
    ],
    "rationale": "Untagged and 7 accessibility issues flagged; alt text written into it would be unreachable.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "untagged",
      "7 DubBot findings"
    ],
    "tagStatus": "UNTAGGED"
  },
  {
    "file": "cares_wasc_one-pager-survey-data.pdf",
    "department": "academic-affairs",
    "pages": 0,
    "fieldCount": 0,
    "missingLabelCount": 0,
    "hasSignatureField": false,
    "classification": "UNTAGGED",
    "recommendedAction": "migrate",
    "workItems": [
      "Publish equivalent as a web form",
      "Retire the PDF"
    ],
    "rationale": "Short untagged form; a modern web form is a cleaner replacement.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": true,
    "signals": [
      "migrate candidate"
    ],
    "tagStatus": "UNTAGGED"
  },
  {
    "file": "april20recorder-1_compressed-1.pdf",
    "department": "faculty",
    "pages": 6,
    "fieldCount": 0,
    "missingLabelCount": 5,
    "hasSignatureField": false,
    "classification": "UNTAGGED",
    "recommendedAction": "recreate_accessible_pdf",
    "workItems": [
      "Recreate as a fillable, accessible PDF (or move to a web form)",
      "Fix the 5 DubBot findings"
    ],
    "rationale": "Untagged and 5 accessibility issues flagged; alt text written into it would be unreachable.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [
      "untagged",
      "5 DubBot findings"
    ],
    "tagStatus": "UNTAGGED"
  },
  {
    "file": "dptadmissionoutreachflyer2026revised.pdf",
    "department": "health-human-services",
    "pages": 1,
    "fieldCount": 0,
    "missingLabelCount": 0,
    "hasSignatureField": false,
    "classification": "TAGGED",
    "recommendedAction": "no_action_needed",
    "workItems": [
      "Periodic spot-check only"
    ],
    "rationale": "Tagged and clean per DubBot; periodic spot-check only.",
    "platforms": [],
    "platformCaveats": [],
    "platformMigrationRequired": false,
    "signals": [],
    "tagStatus": "TAGGED"
  }
]
