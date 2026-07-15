/** Location Intelligence Database — mirrors the Airtable relational schema. */

export type PropertyType =
  | 'Lifestyle Center'
  | 'Power Center'
  | 'Neighborhood Center'
  | 'Community Center'
  | 'Strip Center'
  | 'Mixed-Use'
  | 'Outlet'
  | 'Downtown Retail';

export type TenantCategory =
  | 'QSR / Fast Casual'
  | 'Full Service Restaurant'
  | 'Coffee / Cafe'
  | 'Grocery'
  | 'Fitness'
  | 'Retail Apparel'
  | 'Beauty / Personal Care'
  | 'Medical / Dental'
  | 'Banking / Financial'
  | 'Entertainment'
  | 'Services'
  | 'Other';

export type TenantStatus = 'Open' | 'Closed' | 'Coming Soon';

export type ProjectType =
  | 'Residential'
  | 'Commercial'
  | 'Mixed-Use'
  | 'Infrastructure'
  | 'Industrial'
  | 'Hospitality';

export type ProjectStatus =
  | 'Planned'
  | 'Entitled'
  | 'Under Construction'
  | 'Recently Completed'
  | 'On Hold';

export type OpportunityStatus =
  | 'Identified'
  | 'Qualified'
  | 'Presented'
  | 'In Negotiation'
  | 'Won'
  | 'Passed'
  | 'On Hold';

export type ClientStatus =
  | 'Lead'
  | 'Active'
  | 'Proposal Sent'
  | 'Closed Won'
  | 'Closed Lost'
  | 'Inactive';

export type ReportStatus = 'Draft' | 'Internal Review' | 'Sent' | 'Archived';

export interface RetailCenter {
  id: string;
  name: string;
  address: string;
  city: string;
  county: string;
  state: string;
  lat: number;
  lng: number;
  propertyType: PropertyType;
  yearBuilt: number;
  totalSqft: number;
  buildings: number;
  units: number;
  vacancies: number;
  availableSqft: number;
  driveThru: boolean;
  parkingSpaces: number;
  trafficAadt: number;
  visibility: number;
  accessibility: number;
  owner: string;
  propertyManager: string;
  leasingContact: string;
  website: string;
  googleMaps: string;
  notes: string;
  overallScore: number;
  demographicsId: string;
}

export interface BusinessTenant {
  id: string;
  name: string;
  category: TenantCategory;
  franchise: boolean;
  parentCompany: string;
  retailCenterId: string;
  address: string;
  suite: string;
  website: string;
  openingDate: string;
  status: TenantStatus;
  notes: string;
}

export interface DemographicArea {
  id: string;
  areaName: string;
  population: number;
  populationGrowthPct: number;
  medianHouseholdIncome: number;
  medianHomeValue: number;
  medianAge: number;
  householdSize: number;
  daytimePopulation: number;
  employmentRate: number;
  educationLevels: string;
  trafficCount: number;
  notes: string;
}

export interface Competitor {
  id: string;
  name: string;
  industry: string;
  brand: string;
  address: string;
  city: string;
  retailCenterId?: string;
  lat: number;
  lng: number;
  website: string;
  notes: string;
}

export interface DevelopmentProject {
  id: string;
  name: string;
  projectType: ProjectType;
  city: string;
  address: string;
  developer: string;
  status: ProjectStatus;
  residentialUnits: number;
  commercialSqft: number;
  expectedCompletion: string;
  source: string;
  notes: string;
  nearbyRetailCenterIds: string[];
}

export interface FranchiseRequirement {
  id: string;
  brand: string;
  industry: string;
  typicalSqft: number;
  preferredPopulation: number;
  preferredIncome: number;
  driveThruRequired: boolean;
  parkingRequirement: number;
  preferredTraffic: number;
  preferredCoTenants: string;
  targetCustomer: string;
  expansionNotes: string;
}

export interface Opportunity {
  id: string;
  name: string;
  clientBrand: string;
  retailCenterId: string;
  city: string;
  score: number;
  status: OpportunityStatus;
  whyItFits: string;
  strengths: string;
  weaknesses: string;
  competitionSummary: string;
  nearbyDevelopments: string;
  recommendedAction: string;
  dateCreated: string;
  dateSent?: string;
  followUpDate?: string;
  franchiseRequirementId: string;
  clientId: string;
}

export interface Client {
  id: string;
  companyName: string;
  contactName: string;
  position: string;
  email: string;
  phone: string;
  industry: string;
  numberOfLocations: number;
  expansionMarkets: string;
  notes: string;
  status: ClientStatus;
}

export interface Report {
  id: string;
  name: string;
  clientId: string;
  market: string;
  industry: string;
  date: string;
  retailCenterIds: string[];
  opportunityIds: string[];
  status: ReportStatus;
}

export type IntelligenceTableKey =
  | 'retailCenters'
  | 'businesses'
  | 'demographics'
  | 'competitors'
  | 'developments'
  | 'franchiseRequirements'
  | 'opportunities'
  | 'clients'
  | 'reports';

export interface IntelligenceDatabase {
  retailCenters: RetailCenter[];
  businesses: BusinessTenant[];
  demographics: DemographicArea[];
  competitors: Competitor[];
  developments: DevelopmentProject[];
  franchiseRequirements: FranchiseRequirement[];
  opportunities: Opportunity[];
  clients: Client[];
  reports: Report[];
}
