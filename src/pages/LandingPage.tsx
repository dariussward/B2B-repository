import { Link } from 'react-router-dom';
import { getTopLocations, getTopLocationsInCity } from '../data/locations';
import { formatRecommendation } from '../lib/scoring';

const METRIC_PREVIEWS = [
  { name: 'Population', desc: 'Trade-area density & daytime draw' },
  { name: 'Median Income', desc: 'Household purchasing power' },
  { name: 'Traffic', desc: 'Footfall, walk & transit exposure' },
  { name: 'Demographics', desc: 'Age, education & household fit' },
  { name: 'Competition', desc: 'Similar concepts in radius' },
  { name: 'Developments', desc: 'Planned & recent projects' },
  { name: 'Workforce', desc: 'Labor availability & cost' },
  { name: 'Accessibility', desc: 'Ingress, parking & transit' },
  { name: 'Commercial Rent', desc: 'NNN economics for unit P&L' },
  { name: 'Growth', desc: '5-year population & income trend' },
];

export function LandingPage() {
  const top = getTopLocations(3);
  const irvineTop = getTopLocationsInCity('Irvine', 5);

  return (
    <>
      <section className="hero">
        <div className="hero__media" aria-hidden />
        <div className="hero__content">
          <h1 className="hero__brand fade-up">Locus</h1>
          <p className="hero__headline fade-up fade-up-delay-1">
            Find where your franchise should expand next.
          </p>
          <p className="hero__sub fade-up fade-up-delay-2">
            Population, demographics, income, traffic, and development pipelines
            — scored on a clear 50-point scale so site selection is evidence, not
            guesswork.
          </p>
          <div className="hero__ctas fade-up fade-up-delay-3">
            <Link to="/scout" className="btn btn-primary">
              Scout locations
            </Link>
            <a href="#metrics" className="btn btn-ghost">
              See what we score
            </a>
          </div>
        </div>
      </section>

      <section className="section" id="metrics">
        <p className="section__eyebrow">50-point scoring</p>
        <h2 className="section__title">Every signal, on the same scale</h2>
        <p className="section__lead">
          Each metric is normalized to 0–50 so your team can compare markets
          side-by-side — traffic 45/50, median income 50/50, and so on.
        </p>
        <div className="metrics-grid">
          {METRIC_PREVIEWS.map((m) => (
            <div key={m.name} className="metric-chip">
              <strong>{m.name}</strong>
              <span>{m.desc}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <p className="section__eyebrow">How it works</p>
        <h2 className="section__title">From market shortlist to site decision</h2>
        <p className="section__lead">
          Built for franchise development teams who need denser signal before
          committing to a lease tour.
        </p>
        <div className="how-steps">
          <div className="how-step">
            <div className="how-step__num">1</div>
            <div>
              <h3>Define the concept profile</h3>
              <p>
                Align demographic fit, income band, and competition tolerance to
                your brand’s winning units.
              </p>
            </div>
          </div>
          <div className="how-step">
            <div className="how-step__num">2</div>
            <div>
              <h3>Scout trade areas</h3>
              <p>
                Review population, daytime draw, accessibility, rents, and the
                development pipeline for each candidate market.
              </p>
            </div>
          </div>
          <div className="how-step">
            <div className="how-step__num">3</div>
            <div>
              <h3>Rank by scored metrics</h3>
              <p>
                Weighted 50-point scores surface strong-fit markets and flag
                watch-list risk before you spend on site tours.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <p className="section__eyebrow">Live sample markets</p>
        <h2 className="section__title">Top-scoring trade areas</h2>
        <p className="section__lead">
          Explore demo markets scored with the full Locus metric set.
        </p>
        <div className="preview-list">
          {top.map((loc) => {
            const rec = formatRecommendation(loc.recommendation);
            return (
              <Link
                key={loc.id}
                to={`/location/${loc.id}`}
                className="preview-row"
              >
                <div className="preview-row__meta">
                  <h3>{loc.name}</h3>
                  <span className="place">
                    {loc.city}, {loc.state}
                  </span>
                  <span className={`rec-pill ${rec.tone}`}>{rec.label}</span>
                </div>
                <div className="score-badge" aria-label={`Overall ${loc.overallScore} out of 50`}>
                  <span className="score-badge__num">{loc.overallScore}</span>
                  <span className="score-badge__denom">/50</span>
                </div>
              </Link>
            );
          })}
        </div>
        <div style={{ marginTop: '1.75rem' }}>
          <Link to="/scout" className="btn btn-copper">
            Browse all markets
          </Link>
        </div>
      </section>

      {irvineTop.length > 0 && (
        <section className="section" style={{ paddingTop: 0 }}>
          <p className="section__eyebrow">Irvine, CA</p>
          <h2 className="section__title">Top metric locations in Irvine</h2>
          <p className="section__lead">
            Ranked by weighted 50-point fit across population, income, traffic,
            demographics, competition, developments, and growth.
          </p>
          <div className="preview-list">
            {irvineTop.map((loc, i) => {
              const rec = formatRecommendation(loc.recommendation);
              const strongest = [...loc.metrics]
                .sort((a, b) => b.score - a.score)
                .slice(0, 2);
              return (
                <Link
                  key={loc.id}
                  to={`/location/${loc.id}`}
                  className="preview-row"
                >
                  <div className="preview-row__meta">
                    <h3>
                      #{i + 1} {loc.name}
                    </h3>
                    <span className="place">
                      {loc.tradeArea} · {strongest.map((m) => `${m.label} ${m.score}`).join(' · ')}
                    </span>
                    <span className={`rec-pill ${rec.tone}`}>{rec.label}</span>
                  </div>
                  <div
                    className="score-badge"
                    aria-label={`Overall ${loc.overallScore} out of 50`}
                  >
                    <span className="score-badge__num">{loc.overallScore}</span>
                    <span className="score-badge__denom">/50</span>
                  </div>
                </Link>
              );
            })}
          </div>
          <div style={{ marginTop: '1.75rem' }}>
            <Link to="/scout?q=Irvine" className="btn btn-ghost">
              Scout all Irvine markets
            </Link>
          </div>
        </section>
      )}
    </>
  );
}
