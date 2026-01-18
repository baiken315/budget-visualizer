'use client';

import { useState } from 'react';
import { useBudgetStore } from '@/store/budgetStore';
import { formatCurrency, formatPercentage, getEverydayComparison, roundDaily } from '@/lib/calculations';
import { ServiceIconComponent } from '@/components/ui/Icons';
import { Info, ChevronDown, ChevronUp, Calculator, HelpCircle, Building2, Users, Landmark, Plane, Maximize2, X } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

import { RevenueSource, Jurisdiction, PayerType } from '@/types';

interface CalculationDetail {
  label: string;
  formula: string;
  values: string;
  result: string;
  explanation: string;
}

// Helper to get payer icon
function PayerIcon({ payer, size = 16 }: { payer: PayerType; size?: number }) {
  switch (payer) {
    case 'residential':
      return <Users size={size} className="text-blue-500" />;
    case 'commercial':
      return <Building2 size={size} className="text-amber-500" />;
    case 'government':
      return <Landmark size={size} className="text-purple-500" />;
    case 'visitors':
      return <Plane size={size} className="text-green-500" />;
    default:
      return <Users size={size} className="text-gray-500" />;
  }
}

// Revenue Attribution Section Component
function RevenueAttributionSection({
  revenueSources,
  jurisdiction,
  yourContribution,
}: {
  revenueSources: RevenueSource[];
  jurisdiction: Jurisdiction;
  yourContribution: number;
}) {
  const [expanded, setExpanded] = useState(false);

  // Calculate total revenue by payer type
  const totalRevenue = revenueSources.reduce((sum, s) => sum + s.amount, 0);

  // Calculate residential vs non-residential totals
  let residentialTotal = 0;
  let commercialTotal = 0;
  let governmentTotal = 0;
  let visitorTotal = 0;

  revenueSources.forEach((source) => {
    const residentialShare = source.residentialShare ?? 100; // Default to 100% residential if not specified
    const residentialAmount = source.amount * (residentialShare / 100);
    const nonResidentialAmount = source.amount - residentialAmount;

    residentialTotal += residentialAmount;

    // Categorize non-residential by payer type
    if (source.payer === 'commercial') {
      commercialTotal += nonResidentialAmount;
    } else if (source.payer === 'government') {
      governmentTotal += source.amount; // Government sources are 100% government
    } else if (source.payer === 'visitors') {
      visitorTotal += nonResidentialAmount;
    } else if (source.payer === 'mixed') {
      // For mixed sources, the non-residential portion goes to commercial
      commercialTotal += nonResidentialAmount;
    }
  });

  // Recalculate government (grants are 100% government-funded)
  const grantSources = revenueSources.filter(s => s.payer === 'government');
  governmentTotal = grantSources.reduce((sum, s) => sum + s.amount, 0);
  residentialTotal -= governmentTotal; // Remove government from residential

  const residentialPercent = (residentialTotal / totalRevenue) * 100;
  const commercialPercent = (commercialTotal / totalRevenue) * 100;
  const governmentPercent = (governmentTotal / totalRevenue) * 100;
  const visitorPercent = (visitorTotal / totalRevenue) * 100;

  // Your contribution as percentage of residential share
  const yourPercentOfResidential = residentialTotal > 0
    ? (yourContribution / residentialTotal) * 100
    : 0;

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Who Funds {jurisdiction.name}?</h3>
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-sm text-primary hover:underline"
        >
          <Info size={14} />
          {expanded ? 'Hide' : 'Show'} details
        </button>
      </div>

      <p className="text-sm text-secondary-foreground mb-4">
        Not all revenue comes from residents. Businesses, grants, and visitors also contribute to funding local services.
      </p>

      {/* Visual breakdown bar */}
      <div className="mb-4">
        <div className="h-8 rounded-full overflow-hidden flex">
          {residentialPercent > 0 && (
            <div
              className="bg-blue-500 flex items-center justify-center text-white text-xs font-medium"
              style={{ width: `${residentialPercent}%` }}
              title={`Residents: ${formatPercentage(residentialPercent, 1)}`}
            >
              {residentialPercent > 15 && `${formatPercentage(residentialPercent, 0)}`}
            </div>
          )}
          {commercialPercent > 0 && (
            <div
              className="bg-amber-500 flex items-center justify-center text-white text-xs font-medium"
              style={{ width: `${commercialPercent}%` }}
              title={`Businesses: ${formatPercentage(commercialPercent, 1)}`}
            >
              {commercialPercent > 15 && `${formatPercentage(commercialPercent, 0)}`}
            </div>
          )}
          {governmentPercent > 0 && (
            <div
              className="bg-purple-500 flex items-center justify-center text-white text-xs font-medium"
              style={{ width: `${governmentPercent}%` }}
              title={`Government: ${formatPercentage(governmentPercent, 1)}`}
            >
              {governmentPercent > 15 && `${formatPercentage(governmentPercent, 0)}`}
            </div>
          )}
          {visitorPercent > 0 && (
            <div
              className="bg-green-500 flex items-center justify-center text-white text-xs font-medium"
              style={{ width: `${visitorPercent}%` }}
              title={`Visitors: ${formatPercentage(visitorPercent, 1)}`}
            >
              {visitorPercent > 15 && `${formatPercentage(visitorPercent, 0)}`}
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm mb-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500 shrink-0" />
          <span className="whitespace-nowrap">Residents</span>
          <span className="font-medium whitespace-nowrap">{formatPercentage(residentialPercent, 0)}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-amber-500 shrink-0" />
          <span className="whitespace-nowrap">Businesses</span>
          <span className="font-medium whitespace-nowrap">{formatPercentage(commercialPercent, 0)}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-purple-500 shrink-0" />
          <span className="whitespace-nowrap">Government</span>
          <span className="font-medium whitespace-nowrap">{formatPercentage(governmentPercent, 0)}</span>
        </div>
        {visitorPercent > 0 && (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500 shrink-0" />
            <span className="whitespace-nowrap">Visitors</span>
            <span className="font-medium whitespace-nowrap">{formatPercentage(visitorPercent, 0)}</span>
          </div>
        )}
      </div>

      {/* Your contribution context */}
      <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
        <p className="text-sm">
          <strong>Your contribution</strong> of {formatCurrency(yourContribution, false)} represents{' '}
          <strong>{formatPercentage(yourPercentOfResidential, 4)}</strong> of the residential share,
          helping fund services alongside {(jurisdiction.population - 1).toLocaleString()} other residents.
        </p>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-border space-y-3">
          <h4 className="font-medium text-sm">Revenue Source Breakdown</h4>
          {revenueSources.map((source) => {
            const residentialShare = source.residentialShare ?? 100;
            const payer = source.payer ?? 'residential';

            return (
              <div key={source.id} className="flex items-center justify-between text-sm p-2 bg-secondary/30 rounded">
                <div className="flex items-center gap-2">
                  <PayerIcon payer={payer} size={14} />
                  <span>{source.name}</span>
                </div>
                <div className="text-right">
                  <div className="font-medium">{formatCurrency(source.amount, false)}</div>
                  <div className="text-xs text-muted">
                    {residentialShare}% residents • {100 - residentialShare}% {payer === 'government' ? 'govt' : payer === 'visitors' ? 'visitors' : 'business'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function ContributionDashboard() {
  const { jurisdiction, contribution, residentProfile, revenueSources } = useBudgetStore();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [showMath, setShowMath] = useState<string | null>(null);
  const [showServicesModal, setShowServicesModal] = useState(false);

  if (!jurisdiction || !contribution || !residentProfile) {
    return (
      <div className="card text-center py-12">
        <p className="text-muted">Complete the calculator to see your contribution</p>
      </div>
    );
  }

  const dailyRounding = jurisdiction.config.dailyRounding;
  const roundedDaily = roundDaily(contribution.totalDaily, dailyRounding);
  const everydayComparison = getEverydayComparison(roundedDaily);

  // Build calculation details for each revenue source
  const getCalculationDetails = (): Record<string, CalculationDetail> => {
    const details: Record<string, CalculationDetail> = {};

    // Property Tax - handle real estate and personal property separately
    const realEstateSource = revenueSources.find(s =>
      s.type === 'property_tax' &&
      (s.id.includes('real-estate') || s.name.toLowerCase().includes('real estate') ||
       (!s.id.includes('personal') && !s.name.toLowerCase().includes('personal')))
    );
    const personalPropertySource = revenueSources.find(s =>
      s.type === 'property_tax' &&
      (s.id.includes('personal') || s.name.toLowerCase().includes('personal'))
    );

    // Calculate components
    let realEstateTax = 0;
    let personalPropertyTax = 0;

    if (realEstateSource && residentProfile.housingStatus === 'own' && residentProfile.homeValue) {
      const assessmentRatio = realEstateSource.base || 1;
      const rate = realEstateSource.rate || 0.01;
      const assessedValue = residentProfile.homeValue * assessmentRatio;
      realEstateTax = assessedValue * rate;
    }

    if (personalPropertySource && residentProfile.vehiclesRegistered) {
      const vehicleValue = 25000; // Assumed average vehicle value
      const totalVehicleValue = residentProfile.vehiclesRegistered * vehicleValue;
      const rate = personalPropertySource.rate || 0.04;
      personalPropertyTax = totalVehicleValue * rate;
    }

    // Show combined property tax with breakdown
    if (realEstateTax > 0 || personalPropertyTax > 0) {
      const parts: string[] = [];
      const valueParts: string[] = [];
      const explanationParts: string[] = [];

      if (realEstateTax > 0 && realEstateSource) {
        const assessmentRatio = realEstateSource.base || 1;
        const rate = realEstateSource.rate || 0.01;
        const perHundred = rate * 100;
        parts.push('Home Value × Rate');
        valueParts.push(`${formatCurrency(residentProfile.homeValue!, false)} × $${perHundred.toFixed(4)}/$100 = ${formatCurrency(realEstateTax)}`);
        explanationParts.push(`Real estate tax: ${formatCurrency(residentProfile.homeValue!, false)} home × $${perHundred.toFixed(4)} per $100 assessed (${(assessmentRatio * 100).toFixed(0)}% of market value)`);
      }

      if (personalPropertyTax > 0 && personalPropertySource) {
        const rate = personalPropertySource.rate || 0.04;
        const perHundred = rate * 100;
        const vehicleValue = 25000;
        parts.push('Vehicles × Avg Value × Rate');
        valueParts.push(`${residentProfile.vehiclesRegistered} × $25,000 × $${perHundred.toFixed(2)}/$100 = ${formatCurrency(personalPropertyTax)}`);
        explanationParts.push(`Personal property tax: ${residentProfile.vehiclesRegistered} vehicle(s) at assumed $${vehicleValue.toLocaleString()} each × $${perHundred.toFixed(2)} per $100`);
      }

      details.propertyTax = {
        label: 'Property Tax',
        formula: parts.join(' + '),
        values: valueParts.join('\n'),
        result: formatCurrency(contribution.breakdown.propertyTax),
        explanation: explanationParts.join('. ') + '.'
      };
    }

    // Income Tax
    const incomeSource = revenueSources.find(s => s.type === 'income_tax');
    if (incomeSource && contribution.breakdown.incomeTax > 0) {
      const rate = incomeSource.rate || 0.01;
      details.incomeTax = {
        label: 'Income Tax',
        formula: 'Household Income × Tax Rate',
        values: `${formatCurrency(residentProfile.householdIncome, false)} × ${(rate * 100).toFixed(2)}%`,
        result: formatCurrency(contribution.breakdown.incomeTax),
        explanation: `All residents pay ${(rate * 100).toFixed(2)}% of their income to ${jurisdiction.name}, regardless of where they work.`
      };
    }

    // Wage Tax
    const wageSource = revenueSources.find(s => s.type === 'wage_tax');
    if (wageSource) {
      const rate = wageSource.rate || 0.01;
      if (residentProfile.worksLocally && contribution.breakdown.wageTax > 0) {
        details.wageTax = {
          label: 'Wage Tax',
          formula: 'Household Income × Wage Tax Rate',
          values: `${formatCurrency(residentProfile.householdIncome, false)} × ${(rate * 100).toFixed(2)}%`,
          result: formatCurrency(contribution.breakdown.wageTax),
          explanation: `Because you work in ${jurisdiction.name}, you pay an additional ${(rate * 100).toFixed(2)}% wage tax on your income.`
        };
      } else {
        details.wageTax = {
          label: 'Wage Tax',
          formula: 'Not applicable (work outside jurisdiction)',
          values: `${formatCurrency(residentProfile.householdIncome, false)} × 0%`,
          result: '$0',
          explanation: `You don't work in ${jurisdiction.name}, so the ${(rate * 100).toFixed(2)}% wage tax doesn't apply to you. If you worked locally, this would add ${formatCurrency(residentProfile.householdIncome * rate)} to your contribution.`
        };
      }
    }

    // Utility Fees
    const utilitySource = revenueSources.find(s => s.type === 'utility_fees');
    if (utilitySource && contribution.breakdown.utilityFees > 0) {
      const baseRate = utilitySource.rate || 50;
      const multiplier = 0.7 + (residentProfile.householdSize * 0.15);
      details.utilityFees = {
        label: 'Utility Fees',
        formula: 'Base Monthly Fee × Household Multiplier × 12 months',
        values: `${formatCurrency(baseRate)} × ${multiplier.toFixed(2)} × 12`,
        result: formatCurrency(contribution.breakdown.utilityFees),
        explanation: `Base utility fee is ${formatCurrency(baseRate)}/month. Your household of ${residentProfile.householdSize} has a ${multiplier.toFixed(2)}x usage multiplier (larger households use more water/sewer).`
      };
    }

    // Sales Tax
    const salesSource = revenueSources.find(s => s.type === 'sales_tax');
    if (salesSource && contribution.breakdown.salesTax > 0) {
      const rate = salesSource.rate || 0.01;
      const estimatedSpending = residentProfile.householdIncome * 0.3;
      details.salesTax = {
        label: 'Sales Tax',
        formula: 'Estimated Taxable Spending × Sales Tax Rate',
        values: `${formatCurrency(estimatedSpending, false)} × ${(rate * 100).toFixed(2)}%`,
        result: formatCurrency(contribution.breakdown.salesTax),
        explanation: `Estimated taxable spending is ~30% of income (${formatCurrency(estimatedSpending, false)}). Local sales tax rate is ${(rate * 100).toFixed(2)}%.`
      };
    }

    return details;
  };

  const calculationDetails = getCalculationDetails();

  // Prepare chart data
  const chartData = contribution.serviceAllocations
    .sort((a, b) => b.daily - a.daily)
    .map((service) => ({
      name: service.categoryName,
      daily: roundDaily(service.daily, dailyRounding),
      color: service.color,
    }));

  // Revenue breakdown for display with details
  const revenueBreakdown = [
    { key: 'propertyTax', name: 'Property Tax', amount: contribution.breakdown.propertyTax },
    { key: 'incomeTax', name: 'Income Tax', amount: contribution.breakdown.incomeTax },
    { key: 'wageTax', name: 'Wage Tax', amount: contribution.breakdown.wageTax },
    { key: 'salesTax', name: 'Sales Tax', amount: contribution.breakdown.salesTax },
    { key: 'utilityFees', name: 'Utility Fees', amount: contribution.breakdown.utilityFees },
    { key: 'otherFees', name: 'Other Fees', amount: contribution.breakdown.otherFees },
  ].filter((r) => r.amount > 0 || calculationDetails[r.key]);

  return (
    <div className="space-y-6">
      {/* Hero Summary */}
      <div className="card bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
        <div className="text-center">
          <h2 className="text-lg font-medium text-secondary-foreground mb-2">
            Your Community Contribution
          </h2>
          <div className="text-5xl font-bold text-primary mb-2">
            {formatCurrency(contribution.totalAnnual, false)}
            <span className="text-2xl font-normal text-secondary-foreground">/year</span>
          </div>
          <div className="text-2xl text-foreground mb-4">
            = <span className="font-semibold">{formatCurrency(roundedDaily)}</span>/day
          </div>
          <p className="text-secondary-foreground">
            That&apos;s {everydayComparison}
          </p>
        </div>
      </div>

      {/* Who Funds the Budget - Revenue Attribution (Prominent placement) */}
      <RevenueAttributionSection
        revenueSources={revenueSources}
        jurisdiction={jurisdiction}
        yourContribution={contribution.totalAnnual}
      />

      {/* Where Your Money Comes From - Enhanced */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Where It Comes From</h3>
          <button
            onClick={() => setExpandedSection(expandedSection === 'revenue' ? null : 'revenue')}
            className="flex items-center gap-1 text-sm text-primary hover:underline"
          >
            <Calculator size={14} />
            {expandedSection === 'revenue' ? 'Hide' : 'Show'} calculations
          </button>
        </div>

        <div className="space-y-4">
          {revenueBreakdown.map((source) => {
            const percentage = contribution.totalAnnual > 0
              ? (source.amount / contribution.totalAnnual) * 100
              : 0;
            const detail = calculationDetails[source.key];
            const isExpanded = showMath === source.key;

            return (
              <div key={source.key} className="space-y-2">
                <div className="flex justify-between text-sm mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{source.name}</span>
                    {detail && (
                      <button
                        onClick={() => setShowMath(isExpanded ? null : source.key)}
                        className="text-muted hover:text-primary"
                        title="Show calculation"
                      >
                        <HelpCircle size={14} />
                      </button>
                    )}
                  </div>
                  <span className="font-medium">
                    {formatCurrency(source.amount, false)}
                    {source.amount > 0 && ` (${formatPercentage(percentage, 0)})`}
                  </span>
                </div>

                {source.amount > 0 && (
                  <div className="h-3 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                )}

                {/* Calculation Detail Dropdown */}
                {isExpanded && detail && (
                  <div className="mt-2 p-3 bg-secondary/50 rounded-lg text-sm space-y-2">
                    <div className="flex items-start gap-2">
                      <Calculator size={14} className="text-primary mt-0.5 shrink-0" />
                      <div>
                        <div className="font-mono text-xs text-muted">{detail.formula}</div>
                        <div className="font-mono text-foreground">{detail.values}</div>
                        <div className="font-bold text-primary">= {detail.result}</div>
                      </div>
                    </div>
                    <p className="text-secondary-foreground text-xs">{detail.explanation}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Jurisdiction Tax Rates Summary */}
        {expandedSection === 'revenue' && (
          <div className="mt-6 pt-4 border-t border-border">
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Info size={14} />
              {jurisdiction.name} Tax Rates & Assumptions
            </h4>
            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              {revenueSources.map((source) => {
                // Format rate based on source type
                let rateDisplay = 'Varies';
                if (source.type === 'property_tax' && source.rate) {
                  // Property tax: show as $ per $100 of assessed value
                  const perHundred = source.rate * 100;
                  rateDisplay = `$${perHundred.toFixed(4)}/$100`;
                } else if (source.type === 'utility_fees' && source.rate) {
                  rateDisplay = `${formatCurrency(source.rate)}/mo base`;
                } else if (source.type === 'permits_fees' && source.rate) {
                  // Permits/fees: rate is typically a per-resident estimate
                  rateDisplay = `~${formatCurrency(source.rate)}/resident`;
                } else if (source.type === 'sales_tax' && source.rate) {
                  rateDisplay = `${(source.rate * 100).toFixed(2)}%`;
                } else if ((source.type === 'income_tax' || source.type === 'wage_tax') && source.rate) {
                  rateDisplay = `${(source.rate * 100).toFixed(2)}%`;
                } else if (source.type === 'grants' || source.type === 'other') {
                  rateDisplay = 'N/A';
                }

                return (
                  <div key={source.id} className="flex justify-between p-2 bg-secondary/30 rounded">
                    <span className="text-muted">{source.name}</span>
                    <span className="font-medium">{rateDisplay}</span>
                  </div>
                );
              })}
            </div>

            {/* Calculation Assumptions */}
            <div className="mt-4 p-3 bg-secondary/20 rounded-lg">
              <h5 className="text-xs font-semibold text-muted mb-2">Calculation Assumptions</h5>
              <ul className="text-xs text-muted space-y-1">
                <li>• <strong>Sales Tax:</strong> Based on ~30% of household income going to taxable purchases</li>
                <li>• <strong>Vehicle Tax:</strong> Assumes average vehicle value of $25,000 per vehicle</li>
                <li>• <strong>Utility Fees:</strong> Scaled by household size (1 person = 0.85×, 4 people = 1.30×)</li>
                <li>• <strong>Service Fees:</strong> Estimated per-resident average from total revenue</li>
              </ul>
            </div>

            <p className="text-xs text-muted mt-3">
              Total jurisdiction revenue: {formatCurrency(jurisdiction.totalBudget, false)} •
              Population: {jurisdiction.population.toLocaleString()} •
              Per capita: {formatCurrency(jurisdiction.totalBudget / jurisdiction.population, false)}
            </p>
          </div>
        )}
      </div>

      {/* How Your Contribution is Allocated */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">How It&apos;s Allocated</h3>
          <button
            onClick={() => setExpandedSection(expandedSection === 'allocation' ? null : 'allocation')}
            className="flex items-center gap-1 text-sm text-primary hover:underline"
          >
            <Info size={14} />
            How is this calculated?
          </button>
        </div>

        {expandedSection === 'allocation' && (
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg text-sm">
            <p className="text-secondary-foreground">
              Your contribution is allocated proportionally based on how {jurisdiction.name} divides its budget.
              For example, if Police receives 30% of the total budget, 30% of your contribution goes to Police.
            </p>
            <div className="mt-2 font-mono text-xs">
              Your allocation = (Category Budget ÷ Total Budget) × Your Contribution
            </div>
          </div>
        )}

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
            >
              <XAxis type="number" tickFormatter={(v) => `$${v.toFixed(2)}`} />
              <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(value: number) => [formatCurrency(value), 'Daily Cost']}
                contentStyle={{
                  background: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: '0.5rem',
                }}
              />
              <Bar dataKey="daily" radius={[0, 4, 4, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Service Tiles */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">What It Supports</h3>
          <button
            onClick={() => setShowServicesModal(true)}
            className="hidden sm:flex items-center gap-1 text-sm text-primary hover:underline"
          >
            <Maximize2 size={14} />
            Expand view
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {contribution.serviceAllocations
            .sort((a, b) => b.daily - a.daily)
            .map((service) => (
              <div
                key={service.categoryId}
                className="p-4 rounded-xl text-white overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform sm:cursor-default sm:hover:scale-100"
                style={{ background: `linear-gradient(135deg, ${service.color}, ${service.color}dd)` }}
                onClick={() => window.innerWidth < 640 ? null : setShowServicesModal(true)}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-white/20 rounded-lg shrink-0">
                    <ServiceIconComponent icon={service.icon} size={24} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm leading-tight truncate">{service.categoryName}</h4>
                    <div className="text-xl font-bold mt-1">
                      {formatCurrency(roundDaily(service.daily, dailyRounding))}/day
                    </div>
                    <div className="text-white/70 text-xs mt-1">
                      {formatCurrency(service.annual, false)}/year
                    </div>
                    <p className="text-white/80 text-xs mt-1 line-clamp-2">{service.description}</p>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Services Modal */}
      {showServicesModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowServicesModal(false)}>
          <div
            className="bg-card rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="text-xl font-semibold">What Your Contribution Supports</h3>
              <button
                onClick={() => setShowServicesModal(false)}
                className="p-2 hover:bg-secondary rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[calc(90vh-80px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {contribution.serviceAllocations
                  .sort((a, b) => b.daily - a.daily)
                  .map((service) => (
                    <div
                      key={service.categoryId}
                      className="p-5 rounded-xl text-white"
                      style={{ background: `linear-gradient(135deg, ${service.color}, ${service.color}dd)` }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-3 bg-white/20 rounded-lg shrink-0">
                          <ServiceIconComponent icon={service.icon} size={28} className="text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-base leading-tight">{service.categoryName}</h4>
                          <div className="text-2xl font-bold mt-2">
                            {formatCurrency(roundDaily(service.daily, dailyRounding))}/day
                          </div>
                          <div className="text-white/70 text-sm mt-1">
                            {formatCurrency(service.annual, false)}/year
                          </div>
                        </div>
                      </div>
                      <p className="text-white/90 text-sm mt-3 leading-relaxed">{service.description}</p>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Collective Impact */}
      <div className="card bg-secondary/30">
        <div className="text-center">
          <p className="text-secondary-foreground mb-2">Your share of the total budget:</p>
          <div className="text-3xl font-bold text-primary mb-2">
            {formatPercentage(contribution.percentOfBudget, 4)}
          </div>
          <p className="text-xs text-muted mb-4">
            {formatCurrency(contribution.totalAnnual, false)} ÷ {formatCurrency(jurisdiction.totalBudget, false)} = {formatPercentage(contribution.percentOfBudget, 4)}
          </p>
          <p className="text-secondary-foreground">
            It takes all <strong>{jurisdiction.population.toLocaleString()}</strong> of us to make{' '}
            {jurisdiction.name} work!
          </p>
        </div>
      </div>

      {/* What-If Scenarios */}
      {(() => {
        // Calculate potential scenarios
        const realEstateSource = revenueSources.find(s =>
          s.type === 'property_tax' &&
          (s.id.includes('real-estate') || s.name.toLowerCase().includes('real estate') ||
           (!s.id.includes('personal') && !s.name.toLowerCase().includes('personal')))
        );
        const wageSource = revenueSources.find(s => s.type === 'wage_tax');
        const personalPropertySource = revenueSources.find(s =>
          s.type === 'property_tax' &&
          (s.id.includes('personal') || s.name.toLowerCase().includes('personal'))
        );

        const scenarios: { title: string; description: string; impact: string; positive: boolean }[] = [];

        // Home ownership scenario
        if (residentProfile.housingStatus === 'rent' && realEstateSource) {
          const potentialTax = jurisdiction.medianHomeValue *
            (realEstateSource.base || 1) *
            (realEstateSource.rate || 0.01);
          scenarios.push({
            title: 'If you owned a home',
            description: `At the median value of ${formatCurrency(jurisdiction.medianHomeValue, false)}`,
            impact: `+${formatCurrency(potentialTax)}/year in property tax`,
            positive: false,
          });
        }

        // Work location scenarios
        if (wageSource) {
          const wageTaxAmount = residentProfile.householdIncome * (wageSource.rate || 0.01);
          if (!residentProfile.worksLocally) {
            scenarios.push({
              title: `If you worked in ${jurisdiction.name}`,
              description: 'Wage tax would apply to your income',
              impact: `+${formatCurrency(wageTaxAmount)}/year`,
              positive: false,
            });
          } else {
            scenarios.push({
              title: `If you worked outside ${jurisdiction.name}`,
              description: 'Wage tax wouldn\'t apply',
              impact: `-${formatCurrency(contribution.breakdown.wageTax)}/year saved`,
              positive: true,
            });
          }
        }

        // Vehicle scenario
        if (personalPropertySource && residentProfile.vehiclesRegistered !== undefined) {
          const additionalVehicleTax = 25000 * (personalPropertySource.rate || 0.04);
          scenarios.push({
            title: 'Each additional vehicle',
            description: 'At assumed $25,000 value',
            impact: `+${formatCurrency(additionalVehicleTax)}/year`,
            positive: false,
          });
        }

        if (scenarios.length === 0) return null;

        return (
          <div className="card border-dashed">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <HelpCircle size={18} />
              Explore Scenarios
            </h3>
            <p className="text-xs text-muted mb-3">
              See how changes to your situation would affect your contribution
            </p>
            <div className="grid sm:grid-cols-2 gap-3">
              {scenarios.map((scenario, idx) => (
                <div key={idx} className="p-3 bg-secondary/30 rounded-lg">
                  <div className="font-medium text-sm">{scenario.title}</div>
                  <div className="text-xs text-muted">{scenario.description}</div>
                  <div className={`text-sm font-semibold mt-1 ${scenario.positive ? 'text-green-600' : 'text-amber-600'}`}>
                    {scenario.impact}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
