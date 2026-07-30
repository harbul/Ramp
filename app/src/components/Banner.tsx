import { UniversitySeal } from './Icons'

interface BannerProps {
  onHome: () => void
  onDashboard: () => void
  onRemediate: () => void
  currentView: 'library' | 'workspace' | 'complete' | 'dashboard' | 'remediate'
}

export function Banner({ onHome, onDashboard, onRemediate, currentView }: BannerProps) {
  return (
    <header className="banner">
      <div className="banner__inner">
        <a
          className="banner__brand"
          href="#main"
          onClick={(event) => {
            event.preventDefault()
            onDashboard()
          }}
        >
          <span className="banner__seal">
            <UniversitySeal />
          </span>
          <span className="banner__names">
            <span className="banner__university">Sacramento State</span>
            <span className="banner__product">PDF Remediation Assistant</span>
          </span>
        </a>
        <nav className="banner__nav">
          <button
            type="button"
            className={`banner__nav-link ${currentView === 'dashboard' ? 'banner__nav-link--active' : ''}`}
            onClick={onDashboard}
          >
            Dashboard
          </button>
          <button
            type="button"
            className={`banner__nav-link ${currentView === 'library' || currentView === 'workspace' || currentView === 'complete' ? 'banner__nav-link--active' : ''}`}
            onClick={onHome}
          >
            Review Queue
          </button>
          <button
            type="button"
            className={`banner__nav-link ${currentView === 'remediate' ? 'banner__nav-link--active' : ''}`}
            onClick={onRemediate}
          >
            Workbench
          </button>
        </nav>
        <p className="banner__meta">
          <span className="banner__meta-label">ADA Title&nbsp;II deadline</span>
          <span className="banner__meta-value">April 2027</span>
        </p>
      </div>
    </header>
  )
}
