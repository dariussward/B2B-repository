import { intelligenceDb } from '../data/intelligence/database';
import type {
  Client,
  DemographicArea,
  DevelopmentProject,
  IntelligenceTableKey,
  Report,
  RetailCenter,
} from '../types/intelligence';

export const TABLE_LABELS: Record<IntelligenceTableKey, string> = {
  retailCenters: 'Retail Centers',
  businesses: 'Businesses / Tenants',
  demographics: 'Demographics',
  competitors: 'Competitors',
  developments: 'Development Projects',
  franchiseRequirements: 'Franchise Requirements',
  opportunities: 'Opportunities',
  clients: 'Clients',
  reports: 'Reports',
};

export type SavedViewId =
  | 'all'
  | 'vacant'
  | 'high-traffic'
  | 'drive-thru'
  | 'top-scoring'
  | 'new-developments'
  | 'high-income'
  | 'active-clients'
  | 'reports-sent';

export interface SavedView {
  id: SavedViewId;
  label: string;
  table: IntelligenceTableKey;
  description: string;
}

export const SAVED_VIEWS: SavedView[] = [
  {
    id: 'vacant',
    label: 'Vacant Retail Centers',
    table: 'retailCenters',
    description: 'Centers with vacancies or available SF',
  },
  {
    id: 'high-traffic',
    label: 'High Traffic Locations',
    table: 'retailCenters',
    description: 'AADT ≥ 35,000',
  },
  {
    id: 'drive-thru',
    label: 'Drive-Thru Opportunities',
    table: 'retailCenters',
    description: 'Drive-thru capable with available SF',
  },
  {
    id: 'top-scoring',
    label: 'Top Scoring Locations',
    table: 'retailCenters',
    description: 'Ranked by overall location score',
  },
  {
    id: 'new-developments',
    label: 'New Developments',
    table: 'developments',
    description: 'Planned, entitled, or under construction',
  },
  {
    id: 'high-income',
    label: 'High Income Markets',
    table: 'demographics',
    description: 'Median HH income ≥ $100k',
  },
  {
    id: 'active-clients',
    label: 'Active Clients',
    table: 'clients',
    description: 'Active or proposal sent',
  },
  {
    id: 'reports-sent',
    label: 'Reports Sent',
    table: 'reports',
    description: 'Delivered client reports',
  },
];

export function filterRetailCenters(
  view: SavedViewId,
  city: string,
  query: string,
  minScore: number,
  driveThruOnly: boolean,
): RetailCenter[] {
  let rows = [...intelligenceDb.retailCenters];

  if (view === 'vacant') {
    rows = rows.filter((r) => r.vacancies > 0 || r.availableSqft > 0);
  } else if (view === 'high-traffic') {
    rows = rows.filter((r) => r.trafficAadt >= 35000);
  } else if (view === 'drive-thru') {
    rows = rows.filter((r) => r.driveThru && r.availableSqft > 0);
  } else if (view === 'top-scoring') {
    rows = [...rows].sort((a, b) => b.overallScore - a.overallScore).slice(0, 100);
  }

  if (driveThruOnly) rows = rows.filter((r) => r.driveThru);
  if (city !== 'all') rows = rows.filter((r) => r.city === city);
  if (minScore > 0) rows = rows.filter((r) => r.overallScore >= minScore);

  const q = query.trim().toLowerCase();
  if (q) {
    rows = rows.filter((r) =>
      `${r.name} ${r.city} ${r.state} ${r.propertyType} ${r.owner}`
        .toLowerCase()
        .includes(q),
    );
  }

  if (view !== 'top-scoring') {
    rows.sort((a, b) => b.overallScore - a.overallScore);
  }
  return rows;
}

export function filterDevelopments(view: SavedViewId, city: string, query: string) {
  let rows: DevelopmentProject[] = [...intelligenceDb.developments];
  if (view === 'new-developments') {
    rows = rows.filter((d) =>
      ['Planned', 'Entitled', 'Under Construction'].includes(d.status),
    );
  }
  if (city !== 'all') rows = rows.filter((d) => d.city === city);
  const q = query.trim().toLowerCase();
  if (q) {
    rows = rows.filter((d) =>
      `${d.name} ${d.city} ${d.developer} ${d.projectType}`.toLowerCase().includes(q),
    );
  }
  return rows.sort((a, b) =>
    a.expectedCompletion.localeCompare(b.expectedCompletion),
  );
}

export function filterDemographics(view: SavedViewId, query: string) {
  let rows: DemographicArea[] = [...intelligenceDb.demographics];
  if (view === 'high-income') {
    rows = rows.filter((d) => d.medianHouseholdIncome >= 100000);
  }
  const q = query.trim().toLowerCase();
  if (q) {
    rows = rows.filter((d) => d.areaName.toLowerCase().includes(q));
  }
  return rows.sort((a, b) => b.medianHouseholdIncome - a.medianHouseholdIncome);
}

export function filterClients(view: SavedViewId, query: string) {
  let rows: Client[] = [...intelligenceDb.clients];
  if (view === 'active-clients') {
    rows = rows.filter((c) => c.status === 'Active' || c.status === 'Proposal Sent');
  }
  const q = query.trim().toLowerCase();
  if (q) {
    rows = rows.filter((c) =>
      `${c.companyName} ${c.contactName} ${c.industry}`.toLowerCase().includes(q),
    );
  }
  return rows.sort((a, b) => a.companyName.localeCompare(b.companyName));
}

export function filterReports(view: SavedViewId, query: string) {
  let rows: Report[] = [...intelligenceDb.reports];
  if (view === 'reports-sent') {
    rows = rows.filter((r) => r.status === 'Sent');
  }
  const q = query.trim().toLowerCase();
  if (q) {
    rows = rows.filter((r) =>
      `${r.name} ${r.market} ${r.industry}`.toLowerCase().includes(q),
    );
  }
  return rows.sort((a, b) => b.date.localeCompare(a.date));
}

export function citiesInDb(): string[] {
  return Array.from(
    new Set(intelligenceDb.retailCenters.map((r) => r.city)),
  ).sort();
}

export function centerName(id: string): string {
  return intelligenceDb.retailCenters.find((r) => r.id === id)?.name ?? id;
}

export function clientName(id: string): string {
  return intelligenceDb.clients.find((c) => c.id === id)?.companyName ?? id;
}

export function dbStats() {
  return {
    centers: intelligenceDb.retailCenters.length,
    tenants: intelligenceDb.businesses.length,
    opportunities: intelligenceDb.opportunities.length,
    developments: intelligenceDb.developments.length,
    clients: intelligenceDb.clients.length,
    reports: intelligenceDb.reports.length,
    avgScore: Math.round(
      intelligenceDb.retailCenters.reduce((s, r) => s + r.overallScore, 0) /
        (intelligenceDb.retailCenters.length || 1),
    ),
    topScore: Math.max(
      ...intelligenceDb.retailCenters.map((r) => r.overallScore),
    ),
  };
}
