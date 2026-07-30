import type { View } from '../types'

const STEPS: { view: View; label: string }[] = [
  { view: 'library', label: 'PDF Library' },
  { view: 'workspace', label: 'Review Issues' },
  { view: 'complete', label: 'Download' },
]

export function Steps({ current }: { current: View }) {
  const currentIndex = STEPS.findIndex((step) => step.view === current)

  return (
    <nav className="steps" aria-label="Remediation progress">
      <ol className="steps__list">
        {STEPS.map((step, index) => {
          const isActive = index === currentIndex
          const isDone = index < currentIndex
          const className = ['steps__item', isActive && 'is-active', isDone && 'is-done']
            .filter(Boolean)
            .join(' ')

          return (
            <li key={step.view} className={className} aria-current={isActive ? 'step' : undefined}>
              <span className="steps__num" aria-hidden="true">
                {index + 1}
              </span>
              <span className="steps__label">
                {step.label}
                {isDone && <span className="visually-hidden"> - completed</span>}
              </span>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
