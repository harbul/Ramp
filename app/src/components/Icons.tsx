/** Inline icons. All decorative — labels always live in adjacent text. */

interface IconProps {
  className?: string
}

const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

export const ChevronLeft = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 16 16" aria-hidden="true" focusable="false">
    <path d="M10 2 L4 8 L10 14" {...base} />
  </svg>
)

export const ChevronRight = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 16 16" aria-hidden="true" focusable="false">
    <path d="M6 2 L12 8 L6 14" {...base} />
  </svg>
)

export const Check = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 16 16" aria-hidden="true" focusable="false">
    <path d="M3 8.5 L6.5 12 L13 4.5" {...base} />
  </svg>
)

export const CheckLarge = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path d="M5 12.5 L10 17.5 L19 6.5" {...base} strokeWidth={2.5} />
  </svg>
)

export const Cross = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 16 16" aria-hidden="true" focusable="false">
    <path d="M4 4 L12 12 M12 4 L4 12" {...base} />
  </svg>
)

export const Search = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 20 20" aria-hidden="true" focusable="false">
    <circle cx="8.5" cy="8.5" r="5.5" {...base} />
    <path d="M12.8 12.8 L17 17" {...base} />
  </svg>
)

export const Download = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 16 16" aria-hidden="true" focusable="false">
    <path d="M8 2 V11 M4.5 7.5 L8 11 L11.5 7.5 M3 13.5 H13" {...base} />
  </svg>
)

export const ImagePlaceholder = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <rect x="3" y="5" width="18" height="14" rx="2" {...base} strokeWidth={1.5} />
    <circle cx="8.5" cy="10" r="1.5" {...base} strokeWidth={1.5} />
    <path d="M4 16.5 L9 12 L13 15.5 L16 13 L20 16.5" {...base} strokeWidth={1.5} />
  </svg>
)

export const BookmarkIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 16 16" aria-hidden="true" focusable="false">
    <path d="M4 2 H12 V14 L8 10.5 L4 14 Z" {...base} strokeWidth={1.5} />
  </svg>
)

export const UniversitySeal = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 40 40" aria-hidden="true" focusable="false">
    <circle cx="20" cy="20" r="19" {...base} strokeWidth={1.5} />
    <path d="M20 7 L31 13.5 V26.5 L20 33 L9 26.5 V13.5 Z" {...base} strokeWidth={1.5} />
    <path d="M14 19.5 h12 M20 13.5 v12" {...base} strokeWidth={1.5} />
  </svg>
)

export const Eye = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 20 20" aria-hidden="true" focusable="false">
    <path d="M1.5 10 C4 5.5 6.75 3.5 10 3.5 C13.25 3.5 16 5.5 18.5 10 C16 14.5 13.25 16.5 10 16.5 C6.75 16.5 4 14.5 1.5 10 Z" {...base} strokeWidth={1.5} />
    <circle cx="10" cy="10" r="2.75" {...base} strokeWidth={1.5} />
  </svg>
)

/** The Ramp wordmark glyph: a rising incline to a dot — "the on-ramp to
 *  accessible PDFs." Used beside the "Ramp" text in the banner. */
export const RampMark = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
    <path d="M4 25 H12 L27 8" {...base} strokeWidth={2.75} />
    <circle cx="27" cy="8" r="3" fill="currentColor" stroke="none" />
  </svg>
)
