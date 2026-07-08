import { LOGO_HEART_SVG } from '../logoIcon.js';
import { HOW_IT_WORKS_SVG } from '../howItWorksIcon.js';

export default function Header({ onShowHowItWorks }) {
  return (
    <header className="app-header">
      <div className="app-header__brand">
        <span
          className="app-header__logo"
          aria-hidden="true"
          dangerouslySetInnerHTML={{ __html: LOGO_HEART_SVG }}
        />
        <div>
          <span className="app-header__title">MediDash</span>
          <span className="app-header__tagline">Find cashless network hospitals near you</span>
        </div>
      </div>
      <nav className="app-header__nav">
        <button className="app-header__nav-item" onClick={onShowHowItWorks}>
          <span
            className="app-header__nav-icon"
            aria-hidden="true"
            dangerouslySetInnerHTML={{ __html: HOW_IT_WORKS_SVG }}
          />
          How it works
        </button>
      </nav>
    </header>
  );
}
