import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Cross, Download } from './Icons'

interface PdfPreviewModalProps {
  url: string
  filename: string
  onClose: () => void
}

/**
 * Full-viewport preview of a PDF inside an <iframe>, opened by clicking the
 * eye icon on a Review Queue row. Closes on backdrop click, Escape key, or
 * the header X. The Download button hits the same URL as the iframe with
 * download=true to force a save dialog.
 *
 * Rendered via a React portal into document.body so it escapes any ancestor
 * that established a containing block (LibraryPage's .view section uses an
 * animation-derived transform, which would otherwise break position:fixed).
 */
export function PdfPreviewModal({ url, filename, onClose }: PdfPreviewModalProps) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    // Freeze background scroll while the modal is open
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = previousOverflow
    }
  }, [onClose])

  return createPortal(
    <div
      className="pdfmodal"
      role="dialog"
      aria-modal="true"
      aria-label={`Preview of ${filename}`}
      onClick={onClose}
    >
      <div className="pdfmodal__panel" onClick={(event) => event.stopPropagation()}>
        <header className="pdfmodal__header">
          <span className="pdfmodal__title" title={filename}>{filename}</span>
          <div className="pdfmodal__actions">
            <a
              className="btn btn--ghost btn--sm"
              href={url}
              download={filename}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Download />
              Download
            </a>
            <button
              type="button"
              className="btn btn--ghost btn--sm pdfmodal__close"
              onClick={onClose}
              aria-label="Close preview"
            >
              <Cross />
              Close
            </button>
          </div>
        </header>
        <iframe
          className="pdfmodal__frame"
          src={url}
          title={`PDF preview: ${filename}`}
        />
      </div>
    </div>,
    document.body,
  )
}
