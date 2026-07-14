import { Link, Navigate, useParams } from 'react-router-dom';
import { featuredBusiness, getBusinessById } from '../data/businesses';
import { locations } from '../data/locations';
import {
  formatRecommendation,
  getTopLocationsForBusiness,
} from '../lib/scoring';
import { METRIC_LABELS, type MetricKey } from '../types';

export function PartnerTop10Page() {
  const { businessId } = useParams();
  const business =
    (businessId ? getBusinessById(businessId) : undefined) ?? featuredBusiness;

  if (businessId && !getBusinessById(businessId)) {
    return <Navigate to={`/partner/${featuredBusiness.id}`} replace />;
  }

  const top10 = getTopLocationsForBusiness(locations, business, 10);
  const avgScore = Math.round(
    top10.reduce((sum, e) => sum + e.overallScore, 0) / (top10.length || 1),
  );
  const strongCount = top10.filter(
    (e) => e.recommendation === 'strong-fit',
  ).length;

  const weightEntries = (
    Object.keys(METRIC_LABELS) as MetricKey[]
  ).map((key) => ({
    key,
    label: METRIC_LABELS[key],
    weight: business.metricWeights?.[key] ?? 1,
  }));

  return (
    <>
      <section className="partner-hero fade-up">
        <div className="partner-hero__copy">
          <p className="section__eyebrow">Partnership engagement</p>
          <h1>
            Locus × {business.name}
          </h1>
          <p className="partner-hero__tagline">{business.tagline}</p>
          <p className="partner-hero__desc">{business.description}</p>
          <div className="partner-meta">
            <div>
              <span>Partner</span>
              <strong>{business.partnerName}</strong>
            </div>
            <div>
              <span>Category</span>
              <strong>{business.category}</strong>
            </div>
            <div>
              <span>Format</span>
              <strong>{business.format}</strong>
            </div>
          </div>
        </div>
        <aside className="partner-hero__stats" aria-label="Shortlist summary">
          <div className="partner-stat">
            <strong>10</strong>
            <span>Markets shortlisted</span>
          </div>
          <div className="partner-stat">
            <strong>{avgScore}</strong>
            <span>Avg fit /50</span>
          </div>
          <div className="partner-stat">
            <strong>{strongCount}</strong>
            <span>Strong-fit picks</span>
          </div>
          <div className="partner-stat">
            <strong>{locations.length}</strong>
            <span>Markets scored</span>
          </div>
        </aside>
      </section>

      <section className="section partner-profile fade-up fade-up-delay-1">
        <p className="section__eyebrow">Concept profile</p>
        <h2 className="section__title">What we optimized for</h2>
        <p className="section__lead">
          Demographic fit, income band, and competition tolerance are aligned to{' '}
          {business.name}&apos;s winning units — then every trade area is rescored
          on the Locus 50-point metric system.
        </p>
        <div className="partner-profile__grid">
          <div className="panel partner-priorities">
            <h3>Expansion priorities</h3>
            <ul>
              {business.priorities.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
            <div className="partner-band">
              <span>Target income</span>
              <strong>
                ${(business.targetIncomeMin / 1000).toFixed(0)}k – $
                {(business.targetIncomeMax / 1000).toFixed(0)}k
              </strong>
            </div>
            <div className="partner-band">
              <span>Competition tolerance</span>
              <strong>≤ {business.competitionTolerance} similar concepts</strong>
            </div>
          </div>
          <div className="panel">
            <h3>Metric weights for this brand</h3>
            <p className="panel__note">
              Heavier weights pull the overall fit toward signals that matter most
              for {business.name}.
            </p>
            <div className="weight-list">
              {weightEntries
                .sort((a, b) => b.weight - a.weight)
                .map((w) => (
                  <div key={w.key} className="weight-row">
                    <span>{w.label}</span>
                    <div className="weight-row__bar">
                      <div
                        className="weight-row__fill"
                        style={{ width: `${(w.weight / 1.4) * 100}%` }}
                      />
                    </div>
                    <em>{w.weight.toFixed(2)}×</em>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section partner-top10 fade-up fade-up-delay-2">
        <p className="section__eyebrow">Deliverable</p>
        <h2 className="section__title">Top 10 locations for {business.name}</h2>
        <p className="section__lead">
          Ranked by business-specific overall fit. Open any market for the full
          metric breakdown, or continue in Scout to compare the wider set.
        </p>

        <ol className="top10-list">
          {top10.map((entry) => {
            const rec = formatRecommendation(entry.recommendation);
            const loc = entry.location;
            const highlightMetrics = [...entry.metrics]
              .sort((a, b) => b.score - a.score)
              .slice(0, 3);
            return (
              <li key={loc.id} className="top10-card">
                <div className="top10-card__rank" aria-label={`Rank ${entry.rank}`}>
                  {entry.rank}
                </div>
                <div className="top10-card__body">
                  <div className="top10-card__head">
                    <div>
                      <h3>{loc.name}</h3>
                      <div className="place">
                        {loc.city}, {loc.state} · {loc.region} · {loc.tradeArea}
                      </div>
                    </div>
                    <div className="top10-card__scores">
                      <div className="score-badge">
                        <span className="score-badge__num">
                          {entry.overallScore}
                        </span>
                        <span className="score-badge__denom">/50</span>
                      </div>
                      <span className={`rec-pill ${rec.tone}`}>{rec.label}</span>
                    </div>
                  </div>
                  <p className="top10-card__summary">{loc.summary}</p>
                  <div className="top10-card__metrics">
                    {highlightMetrics.map((m) => (
                      <span key={m.key} className="mini-score">
                        {m.label}: {m.score}/50
                      </span>
                    ))}
                    <span className="mini-score mini-score--accent">
                      Brand fit: {entry.demographicsFit}%
                    </span>
                  </div>
                  <div className="top10-card__actions">
                    <Link
                      to={`/location/${loc.id}`}
                      className="btn btn-copper"
                    >
                      Full score report
                    </Link>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>

        <div className="partner-footer-cta">
          <Link to="/scout" className="btn btn-primary">
            Compare all markets in Scout
          </Link>
          <Link to="/" className="btn btn-ghost">
            Back to overview
          </Link>
        </div>
      </section>
    </>
  );
}
