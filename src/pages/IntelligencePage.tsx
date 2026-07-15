import { useMemo, useState } from 'react';
import { intelligenceDb } from '../data/intelligence/database';
import {
  SAVED_VIEWS,
  TABLE_LABELS,
  centerName,
  citiesInDb,
  clientName,
  dbStats,
  filterClients,
  filterDemographics,
  filterDevelopments,
  filterReports,
  filterRetailCenters,
  type SavedViewId,
} from '../lib/intelligenceViews';
import type { IntelligenceTableKey } from '../types/intelligence';

const TABLE_KEYS = Object.keys(TABLE_LABELS) as IntelligenceTableKey[];

function money(n: number) {
  return '$' + n.toLocaleString();
}

function pct(n: number) {
  return n.toFixed(1) + '%';
}

export function IntelligencePage() {
  const stats = dbStats();
  const cities = citiesInDb();
  const [table, setTable] = useState<IntelligenceTableKey>('retailCenters');
  const [view, setView] = useState<SavedViewId>('top-scoring');
  const [city, setCity] = useState('all');
  const [query, setQuery] = useState('');
  const [minScore, setMinScore] = useState(0);
  const [driveThruOnly, setDriveThruOnly] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const applicableViews = useMemo(
    () => SAVED_VIEWS.filter((v) => v.table === table),
    [table],
  );

  const retailRows = useMemo(
    () => filterRetailCenters(view, city, query, minScore, driveThruOnly),
    [view, city, query, minScore, driveThruOnly],
  );

  const developmentRows = useMemo(
    () => filterDevelopments(view, city, query),
    [view, city, query],
  );
  const demographicRows = useMemo(
    () => filterDemographics(view, query),
    [view, query],
  );
  const clientRows = useMemo(() => filterClients(view, query), [view, query]);
  const reportRows = useMemo(() => filterReports(view, query), [view, query]);

  function switchTable(next: IntelligenceTableKey) {
    setTable(next);
    setSelectedId(null);
    const first = SAVED_VIEWS.find((v) => v.table === next);
    setView(first?.id ?? 'all');
  }

  function switchView(next: SavedViewId) {
    setView(next);
    setSelectedId(null);
    const meta = SAVED_VIEWS.find((v) => v.id === next);
    if (meta && meta.table !== table) setTable(meta.table);
  }

  const selectedCenter = selectedId
    ? intelligenceDb.retailCenters.find((r) => r.id === selectedId)
    : null;
  const selectedDemo = selectedCenter
    ? intelligenceDb.demographics.find(
        (d) => d.id === selectedCenter.demographicsId,
      )
    : null;
  const selectedTenants = selectedCenter
    ? intelligenceDb.businesses.filter(
        (b) => b.retailCenterId === selectedCenter.id,
      )
    : [];
  const selectedOpps = selectedCenter
    ? intelligenceDb.opportunities.filter(
        (o) => o.retailCenterId === selectedCenter.id,
      )
    : [];
  const selectedDevs = selectedCenter
    ? intelligenceDb.developments.filter((d) =>
        d.nearbyRetailCenterIds.includes(selectedCenter.id),
      )
    : [];

  return (
    <>
      <div className="page-head fade-up">
        <h1>Location Intelligence Database</h1>
        <p>
          Relational CRE workspace — retail centers, tenants, demographics,
          competitors, developments, franchise criteria, opportunities, clients,
          and reports. Mirrors the Airtable base schema.
        </p>
      </div>

      <div className="intel-stats fade-up fade-up-delay-1">
        <div>
          <strong>{stats.centers}</strong>
          <span>Retail centers</span>
        </div>
        <div>
          <strong>{stats.opportunities}</strong>
          <span>Opportunities</span>
        </div>
        <div>
          <strong>{stats.developments}</strong>
          <span>Developments</span>
        </div>
        <div>
          <strong>{stats.clients}</strong>
          <span>Clients</span>
        </div>
        <div>
          <strong>{stats.avgScore}</strong>
          <span>Avg score</span>
        </div>
        <div>
          <strong>{stats.topScore}</strong>
          <span>Top score</span>
        </div>
      </div>

      <div className="intel-views fade-up fade-up-delay-1">
        {SAVED_VIEWS.map((v) => (
          <button
            key={v.id}
            type="button"
            className={`intel-view-chip${view === v.id ? ' is-active' : ''}`}
            onClick={() => switchView(v.id)}
            title={v.description}
          >
            {v.label}
          </button>
        ))}
      </div>

      <div className="scout-toolbar fade-up fade-up-delay-2">
        <input
          type="search"
          placeholder="Search city, center, brand, project…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search database"
        />
        <select
          value={city}
          onChange={(e) => setCity(e.target.value)}
          aria-label="Filter by city"
        >
          <option value="all">All cities</option>
          {cities.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          value={minScore}
          onChange={(e) => setMinScore(Number(e.target.value))}
          aria-label="Minimum overall score"
        >
          <option value={0}>Any score</option>
          <option value={80}>Score ≥ 80</option>
          <option value={85}>Score ≥ 85</option>
          <option value={90}>Score ≥ 90</option>
        </select>
        <label className="intel-check">
          <input
            type="checkbox"
            checked={driveThruOnly}
            onChange={(e) => setDriveThruOnly(e.target.checked)}
          />
          Drive-thru only
        </label>
      </div>

      <div className="intel-tabs fade-up fade-up-delay-2">
        {TABLE_KEYS.map((key) => (
          <button
            key={key}
            type="button"
            className={`intel-tab${table === key ? ' is-active' : ''}`}
            onClick={() => switchTable(key)}
          >
            {TABLE_LABELS[key]}
            {applicableViews.some((v) => v.id === view) && table === key ? (
              <em>view</em>
            ) : null}
          </button>
        ))}
      </div>

      <div className="intel-layout fade-up fade-up-delay-3">
        <div className="intel-table-wrap">
          {table === 'retailCenters' && (
            <table className="intel-table">
              <thead>
                <tr>
                  <th>Center</th>
                  <th>City</th>
                  <th>Type</th>
                  <th>SF</th>
                  <th>Vacant SF</th>
                  <th>AADT</th>
                  <th>DT</th>
                  <th>Score</th>
                </tr>
              </thead>
              <tbody>
                {retailRows.map((r) => (
                  <tr
                    key={r.id}
                    className={selectedId === r.id ? 'is-active' : ''}
                    onClick={() => setSelectedId(r.id)}
                  >
                    <td>
                      <strong>{r.name}</strong>
                    </td>
                    <td>
                      {r.city}, {r.state}
                    </td>
                    <td>{r.propertyType}</td>
                    <td>{r.totalSqft.toLocaleString()}</td>
                    <td>{r.availableSqft.toLocaleString()}</td>
                    <td>{r.trafficAadt.toLocaleString()}</td>
                    <td>{r.driveThru ? 'Yes' : '—'}</td>
                    <td>
                      <span className="score-inline">{r.overallScore}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {table === 'businesses' && (
            <table className="intel-table">
              <thead>
                <tr>
                  <th>Business</th>
                  <th>Category</th>
                  <th>Franchise</th>
                  <th>Center</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {intelligenceDb.businesses
                  .filter((b) => {
                    const center = intelligenceDb.retailCenters.find(
                      (c) => c.id === b.retailCenterId,
                    );
                    if (city !== 'all' && center?.city !== city) return false;
                    const q = query.trim().toLowerCase();
                    if (!q) return true;
                    return `${b.name} ${b.category} ${centerName(b.retailCenterId)}`
                      .toLowerCase()
                      .includes(q);
                  })
                  .map((b) => (
                    <tr key={b.id} onClick={() => setSelectedId(b.retailCenterId)}>
                      <td>
                        <strong>{b.name}</strong>
                      </td>
                      <td>{b.category}</td>
                      <td>{b.franchise ? 'Yes' : 'No'}</td>
                      <td>{centerName(b.retailCenterId)}</td>
                      <td>{b.status}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}

          {table === 'demographics' && (
            <table className="intel-table">
              <thead>
                <tr>
                  <th>Area</th>
                  <th>Population</th>
                  <th>Growth</th>
                  <th>Income</th>
                  <th>Home value</th>
                  <th>Daytime</th>
                </tr>
              </thead>
              <tbody>
                {demographicRows.map((d) => (
                  <tr key={d.id}>
                    <td>
                      <strong>{d.areaName}</strong>
                    </td>
                    <td>{d.population.toLocaleString()}</td>
                    <td>{pct(d.populationGrowthPct)}</td>
                    <td>{money(d.medianHouseholdIncome)}</td>
                    <td>{money(d.medianHomeValue)}</td>
                    <td>{d.daytimePopulation.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {table === 'competitors' && (
            <table className="intel-table">
              <thead>
                <tr>
                  <th>Business</th>
                  <th>Brand</th>
                  <th>Industry</th>
                  <th>City</th>
                  <th>Center</th>
                </tr>
              </thead>
              <tbody>
                {intelligenceDb.competitors
                  .filter((c) => {
                    if (city !== 'all' && c.city !== city) return false;
                    const q = query.trim().toLowerCase();
                    if (!q) return true;
                    return `${c.name} ${c.brand} ${c.industry} ${c.city}`
                      .toLowerCase()
                      .includes(q);
                  })
                  .map((c) => (
                    <tr
                      key={c.id}
                      onClick={() =>
                        c.retailCenterId && setSelectedId(c.retailCenterId)
                      }
                    >
                      <td>
                        <strong>{c.name}</strong>
                      </td>
                      <td>{c.brand}</td>
                      <td>{c.industry}</td>
                      <td>{c.city}</td>
                      <td>
                        {c.retailCenterId ? centerName(c.retailCenterId) : '—'}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}

          {table === 'developments' && (
            <table className="intel-table">
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Type</th>
                  <th>City</th>
                  <th>Status</th>
                  <th>Units</th>
                  <th>Comm. SF</th>
                  <th>Completion</th>
                </tr>
              </thead>
              <tbody>
                {developmentRows.map((d) => (
                  <tr
                    key={d.id}
                    onClick={() =>
                      d.nearbyRetailCenterIds[0] &&
                      setSelectedId(d.nearbyRetailCenterIds[0])
                    }
                  >
                    <td>
                      <strong>{d.name}</strong>
                    </td>
                    <td>{d.projectType}</td>
                    <td>{d.city}</td>
                    <td>{d.status}</td>
                    <td>{d.residentialUnits || '—'}</td>
                    <td>
                      {d.commercialSqft
                        ? d.commercialSqft.toLocaleString()
                        : '—'}
                    </td>
                    <td>{d.expectedCompletion}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {table === 'franchiseRequirements' && (
            <table className="intel-table">
              <thead>
                <tr>
                  <th>Brand</th>
                  <th>Industry</th>
                  <th>SF</th>
                  <th>Pop.</th>
                  <th>Income</th>
                  <th>Drive-thru</th>
                  <th>Traffic</th>
                </tr>
              </thead>
              <tbody>
                {intelligenceDb.franchiseRequirements
                  .filter((f) => {
                    const q = query.trim().toLowerCase();
                    if (!q) return true;
                    return `${f.brand} ${f.industry}`.toLowerCase().includes(q);
                  })
                  .map((f) => (
                    <tr key={f.id}>
                      <td>
                        <strong>{f.brand}</strong>
                      </td>
                      <td>{f.industry}</td>
                      <td>{f.typicalSqft.toLocaleString()}</td>
                      <td>{f.preferredPopulation.toLocaleString()}</td>
                      <td>{money(f.preferredIncome)}</td>
                      <td>{f.driveThruRequired ? 'Required' : 'No'}</td>
                      <td>{f.preferredTraffic.toLocaleString()}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}

          {table === 'opportunities' && (
            <table className="intel-table">
              <thead>
                <tr>
                  <th>Opportunity</th>
                  <th>Brand</th>
                  <th>Center</th>
                  <th>City</th>
                  <th>Status</th>
                  <th>Score</th>
                </tr>
              </thead>
              <tbody>
                {intelligenceDb.opportunities
                  .filter((o) => {
                    if (city !== 'all' && o.city !== city) return false;
                    const q = query.trim().toLowerCase();
                    if (!q) return true;
                    return `${o.name} ${o.clientBrand} ${o.city}`
                      .toLowerCase()
                      .includes(q);
                  })
                  .sort((a, b) => b.score - a.score)
                  .map((o) => (
                    <tr
                      key={o.id}
                      className={selectedId === o.retailCenterId ? 'is-active' : ''}
                      onClick={() => setSelectedId(o.retailCenterId)}
                    >
                      <td>
                        <strong>{o.name}</strong>
                      </td>
                      <td>{o.clientBrand}</td>
                      <td>{centerName(o.retailCenterId)}</td>
                      <td>{o.city}</td>
                      <td>{o.status}</td>
                      <td>
                        <span className="score-inline">{o.score}</span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}

          {table === 'clients' && (
            <table className="intel-table">
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Contact</th>
                  <th>Industry</th>
                  <th>Locations</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {clientRows.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <strong>{c.companyName}</strong>
                    </td>
                    <td>
                      {c.contactName}
                      <div className="muted">{c.position}</div>
                    </td>
                    <td>{c.industry}</td>
                    <td>{c.numberOfLocations}</td>
                    <td>{c.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {table === 'reports' && (
            <table className="intel-table">
              <thead>
                <tr>
                  <th>Report</th>
                  <th>Client</th>
                  <th>Market</th>
                  <th>Date</th>
                  <th>Centers</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {reportRows.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <strong>{r.name}</strong>
                    </td>
                    <td>{clientName(r.clientId)}</td>
                    <td>{r.market}</td>
                    <td>{r.date}</td>
                    <td>{r.retailCenterIds.length}</td>
                    <td>{r.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <aside className="intel-detail panel">
          {selectedCenter ? (
            <>
              <p className="section__eyebrow">Retail center dossier</p>
              <h2>{selectedCenter.name}</h2>
              <p className="place">
                {selectedCenter.address} · {selectedCenter.city},{' '}
                {selectedCenter.state}
              </p>
              <div className="map-panel__stats" style={{ margin: '1rem 0' }}>
                <div>
                  <strong>{selectedCenter.overallScore}</strong>
                  <span>Score</span>
                </div>
                <div>
                  <strong>
                    {(selectedCenter.trafficAadt / 1000).toFixed(0)}k
                  </strong>
                  <span>AADT</span>
                </div>
                <div>
                  <strong>
                    {(selectedCenter.availableSqft / 1000).toFixed(1)}k
                  </strong>
                  <span>Avail SF</span>
                </div>
              </div>
              <p className="intel-notes">{selectedCenter.notes}</p>
              <div className="facts" style={{ marginTop: '1rem' }}>
                <div className="fact">
                  <span>Property type</span>
                  <strong>{selectedCenter.propertyType}</strong>
                </div>
                <div className="fact">
                  <span>Drive-thru</span>
                  <strong>{selectedCenter.driveThru ? 'Yes' : 'No'}</strong>
                </div>
                <div className="fact">
                  <span>Vacancies</span>
                  <strong>{selectedCenter.vacancies}</strong>
                </div>
                <div className="fact">
                  <span>Visibility</span>
                  <strong>{selectedCenter.visibility}/10</strong>
                </div>
              </div>

              {selectedDemo && (
                <>
                  <h3 className="intel-subhead">Demographics</h3>
                  <p className="muted">{selectedDemo.areaName}</p>
                  <div className="facts">
                    <div className="fact">
                      <span>Population</span>
                      <strong>{selectedDemo.population.toLocaleString()}</strong>
                    </div>
                    <div className="fact">
                      <span>Income</span>
                      <strong>
                        {money(selectedDemo.medianHouseholdIncome)}
                      </strong>
                    </div>
                    <div className="fact">
                      <span>Growth</span>
                      <strong>{pct(selectedDemo.populationGrowthPct)}</strong>
                    </div>
                    <div className="fact">
                      <span>Daytime</span>
                      <strong>
                        {selectedDemo.daytimePopulation.toLocaleString()}
                      </strong>
                    </div>
                  </div>
                </>
              )}

              {selectedTenants.length > 0 && (
                <>
                  <h3 className="intel-subhead">Tenants</h3>
                  <ul className="intel-list">
                    {selectedTenants.map((t) => (
                      <li key={t.id}>
                        <strong>{t.name}</strong> · {t.category} · {t.status}
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {selectedOpps.length > 0 && (
                <>
                  <h3 className="intel-subhead">Opportunities</h3>
                  <ul className="intel-list">
                    {selectedOpps.map((o) => (
                      <li key={o.id}>
                        <strong>{o.score}</strong> {o.name} · {o.status}
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {selectedDevs.length > 0 && (
                <>
                  <h3 className="intel-subhead">Nearby developments</h3>
                  <ul className="intel-list">
                    {selectedDevs.map((d) => (
                      <li key={d.id}>
                        <strong>{d.name}</strong> · {d.status} ·{' '}
                        {d.expectedCompletion}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </>
          ) : (
            <>
              <p className="section__eyebrow">Relationships</p>
              <h2>Select a retail center</h2>
              <p className="intel-notes">
                Click any center-linked row to open its dossier — tenants,
                demographics, opportunities, and nearby developments in one
                place.
              </p>
              <h3 className="intel-subhead">Schema</h3>
              <ul className="intel-list">
                <li>1 center → many tenants, opportunities, competitors</li>
                <li>1 center → demographics area</li>
                <li>Centers ↔ development projects</li>
                <li>Clients → reports & opportunities</li>
                <li>Franchise requirements → opportunities</li>
              </ul>
            </>
          )}
        </aside>
      </div>
    </>
  );
}
