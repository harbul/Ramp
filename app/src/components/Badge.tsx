import type { ReactNode } from 'react'
import type { DocStatus, Severity } from '../types'

type Tone = 'warn' | 'alert' | 'ok' | 'neutral'

interface BadgeProps {
  tone: Tone
  children: ReactNode
  /** Adds a leading dot — used for document status, where colour alone must not carry meaning. */
  dot?: boolean
}

export function Badge({ tone, children, dot = false }: BadgeProps) {
  return <span className={`badge badge--${tone}${dot ? ' badge--dot' : ''}`}>{children}</span>
}

const STATUS_COPY: Record<DocStatus, { label: string; tone: Tone }> = {
  'needs-review': { label: 'Needs Review', tone: 'warn' },
  'issues-found': { label: 'Issues Found', tone: 'alert' },
  remediated: { label: 'Remediated', tone: 'ok' },
}

export function StatusBadge({ status }: { status: DocStatus }) {
  const { label, tone } = STATUS_COPY[status]
  return (
    <Badge tone={tone} dot>
      {label}
    </Badge>
  )
}

const SEVERITY_TONE: Record<Severity, Tone> = {
  High: 'alert',
  Medium: 'warn',
  Low: 'neutral',
}

export function SeverityBadge({ severity }: { severity: Severity }) {
  return <Badge tone={SEVERITY_TONE[severity]}>{severity} Severity</Badge>
}
