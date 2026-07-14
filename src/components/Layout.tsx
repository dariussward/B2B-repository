import { NavLink } from 'react-router-dom';

function BrandMark() {
  return (
    <span className="brand__mark" aria-hidden>
      <svg viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="10" r="5" stroke="#E8F0EC" strokeWidth="2" />
        <circle cx="12" cy="10" r="1.75" fill="#C4A574" />
        <path
          d="M12 15v5"
          stroke="#E8F0EC"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}

export function Header() {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <NavLink to="/" className="brand">
          <BrandMark />
          Locus
        </NavLink>
        <nav className="nav" aria-label="Primary">
          <NavLink to="/" end>
            Overview
          </NavLink>
          <NavLink to="/scout">Scout</NavLink>
          <NavLink to="/partner">Partner</NavLink>
        </nav>
        <NavLink to="/partner" className="btn btn-primary">
          Top 10 report
        </NavLink>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="site-footer">
      <p>
        <strong>Locus</strong> — franchise location intelligence. Metrics scored
        on a 50-point scale.
      </p>
    </footer>
  );
}
