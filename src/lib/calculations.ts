import {
  Jurisdiction,
  ResidentProfile,
  ResidentContribution,
  ServiceAllocation,
  BudgetCategory,
  RevenueSource,
  ContributionBreakdown,
  CategoryAdjustment,
  ScenarioImpact,
  ServiceImplication,
  EVERYDAY_COMPARISONS,
} from '@/types';

/**
 * Calculate a resident's total contribution to their jurisdiction
 */
export function calculateResidentContribution(
  resident: ResidentProfile,
  jurisdiction: Jurisdiction,
  revenueSources: RevenueSource[],
  budgetCategories: BudgetCategory[]
): ResidentContribution {
  const breakdown = calculateContributionBreakdown(resident, revenueSources);
  const totalAnnual = Object.values(breakdown).reduce((sum, val) => sum + val, 0);

  const serviceAllocations = allocateToServices(totalAnnual, budgetCategories);

  return {
    totalAnnual,
    totalMonthly: totalAnnual / 12,
    totalDaily: totalAnnual / 365,
    breakdown,
    percentOfBudget: (totalAnnual / jurisdiction.totalBudget) * 100,
    serviceAllocations,
  };
}

/**
 * Calculate the breakdown of contributions by revenue type
 */
function calculateContributionBreakdown(
  resident: ResidentProfile,
  revenueSources: RevenueSource[]
): ContributionBreakdown {
  const breakdown: ContributionBreakdown = {
    propertyTax: 0,
    incomeTax: 0,
    wageTax: 0,
    salesTax: 0,
    utilityFees: 0,
    otherFees: 0,
  };

  for (const source of revenueSources) {
    switch (source.type) {
      case 'property_tax':
        if (resident.housingStatus === 'own' && resident.homeValue) {
          // Typical assessment ratio is around 100% but varies
          const assessedValue = resident.homeValue * (source.base || 1);
          breakdown.propertyTax = assessedValue * (source.rate || 0.01);
        }
        break;

      case 'income_tax':
        breakdown.incomeTax = resident.householdIncome * (source.rate || 0.01);
        break;

      case 'wage_tax':
        if (resident.worksLocally) {
          breakdown.wageTax = resident.householdIncome * (source.rate || 0.01);
        }
        break;

      case 'sales_tax':
        // Estimate based on income (roughly 30% of income goes to taxable purchases)
        const estimatedSpending = resident.householdIncome * 0.3;
        breakdown.salesTax = estimatedSpending * (source.rate || 0.01);
        break;

      case 'utility_fees':
        // Monthly estimate times 12, scaled by household size
        const baseUtility = source.rate || 50;
        const householdMultiplier = 0.7 + (resident.householdSize * 0.15); // 1-person = 0.85x, 4-person = 1.3x
        breakdown.utilityFees = baseUtility * householdMultiplier * 12;
        break;

      case 'permits_fees':
      case 'other':
        // Distribute evenly across residents as estimate
        breakdown.otherFees += source.rate || 100;
        break;
    }
  }

  return breakdown;
}

/**
 * Allocate total contribution across budget categories proportionally
 */
function allocateToServices(
  totalContribution: number,
  budgetCategories: BudgetCategory[]
): ServiceAllocation[] {
  const totalBudget = budgetCategories.reduce((sum, cat) => sum + cat.amount, 0);

  return budgetCategories.map((category) => {
    const proportion = category.amount / totalBudget;
    const annualAllocation = totalContribution * proportion;

    return {
      categoryId: category.id,
      categoryName: category.name,
      icon: category.icon,
      color: category.color,
      annual: annualAllocation,
      monthly: annualAllocation / 12,
      daily: annualAllocation / 365,
      description: category.description,
    };
  });
}

/**
 * Round daily amount for display based on jurisdiction config
 */
export function roundDaily(amount: number, rounding: number = 0.01): number {
  return Math.round(amount / rounding) * rounding;
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number, showCents: boolean = true): string {
  if (showCents) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format percentage for display
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Get an everyday comparison for a given amount
 */
export function getEverydayComparison(dailyAmount: number): string {
  // Find the closest comparison item
  const sorted = [...EVERYDAY_COMPARISONS].sort(
    (a, b) => Math.abs(a.cost - dailyAmount) - Math.abs(b.cost - dailyAmount)
  );

  const closest = sorted[0];
  const ratio = dailyAmount / closest.cost;

  if (ratio < 0.5) {
    return `less than half a ${closest.item}`;
  } else if (ratio < 0.9) {
    return `less than a ${closest.item}`;
  } else if (ratio < 1.1) {
    return `about the same as a ${closest.item}`;
  } else if (ratio < 2) {
    return `a bit more than a ${closest.item}`;
  } else {
    return `about ${Math.round(ratio)} ${closest.item}s`;
  }
}

/**
 * Validate budget adjustments against constraints
 */
export function validateBudgetChanges(
  original: BudgetCategory[],
  adjustments: CategoryAdjustment[]
): ScenarioImpact {
  const errors: string[] = [];
  const serviceImplications: ServiceImplication[] = [];

  const originalTotal = original.reduce((sum, cat) => sum + cat.amount, 0);
  let newTotal = originalTotal;

  for (const adjustment of adjustments) {
    const category = original.find((c) => c.id === adjustment.categoryId);
    if (!category) {
      errors.push(`Category ${adjustment.categoryId} not found`);
      continue;
    }

    const fixedAmount = category.amount * (category.fixedPercentage / 100);
    const change = adjustment.newAmount - adjustment.originalAmount;
    newTotal += change;

    // Check if new amount is below fixed minimum
    if (adjustment.newAmount < fixedAmount) {
      errors.push(
        `${category.name} cannot go below ${formatCurrency(fixedAmount, false)} due to: ${
          category.constraints?.join(', ') || 'fixed obligations'
        }`
      );
    }

    // Generate service implications
    if (change !== 0) {
      const percentChange = (change / category.amount) * 100;
      let description: string;
      let severity: 'low' | 'medium' | 'high';

      if (percentChange < -20) {
        description = `Significant reduction in ${category.name.toLowerCase()} services`;
        severity = 'high';
      } else if (percentChange < -10) {
        description = `Moderate reduction in ${category.name.toLowerCase()} capacity`;
        severity = 'medium';
      } else if (percentChange < 0) {
        description = `Minor adjustments to ${category.name.toLowerCase()}`;
        severity = 'low';
      } else if (percentChange > 20) {
        description = `Major expansion of ${category.name.toLowerCase()} services`;
        severity = 'low';
      } else {
        description = `Enhanced ${category.name.toLowerCase()} capacity`;
        severity = 'low';
      }

      serviceImplications.push({
        categoryId: category.id,
        categoryName: category.name,
        changeDescription: description,
        severity,
      });
    }
  }

  // Calculate tax impact (changes distributed across residents)
  const totalChange = adjustments.reduce(
    (sum, adj) => sum + (adj.newAmount - adj.originalAmount),
    0
  );

  return {
    valid: errors.length === 0,
    errors,
    taxImpact: totalChange,
    budgetChange: newTotal - originalTotal,
    serviceImplications,
  };
}

/**
 * Calculate discretionary (adjustable) amount for a category
 */
export function getDiscretionaryAmount(category: BudgetCategory): number {
  return category.amount * (1 - category.fixedPercentage / 100);
}

/**
 * Calculate fixed (non-adjustable) amount for a category
 */
export function getFixedAmount(category: BudgetCategory): number {
  return category.amount * (category.fixedPercentage / 100);
}

/**
 * Get jurisdiction size category based on population
 */
export function getJurisdictionSize(
  population: number
): 'small' | 'medium' | 'large' {
  if (population < 5000) return 'small';
  if (population < 50000) return 'medium';
  return 'large';
}

/**
 * Calculate per-capita spending for a category
 */
export function perCapita(amount: number, population: number): number {
  return amount / population;
}

/**
 * Generate comparison text for resident contribution
 */
export function generateComparisonText(
  contribution: ResidentContribution,
  jurisdiction: Jurisdiction
): string[] {
  const comparisons: string[] = [];

  // Daily comparison
  const dailyComparison = getEverydayComparison(contribution.totalDaily);
  comparisons.push(
    `Your daily contribution of ${formatCurrency(contribution.totalDaily)} is ${dailyComparison}`
  );

  // Collective comparison
  const totalResidents = jurisdiction.population;
  comparisons.push(
    `You're one of ${totalResidents.toLocaleString()} residents making this work together`
  );

  // Percentage perspective
  if (contribution.percentOfBudget < 0.01) {
    comparisons.push(
      `Your share is ${formatPercentage(contribution.percentOfBudget, 4)} of the total budget`
    );
  } else {
    comparisons.push(
      `Your share is ${formatPercentage(contribution.percentOfBudget, 2)} of the total budget`
    );
  }

  return comparisons;
}
