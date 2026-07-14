import { useMemo, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { locations } from '../data/locations';
import { formatRecommendation } from '../lib/scoring';
import type { LocationProfile } from '../types';

function pinStyle(loc: LocationProfile): CSSProperties {
  // Rough US-ish projection for demo map pins
  const left = ((loc.lng + 125) / 55) * 100;
  const top = ((50 - loc.lat) / 28) * 100;
  return {
    left: `${Math.min(92, Math.max(8, left))}%`,
    top: `${Math.min(88, Math.max(12, top))}%`,
  };
}

export function ScoutPage() {
  const [query, setQuery] = useState('');
  const [region, setRegion] = useState('all');
  const [selectedId, setSelectedId] = useState(locations[0]?.id ?? '');

  const regions = useMemo(
    () => ['all', ...Array.from(new Set(locations.map((l) => l.region)))],
    [],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return [...locations]
      .filter((l) => (region === 'all' ? true : l.region === region))
      .filter((l) =>
        q
          ? `${l.name} ${l.city} ${l.state} ${l.region}`
              .toLowerCase()
              .includes(q)
          : true,
      )
      .sort((a, b) => b.overallScore - a.overallScore);
  }, [query, region]);

  const selected =
    filtered.find((l) => l.id === selectedId) ?? filtered[0] ?? null;

  return (
    <>
      <div className="page-head fade-up">
        <h1>Scout markets</h1>
        <p>
          Filter trade areas by region, compare overall fit, and drill into
          every metric on a 50-point scale.
        </p>
      </div>

      <div className="scout-toolbar fade-up fade-up-delay-1">
        <input
          type="search"
          placeholder="Search city, district, or state…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search locations"
        />
        <select
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          aria-label="Filter by region"
        >
          {regions.map((r) => (
            <option key={r} value={r}>
              {r === 'all' ? 'All regions' : r}
            </option>
          ))}
        </select>
      </div>

      <div className="scout-layout fade-up fade-up-delay-2">
        <div className="location-list">
          {filtered.length === 0 && (
            <div className="empty-state">No markets match that filter.</div>
          )}
          {filtered.map((loc) => {
            const rec = formatRecommendation(loc.recommendation);
            const topMetrics = [...loc.metrics]
              .sort((a, b) => b.score - a.score)
              .slice(0, 3);
            return (
              <button
                key={loc.id}
                type="button"
                className={`location-card${selected?.id === loc.id ? ' is-active' : ''}`}
                onClick={() => setSelectedId(loc.id)}
              >
                <div className="location-card__top">
                  <div>
                    <h3>{loc.name}</h3>
                    <div className="location-card__place">
                      {loc.city}, {loc.state} · {loc.region}
                    </div>
                  </div>
                  <div className="score-badge">
                    <span className="score-badge__num">{loc.overallScore}</span>
                    <span className="score-badge__denom">/50</span>
                  </div>
                </div>
                <span className={`rec-pill ${rec.tone}`}>{rec.label}</span>
                <p className="location-card__summary">{loc.summary}</p>
                <div className="location-card__metrics">
                  {topMetrics.map((m) => (
                    <span key={m.key} className="mini-score">
                      {m.label}: {m.score}/50
                    </span>
                  ))}
                </div>
              </button>
            );
          })}
        </div>

        <aside className="map-panel" aria-label="Market map preview">
          <div className="map-panel__canvas">
            {filtered.map((loc) => (
              <button
                key={loc.id}
                type="button"
                className={`map-pin${selected?.id === loc.id ? ' is-active' : ''}`}
                style={pinStyle(loc)}
                title={`${loc.name}, ${loc.city}`}
                aria-label={`${loc.name}, ${loc.city}`}
                onClick={() => setSelectedId(loc.id)}
              />
            ))}
          </div>
          {selected && (
            <div className="map-panel__body">
              <h3>{selected.name}</h3>
              <div className="place">
                {selected.city}, {selected.state} · {selected.tradeArea}
              </div>
              <div className="map-panel__stats">
                <div>
                  <strong>{selected.overallScore}/50</strong>
                  <span>Overall</span>
                </div>
                <div>
                  <strong>
                    ${(selected.medianIncome / 1000).toFixed(0)}k
                  </strong>
                  <span>Income</span>
                </div>
                <div>
                  <strong>
                    {(selected.population / 1000).toFixed(0)}k
                  </strong>
                  <span>Pop.</span>
                </div>
              </div>
              <Link
                to={`/location/${selected.id}`}
                className="btn btn-copper"
                style={{ width: '100%' }}
              >
                Full score report
              </Link>
            </div>
          )}
        </aside>
      </div>
    </>
  );
}
