# Challenge Overview: AI-Powered PDF Form Modernization Assistant - Assess, remediate, and recommend modernization paths for campus PDF forms at scale

## Project Objectives

- Automatically identify, inventory, and assess PDF forms across the campus website, extracting form fields and business process information (addresses inability to operationalize form assessment at scale).  
- Enable accessibility evaluation of fillable form elements-labels, inputs, ARIA descriptions-that current tools cannot handle (addresses the core field/input remediation gap).
- Improve experiences for faculty, staff, students, and community members who fill out forms, plus web editors who maintain them (addresses ADA Title II compliance and service delivery).  
- Reduce staff/intern time spent manually assessing and remediating forms one-by-one; increase forms meeting accessibility standards (addresses volume of manual PDF-by-PDF work).  
- Leave room to grow into duplicate/redundant form detection via semantic matching of captured field data (stretch direction).

## Current Workflow

- Hundreds of PDF forms live on the campus website, supporting student services, HR, academic, and administrative processes.  
- Student interns manually remediate forms one PDF at a time; leadership informally considers modernization options.  
- Users find and complete forms as static or scanned PDFs, some non-fillable, creating barriers for screen reader and keyboard users.  
- A web page lists most in-scope PDF forms; an informal/draft modernization matrix exists but is not documented or complete.  
- Legacy/constrained tooling: DubBot (reporting/auditing), CommonLook (manual remediation), Acrobat accessibility checker, PAC, and Fullerton's AI PDF tagger-all human-piloted, none automated for form fields.

## Key Pain Points

- Scanned/static PDFs retain a non-fillable look, blocking assistive technology navigation (discoverability/accessibility problem).  
- Remediating form labels, inputs, and ARIA descriptions requires expertise the team lacks (tribal knowledge / hand-holding).  
- Manual, PDF-by-PDF remediation is slow given the large volume of forms (time cost of sifting and remediating).  
- High volume of legacy PDFs (from a redesign 7 years ago) that could plausibly be assessed, migrated, or retired via automation.  
- Existing tools are human-piloted and cannot handle form fields; ADA Title II deadline (April 2026\) adds pressure to scale.

## Ideal Solution Vision

- Automation pipeline that crawls the site, inspects each form, remediates where possible, and tags recommendations-platform-agnostic key-value extraction.
- Example: given a fillable PDF, extract fields, assess accessibility/complexity, and recommend a path (remediate, recreate as accessible PDF, migrate to web form, or retire).  
- Index all site PDF forms; extract fields and business process metadata with source file names/links (addresses inventory gap).  
- Optional surface: a reviewable list of recommendations and a duplicate/redundant-forms rollup for staff triage.  
- Extension path: rubric-driven routing to enterprise platforms (e.g., OnBase for PeopleSoft-touching data) and semantic matching to flag redundant forms without a rewrite.

## Data Availability

- Primary source of truth: campus web page listing most in-scope PDF forms; sample PDF forms across business processes available.  
- Supplementary: form inventories, accessibility standards, remediation guidance, modernization criteria, and a draft modernization decision matrix.  
- Human resources: SMEs in web accessibility, digital user experience, and business process areas; functional-area stakeholders (student services, HR, academic affairs, administration) for validation; potential pilot opportunities.  
- Known gaps: no formal/complete recommendation rubric exists yet (only an informal draft); enterprise migration targets available include Microsoft 365 (Forms, Power Apps), ServiceNow, Adobe Acrobat Sign, OnBase, and the university website.
