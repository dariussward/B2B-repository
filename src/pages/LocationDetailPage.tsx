import { Link, useParams } from 'react-router-dom';
import { getLocationById } from '../data/locations';
import { formatRecommendation } from '../lib/scoring';

export function LocationDetailPage() {
  const { id } = useParams();
  const loc = id ? getLocationById(id) : undefined;

  if (!loc) {
    return (
      <div className="empty-state">
        <p>Location not found.</p>
        <Link to="/scout" className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Back to scout
        </Link>
      </div>
    );
  }

  const rec = formatRecommendation(loc.recommendation);
  const demoEntries = [
    { label: 'Ages 18–34', value: loc.demographics.age18to34 },
    { label: 'Ages 35–54', value: loc.demographics.age35to54 },
    { label: 'Families with children', value: loc.demographics.familiesWithChildren },
    { label: 'College educated', value: loc.demographics.collegeEducated },
  ];

  return (
    <>
      <div className="detail-hero fade-up">
        <div>
          <Link to="/scout" className="detail-hero__back">
            ← Back to scout
          </Link>
          <h1>{loc.name}</h1>
          <div className="place">
            {loc.city}, {loc.state} · {loc.region} · {loc.tradeArea}
          </div>
          <p className="summary">{loc.summary}</p>
        </div>
        <div className="overall-score">
          <div className="overall-score__label">Overall fit</div>
          <div className="overall-score__value">
            {loc.overallScore}
            <span>/50</span>
          </div>
          <span className={`rec-pill ${rec.tone}`}>{rec.label}</span>
        </div>
      </div>

      <div className="detail-grid fade-up fade-up-delay-1">
        <section className="panel">
          <h2>Metric scores</h2>
          <div className="score-rows">
            {loc.metrics.map((m, i) => (
              <div key={m.key} className="score-row">
                <div className="score-row__head">
                  <strong>{m.label}</strong>
                  <span className="score">
                    {m.score}
                    <span style={{ opacity: 0.5 }}>/50</span>
                  </span>
                </div>
                <div className="score-row__bar">
                  <div
                    className="score-row__fill"
                    style={{
                      width: `${(m.score / 50) * 100}%`,
                      animationDelay: `${i * 0.05}s`,
                    }}
                  />
                </div>
                <div className="score-row__meta">
                  <em>{m.value}</em>
                  <span>{m.insight}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="stack-gap">
          <section className="panel">
            <h2>Market snapshot</h2>
            <div className="facts">
              <div className="fact">
                <span>Population</span>
                <strong>{loc.population.toLocaleString()}</strong>
              </div>
              <div className="fact">
                <span>Daytime pop.</span>
                <strong>{loc.daytimePopulation.toLocaleString()}</strong>
              </div>
              <div className="fact">
                <span>Median income</span>
                <strong>${loc.medianIncome.toLocaleString()}</strong>
              </div>
              <div className="fact">
                <span>Median age</span>
                <strong>{loc.medianAge}</strong>
              </div>
              <div className="fact">
                <span>HH size</span>
                <strong>{loc.householdSize}</strong>
              </div>
              <div className="fact">
                <span>5-yr growth</span>
                <strong>
                  {loc.growthRate5yr >= 0 ? '+' : ''}
                  {loc.growthRate5yr}%
                </strong>
              </div>
              <div className="fact">
                <span>Competitors</span>
                <strong>{loc.competitorsNearby}</strong>
              </div>
              <div className="fact">
                <span>Est. rent</span>
                <strong>${loc.avgCommercialRent}/sqft</strong>
              </div>
            </div>

            <h2 style={{ marginTop: '0.5rem' }}>Demographics</h2>
            <div className="demo-bars">
              {demoEntries.map((d) => (
                <div key={d.label} className="demo-bar">
                  <span>{d.label}</span>
                  <strong>{d.value}%</strong>
                  <div className="demo-bar__track">
                    <div
                      className="demo-bar__fill"
                      style={{ width: `${d.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="panel">
            <h2>Recent & planned developments</h2>
            <div className="dev-list">
              {loc.developments.map((d) => (
                <article key={d.name} className="dev-item">
                  <div className="dev-item__top">
                    <strong>{d.name}</strong>
                    <span className="dev-item__status">
                      {d.status.replace('-', ' ')} · {d.year}
                    </span>
                  </div>
                  <p>
                    {d.type} — {d.impact}
                  </p>
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
