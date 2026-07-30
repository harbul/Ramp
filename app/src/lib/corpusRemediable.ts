/**
 * The corpus forms whose images can actually be described by the alt-text
 * pipeline. Every form here yields real extractable figure pixels, so clicking
 * Remediate produces genuine Claude alt text (not a "needs manual" placeholder).
 *
 * This set was determined by running the extraction pipeline over the whole
 * corpus (see backend scan): route ALT_TEXT_REMEDIATION alone overcounts,
 * because some tagged figures are vector art with no pixels to send the model.
 * The number is the count of images the pipeline extracts for that form.
 */
const REMEDIABLE: Record<string, number> = {
  'accounts-payable-travel/adobe-sign-invoice-user-guide.pdf': 8,
  'bursar/temporary-mailing-paychecks-instructions.pdf': 8,
  'budget-planning/budget-transfer-instructions.pdf': 5,
  'police-department/citizen-complaint-form.pdf': 2,
  'procurement/procard-manual.pdf': 2,
  'accounts-payable-travel/concur-cash-advance-request.pdf': 1,
  'benefits/catastrophic-leave-donation.pdf': 1,
  'university-print/envelope-options.pdf': 1,
  'university-print/letterhead-options.pdf': 1,
  'utaps/carpool-form.pdf': 1,
}

/** Whether a listed form can be remediated in place (real image alt text). */
export function isCorpusRemediable(department: string, file: string): boolean {
  return `${department}/${file}` in REMEDIABLE
}

/** How many images the pipeline will describe for a remediable form. */
export function remediableImageCount(department: string, file: string): number {
  return REMEDIABLE[`${department}/${file}`] ?? 0
}
