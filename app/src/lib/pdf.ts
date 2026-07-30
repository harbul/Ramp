/**
 * Minimal PDF writer.
 *
 * Scope note: this prototype has no real PDF back end, so the downloaded file
 * is a genuine (valid, openable) PDF summarising the remediation rather than a
 * rewritten copy of the source document. In production this function would be
 * replaced by a call to the remediation service, which returns the real tagged
 * PDF bytes. The generated file states this on its face so nobody mistakes it
 * for the remediated form.
 */

import type { RemediationResult } from '../types'

const encoder = new TextEncoder()
const byteLength = (s: string): number => encoder.encode(s).length

/** PDF string literals escape backslash and both parens. */
const escapeText = (s: string): string => s.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)')

/**
 * Base-14 Helvetica uses WinAnsi, so fold the typographic characters our copy
 * is likely to contain down to ASCII equivalents.
 */
const toAscii = (s: string): string =>
  s
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, '-')
    .replace(/…/g, '...')
    .replace(/ /g, ' ')
    // eslint-disable-next-line no-control-regex
    .replace(/[^\x20-\x7E]/g, '')

interface TextLine {
  text: string
  size: number
  bold?: boolean
  /** Extra leading above this line, in points. */
  spaceBefore?: number
}

const PAGE_WIDTH = 612
const PAGE_HEIGHT = 792
const MARGIN = 56
const MAX_WIDTH = PAGE_WIDTH - MARGIN * 2

/** Rough Helvetica advance width; good enough for wrapping a summary sheet. */
const measure = (text: string, size: number, bold: boolean): number =>
  text.length * size * (bold ? 0.58 : 0.52)

function wrap(text: string, size: number, bold: boolean): string[] {
  const words = text.split(/\s+/).filter(Boolean)
  const lines: string[] = []
  let current = ''

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word
    if (measure(candidate, size, bold) > MAX_WIDTH && current) {
      lines.push(current)
      current = word
    } else {
      current = candidate
    }
  }
  if (current) lines.push(current)
  return lines.length ? lines : ['']
}

function buildContentStream(lines: TextLine[]): string {
  let cursorY = PAGE_HEIGHT - MARGIN
  const ops: string[] = []

  for (const line of lines) {
    const bold = line.bold ?? false
    cursorY -= line.spaceBefore ?? 0

    for (const piece of wrap(toAscii(line.text), line.size, bold)) {
      cursorY -= line.size * 1.45
      if (cursorY < MARGIN) break
      ops.push(
        'BT',
        `/${bold ? 'F2' : 'F1'} ${line.size} Tf`,
        `1 0 0 1 ${MARGIN} ${cursorY.toFixed(2)} Tm`,
        `(${escapeText(piece)}) Tj`,
        'ET',
      )
    }
  }

  return ops.join('\n')
}

/** Assembles numbered objects into a valid PDF with a correct xref table. */
function assemble(objects: string[]): Blob {
  const header = '%PDF-1.7\n'
  const offsets: number[] = []
  let body = ''
  let cursor = byteLength(header)

  objects.forEach((object, index) => {
    offsets.push(cursor)
    const chunk = `${index + 1} 0 obj\n${object}\nendobj\n`
    body += chunk
    cursor += byteLength(chunk)
  })

  const xrefOffset = cursor
  const count = objects.length + 1

  let xref = `xref\n0 ${count}\n0000000000 65535 f \n`
  for (const offset of offsets) {
    xref += `${String(offset).padStart(10, '0')} 00000 n \n`
  }

  const trailer =
    `trailer\n<< /Size ${count} /Root 1 0 R /Info ${objects.length} 0 R >>\n` +
    `startxref\n${xrefOffset}\n%%EOF\n`

  return new Blob([header + body + xref + trailer], { type: 'application/pdf' })
}

export function buildRemediationPdf(result: RemediationResult): Blob {
  const lines: TextLine[] = [
    { text: 'Sacramento State', size: 11, bold: true },
    { text: 'PDF Remediation Assistant', size: 20, bold: true, spaceBefore: 4 },
    { text: 'Remediation Summary', size: 13, spaceBefore: 2 },

    { text: 'Document', size: 11, bold: true, spaceBefore: 22 },
    { text: `Original file: ${result.originalName}`, size: 11 },
    { text: `Remediated file: ${result.newName}`, size: 11 },
    { text: `Date remediated: ${result.remediatedOn}`, size: 11 },
    // Separate lines: wrap() normalises runs of whitespace, so columns would collapse.
    { text: `Issues fixed: ${result.fixed.length}`, size: 11 },
    { text: `Issues skipped: ${result.skipped.length}`, size: 11 },

    { text: 'Fixes applied', size: 11, bold: true, spaceBefore: 20 },
    ...(result.fixed.length
      ? result.fixed.map((fix): TextLine => ({ text: `- ${fix}`, size: 11 }))
      : [{ text: '- None', size: 11 } as TextLine]),
  ]

  if (result.skipped.length) {
    lines.push(
      { text: 'Skipped — still require review', size: 11, bold: true, spaceBefore: 20 },
      ...result.skipped.map((item): TextLine => ({ text: `- ${item}`, size: 11 })),
    )
  }

  lines.push(
    { text: 'About this file', size: 11, bold: true, spaceBefore: 22 },
    {
      text:
        'This is a prototype artifact. It records the fixes approved by a reviewer in the ' +
        'PDF Remediation Assistant; it is not the remediated form itself. In production this ' +
        'download returns the tagged, remediated PDF produced by the remediation service.',
      size: 10,
    },
    {
      text: 'AI-suggested fixes require human review before publication.',
      size: 10,
      spaceBefore: 8,
    },
  )

  const content = buildContentStream(lines)
  const title = toAscii(`Remediation Summary - ${result.originalName}`)

  return assemble([
    // 1 — Catalog. /Lang matters for assistive tech even on a summary sheet.
    '<< /Type /Catalog /Pages 2 0 R /Lang (en-US) >>',
    // 2 — Page tree
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    // 3 — Page
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] ` +
      '/Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>',
    // 4/5 — Base-14 fonts
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>',
    // 6 — Content stream
    `<< /Length ${byteLength(content)} >>\nstream\n${content}\nendstream`,
    // 7 — Info
    `<< /Title (${escapeText(title)}) /Producer (Sac State PDF Remediation Assistant) >>`,
  ])
}

/** Triggers a browser download for the given blob. */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}
