// Jurisdiction Types
export type JurisdictionType = 'township' | 'city' | 'county' | 'village' | 'borough';

export interface Jurisdiction {
  id: string;
  name: string;
  type: JurisdictionType;
  state: string;
  population: number;
  medianHomeValue: number;
  totalBudget: number;
  fiscalYear: string;
  governanceStructure?: string;
  config: JurisdictionConfig;
}

export interface JurisdictionConfig {
  maxCategories: number;
  emphasis: 'systems_over_departments' | 'balanced_services' | 'departmental';
  showFixedCosts: boolean;
  comparisonPhrase: string;
  dailyRounding: number;
}

// Revenue Source Types
export type RevenueType =
  | 'property_tax'
  | 'income_tax'
  | 'wage_tax'
  | 'sales_tax'
  | 'utility_fees'
  | 'permits_fees'
  | 'grants'
  | 'other';

// Who pays this revenue source
export type PayerType = 'residential' | 'commercial' | 'mixed' | 'government' | 'visitors';

export interface RevenueSource {
  id: string;
  jurisdictionId: string;
  type: RevenueType;
  name: string;
  amount: number;
  rate?: number;
  base?: number;
  description?: string;
  // Revenue attribution - who pays this?
  payer?: PayerType; // Primary payer type
  residentialShare?: number; // 0-100, percentage paid by residents (vs commercial/other)
}

// Budget Category Types
export type ServiceIcon =
  | 'shield' // police
  | 'flame' // fire
  | 'road' // roads/infrastructure
  | 'trees' // parks
  | 'building' // administration
  | 'droplet' // utilities/water
  | 'book' // library
  | 'heart' // health
  | 'truck' // public works
  | 'lightbulb' // utilities/electric
  | 'graduation-cap' // education
  | 'scale' // courts/legal
  | 'scales' // courts/legal (alias)
  | 'users' // community services
  | 'home' // housing
  | 'wallet' // finance/debt
  | 'hammer' // capital/construction
  | 'gift'; // grants/contributions

export interface BudgetCategory {
  id: string;
  jurisdictionId: string;
  name: string;
  amount: number;
  fixedPercentage: number; // 0-100, portion that is fixed/non-discretionary
  icon: ServiceIcon;
  color: string;
  description: string;
  constraints?: string[]; // reasons for fixed portions
  subcategories?: BudgetSubcategory[];
}

export interface BudgetSubcategory {
  id: string;
  name: string;
  amount: number;
  description?: string;
}

// Resident Profile Types
export type HousingStatus = 'own' | 'rent';

export interface ResidentProfile {
  id?: string;
  jurisdictionId: string;
  housingStatus: HousingStatus;
  homeValue?: number;
  annualRent?: number;
  householdIncome: number;
  worksLocally: boolean;
  householdSize: number;
  monthlyWaterUsage?: number; // gallons
  vehiclesRegistered?: number;
}

// Contribution Calculation Types
export interface ContributionBreakdown {
  propertyTax: number;
  incomeTax: number;
  wageTax: number;
  salesTax: number;
  utilityFees: number;
  otherFees: number;
}

export interface ResidentContribution {
  totalAnnual: number;
  totalMonthly: number;
  totalDaily: number;
  breakdown: ContributionBreakdown;
  percentOfBudget: number;
  serviceAllocations: ServiceAllocation[];
}

export interface ServiceAllocation {
  categoryId: string;
  categoryName: string;
  icon: ServiceIcon;
  color: string;
  annual: number;
  monthly: number;
  daily: number;
  description: string;
}

// Budget Simulator Types
export interface BudgetScenario {
  id: string;
  residentProfileId?: string;
  jurisdictionId: string;
  name: string;
  adjustments: CategoryAdjustment[];
  createdAt: Date;
}

export interface CategoryAdjustment {
  categoryId: string;
  originalAmount: number;
  newAmount: number;
  percentChange: number;
}

export interface ScenarioImpact {
  valid: boolean;
  errors: string[];
  taxImpact: number; // change in annual taxes per resident
  budgetChange: number; // total budget change (+ = increase, - = decrease)
  serviceImplications: ServiceImplication[];
}

export interface ServiceImplication {
  categoryId: string;
  categoryName: string;
  changeDescription: string;
  severity: 'low' | 'medium' | 'high';
}

// Comparison/Benchmark Types
export interface BenchmarkData {
  jurisdictionSize: 'small' | 'medium' | 'large';
  category: string;
  medianAmount: number;
  medianPerCapita: number;
  percentile25: number;
  percentile75: number;
}

// Everyday Comparison Types (for "less than a latte" comparisons)
export interface EverydayComparison {
  item: string;
  cost: number;
  icon: string;
}

export const EVERYDAY_COMPARISONS: EverydayComparison[] = [
  { item: 'cup of coffee', cost: 3.50, icon: '☕' },
  { item: 'latte', cost: 5.50, icon: '☕' },
  { item: 'fast food meal', cost: 10.00, icon: '🍔' },
  { item: 'movie ticket', cost: 15.00, icon: '🎬' },
  { item: 'streaming subscription', cost: 15.00, icon: '📺' },
  { item: 'gas tank fill-up', cost: 50.00, icon: '⛽' },
  { item: 'grocery trip', cost: 100.00, icon: '🛒' },
  { item: 'dinner out', cost: 60.00, icon: '🍽️' },
  { item: 'phone bill', cost: 80.00, icon: '📱' },
];

// Template Types (for jurisdiction setup)
export interface JurisdictionTemplate {
  type: JurisdictionType;
  populationRange: [number, number];
  suggestedCategories: Omit<BudgetCategory, 'id' | 'jurisdictionId' | 'amount'>[];
  suggestedRevenueSources: Omit<RevenueSource, 'id' | 'jurisdictionId' | 'amount'>[];
  config: JurisdictionConfig;
}

// Export/Infographic Types
export interface InfographicData {
  jurisdiction: Jurisdiction;
  profile: ResidentProfile;
  contribution: ResidentContribution;
  generatedAt: Date;
}

export type ExportFormat = 'png' | 'pdf' | 'jpg';
