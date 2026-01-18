'use client';

import { useState, useMemo } from 'react';
import { useBudgetStore } from '@/store/budgetStore';
import {
  formatCurrency,
  formatPercentage,
  getFixedAmount,
  getDiscretionaryAmount,
  validateBudgetChanges,
} from '@/lib/calculations';
import { ServiceIconComponent } from '@/components/ui/Icons';
import { Lock, AlertTriangle, Info, RotateCcw, TrendingDown, TrendingUp, Minus } from 'lucide-react';

export function BudgetSimulator() {
  const {
    jurisdiction,
    budgetCategories,
    scenarioCategories,
    currentScenario,
    startScenario,
    adjustCategory,
    resetScenario,
  } = useBudgetStore();

  const [showConstraints, setShowConstraints] = useState<string | null>(null);

  // Calculate totals and validation
  const originalTotal = useMemo(
    () => budgetCategories.reduce((sum, cat) => sum + cat.amount, 0),
    [budgetCategories]
  );

  const scenarioTotal = useMemo(
    () => scenarioCategories.reduce((sum, cat) => sum + cat.amount, 0),
    [scenarioCategories]
  );

  const budgetDifference = scenarioTotal - originalTotal;

  const validation = useMemo(() => {
    if (!currentScenario) return null;
    return validateBudgetChanges(budgetCategories, currentScenario.adjustments);
  }, [budgetCategories, currentScenario]);

  // Calculate per-resident tax impact
  const taxImpactPerResident = jurisdiction
    ? budgetDifference / jurisdiction.population
    : 0;

  if (!jurisdiction || budgetCategories.length === 0) {
    return (
      <div className="card text-center py-12">
        <p className="text-muted">Please select a jurisdiction to use the budget simulator</p>
      </div>
    );
  }

  if (!currentScenario) {
    return (
      <div className="card">
        <div className="text-center py-8">
          <h2 className="text-xl font-semibold mb-4">Budget Prioritization Simulator</h2>
          <p className="text-secondary-foreground mb-6 max-w-md mx-auto">
            Explore how budget changes affect services and taxes. See what&apos;s fixed,
            what&apos;s flexible, and the real trade-offs involved in budget decisions.
          </p>
          <button onClick={startScenario} className="btn-primary">
            Start Building Your Budget
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with totals */}
      <div className="card">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">Your Budget Scenario</h2>
            <p className="text-secondary-foreground text-sm">
              Slide to adjust spending. Reductions below the original level lower taxes.
            </p>
          </div>
          <button
            onClick={resetScenario}
            className="btn-secondary flex items-center gap-2"
          >
            <RotateCcw size={16} />
            Reset
          </button>
        </div>

        {/* Budget Balance Indicator */}
        <div className={`mt-4 p-4 rounded-lg ${
          budgetDifference < 0
            ? 'bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800'
            : budgetDifference > 0
            ? 'bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800'
            : 'bg-secondary/30'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Your Budget Total</span>
            <span className="text-lg font-bold">
              {formatCurrency(scenarioTotal, false)}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            {budgetDifference < 0 ? (
              <>
                <TrendingDown size={16} className="text-green-600" />
                <span className="text-green-700 dark:text-green-400">
                  Tax savings: <strong>{formatCurrency(Math.abs(taxImpactPerResident))}/year</strong> per resident
                  ({formatCurrency(Math.abs(taxImpactPerResident) / 365)}/day)
                </span>
              </>
            ) : budgetDifference > 0 ? (
              <>
                <TrendingUp size={16} className="text-amber-600" />
                <span className="text-amber-700 dark:text-amber-400">
                  Tax increase: <strong>+{formatCurrency(taxImpactPerResident)}/year</strong> per resident
                  (+{formatCurrency(taxImpactPerResident / 365)}/day)
                </span>
              </>
            ) : (
              <>
                <Minus size={16} className="text-muted" />
                <span className="text-muted">No change from current budget</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Category Sliders */}
      <div className="space-y-4">
        {scenarioCategories.map((category) => {
          const original = budgetCategories.find((c) => c.id === category.id);
          if (!original) return null;

          const fixedAmount = getFixedAmount(original);
          const discretionaryAmount = getDiscretionaryAmount(original);
          const change = category.amount - original.amount;
          const percentChange = (change / original.amount) * 100;

          // Calculate slider bounds - allow reduction to fixed minimum, increase by 50% of discretionary
          const minAmount = fixedAmount;
          const maxAmount = original.amount + discretionaryAmount * 0.5;

          // Calculate position percentages for visual
          const sliderRange = maxAmount - minAmount;
          const currentPosition = ((category.amount - minAmount) / sliderRange) * 100;
          const originalPosition = ((original.amount - minAmount) / sliderRange) * 100;

          return (
            <div key={category.id} className="card">
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div
                  className="p-3 rounded-xl text-white shrink-0"
                  style={{ background: category.color }}
                >
                  <ServiceIconComponent icon={category.icon} size={24} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{category.name}</h3>
                    <div className="text-right">
                      <div className="font-bold">
                        {formatCurrency(category.amount, false)}
                      </div>
                      {change !== 0 && (
                        <div className={`text-sm font-medium ${change > 0 ? 'text-amber-600' : 'text-green-600'}`}>
                          {change > 0 ? '+' : ''}{formatCurrency(change, false)} ({formatPercentage(percentChange, 1)})
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Custom Slider Track with visual markers */}
                  <div className="relative mb-2">
                    {/* Track background */}
                    <div className="h-3 rounded-full bg-secondary overflow-hidden relative">
                      {/* Filled portion up to current value */}
                      <div
                        className="absolute h-full rounded-full transition-all"
                        style={{
                          width: `${currentPosition}%`,
                          background: change < 0
                            ? 'linear-gradient(90deg, #10b981, #34d399)'
                            : change > 0
                            ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
                            : category.color
                        }}
                      />
                      {/* Original position marker */}
                      <div
                        className="absolute top-0 bottom-0 w-0.5 bg-foreground/50"
                        style={{ left: `${originalPosition}%` }}
                        title="Current budget"
                      />
                    </div>

                    {/* Hidden range input overlaid */}
                    <input
                      type="range"
                      value={category.amount}
                      onChange={(e) => adjustCategory(category.id, Number(e.target.value))}
                      min={minAmount}
                      max={maxAmount}
                      step={1000}
                      className="absolute inset-0 w-full h-3 opacity-0 cursor-pointer"
                    />

                    {/* Custom thumb indicator */}
                    <div
                      className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-2 border-white shadow-md pointer-events-none transition-all"
                      style={{
                        left: `calc(${currentPosition}% - 10px)`,
                        background: change < 0
                          ? '#10b981'
                          : change > 0
                          ? '#f59e0b'
                          : category.color
                      }}
                    />
                  </div>

                  {/* Labels below slider */}
                  <div className="flex justify-between text-xs text-muted">
                    <span className="flex items-center gap-1">
                      <Lock size={10} />
                      Min: {formatCurrency(fixedAmount, false)}
                    </span>
                    <span className="text-foreground/60">
                      ↑ Current: {formatCurrency(original.amount, false)}
                    </span>
                    <span>
                      Max: {formatCurrency(maxAmount, false)}
                    </span>
                  </div>

                  {/* Constraints Info */}
                  {original.constraints && original.constraints.length > 0 && (
                    <button
                      onClick={() =>
                        setShowConstraints(showConstraints === category.id ? null : category.id)
                      }
                      className="flex items-center gap-1 text-sm text-muted hover:text-foreground mt-3"
                    >
                      <Info size={14} />
                      Why can&apos;t I go below {formatCurrency(fixedAmount, false)}?
                    </button>
                  )}

                  {showConstraints === category.id && original.constraints && (
                    <div className="mt-2 p-3 bg-secondary/50 rounded-lg text-sm">
                      <p className="font-medium mb-2">{formatCurrency(fixedAmount, false)} is locked due to:</p>
                      <ul className="list-disc list-inside space-y-1 text-secondary-foreground">
                        {original.constraints.map((constraint, i) => (
                          <li key={i}>{constraint}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Validation Errors */}
      {validation && !validation.valid && (
        <div className="card border-red-300 bg-red-50 dark:bg-red-950/20">
          <h3 className="font-semibold text-red-700 dark:text-red-400 flex items-center gap-2">
            <AlertTriangle size={18} />
            Budget Issues
          </h3>
          <ul className="mt-2 space-y-1 text-sm text-red-600 dark:text-red-400">
            {validation.errors.map((error, i) => (
              <li key={i}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Service Implications */}
      {validation && validation.serviceImplications.length > 0 && (
        <div className="card">
          <h3 className="font-semibold mb-4">Impact of Your Changes</h3>
          <div className="space-y-3">
            {validation.serviceImplications.map((impl) => (
              <div
                key={impl.categoryId}
                className={`p-3 rounded-lg ${
                  impl.severity === 'high'
                    ? 'bg-red-100 dark:bg-red-950/30 border border-red-200 dark:border-red-800'
                    : impl.severity === 'medium'
                    ? 'bg-amber-100 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800'
                    : 'bg-green-100 dark:bg-green-950/30 border border-green-200 dark:border-green-800'
                }`}
              >
                <div className="font-medium">{impl.categoryName}</div>
                <div className="text-sm text-secondary-foreground">
                  {impl.changeDescription}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary */}
      {Math.abs(budgetDifference) > 0 && (
        <div className="card bg-primary/5 border-primary/20">
          <h3 className="font-semibold mb-2">What This Means</h3>
          <p className="text-secondary-foreground">
            {budgetDifference > 0 ? (
              <>
                Your scenario would require an additional{' '}
                <strong>{formatCurrency(taxImpactPerResident)}</strong> per resident annually
                (about <strong>{formatCurrency(taxImpactPerResident / 365)}/day</strong>) to fund.
              </>
            ) : (
              <>
                Your scenario would save{' '}
                <strong>{formatCurrency(Math.abs(taxImpactPerResident))}</strong> per resident annually
                (about <strong>{formatCurrency(Math.abs(taxImpactPerResident) / 365)}/day</strong>).
              </>
            )}
          </p>
        </div>
      )}
    </div>
  );
}
