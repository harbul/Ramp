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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/college/arts-letters/english/_internal/adv-worksheet-minor-in-english-2024.06.12.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/college/health-human-services/student-success/_internal/_documents/kins-pe-teacher-education.pdf"
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
    "tagStatus": "UNTAGGED",
    "sourceUrl": "https://www.csus.edu/college/social-sciences-interdisciplinary-studies/public-policy-administration/_internal/_documents/thesis-bank/thesis-bank-2018-stumpf.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/college/natural-sciences-mathematics/center-science-math-success/_internal/_images/copy-of-week-4-problem-set-1.pdf"
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
    "tagStatus": "UNTAGGED",
    "sourceUrl": "https://www.csus.edu/academic-affairs/graduate-excellence-engagement-program/spotlights/probation-awardees/ellison_report.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/college/natural-sciences-mathematics/physics-astronomy/meet-us/_internal/schedules/ray-s26.pdf"
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
    "tagStatus": "UNTAGGED",
    "sourceUrl": "https://www.csus.edu/academic-affairs/program-assessment/archive/_internal/_documents/1516%20Report%20PDFs%20by%20clge/al/15-16-ba-history.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/college/education/masters-programs/specialties-concentrations/counselor-education/assets/documents/fieldwork-handbook_edc_20251.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/academic-affairs/course-program-proposals/_internal/_documents/_2024-2025/list-5/courses/phys-252_-nuclear-and-particle-physics.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/college/natural-sciences-mathematics/physics-astronomy/_internal/docs/colloquium_flyers/12.04.25.sr.proj.alejandro.wallace.pdf"
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
    "tagStatus": "UNTAGGED",
    "sourceUrl": "https://www.csus.edu/title-ix/_internal/_documents/david-turner-training-2020-2023.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/academic-affairs/course-program-proposals/_internal/_documents/_2024-2025/list-4/courses/nurs-219_-healthcare-policy-and-advocacy.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/academic-affairs/course-program-proposals/_internal/_documents/_2025-2026/list-6/courses/psyc-104_-learning-theories.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/academic-affairs/senate/senate-info/24-25senate/24-25fs-am/05-08-25/bes-erg.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/college/health-human-services/communication-sciences-disorders/_internal/_documents/accredediation/csad-org-chart-2024-2025.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/academic-affairs/course-program-proposals/_internal/_documents/_2025-2026/list-2/courses/th-111_-science-of-disability.pdf"
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
    "tagStatus": "UNTAGGED",
    "sourceUrl": "https://www.csus.edu/academic-affairs/program-assessment/archive/_internal/_documents/1516%20Report%20PDFs%20by%20clge/nsm/15-16-bsba-chem.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/center/community-engagement-center/spotlights/_internal/_documents/community-engagement-showcase-poster-fulton.pdf"
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
    "tagStatus": "UNTAGGED",
    "sourceUrl": "https://www.csus.edu/academic-affairs/program-assessment/archive/_internal/_documents/1718%20Report%20PDFs%20by%20clge/ssis/1718-ba-ethnic-std---full.pdf"
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
    "tagStatus": "UNTAGGED",
    "sourceUrl": "https://www.csus.edu/academic-affairs/program-assessment/archive/_internal/_documents/1819-report-pdfs-by-clge/hhs/1819-ba-soc-wrk-full.pdf"
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
    "tagStatus": "UNTAGGED",
    "sourceUrl": "https://www.csus.edu/college/social-sciences-interdisciplinary-studies/public-policy-administration/_internal/_documents/thesis-bank/thesis-bank-2010-propheter.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/academic-affairs/course-program-proposals/_internal/_documents/_2023-2024/list-3/courses/honr-199_-independent-study.pdf"
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
    "tagStatus": "UNTAGGED",
    "sourceUrl": "https://www.csus.edu/college/natural-sciences-mathematics/center-science-math-success/_internal/_images/pal-worksheets/pal/worksheets/math-32/m32_9.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/people-climate/risk-management-services/_internal/_documents/executive-safety-committee/agenda/10.27.20_agenda.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/academic-affairs/senate/senate-info/fs-standing-rules-f.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/college/health-human-services/communication-sciences-disorders/_internal/_documents/course-syllabi/2248-syllabi-2024-fall/csad-295p-01-fall-2024.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/college/social-sciences-interdisciplinary-studies/renaissance-society/_internal/_documents/join-meet-android.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/academic-affairs/senate/executive-committee/24-25ex-cmte/24-25ex-a-m/01-28-25/24-25ex-115.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/academic-affairs/course-program-proposals/_internal/_documents/_2023-2024/list-2/programs/subject-matter-program_german.pdf"
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
    "tagStatus": "UNTAGGED",
    "sourceUrl": "https://www.csus.edu/administration-business-affairs/internal/_internal/_documents/travel-advance-authorization-0812.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/center/race-immigration-social-justice/_internal/_documents/annual-report-2019-2020.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/academic-affairs/senate/senate-info/23-24senate/23-24-action-items/23-24-osa-f.pdf"
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
    "tagStatus": "UNTAGGED",
    "sourceUrl": "https://www.csus.edu/academic-affairs/center-teaching-learning/_internal/_documents/using-the-zoom-chat.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/college/health-human-services/_internal/_documents/hhs_secondary-rtp-2004.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/center/african-peace-conflict-resolution/_internal/_documents/apf-curriculum-demo-program-for-may-25-26-2021.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/academic-affairs/program-assessment/archive/_internal/_documents/1617%20Fdbk/nsm/1617-ms-geol-pckt.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/college/health-human-services/communication-sciences-disorders/_internal/_documents/speech-language-clinic/maryjane-rees-center-speech-lancguage-clinic-required-documentation.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/academic-affairs/course-program-proposals/_internal/_documents/_2024-2025/list-2/courses/pubh-120_-social-marketing-in-health-promotion.pdf"
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
    "tagStatus": "UNTAGGED",
    "sourceUrl": "https://www.csus.edu/faculty/m/fred.molitor/docs/PE%20and%20Preterm%20Birth.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/academic-affairs/senate/executive-committee/25-26ex-cmte/25-26ex-a-m/04-14-26/25-26ex-121.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/academic-affairs/senate/senate-info/24-25senate/24-25fs-am/02-20-25/24-25fs-130.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/people-climate/human-resources/class-compensation/_internal/_documents/stipends-service-levels.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/college/engineering-computer-science/electrical-engineering/_internal/_documents/graduate-forms/eee-graduate-advising-form.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/president/inclusive-excellence/accessible-practices/_internal/_documents/template_-inclusive-mtg-practices-slide.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/academic-affairs/senate/senate-info/24-25senate/24-25fs-am/05-15-25/24-25fs-210.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/faculty/w/sac65434/_internal/_images/Wassmer%20on%20Rent%20Control.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/academic-affairs/course-program-proposals/_internal/_documents/_2025-2026/list-2/programs/ba-in-art.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/academic-affairs/course-program-proposals/_internal/_documents/_2023-2024/list-3/courses/wgs-180_-seminar-in-feminist-theory.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/academic-affairs/program-assessment/archive/_internal/_documents/1415%20Report%20PDFs%20by%20clge/nsm/14-15-chemistry-assessment.pdf"
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
    "tagStatus": "UNTAGGED",
    "sourceUrl": "https://www.csus.edu/information-resources-technology/institutional-research/surveys/bcsse19-nsse20-combined-report-sacramento-state.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/faculty/d/degraff/cv-1-2023.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/college/education/teaching-credentials/_internal/_documents/summer_session_reg_form-2026.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/academic-affairs/senate/senate-info/24-25senate/24-25fs-am/05-08-25/24-25fsa-05-08-f.pdf"
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
    "tagStatus": "UNTAGGED",
    "sourceUrl": "https://www.csus.edu/college/arts-letters/music/_internal/_documents/programs/11.15.25-smith.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/college/health-human-services/student-success/_internal/_documents/kins-athletic-administration.pdf"
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
    "tagStatus": "UNTAGGED",
    "sourceUrl": "https://www.csus.edu/campus-safety/environmental-health-safety/_internal/_documents/chemical-procurement-information.pdf"
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
    "tagStatus": "UNTAGGED",
    "sourceUrl": "https://www.csus.edu/information-resources-technology/onbase/_internal/_documents/quality-control.pdf"
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
    "tagStatus": "UNTAGGED",
    "sourceUrl": "https://www.csus.edu/administration-business-affairs/budget-planning/_internal/_documents/ubac-meeting-notes04-30-2021_11am.pdf"
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
    "tagStatus": "UNTAGGED",
    "sourceUrl": "https://www.csus.edu/college/natural-sciences-mathematics/biology/stem-cell-program-student-work/_internal/_documents/2023/alexis-arellano_spring-2023.pdf"
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
    "tagStatus": "UNTAGGED",
    "sourceUrl": "https://www.csus.edu/administration-business-affairs/bursar/_internal/_documents/archives/due-dates/financial-deadlines-spring_2026.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/experience/innovation-creativity/oried/research-proposal-development/_internal/_documents/2025-mri-guidelines-final.pdf"
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
    "tagStatus": "UNTAGGED",
    "sourceUrl": "https://www.csus.edu/people-climate/human-resources/employment-services/_internal/_documents/hiring-manager-forms/tae-faq.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/faculty/x/m.xiong/y-hope-brief.pdf"
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
    "tagStatus": "UNTAGGED",
    "sourceUrl": "https://www.csus.edu/academic-affairs/senate/executive-committee/23-24ex-cmte/23-24ex-a-m/10-24-23/23-24ex-36.pdf"
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
    "tagStatus": "UNTAGGED",
    "sourceUrl": "https://www.csus.edu/college/natural-sciences-mathematics/center-science-math-success/_internal/_images/pal-worksheets/pal/worksheets/Bio%20121%20Fall-14/Bio%20121%20fall%2017/intro-to-molecular-cell-bio1.pdf"
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
    "tagStatus": "UNTAGGED",
    "sourceUrl": "https://www.csus.edu/faculty/f/tfong/aanapisi_week_highlights_federal_grant_for_low-__sacramento_bee_the_ca___september_28_2019__p3a-1.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/academic-affairs/course-program-proposals/_internal/_documents/_2023-2024/list-2/courses/intd-30_-beginning-autocad-and-sketchup.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/college/health-human-services/communication-sciences-disorders/meet-us/_internal/faculty-cv/dangelo-cv-fall-2024.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/apply/financial-aid-scholarships/_internal/_documents/award-notice-guide-24-251.pdf"
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
    "tagStatus": "UNTAGGED",
    "sourceUrl": "https://www.csus.edu/center/african-peace-conflict-resolution/_internal/_documents/capcrboardapplication.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/academic-affairs/program-assessment/archive/_internal/_documents/1516%20Fdbk/ssis/15-16-ba-anth-pkt-final.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/administration-business-affairs/internal/concur-travel/_internal/_documents/how-to-access-concur-reporting1.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/college/education/teaching-credentials/_internal/_documents/mat_maset_credential_application_instructions_2025.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/academic-affairs/center-teaching-learning/_internal/_documents/summer-online-grant-2025-flyerv2-1.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/center/community-engagement-center/_internal/_documents/student-service-learning-faq.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/college/natural-sciences-mathematics/mathematics-statistics/_internal/docs/careers/occupation-report-for-statisticians.pdf"
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
    "tagStatus": "UNTAGGED",
    "sourceUrl": "https://www.csus.edu/faculty/s/sobredo/ETHN%20119%20Filipino%20Americans/Little%20Manila_321_E_Main_St_MAP.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/academic-affairs/senate/executive-committee/23-24ex-cmte/23-24ex-a-m/09-19-23/23-24exm9-19-f.pdf"
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
    "tagStatus": "UNTAGGED",
    "sourceUrl": "https://www.csus.edu/academic-affairs/program-assessment/archive/_internal/_documents/1516%20Report%20PDFs%20by%20clge/hhs/15-16-bs-cce-cj.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/academic-affairs/course-program-proposals/_internal/_documents/_2025-2026/list-1/courses/phys-235_-advanced-electromagnetism.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/academic-affairs/course-program-proposals/_internal/_documents/_2025-2026/list-1/courses/phys-500_-masters-thesis.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/academic-affairs/graduate-excellence-engagement-program/spotlights/probation-awardees/yuan-pfdg-2020-poster.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/academic-affairs/course-program-proposals/_internal/_documents/_2025-2026/list-1/courses/edc-252_-legal-and-ethical-issues-in-professional-counseling.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/academic-affairs/course-program-proposals/_internal/_documents/_2023-2024/list-3/courses/envs-230_-environmental-policy-analysis.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/academic-affairs/course-program-proposals/_internal/_documents/_2025-2026/list-6/courses/mktg-126_-professional-selling.pdf"
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
    "tagStatus": "UNTAGGED",
    "sourceUrl": "https://www.csus.edu/academic-affairs/_internal/_documents/sasaki-design-firm-talks-vision-for-sac._.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/college/health-human-services/communication-sciences-disorders/_internal/_documents/speech-language-clinic/maryjane-rees-center-speech-lancguage-clinic-observation-room.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/international-programs-global-engagement/international-student-scholar-services/_internal/_documents/ev-1-request-to-host-exchange-visitor-updated-10.24.19.pdf"
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
    "tagStatus": "UNTAGGED",
    "sourceUrl": "https://www.csus.edu/campus-safety/environmental-health-safety/safety-management/general-safety/_documents/checklist/ic_09.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/administration-business-affairs/financial-services/_internal/_documents/training/access_lcd_dashboard.pdf"
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
    "tagStatus": "UNTAGGED",
    "sourceUrl": "https://www.csus.edu/academic-affairs/program-assessment/archive/_internal/_documents/1819-report-pdfs-by-clge/hhs/1819-bs-crim-just.pdf"
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
    "tagStatus": "UNTAGGED",
    "sourceUrl": "https://www.csus.edu/faculty/m/fred.molitor/docs/PA%20and%20Health%20Behaviors.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/college/health-human-services/social-work/_internal/documents/fielddocs/basw-field-manual-accreditation-2025.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/academic-affairs/senate/executive-committee/24-25ex-cmte/24-25ex-a-m/12-03-24/24-25ex-91.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/academic-affairs/course-program-proposals/_internal/_documents/_2025-2026/list-5/courses/engl-190s_-literatures-of-disability.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/academic-affairs/senate/senate-info/25-26-senate/25-26fs-am/02-05-26/25-26fs-78.pdf"
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
    "tagStatus": "UNTAGGED",
    "sourceUrl": "https://www.csus.edu/center/community-engagement-center/_internal/_documents/cec-wp-infographic.pdf"
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
    "tagStatus": "UNTAGGED",
    "sourceUrl": "https://www.csus.edu/college/business-administration/internal/g-3953-cob-values.pdf"
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
    "tagStatus": "UNTAGGED",
    "sourceUrl": "https://www.csus.edu/faculty/m/fred.molitor/docs/War%20and%20Mental%20Disorders.pdf"
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
    "tagStatus": "UNTAGGED",
    "sourceUrl": "https://www.csus.edu/college/health-human-services/communication-sciences-disorders/_internal/_documents/course-syllabi/2258-syllabi-2025-fall/csad-673-01-thomas-fall-2025.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/college/natural-sciences-mathematics/physics-astronomy/_internal/docs/colloquium_flyers/02.19.26.kim_color.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/academic-affairs/senate/executive-committee/24-25ex-cmte/24-25ex-a-m/12-03-24/24-25exm-12-3-f.pdf"
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
    "tagStatus": "UNTAGGED",
    "sourceUrl": "https://www.csus.edu/college/arts-letters/music/_internal/_documents/programs/4.14.26-bryce.pdf"
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
    "tagStatus": "UNTAGGED",
    "sourceUrl": "https://www.csus.edu/president/inclusive-excellence/employee-affinity-groups/black-staff-faculty-association/_internal/_documents/prefilled-payroll-deduction-form.pdf"
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
    "tagStatus": "UNTAGGED",
    "sourceUrl": "https://www.csus.edu/academic-affairs/center-teaching-learning/_internal/_documents/community-agreements.pdf"
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
    "tagStatus": "UNTAGGED",
    "sourceUrl": "https://www.csus.edu/academic-affairs/program-assessment/archive/_internal/_documents/1314%20Report%20PDFs%20by%20clge/ssis/2013-2014-gerontology-bs-appendix-d1.pdf"
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
    "tagStatus": "UNTAGGED",
    "sourceUrl": "https://www.csus.edu/college/natural-sciences-mathematics/center-science-math-success/_internal/_images/pal-worksheets/pal/worksheets/Chem%201A%20Fall-16/w-1.-worksheet-1.-introduction-to-nomenclature.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/academic-affairs/program-assessment/archive/_internal/_documents/1314%20Report%20PDFs%20by%20clge/bus/2013-2014-business-assmt-rpt-cba-bsba.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/faculty/f/ryan.fuller/pec-cop-scale-overview.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/academic-affairs/senate/executive-committee/23-24ex-cmte/23-24ex-a-m/10-10-23/23-24exm10-10-f.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/academic-affairs/senate/senate-info/24-25senate/24-25fs-am/09-05-24/24-25fs-36.pdf"
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
    "tagStatus": "UNTAGGED",
    "sourceUrl": "https://www.csus.edu/college/business-administration/finance-insurance-real-estate/meet-us/_internal/photos/bio/vygodina_anna_bio.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/academic-affairs/program-assessment/archive/_internal/_documents/1314%20Report%20PDFs%20by%20clge/al/2013-2014-art-ba-art-history-rpt.pdf"
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
    "tagStatus": "UNTAGGED",
    "sourceUrl": "https://www.csus.edu/center/community-engagement-center/_internal/p-29735-cec-hands-on-year-in-review-2023-3.pdf"
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
    "tagStatus": "UNTAGGED",
    "sourceUrl": "https://www.csus.edu/faculty/m/fred.molitor/docs/sleep-and-technology.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/faculty/m/e.morgan/images/e.morgan_curriculum-vitae_nov2021.pdf"
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
    "tagStatus": "UNTAGGED",
    "sourceUrl": "https://www.csus.edu/college/arts-letters/communication-studies/communication-masters/_internal/_documents/flowchart-thesis-project-fall-2021.pdf"
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
    "tagStatus": "UNTAGGED",
    "sourceUrl": "https://www.csus.edu/faculty/m/fred.molitor/docs/Media%20Violence%20Youth.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/college/education/teaching-credentials/_internal/_documents/current-student-information-center.pe-workshop-spring-2026.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/college/education/teaching-credentials/_internal/_documents/subject-matter-advisor-list1.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/president/inclusive-excellence/csu-asap/_internal/_documents/mary-ann-wong-biography.pdf"
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
    "tagStatus": "UNTAGGED",
    "sourceUrl": "https://www.csus.edu/college/social-sciences-interdisciplinary-studies/public-policy-administration/_internal/_documents/thesis-bank/thesis-bank-2019-myers.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/college/business-administration/internal/forms/how-to-upload-documents-to-mysacstate-updated.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/academic-affairs/course-program-proposals/_internal/_documents/_2023-2024/list-3/programs/ma-in-education-equity-and-social-justice_ethnicity-and-race.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/academic-affairs/faculty-affairs/_internal/_documents/sabbatical-workshop-powerpoint-presentation-april-24-2026.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/academic-affairs/program-assessment/archive/_internal/_documents/1213%20Report%20PDFs%20by%20clge/ecs/construction-management-academic-quality-plan.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/college/engineering-computer-science/electrical-engineering/_internal/_documents/letter-templates/eee-allow-to-register-for-less-than-9-units.pdf"
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
    "tagStatus": "UNTAGGED",
    "sourceUrl": "https://www.csus.edu/faculty/g/etgonzal/F13%20NSM%2021%20Syllabus.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/experience/innovation-creativity/oried/documents/fixed-price-contracts_guidelines-october-2018-final.pdf"
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
    "tagStatus": "UNTAGGED",
    "sourceUrl": "https://www.csus.edu/faculty/h/whussey/docs/Gov155%20Congress/blue_slip-neil_andrews_1949.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/college/social-sciences-interdisciplinary-studies/womens-gender-studies/_internal/_documents/wgs-major-requirements-2026-27.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/academic-affairs/course-program-proposals/_internal/_documents/_2023-2024/list-1/courses/hist-172b_-queer-black-histories.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/academic-affairs/senate/senate-info/24-25senate/24-25fs-am/10-17-24/24-25fsa-10-17-f.pdf"
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
    "tagStatus": "UNTAGGED",
    "sourceUrl": "https://www.csus.edu/college/health-human-services/communication-sciences-disorders/_internal/_documents/course-syllabi/2258-syllabi-2025-fall/csad-613-01-gaeta-fall-2025.pdf"
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
    "tagStatus": "UNTAGGED",
    "sourceUrl": "https://www.csus.edu/academic-affairs/program-assessment/archive/_internal/_documents/1314%20Fdbk/edu/packet-ms-counseling.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/college/health-human-services/communication-sciences-disorders/_internal/_documents/policy/csad-ms-apip-policy.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/college/social-sciences-interdisciplinary-studies/public-policy-administration/_internal/_documents/thesis-bank/thesis-bank-2017-cowgill.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/academic-affairs/graduate-excellence-engagement-program/spotlights/probation-awardees/pfdg-report--ashtari-aug2020.pdf"
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
    "tagStatus": "UNTAGGED",
    "sourceUrl": "https://www.csus.edu/college/natural-sciences-mathematics/center-science-math-success/_internal/_images/pal-worksheets/pal/worksheets/Math-29Fall-13/worksheet-6-compositions-and-inverses.pdf"
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
    "tagStatus": "UNTAGGED",
    "sourceUrl": "https://www.csus.edu/college/social-sciences-interdisciplinary-studies/public-policy-administration/_internal/_documents/thesis-bank/ibarra-m-s24-thesis.pdf"
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
    "tagStatus": "UNTAGGED",
    "sourceUrl": "https://www.csus.edu/academic-affairs/academic-excellence/accreditations/_internal/_documents/operating-fund-budget-allocation-summary-202526.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/academic-affairs/program-assessment/archive/_internal/_documents/1617%20Fdbk/ssis/1617-ba-ethnic-std-pckt-v3.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/college/social-sciences-interdisciplinary-studies/public-policy-administration/_internal/_documents/thesis-bank/thesis-bank-2015-blodgett.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/college/health-human-services/kinesiology/_internal/documents/kins-concentrations.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/experience/alumni-association/about-us/_internal/_images/ssaa_investment_policy.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/college/arts-letters/internal/_internal/_documents/artp_chairsworkshop2024.pdf"
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
    "tagStatus": "UNTAGGED",
    "sourceUrl": "https://www.csus.edu/college/natural-sciences-mathematics/center-science-math-success/_internal/_images/pal-worksheets/pal/worksheets/math-30/m30_13.pdf"
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
    "tagStatus": "UNTAGGED",
    "sourceUrl": "https://www.csus.edu/college/business-administration/finance-insurance-real-estate/meet-us/_internal/photos/bio/lin_hao_bio.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/title-ix/_internal/_documents/california-state-university-sacramento_university-report_july-17-202315.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/academic-affairs/senate/senate-info/24-25senate/24-25fs-am/12-12-24/pam-9-19-24.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/academic-affairs/faculty-affairs/_internal/_documents/check-in-2---embedding-dei-into-the-position,-description-and-other-pre-posting-materials-.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/title-ix/_internal/_documents/grs-2023-title-ix-training-materials1.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/academic-affairs/senate/senate-info/25-26-senate/25-26fs-am/12-04-25/25-26fs-46.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/academic-affairs/course-program-proposals/_internal/_documents/_2023-2024/list-3/courses/wgs-50_-introduction-to-lgbtq-studies.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/administration-business-affairs/budget-planning/_internal/_documents/ubac-meeting-minutes-5-24-2023-afternoon-final.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/college/social-sciences-interdisciplinary-studies/nutrition/_internal/_documents/faculty-office-hours-sp26.pdf"
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
    "tagStatus": "UNTAGGED",
    "sourceUrl": "https://www.csus.edu/college/social-sciences-interdisciplinary-studies/renaissance-society/_internal/_documents/recordermay2024final.pdf"
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
    "tagStatus": "UNTAGGED",
    "sourceUrl": "https://www.csus.edu/academic-affairs/program-assessment/archive/_internal/_documents/1213%20Report%20PDFs%20by%20clge/ssis/12-13-womens-studies-appendix-1.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/college/social-sciences-interdisciplinary-studies/political-science/_internal/_documents/spring-2026-new-minor-advising-hours.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/academic-affairs/course-program-proposals/_internal/_documents/_2024-2025/list-6/courses/pt-640_-physical-therapy-interventions-ii.pdf"
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
    "tagStatus": "UNTAGGED",
    "sourceUrl": "https://www.csus.edu/college/natural-sciences-mathematics/center-science-math-success/_internal/_images/pal-worksheets/pal/worksheets/math-12-sp-23/m12pal_worksheet20.pdf"
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
    "tagStatus": "UNTAGGED",
    "sourceUrl": "https://www.csus.edu/college/natural-sciences-mathematics/center-science-math-success/_internal/_images/pal-worksheets/pal/worksheets/Bio%20184/184---problem-set-lecture-6-ch-18.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/faculty/m/tmigliac/CV.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/administration-business-affairs/budget-planning/_internal/_documents/ubac_meetingnotes_20200730.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/academic-affairs/program-assessment/archive/_internal/_documents/assess%20plan/ssis/1617-govt-ma-assessment-plan.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/information-resources-technology/academic-technology-classrooms/_internal/_documents/classroom-equipment/instructions/zoom/zoom-doc-podium-line-in.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/college/health-human-services/communication-sciences-disorders/_internal/_documents/speech-language-clinic/2024-maryjane-rees-center-csad-ms-clinic-handbook.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/administration-business-affairs/internal/accounts-payable/_internal/_documents/covid-travel-checklist-domestic.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/administration-business-affairs/financial-services/_internal/_documents/bmss-2024-2025/2024.10.10.ufss.fundchanges.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/college/natural-sciences-mathematics/internal/_internal/_documents/nsm-pdp-application-form.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/college/engineering-computer-science/mechanical-engineering/_internal/_documents/opportunities_for_involvement.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/student-affairs/retention-academic-success/_internal/_documents/first-star-news-release.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/academic-affairs/senate/senate-info/23-24senate/23-24fs-am/04-25-24/23-24fs-107a.pdf"
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
    "tagStatus": "UNTAGGED",
    "sourceUrl": "https://www.csus.edu/academic-affairs/curriculum-workflow/_internal/_documents/cs_numbers2015.pdf"
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
    "tagStatus": "UNTAGGED",
    "sourceUrl": "https://www.csus.edu/college/engineering-computer-science/mesa/_internal/_documents/mep-report-card-sp23newstudent-3-1.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/academic-affairs/course-program-proposals/_internal/_documents/_2025-2026/list-6/courses/mktg-140_-sports-marketing.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/college/engineering-computer-science/computer-science/_internal/_documents/ms-project-topic-form.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/academic-affairs/course-program-proposals/_internal/_documents/_2025-2026/list-2/courses/th-114_-therapeutic-health-interventions-ii.pdf"
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
    "tagStatus": "UNTAGGED",
    "sourceUrl": "https://www.csus.edu/college/business-administration/accounting/meet-us/_internal/photos/bio/xiong_yan_bio.pdf"
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
    "tagStatus": "UNTAGGED",
    "sourceUrl": "https://www.csus.edu/faculty/t/rtatro/_internal/_documents/battery-management.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/college/natural-sciences-mathematics/center-science-math-success/_internal/_images/pal-worksheets/pal/syllabi/syllabi-f20/nsm-12a-syllabus-chem-4-fall-20.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/academic-affairs/course-program-proposals/_internal/_documents/_2024-2025/list-6/courses/arch-136a_-advanced-building-information-modeling-for-architecture.pdf"
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
    "tagStatus": "UNTAGGED",
    "sourceUrl": "https://www.csus.edu/faculty/k/kneitel/kneitel-cv_aug-2025.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/academic-affairs/senate/senate-info/d-dc-consultation/d-dc-4-9-26-scrp.pdf"
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
    "tagStatus": "UNTAGGED",
    "sourceUrl": "https://www.csus.edu/experience/fact-book/_internal/_documents/factbook26_finalweb.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/college/social-sciences-interdisciplinary-studies/renaissance-society/_internal/_documents/march20minutes.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/academic-affairs/senate/executive-committee/24-25ex-cmte/24-25ex-a-m/12-03-24/24-25ex-106.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/academic-affairs/program-assessment/archive/_internal/_documents/1213%20Report%20PDFs%20by%20clge/ssis/sociology-graduate-assessment.pdf"
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
    "tagStatus": "UNTAGGED",
    "sourceUrl": "https://www.csus.edu/faculty/f/tfong/docs/in_celebrating_king_we_must_overcome_divisive__sacramento_bee_the_ca___january_16_2017__p5b.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/college/engineering-computer-science/student-success/career-services/_internal/_images/getting-the-most-out-of-a-career-fair_digital.pdf"
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
    "tagStatus": "UNTAGGED",
    "sourceUrl": "https://www.csus.edu/faculty/c/cohenaj/docs/youngscholarsforum.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/administration-business-affairs/_internal/_documents/aba-pdfs/hardcopy_req20161.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/experience/alumni-association/about-us/_internal/_documents/ssaa-hornet-alumni-champions-flyer-rev120221.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/people-climate/human-resources/benefits/_internal/_documents/fee-waiver-costs.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/people-climate/risk-management-services/_internal/_documents/executive-safety-committee/agenda/9-16-2025_esc-agenda.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/center/race-immigration-social-justice/justice-podcast/_internal/_documents/s2e25_matching-diversity-of-educated-to-educators_mai_lam_building-justice-podcast-transcript1.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/academic-affairs/program-assessment/archive/_internal/_documents/1617%20Fdbk/ssis/1617-bs-enviro-std-pckt.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/faculty/m/tmigliac/soc135syllabus-2020.pdf"
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
    "tagStatus": "UNTAGGED",
    "sourceUrl": "https://www.csus.edu/experience/innovation-creativity/sustainability/_internal/sac-state-campus-sustainability-report-2012---2014.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/experience/alumni-association/about-us/_internal/_images/ssaa-policy-conflict-of-interest.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/administration-business-affairs/internal/_internal/_documents/departmental-permit-purchase-form-july,-2020.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/college/education/undergraduate/_internal/_documents/chad-sc-factsheet24.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/college/health-human-services/communication-sciences-disorders/_internal/_documents/course-syllabi/2258-syllabi-2025-fall/csad-223-all-sections-roseberry-fall-2025.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/academic-affairs/course-program-proposals/_internal/_documents/_2023-2024/list-3/courses/geol-100_-earth-materials-rocks-and-minerals.pdf"
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
    "tagStatus": "UNTAGGED",
    "sourceUrl": "https://www.csus.edu/academic-affairs/program-assessment/archive/_internal/_documents/1314%20Report%20PDFs%20by%20clge/nsm/2013-2014-geography-undergrad-rpt.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/academic-affairs/senate/non-senate-university-committees/pdfs/acip-m.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/college/arts-letters/world-languages-literatures/_internal/_documents/span-minor_roadmap_option-1_-span-47_fall-2023.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/college/social-sciences-interdisciplinary-studies/renaissance-society/_internal/_documents/agendasept22.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/academic-affairs/senate/executive-committee/25-26ex-cmte/25-26ex-a-m/03-10-26/25-26ex-106.pdf"
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
    "tagStatus": "UNTAGGED",
    "sourceUrl": "https://www.csus.edu/college/engineering-computer-science/student-success/peer-assisted-learning/_internal/_documents/pal-worksheet-9-supernodes-supermeshes-and-source-transformations.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/college/engineering-computer-science/electrical-engineering/_internal/_documents/299_199_special-problems-petition.pdf"
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
    "tagStatus": "UNTAGGED",
    "sourceUrl": "https://www.csus.edu/administration-business-affairs/facilities-management/_internal/_documents/folsom-blvd-project-ceqa.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/college/education/teaching-credentials/_internal/_documents/maximize-financial-aid.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/academic-affairs/course-program-proposals/_internal/_documents/_2023-2024/list-3/courses/psyc-183_-teaching-of-psychology.pdf"
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
    "tagStatus": "UNTAGGED",
    "sourceUrl": "https://www.csus.edu/faculty/m/fred.molitor/docs/Body%20and%20Eating.pdf"
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
    "tagStatus": "UNTAGGED",
    "sourceUrl": "https://www.csus.edu/college/engineering-computer-science/student-success/peer-assisted-learning/_internal/_documents/engr-110-pal-ws12-oscillations-last-one.pdf"
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
    "tagStatus": "UNTAGGED",
    "sourceUrl": "https://www.csus.edu/faculty/m/fred.molitor/docs/Apples%20and%20Diet.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/academic-affairs/senate/executive-committee/23-24ex-cmte/23-24ex-a-m/09-05-23/23-24ex-04a.pdf"
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
    "tagStatus": "UNTAGGED",
    "sourceUrl": "https://www.csus.edu/college/natural-sciences-mathematics/center-science-math-success/_internal/_images/pal-worksheets/pal/worksheets/math-31/m31_26.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/people-climate/human-resources/benefits/_internal/_documents/2026-cobra-rates.pdf"
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
    "tagStatus": "UNTAGGED",
    "sourceUrl": "https://www.csus.edu/academic-affairs/senate/lectures-awards-scholarships/distinguished-faculty-award-lecture/25-26-dfal-call.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/academic-affairs/_internal/_documents/process-to-obtain-provost-office-signature-7.22.22.pdf"
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
    "tagStatus": "UNTAGGED",
    "sourceUrl": "https://www.csus.edu/faculty/s/sobredo/ETHN%20119%20Filipino%20Americans/ETHN_114_Spr_2017.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/administration-business-affairs/financial-services/_internal/_documents/bprt-2025-2026/2026.02/04.as.pdf"
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
    "tagStatus": "UNTAGGED",
    "sourceUrl": "https://www.csus.edu/college/social-sciences-interdisciplinary-studies/public-policy-administration/_internal/_documents/thesis-bank/connor-leahy-thesis.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/academic-affairs/program-assessment/archive/_internal/_documents/1516%20Fdbk/nsm/15-16-bs-physics-pkt-final.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/college/arts-letters/english/_internal/handbook.engl-ma.2025-2026.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/academic-affairs/senate/executive-committee/24-25ex-cmte/24-25ex-a-m/03-11-25/24-25exa-03-11-25-f.pdf"
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
    "tagStatus": "UNTAGGED",
    "sourceUrl": "https://www.csus.edu/college/social-sciences-interdisciplinary-studies/public-policy-administration/_internal/_documents/thesis-bank/thesis-bank-2012-brooks.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/academic-affairs/course-program-proposals/_internal/_documents/_2025-2026/list-2/programs/bs-in-fashion-merchandising-and-management.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/experience/alumni-association/about-us/_internal/_documents/ssaa-brand-book.pdf"
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
    "tagStatus": "UNTAGGED",
    "sourceUrl": "https://www.csus.edu/college/education/masters-programs/_internal/_documents/pasc-end-of-program.administrative-credential-application.pdf"
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
    "tagStatus": "UNTAGGED",
    "sourceUrl": "https://www.csus.edu/college/natural-sciences-mathematics/peer-assisted-learning-program-pal/_internal/_documents/office-hours/bio-oh-s25.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/academic-affairs/program-assessment/archive/_internal/_documents/1617%20Fdbk/al/1617-ba-wl-spanish-pckt.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/academic-affairs/senate/senate-info/24-25senate/24-25-fs-roster/cob-s-24-25.pdf"
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
    "tagStatus": "UNTAGGED",
    "sourceUrl": "https://www.csus.edu/faculty/s/s.sabati/images/sabati_cv_vs.2021.09-cv.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/academic-affairs/course-program-proposals/_internal/_documents/_2025-2026/list-1/courses/phys-290_-graduate-colloquium.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/college/natural-sciences-mathematics/physics-astronomy/_internal/docs/faculty-schedules/lege-s26.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/academic-affairs/program-assessment/archive/_internal/_documents/1516%20Fdbk/bus/15-16-bs-bus-admin-pkt-final.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/college/natural-sciences-mathematics/peer-assisted-learning-program-pal/_internal/_documents/posters/2022-23/pal-research-concept-map.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/experience/innovation-creativity/sustainability/_internal/sustainability-policy-2022.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/college/social-sciences-interdisciplinary-studies/public-policy-administration/_internal/_documents/thesis-bank/thesis-bank-2019-costa.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/academic-affairs/senate/senate-info/24-25senate/24-25fs-am/08-22-24/24-25fs-03-13.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/administration-business-affairs/budget-planning/_internal/_documents/budget-process1.pdf"
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
    "tagStatus": "UNTAGGED",
    "sourceUrl": "https://www.csus.edu/graduate-studies/unit-11/_internal/_documents/graduateassistanttimebasechange.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/academic-affairs/program-assessment/archive/_internal/_documents/1617%20Report%20PDFs%20by%20clge/ssis/1617-ba-woms.pdf"
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
    "tagStatus": "UNTAGGED",
    "sourceUrl": "https://www.csus.edu/academic-affairs/program-assessment/archive/_internal/_documents/1718%20Report%20PDFs%20by%20clge/hhs/1718-2nd-bs-comm-sci-and-disorders---full.pdf"
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
    "tagStatus": "UNTAGGED",
    "sourceUrl": "https://www.csus.edu/academic-affairs/academic-excellence/accreditations/_internal/_documents/cares_wasc_one-pager-survey-data.pdf"
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
    "tagStatus": "UNTAGGED",
    "sourceUrl": "https://www.csus.edu/faculty/r/celeste/_internal/_documents/april20recorder-1_compressed-1.pdf"
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
    "tagStatus": "TAGGED",
    "sourceUrl": "https://www.csus.edu/college/health-human-services/physical-therapy/_internal/documents/dptadmissionoutreachflyer2026revised.pdf"
  }
]
