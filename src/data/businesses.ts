import type { BusinessConcept } from '../types';

/**
 * Hypothetical partnership: Locus is engaged by Apex Growth Partners
 * to shortlist the best U.S. trade areas for Northwind Coffee Co.
 */
export const businesses: BusinessConcept[] = [
  {
    id: 'northwind-coffee',
    partnerName: 'Apex Growth Partners',
    name: 'Northwind Coffee Co.',
    category: 'Specialty coffee · Fast-casual café',
    tagline: 'Third-wave coffee for walkable, high-income urban cores.',
    description:
      'Multi-unit specialty coffee brand seeking its next ten markets. Concept wins with college-educated professionals, strong daytime footfall, and corridors that are not yet saturated with peer cafés.',
    format: '1,400–1,800 sqft end-cap or inline with patio',
    targetIncomeMin: 78000,
    targetIncomeMax: 130000,
    targetDemographics: {
      age18to34: 40,
      age35to54: 30,
      familiesWithChildren: 18,
      collegeEducated: 58,
    },
    competitionTolerance: 6,
    metricWeights: {
      demographics: 1.35,
      traffic: 1.3,
      medianIncome: 1.25,
      competition: 1.2,
      accessibility: 1.15,
      population: 1.05,
      developments: 1.0,
      growth: 1.1,
      workforce: 0.85,
      commercialRent: 0.9,
    },
    priorities: [
      'Walkable urban villages and TOD corridors',
      'Median HH income at or above $78k',
      'Daytime population that supports morning + midday peaks',
      'Fewer than six similar specialty cafés in the trade area',
      'Active residential or mixed-use pipeline nearby',
    ],
  },
];

export const featuredBusiness = businesses[0];

export function getBusinessById(id: string): BusinessConcept | undefined {
  return businesses.find((b) => b.id === id);
}
