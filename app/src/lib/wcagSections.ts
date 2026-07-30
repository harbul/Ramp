import type { WcagFinding, WcagReport, WcagSeverity } from './api'

/**
 * The three Workbench sections + Other. Every WcagFinding lives in exactly one
 * section, chosen by HOW it gets fixed (not by what it's called):
 *
 *   Modernization — deterministic, one-click, no review needed (Ramp does it).
 *   Remediation   — AI drafts, human reviews per item before it ships.
 *   Compliance    — human-only decision; no code fix available.
 *   Other         — the whole document is a blocker (encrypted, corrupt) or
 *                    otherwise can't be classified.
 */
export type SectionKey = 'modernization' | 'remediation' | 'compliance' | 'other'

export interface Section {
  key: SectionKey
  title: string
  description: string
  findings: WcagFinding[]
  failing: WcagFinding[]
  passing: WcagFinding[]
  // Rollups on the failing set — quick summary for the section header
  blockerCount: number
  majorCount: number
  minorCount: number
}

/** Fix actions that need per-item human review (only alt text today; the
 *  label writer uses deterministic tier-1 humanize, so it stays in Modernization). */
const AI_REVIEW_ACTIONS = new Set(['generate_alt_text'])

/** Fatal document-level rules that don't fit any of the three normal sections. */
const OTHER_RULE_IDS = new Set(['WCAG-encrypted', 'WCAG-unreadable'])

export function classifyFinding(finding: WcagFinding): SectionKey {
  if (OTHER_RULE_IDS.has(finding.ruleId)) return 'other'
  // Passing findings inherit the classification of their rule so they display
  // in the right section as "already-done".
  if (finding.fixAction && AI_REVIEW_ACTIONS.has(finding.fixAction)) return 'remediation'
  if (finding.autoFixable && !finding.manualReview) return 'modernization'
  if (finding.manualReview) return 'compliance'
  // Explicit fallback: alt-text always Remediation (needs review), form
  // labels always Modernization (deterministic tier-1 humanize).
  if (finding.ruleId === 'WCAG-1.1.1-figure-alt') return 'remediation'
  if (finding.ruleId === 'WCAG-4.1.2-form-labels') return 'modernization'
  // Default catch-all: compliance (manual attention).
  return 'compliance'
}

const SECTION_TITLES: Record<SectionKey, string> = {
  modernization: 'Modernization',
  remediation: 'Remediation',
  compliance: 'Compliance',
  other: 'Other',
}

const SECTION_DESCRIPTIONS: Record<SectionKey, string> = {
  modernization: 'Deterministic structural fixes Ramp can apply in one click — inject tags, set language, title, PDF/UA metadata.',
  remediation: 'Content fixes that need AI to draft and a human to approve — figure alt text and form-field labels.',
  compliance: 'WCAG rules that only a person can decide on — heading hierarchy, table headers, color contrast.',
  other: 'Document-level blockers that stop the pipeline before any fix can run.',
}

const SEVERITY_WEIGHT: Record<WcagSeverity, number> = {
  BLOCKER: 3,
  MAJOR: 2,
  MINOR: 1,
}

export function groupIntoSections(report: WcagReport): Section[] {
  const empty = (): Section[] => (['modernization', 'remediation', 'compliance', 'other'] as SectionKey[]).map(
    (key) => ({
      key,
      title: SECTION_TITLES[key],
      description: SECTION_DESCRIPTIONS[key],
      findings: [],
      failing: [],
      passing: [],
      blockerCount: 0,
      majorCount: 0,
      minorCount: 0,
    }),
  )
  const sections = empty()
  const bucketByKey = Object.fromEntries(sections.map((s) => [s.key, s])) as Record<SectionKey, Section>
  for (const f of report.findings) {
    const s = bucketByKey[classifyFinding(f)]
    s.findings.push(f)
    if (f.passed) {
      s.passing.push(f)
    } else {
      s.failing.push(f)
      if (f.severity === 'BLOCKER') s.blockerCount += 1
      else if (f.severity === 'MAJOR') s.majorCount += 1
      else s.minorCount += 1
    }
  }
  // Sort each section's failing findings by severity (blockers first) so the
  // most important repair reads first when the card expands.
  for (const s of sections) {
    s.failing.sort((a, b) => SEVERITY_WEIGHT[b.severity] - SEVERITY_WEIGHT[a.severity])
  }
  return sections
}
