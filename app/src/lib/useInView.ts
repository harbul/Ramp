import { useEffect, useRef, useState } from 'react'

/**
 * Reveals an element the first time it scrolls into view. Uses
 * IntersectionObserver (never a scroll listener) and disconnects after the
 * first hit, so it drives one-shot entry animations cheaply.
 *
 * Falls back to "visible" immediately where IntersectionObserver is missing,
 * so content is never trapped invisible.
 */
export function useInView<T extends HTMLElement>(
  options: IntersectionObserverInit = { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
) {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true)
      return
    }

    // If the element is already on-screen when this runs (e.g. the table right
    // after switching to the Review Queue tab), reveal it deterministically now
    // rather than waiting on the observer's async callback, which can miss the
    // first mount and leave content stuck invisible.
    const rect = el.getBoundingClientRect()
    const viewportH = window.innerHeight || document.documentElement.clientHeight
    if (rect.top < viewportH && rect.bottom > 0) {
      setInView(true)
      return
    }

    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          setInView(true)
          observer.disconnect()
          break
        }
      }
    }, options)
    observer.observe(el)
    return () => observer.disconnect()
    // options is a stable literal per mount; intentionally run once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { ref, inView }
}
