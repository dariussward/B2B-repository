export type MetricKey =
  | 'population'
  | 'medianIncome'
  | 'traffic'
  | 'demographics'
  | 'competition'
  | 'developments'
  | 'workforce'
  | 'accessibility'
  | 'commercialRent'
  | 'growth';

export interface MetricScore {
  key: MetricKey;
  label: string;
  score: number; // 0–50
  value: string;
  insight: string;
}

export interface Development {
  name: string;
  type: 'residential' | 'commercial' | 'infrastructure' | 'mixed-use';
  status: 'planned' | 'under-construction' | 'recently-completed';
  year: number;
  impact: string;
}

export interface LocationProfile {
  id: string;
  name: string;
  city: string;
  state: string;
  region: string;
  lat: number;
  lng: number;
  tradeArea: string;
  summary: string;
  population: number;
  medianIncome: number;
  householdSize: number;
  medianAge: number;
  daytimePopulation: number;
  unemploymentRate: number;
  growthRate5yr: number;
  competitorsNearby: number;
  avgCommercialRent: number;
  walkScore: number;
  transitScore: number;
  demographics: {
    age18to34: number;
    age35to54: number;
    familiesWithChildren: number;
    collegeEducated: number;
  };
  developments: Development[];
  metrics: MetricScore[];
  overallScore: number; // average of metrics, still on /50
  recommendation: 'strong-fit' | 'promising' | 'watch' | 'pass';
}

export const METRIC_WEIGHTS: Record<MetricKey, number> = {
  population: 1.1,
  medianIncome: 1.2,
  traffic: 1.15,
  demographics: 1.1,
  competition: 0.95,
  developments: 1.05,
  workforce: 0.9,
  accessibility: 1.0,
  commercialRent: 0.85,
  growth: 1.1,
};

export const METRIC_LABELS: Record<MetricKey, string> = {
  population: 'Population Density',
  medianIncome: 'Median Income',
  traffic: 'Traffic & Footfall',
  demographics: 'Demographic Fit',
  competition: 'Competition',
  developments: 'Developments',
  workforce: 'Workforce',
  accessibility: 'Accessibility',
  commercialRent: 'Commercial Rent',
  growth: 'Growth Trajectory',
};
