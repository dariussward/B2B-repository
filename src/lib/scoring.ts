import type {
  BusinessConcept,
  BusinessLocationScore,
  DemographicsBreakdown,
  LocationProfile,
  MetricKey,
  MetricScore,
} from '../types';
import { METRIC_LABELS, METRIC_WEIGHTS } from '../types';

/** Clamp a raw value into a 0–50 score using linear mapping. */
export function scoreOn50(
  value: number,
  min: number,
  max: number,
  invert = false,
): number {
  const clamped = Math.min(max, Math.max(min, value));
  const ratio = (clamped - min) / (max - min || 1);
  const raw = invert ? 1 - ratio : ratio;
  return Math.round(Math.min(50, Math.max(0, raw * 50)));
}

export function computeOverallScore(
  metrics: MetricScore[],
  weights: Partial<Record<MetricKey, number>> = METRIC_WEIGHTS,
): number {
  let weighted = 0;
  let totalWeight = 0;
  for (const m of metrics) {
    const w = weights[m.key] ?? METRIC_WEIGHTS[m.key] ?? 1;
    weighted += m.score * w;
    totalWeight += w;
  }
  return Math.round(weighted / (totalWeight || 1));
}

export function recommendationFromScore(
  score: number,
): LocationProfile['recommendation'] {
  if (score >= 38) return 'strong-fit';
  if (score >= 32) return 'promising';
  if (score >= 26) return 'watch';
  return 'pass';
}

/** How closely a market's demographic mix matches a concept's targets (0–100). */
export function computeDemographicsFit(
  actual: DemographicsBreakdown,
  targets: DemographicsBreakdown,
): number {
  const keys: (keyof DemographicsBreakdown)[] = [
    'age18to34',
    'age35to54',
    'familiesWithChildren',
    'collegeEducated',
  ];
  let total = 0;
  for (const key of keys) {
    const diff = Math.abs(actual[key] - targets[key]);
    // Within ~20pp is still usable; beyond that drops toward zero.
    const closeness = Math.max(0, 1 - diff / 20);
    total += closeness * 100;
  }
  return Math.round(total / keys.length);
}

/** Soft penalty when median income sits outside the brand's target band. */
export function incomeBandFit(
  medianIncome: number,
  min: number,
  max: number,
): number {
  if (medianIncome >= min && medianIncome <= max) return 100;
  if (medianIncome < min) {
    const gap = min - medianIncome;
    return Math.max(40, Math.round(100 - (gap / min) * 80));
  }
  const gap = medianIncome - max;
  return Math.max(55, Math.round(100 - (gap / max) * 50));
}

export function buildMetrics(input: {
  population: number;
  medianIncome: number;
  daytimePopulation: number;
  walkScore: number;
  transitScore: number;
  demographicsFit: number; // 0–100 composite
  competitorsNearby: number;
  developmentImpact: number; // 0–100
  unemploymentRate: number;
  avgCommercialRent: number;
  growthRate5yr: number;
  insights?: Partial<Record<MetricKey, string>>;
  /** When set, competition is scored relative to brand tolerance. */
  competitionTolerance?: number;
}): MetricScore[] {
  const trafficProxy =
    input.daytimePopulation / 1000 + input.walkScore * 0.4 + input.transitScore * 0.3;

  const competitionMax = input.competitionTolerance
    ? Math.max(input.competitionTolerance * 2.5, 14)
    : 14;

  const metrics: MetricScore[] = [
    {
      key: 'population',
      label: METRIC_LABELS.population,
      score: scoreOn50(input.population, 25000, 90000),
      value: input.population.toLocaleString() + ' residents',
      insight:
        input.insights?.population ??
        'Trade-area population supports sustained demand for multi-unit brands.',
    },
    {
      key: 'medianIncome',
      label: METRIC_LABELS.medianIncome,
      score: scoreOn50(input.medianIncome, 55000, 120000),
      value: '$' + input.medianIncome.toLocaleString() + ' median HH',
      insight:
        input.insights?.medianIncome ??
        'Household purchasing power aligns with mid-to-premium franchise concepts.',
    },
    {
      key: 'traffic',
      label: METRIC_LABELS.traffic,
      score: scoreOn50(trafficProxy, 50, 180),
      value:
        input.daytimePopulation.toLocaleString() +
        ' daytime · Walk ' +
        input.walkScore,
      insight:
        input.insights?.traffic ??
        'Daytime density and walkability indicate strong pass-by exposure.',
    },
    {
      key: 'demographics',
      label: METRIC_LABELS.demographics,
      score: scoreOn50(input.demographicsFit, 50, 92),
      value: input.demographicsFit + '% brand fit index',
      insight:
        input.insights?.demographics ??
        'Age, education, and household mix match typical franchise customer profiles.',
    },
    {
      key: 'competition',
      label: METRIC_LABELS.competition,
      score: scoreOn50(input.competitorsNearby, 1, competitionMax, true),
      value: input.competitorsNearby + ' similar concepts nearby',
      insight:
        input.insights?.competition ??
        (input.competitorsNearby <= 4
          ? 'White space available — limited direct competition in the trade area.'
          : 'Crowded corridor — differentiation and site quality will matter.'),
    },
    {
      key: 'developments',
      label: METRIC_LABELS.developments,
      score: scoreOn50(input.developmentImpact, 40, 95),
      value: input.developmentImpact + ' pipeline strength',
      insight:
        input.insights?.developments ??
        'Planned and recent projects signal rising foot traffic and residential fill-in.',
    },
    {
      key: 'workforce',
      label: METRIC_LABELS.workforce,
      score: scoreOn50(input.unemploymentRate, 2.5, 7.5, true),
      value: input.unemploymentRate.toFixed(1) + '% unemployment',
      insight:
        input.insights?.workforce ??
        'Local labor market supports hiring for QSR, retail, and service formats.',
    },
    {
      key: 'accessibility',
      label: METRIC_LABELS.accessibility,
      score: scoreOn50(
        (input.walkScore + input.transitScore) / 2,
        30,
        90,
      ),
      value:
        'Walk ' + input.walkScore + ' · Transit ' + input.transitScore,
      insight:
        input.insights?.accessibility ??
        'Ingress, parking, and transit access support multi-daypart traffic.',
    },
    {
      key: 'commercialRent',
      label: METRIC_LABELS.commercialRent,
      score: scoreOn50(input.avgCommercialRent, 22, 60, true),
      value: '$' + input.avgCommercialRent + '/sqft NNN est.',
      insight:
        input.insights?.commercialRent ??
        'Rent levels leave room for healthy unit economics at target AUV.',
    },
    {
      key: 'growth',
      label: METRIC_LABELS.growth,
      score: scoreOn50(input.growthRate5yr, 0, 16),
      value: (input.growthRate5yr >= 0 ? '+' : '') + input.growthRate5yr + '% 5-yr',
      insight:
        input.insights?.growth ??
        'Population and income growth support multi-year ramp and expansion density.',
    },
  ];

  return metrics;
}

/**
 * Rescore a market against a partnered business concept profile —
 * dynamic demographic fit, income-band awareness, and custom weights.
 */
export function scoreLocationForBusiness(
  location: LocationProfile,
  business: BusinessConcept,
): Omit<BusinessLocationScore, 'rank'> {
  const demoFit = computeDemographicsFit(
    location.demographics,
    business.targetDemographics,
  );
  const incomeFit = incomeBandFit(
    location.medianIncome,
    business.targetIncomeMin,
    business.targetIncomeMax,
  );
  // Blend demographic mix with income-band fit for the brand index.
  const demographicsFit = Math.round(demoFit * 0.7 + incomeFit * 0.3);

  const metrics = buildMetrics({
    population: location.population,
    medianIncome: location.medianIncome,
    daytimePopulation: location.daytimePopulation,
    walkScore: location.walkScore,
    transitScore: location.transitScore,
    demographicsFit,
    competitorsNearby: location.competitorsNearby,
    developmentImpact: location.developmentImpact,
    unemploymentRate: location.unemploymentRate,
    avgCommercialRent: location.avgCommercialRent,
    growthRate5yr: location.growthRate5yr,
    competitionTolerance: business.competitionTolerance,
    insights: {
      demographics:
        demographicsFit >= 80
          ? `Strong match to ${business.name}'s target guest profile.`
          : demographicsFit >= 65
            ? `Partial demographic overlap with ${business.name}'s winning units.`
            : `Demographic mix sits outside ${business.name}'s core guest profile.`,
      competition:
        location.competitorsNearby <= business.competitionTolerance
          ? `Within ${business.name}'s competition tolerance (${business.competitionTolerance} peers).`
          : `Above ${business.name}'s tolerance of ${business.competitionTolerance} similar concepts.`,
      medianIncome:
        location.medianIncome >= business.targetIncomeMin &&
        location.medianIncome <= business.targetIncomeMax
          ? `Income band fits ${business.name}'s $${(business.targetIncomeMin / 1000).toFixed(0)}–${(business.targetIncomeMax / 1000).toFixed(0)}k target.`
          : `Median income sits outside ${business.name}'s preferred band.`,
    },
  });

  const weights = { ...METRIC_WEIGHTS, ...business.metricWeights };
  const overallScore = computeOverallScore(metrics, weights);

  return {
    location,
    businessId: business.id,
    metrics,
    overallScore,
    recommendation: recommendationFromScore(overallScore),
    demographicsFit,
  };
}

/** Rank all markets for a business and return the top N. */
export function getTopLocationsForBusiness(
  locations: LocationProfile[],
  business: BusinessConcept,
  n = 10,
): BusinessLocationScore[] {
  return [...locations]
    .map((loc) => scoreLocationForBusiness(loc, business))
    .sort((a, b) => b.overallScore - a.overallScore)
    .slice(0, n)
    .map((entry, index) => ({ ...entry, rank: index + 1 }));
}

export function formatRecommendation(
  rec: LocationProfile['recommendation'],
): { label: string; tone: string } {
  switch (rec) {
    case 'strong-fit':
      return { label: 'Strong Fit', tone: 'strong' };
    case 'promising':
      return { label: 'Promising', tone: 'promising' };
    case 'watch':
      return { label: 'Watch List', tone: 'watch' };
    case 'pass':
      return { label: 'Pass', tone: 'pass' };
  }
}
