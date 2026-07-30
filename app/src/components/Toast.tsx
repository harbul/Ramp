import { useEffect, useState } from 'react'

interface ToastProps {
  /** Changing this message shows the toast; empty hides it. */
  message: string
  duration?: number
}

export function Toast({ message, duration = 3200 }: ToastProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!message) return
    setVisible(true)
    const timer = window.setTimeout(() => setVisible(false), duration)
    return () => window.clearTimeout(timer)
  }, [message, duration])

  // Always mounted so the live region is announced on update rather than on insert.
  return (
    <div className={`toast${visible ? ' is-up' : ''}`} role="status" aria-live="polite">
      {message}
    </div>
  )
}
