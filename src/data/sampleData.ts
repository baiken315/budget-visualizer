import {
  Jurisdiction,
  BudgetCategory,
  RevenueSource,
  ResidentProfile,
  JurisdictionTemplate,
} from '@/types';

// Sample Small Township
export const sampleTownship: Jurisdiction = {
  id: 'liberty-township',
  name: 'Liberty Township',
  type: 'township',
  state: 'OH',
  population: 3200,
  medianHomeValue: 185000,
  totalBudget: 2850000,
  fiscalYear: '2024',
  governanceStructure: 'Three-member Board of Trustees',
  config: {
    maxCategories: 5,
    emphasis: 'systems_over_departments',
    showFixedCosts: true,
    comparisonPhrase: 'community system',
    dailyRounding: 0.25,
  },
};

export const townshipBudgetCategories: BudgetCategory[] = [
  {
    id: 'safety-services',
    jurisdictionId: 'liberty-township',
    name: 'Safety Services',
    amount: 980000,
    fixedPercentage: 75,
    icon: 'shield',
    color: '#3b82f6',
    description: 'Police protection, fire services, and emergency medical response',
    constraints: [
      'Union contracts',
      'Minimum staffing requirements',
      'Equipment maintenance schedules',
    ],
  },
  {
    id: 'roads-infrastructure',
    jurisdictionId: 'liberty-township',
    name: 'Roads & Infrastructure',
    amount: 720000,
    fixedPercentage: 60,
    icon: 'road',
    color: '#6b7280',
    description: 'Road maintenance, snow removal, storm drainage, and bridge repairs',
    constraints: ['State maintenance mandates', 'Equipment leases', 'Salt contracts'],
  },
  {
    id: 'administration',
    jurisdictionId: 'liberty-township',
    name: 'Administration',
    amount: 485000,
    fixedPercentage: 80,
    icon: 'building',
    color: '#8b5cf6',
    description: 'Township operations, fiscal management, zoning, and public records',
    constraints: ['Staff salaries', 'Insurance premiums', 'Legal requirements'],
  },
  {
    id: 'parks-recreation',
    jurisdictionId: 'liberty-township',
    name: 'Parks & Recreation',
    amount: 380000,
    fixedPercentage: 40,
    icon: 'trees',
    color: '#10b981',
    description: 'Park maintenance, recreation programs, and community events',
    constraints: ['Facility maintenance', 'Insurance'],
  },
  {
    id: 'cemetery-services',
    jurisdictionId: 'liberty-township',
    name: 'Cemetery & Other Services',
    amount: 285000,
    fixedPercentage: 50,
    icon: 'users',
    color: '#f59e0b',
    description: 'Cemetery maintenance, community services, and reserve funds',
    constraints: ['Cemetery perpetual care fund'],
  },
];

export const townshipRevenueSources: RevenueSource[] = [
  {
    id: 'property-tax',
    jurisdictionId: 'liberty-township',
    type: 'property_tax',
    name: 'Property Tax',
    amount: 1650000,
    rate: 0.0089, // 8.9 mills
    base: 0.35, // 35% assessment ratio
    description: 'Primary revenue source based on property values',
    payer: 'mixed',
    residentialShare: 85, // 85% from homes, 15% from commercial/farm properties
  },
  {
    id: 'local-wage-tax',
    jurisdictionId: 'liberty-township',
    type: 'wage_tax',
    name: 'Local Wage Tax',
    amount: 720000,
    rate: 0.01, // 1% wage tax for those working locally
    description: 'Wage tax on those who work in the township',
    payer: 'mixed',
    residentialShare: 70, // 70% from residents working locally, 30% from non-resident workers
  },
  {
    id: 'state-funding',
    jurisdictionId: 'liberty-township',
    type: 'grants',
    name: 'State & Federal Funding',
    amount: 280000,
    description: 'State shared revenue and grants',
    payer: 'government',
    residentialShare: 0, // Not paid by local residents/businesses
  },
  {
    id: 'fees-permits',
    jurisdictionId: 'liberty-township',
    type: 'permits_fees',
    name: 'Fees & Permits',
    amount: 200000,
    rate: 62.5, // Per resident estimate
    description: 'Zoning permits, park fees, and other charges',
    payer: 'mixed',
    residentialShare: 60, // Mix of residential and commercial permits
  },
];

// Sample Medium City
export const sampleCity: Jurisdiction = {
  id: 'riverside-city',
  name: 'City of Riverside',
  type: 'city',
  state: 'OH',
  population: 28500,
  medianHomeValue: 245000,
  totalBudget: 42000000,
  fiscalYear: '2024',
  governanceStructure: 'Mayor-Council',
  config: {
    maxCategories: 8,
    emphasis: 'balanced_services',
    showFixedCosts: true,
    comparisonPhrase: 'city services',
    dailyRounding: 0.1,
  },
};

export const cityBudgetCategories: BudgetCategory[] = [
  {
    id: 'police',
    jurisdictionId: 'riverside-city',
    name: 'Police & Safety',
    amount: 12600000,
    fixedPercentage: 85,
    icon: 'shield',
    color: '#3b82f6',
    description: 'Police department, dispatch, and public safety operations',
    constraints: ['Union contracts', 'Minimum staffing', 'Equipment costs'],
  },
  {
    id: 'fire-ems',
    jurisdictionId: 'riverside-city',
    name: 'Fire & EMS',
    amount: 8400000,
    fixedPercentage: 80,
    icon: 'flame',
    color: '#ef4444',
    description: 'Fire department and emergency medical services',
    constraints: ['Union contracts', 'Apparatus maintenance', 'Training mandates'],
  },
  {
    id: 'public-works',
    jurisdictionId: 'riverside-city',
    name: 'Public Works',
    amount: 6300000,
    fixedPercentage: 55,
    icon: 'truck',
    color: '#6b7280',
    description: 'Streets, sanitation, fleet maintenance, and infrastructure',
    constraints: ['Equipment leases', 'Fuel contracts'],
  },
  {
    id: 'utilities',
    jurisdictionId: 'riverside-city',
    name: 'Water & Sewer',
    amount: 5250000,
    fixedPercentage: 70,
    icon: 'droplet',
    color: '#06b6d4',
    description: 'Water treatment, distribution, and wastewater services',
    constraints: ['EPA mandates', 'Infrastructure bonds', 'Chemical costs'],
  },
  {
    id: 'parks-rec',
    jurisdictionId: 'riverside-city',
    name: 'Parks & Recreation',
    amount: 3150000,
    fixedPercentage: 35,
    icon: 'trees',
    color: '#10b981',
    description: 'Parks, pools, recreation centers, and community programs',
    constraints: ['Facility maintenance'],
  },
  {
    id: 'administration',
    jurisdictionId: 'riverside-city',
    name: 'General Government',
    amount: 2940000,
    fixedPercentage: 75,
    icon: 'building',
    color: '#8b5cf6',
    description: 'City administration, finance, HR, and legal services',
    constraints: ['Salaries', 'Insurance', 'Audit requirements'],
  },
  {
    id: 'library',
    jurisdictionId: 'riverside-city',
    name: 'Library Services',
    amount: 1680000,
    fixedPercentage: 60,
    icon: 'book',
    color: '#f59e0b',
    description: 'Public library operations and programs',
    constraints: ['Building costs', 'Staff salaries'],
  },
  {
    id: 'community-dev',
    jurisdictionId: 'riverside-city',
    name: 'Community Development',
    amount: 1680000,
    fixedPercentage: 40,
    icon: 'home',
    color: '#ec4899',
    description: 'Planning, zoning, economic development, and housing programs',
    constraints: ['Grant match requirements'],
  },
];

export const cityRevenueSources: RevenueSource[] = [
  {
    id: 'property-tax',
    jurisdictionId: 'riverside-city',
    type: 'property_tax',
    name: 'Property Tax',
    amount: 14700000,
    rate: 0.0125,
    base: 0.35,
    description: 'Property taxes on real estate',
    payer: 'mixed',
    residentialShare: 65, // 65% residential, 35% commercial/industrial property
  },
  {
    id: 'income-tax',
    jurisdictionId: 'riverside-city',
    type: 'income_tax',
    name: 'Resident Income Tax',
    amount: 10000000,
    rate: 0.015,
    description: '1.5% income tax on all residents',
    payer: 'residential',
    residentialShare: 100, // Only residents pay this
  },
  {
    id: 'wage-tax',
    jurisdictionId: 'riverside-city',
    type: 'wage_tax',
    name: 'Worker Wage Tax',
    amount: 6800000,
    rate: 0.005,
    description: '0.5% additional tax for those who work in the city',
    payer: 'mixed',
    residentialShare: 55, // 55% from residents who work locally, 45% from commuters into city
  },
  {
  id: 'business-income-tax',
    jurisdictionId: 'riverside-city',
    type: 'income_tax',
    name: 'Business Net Profits Tax',
    amount: 4200000,
    rate: 0.015,
    description: '1.5% tax on business profits',
    payer: 'commercial',
    residentialShare: 0, // Paid entirely by businesses
  },
  {
    id: 'utility-fees',
    jurisdictionId: 'riverside-city',
    type: 'utility_fees',
    name: 'Utility Fees',
    amount: 6300000,
    rate: 75,
    description: 'Water, sewer, and trash fees',
    payer: 'mixed',
    residentialShare: 70, // 70% residential, 30% commercial usage
  },
  {
    id: 'grants',
    jurisdictionId: 'riverside-city',
    type: 'grants',
    name: 'Grants & Intergovernmental',
    amount: 2520000,
    description: 'State and federal grants',
    payer: 'government',
    residentialShare: 0, // Not from local taxpayers
  },
  {
    id: 'hotel-tax',
    jurisdictionId: 'riverside-city',
    type: 'other',
    name: 'Hotel/Lodging Tax',
    amount: 850000,
    rate: 0.03,
    description: '3% tax on hotel stays',
    payer: 'visitors',
    residentialShare: 5, // Mostly visitors, few residents use local hotels
  },
  {
    id: 'other',
    jurisdictionId: 'riverside-city',
    type: 'other',
    name: 'Other Revenue',
    amount: 830000,
    rate: 29,
    description: 'Permits, fines, interest, and miscellaneous',
    payer: 'mixed',
    residentialShare: 50, // Mix of residential and commercial
  },
];

// Sample "Average Resident" Profiles
export const averageTownshipResident: ResidentProfile = {
  jurisdictionId: 'liberty-township',
  housingStatus: 'own',
  homeValue: 185000,
  householdIncome: 72000,
  worksLocally: false,
  householdSize: 2.4,
};

export const averageCityResident: ResidentProfile = {
  jurisdictionId: 'riverside-city',
  housingStatus: 'own',
  homeValue: 245000,
  householdIncome: 68000,
  worksLocally: true,
  householdSize: 2.3,
  monthlyWaterUsage: 4500,
};

// Jurisdiction Templates for new setups
export const jurisdictionTemplates: JurisdictionTemplate[] = [
  {
    type: 'township',
    populationRange: [0, 5000],
    config: {
      maxCategories: 5,
      emphasis: 'systems_over_departments',
      showFixedCosts: true,
      comparisonPhrase: 'community system',
      dailyRounding: 0.25,
    },
    suggestedCategories: [
      {
        name: 'Safety Services',
        fixedPercentage: 75,
        icon: 'shield',
        color: '#3b82f6',
        description: 'Police, fire, and emergency services',
      },
      {
        name: 'Roads & Infrastructure',
        fixedPercentage: 60,
        icon: 'road',
        color: '#6b7280',
        description: 'Road maintenance and public infrastructure',
      },
      {
        name: 'Administration',
        fixedPercentage: 80,
        icon: 'building',
        color: '#8b5cf6',
        description: 'Government operations and management',
      },
      {
        name: 'Parks & Services',
        fixedPercentage: 40,
        icon: 'trees',
        color: '#10b981',
        description: 'Parks, recreation, and community services',
      },
    ],
    suggestedRevenueSources: [
      {
        type: 'property_tax',
        name: 'Property Tax',
        description: 'Primary revenue from property assessments',
      },
      {
        type: 'income_tax',
        name: 'Local Income Tax',
        description: 'Income-based revenue',
      },
      {
        type: 'grants',
        name: 'State Funding',
        description: 'Intergovernmental transfers',
      },
    ],
  },
  {
    type: 'city',
    populationRange: [5000, 50000],
    config: {
      maxCategories: 8,
      emphasis: 'balanced_services',
      showFixedCosts: true,
      comparisonPhrase: 'city services',
      dailyRounding: 0.1,
    },
    suggestedCategories: [
      {
        name: 'Police',
        fixedPercentage: 85,
        icon: 'shield',
        color: '#3b82f6',
        description: 'Law enforcement and public safety',
      },
      {
        name: 'Fire & EMS',
        fixedPercentage: 80,
        icon: 'flame',
        color: '#ef4444',
        description: 'Fire protection and emergency medical',
      },
      {
        name: 'Public Works',
        fixedPercentage: 55,
        icon: 'truck',
        color: '#6b7280',
        description: 'Streets, sanitation, and maintenance',
      },
      {
        name: 'Utilities',
        fixedPercentage: 70,
        icon: 'droplet',
        color: '#06b6d4',
        description: 'Water, sewer, and utilities',
      },
      {
        name: 'Parks & Recreation',
        fixedPercentage: 35,
        icon: 'trees',
        color: '#10b981',
        description: 'Parks and recreation programs',
      },
      {
        name: 'Administration',
        fixedPercentage: 75,
        icon: 'building',
        color: '#8b5cf6',
        description: 'City government operations',
      },
      {
        name: 'Library',
        fixedPercentage: 60,
        icon: 'book',
        color: '#f59e0b',
        description: 'Public library services',
      },
      {
        name: 'Community Development',
        fixedPercentage: 40,
        icon: 'home',
        color: '#ec4899',
        description: 'Planning and development',
      },
    ],
    suggestedRevenueSources: [
      {
        type: 'property_tax',
        name: 'Property Tax',
        description: 'Property-based revenue',
      },
      {
        type: 'income_tax',
        name: 'Income Tax',
        description: 'Municipal income tax',
      },
      {
        type: 'utility_fees',
        name: 'Utility Fees',
        description: 'Fees for municipal utilities',
      },
      {
        type: 'sales_tax',
        name: 'Sales Tax',
        description: 'Local sales tax portion',
      },
      {
        type: 'grants',
        name: 'Grants',
        description: 'Federal and state grants',
      },
    ],
  },
];

// Helper to get sample data by jurisdiction type
export function getSampleJurisdiction(type: 'township' | 'city') {
  if (type === 'township') {
    return {
      jurisdiction: sampleTownship,
      categories: townshipBudgetCategories,
      revenue: townshipRevenueSources,
      averageResident: averageTownshipResident,
    };
  }
  return {
    jurisdiction: sampleCity,
    categories: cityBudgetCategories,
    revenue: cityRevenueSources,
    averageResident: averageCityResident,
  };
}
