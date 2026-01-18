'use client';

import { useState } from 'react';
import { useBudgetStore } from '@/store/budgetStore';
import {
  Jurisdiction,
  JurisdictionType,
  BudgetCategory,
  RevenueSource,
  RevenueType,
  ServiceIcon,
} from '@/types';
import { formatCurrency } from '@/lib/calculations';
import { ServiceIconComponent } from '@/components/ui/Icons';
import {
  Plus,
  Trash2,
  ChevronRight,
  ChevronLeft,
  Check,
  Building2,
  DollarSign,
  PieChart,
} from 'lucide-react';

type Step = 'basics' | 'revenue' | 'categories' | 'review';

const JURISDICTION_TYPES: { value: JurisdictionType; label: string }[] = [
  { value: 'township', label: 'Township' },
  { value: 'city', label: 'City' },
  { value: 'village', label: 'Village' },
  { value: 'borough', label: 'Borough' },
  { value: 'county', label: 'County' },
];

const REVENUE_TYPES: { value: RevenueType; label: string; description: string }[] = [
  { value: 'property_tax', label: 'Property Tax', description: 'Based on assessed property values' },
  { value: 'income_tax', label: 'Income Tax', description: 'Tax on resident income' },
  { value: 'wage_tax', label: 'Wage Tax', description: 'Tax for those who work locally' },
  { value: 'sales_tax', label: 'Sales Tax', description: 'Tax on retail purchases' },
  { value: 'utility_fees', label: 'Utility Fees', description: 'Water, sewer, trash fees' },
  { value: 'permits_fees', label: 'Permits & Fees', description: 'Building permits, licenses' },
  { value: 'grants', label: 'Grants', description: 'State/federal grants' },
  { value: 'other', label: 'Other Revenue', description: 'Miscellaneous revenue' },
];

const SERVICE_ICONS: { value: ServiceIcon; label: string }[] = [
  { value: 'shield', label: 'Police/Safety' },
  { value: 'flame', label: 'Fire/EMS' },
  { value: 'road', label: 'Roads' },
  { value: 'trees', label: 'Parks' },
  { value: 'building', label: 'Admin' },
  { value: 'droplet', label: 'Water' },
  { value: 'book', label: 'Library' },
  { value: 'heart', label: 'Health' },
  { value: 'truck', label: 'Public Works' },
  { value: 'home', label: 'Housing' },
  { value: 'users', label: 'Community' },
];

const COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
  '#06b6d4', '#ec4899', '#6b7280', '#84cc16', '#f97316',
];

export function JurisdictionBuilder() {
  const { setJurisdiction, setBudgetCategories, setRevenueSources } = useBudgetStore();

  const [step, setStep] = useState<Step>('basics');

  // Basics
  const [name, setName] = useState('');
  const [type, setType] = useState<JurisdictionType>('city');
  const [state, setState] = useState('');
  const [population, setPopulation] = useState(10000);
  const [medianHomeValue, setMedianHomeValue] = useState(200000);
  const [fiscalYear, setFiscalYear] = useState('2024');

  // Revenue Sources
  const [revenueSources, setRevenueSourcesLocal] = useState<Partial<RevenueSource>[]>([
    { type: 'property_tax', name: 'Property Tax', amount: 0, rate: 0.01, base: 0.35 },
  ]);

  // Budget Categories
  const [categories, setCategories] = useState<Partial<BudgetCategory>[]>([
    { name: 'Safety Services', amount: 0, fixedPercentage: 75, icon: 'shield', color: COLORS[0] },
  ]);

  const totalRevenue = revenueSources.reduce((sum, r) => sum + (r.amount || 0), 0);
  const totalBudget = categories.reduce((sum, c) => sum + (c.amount || 0), 0);

  const addRevenueSource = () => {
    setRevenueSourcesLocal([
      ...revenueSources,
      { type: 'other', name: '', amount: 0 },
    ]);
  };

  const updateRevenueSource = (index: number, updates: Partial<RevenueSource>) => {
    setRevenueSourcesLocal(
      revenueSources.map((r, i) => (i === index ? { ...r, ...updates } : r))
    );
  };

  const removeRevenueSource = (index: number) => {
    setRevenueSourcesLocal(revenueSources.filter((_, i) => i !== index));
  };

  const addCategory = () => {
    const usedColors = categories.map((c) => c.color);
    const nextColor = COLORS.find((c) => !usedColors.includes(c)) || COLORS[0];
    setCategories([
      ...categories,
      { name: '', amount: 0, fixedPercentage: 50, icon: 'building', color: nextColor },
    ]);
  };

  const updateCategory = (index: number, updates: Partial<BudgetCategory>) => {
    setCategories(
      categories.map((c, i) => (i === index ? { ...c, ...updates } : c))
    );
  };

  const removeCategory = (index: number) => {
    setCategories(categories.filter((_, i) => i !== index));
  };

  const handleFinish = () => {
    const jurisdictionId = name.toLowerCase().replace(/\s+/g, '-');

    const jurisdiction: Jurisdiction = {
      id: jurisdictionId,
      name,
      type,
      state,
      population,
      medianHomeValue,
      totalBudget,
      fiscalYear,
      config: {
        maxCategories: categories.length,
        emphasis: population < 5000 ? 'systems_over_departments' : 'balanced_services',
        showFixedCosts: true,
        comparisonPhrase: type === 'township' ? 'community system' : 'city services',
        dailyRounding: population < 5000 ? 0.25 : 0.1,
      },
    };

    const fullRevenueSources: RevenueSource[] = revenueSources.map((r, i) => ({
      id: `revenue-${i}`,
      jurisdictionId,
      type: r.type || 'other',
      name: r.name || 'Revenue',
      amount: r.amount || 0,
      rate: r.rate,
      base: r.base,
      description: r.description,
    }));

    const fullCategories: BudgetCategory[] = categories.map((c, i) => ({
      id: `category-${i}`,
      jurisdictionId,
      name: c.name || 'Service',
      amount: c.amount || 0,
      fixedPercentage: c.fixedPercentage || 50,
      icon: c.icon || 'building',
      color: c.color || COLORS[i % COLORS.length],
      description: c.description || '',
      constraints: [],
    }));

    setJurisdiction(jurisdiction);
    setBudgetCategories(fullCategories);
    setRevenueSources(fullRevenueSources);
  };

  const canProceed = () => {
    switch (step) {
      case 'basics':
        return name.trim() && state.trim() && population > 0;
      case 'revenue':
        return revenueSources.length > 0 && totalRevenue > 0;
      case 'categories':
        return categories.length > 0 && totalBudget > 0;
      default:
        return true;
    }
  };

  const steps: { id: Step; label: string; icon: React.ReactNode }[] = [
    { id: 'basics', label: 'Basics', icon: <Building2 size={18} /> },
    { id: 'revenue', label: 'Revenue', icon: <DollarSign size={18} /> },
    { id: 'categories', label: 'Budget', icon: <PieChart size={18} /> },
    { id: 'review', label: 'Review', icon: <Check size={18} /> },
  ];

  return (
    <div className="card">
      {/* Step Indicator */}
      <div className="flex items-center justify-between mb-8">
        {steps.map((s, i) => (
          <div key={s.id} className="flex items-center">
            <button
              onClick={() => setStep(s.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                step === s.id
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted hover:text-foreground'
              }`}
            >
              {s.icon}
              <span className="hidden sm:inline">{s.label}</span>
            </button>
            {i < steps.length - 1 && (
              <ChevronRight size={16} className="mx-2 text-muted" />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      {step === 'basics' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Basic Information</h2>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Jurisdiction Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., City of Springfield"
                className="input"
              />
            </div>

            <div>
              <label className="label">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as JurisdictionType)}
                className="input"
              >
                {JURISDICTION_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">State</label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value.toUpperCase().slice(0, 2))}
                placeholder="e.g., OH"
                maxLength={2}
                className="input"
              />
            </div>

            <div>
              <label className="label">Fiscal Year</label>
              <input
                type="text"
                value={fiscalYear}
                onChange={(e) => setFiscalYear(e.target.value)}
                placeholder="e.g., 2024"
                className="input"
              />
            </div>

            <div>
              <label className="label">Population</label>
              <input
                type="number"
                value={population}
                onChange={(e) => setPopulation(Number(e.target.value))}
                min={100}
                className="input"
              />
            </div>

            <div>
              <label className="label">Median Home Value</label>
              <input
                type="number"
                value={medianHomeValue}
                onChange={(e) => setMedianHomeValue(Number(e.target.value))}
                min={50000}
                step={5000}
                className="input"
              />
            </div>
          </div>
        </div>
      )}

      {step === 'revenue' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Revenue Sources</h2>
            <div className="text-right">
              <div className="text-sm text-muted">Total Revenue</div>
              <div className="text-lg font-bold text-primary">
                {formatCurrency(totalRevenue, false)}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {revenueSources.map((source, index) => (
              <div key={index} className="p-4 border border-border rounded-lg">
                <div className="flex items-start gap-4">
                  <div className="flex-1 grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="label text-sm">Type</label>
                      <select
                        value={source.type}
                        onChange={(e) =>
                          updateRevenueSource(index, {
                            type: e.target.value as RevenueType,
                            name: REVENUE_TYPES.find((t) => t.value === e.target.value)?.label,
                          })
                        }
                        className="input"
                      >
                        {REVENUE_TYPES.map((t) => (
                          <option key={t.value} value={t.value}>
                            {t.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="label text-sm">Name</label>
                      <input
                        type="text"
                        value={source.name || ''}
                        onChange={(e) => updateRevenueSource(index, { name: e.target.value })}
                        className="input"
                      />
                    </div>

                    <div>
                      <label className="label text-sm">Annual Amount</label>
                      <input
                        type="number"
                        value={source.amount || ''}
                        onChange={(e) =>
                          updateRevenueSource(index, { amount: Number(e.target.value) })
                        }
                        min={0}
                        step={1000}
                        className="input"
                      />
                    </div>

                    {(source.type === 'property_tax' ||
                      source.type === 'income_tax' ||
                      source.type === 'wage_tax' ||
                      source.type === 'sales_tax') && (
                      <div>
                        <label className="label text-sm">
                          Rate {source.type === 'property_tax' ? '(mills ÷ 1000)' : '(decimal)'}
                        </label>
                        <input
                          type="number"
                          value={source.rate || ''}
                          onChange={(e) =>
                            updateRevenueSource(index, { rate: Number(e.target.value) })
                          }
                          min={0}
                          max={1}
                          step={0.001}
                          className="input"
                          placeholder="e.g., 0.01 for 1%"
                        />
                      </div>
                    )}

                    {source.type === 'utility_fees' && (
                      <div>
                        <label className="label text-sm">Monthly per household</label>
                        <input
                          type="number"
                          value={source.rate || ''}
                          onChange={(e) =>
                            updateRevenueSource(index, { rate: Number(e.target.value) })
                          }
                          min={0}
                          step={5}
                          className="input"
                          placeholder="e.g., 75"
                        />
                      </div>
                    )}
                  </div>

                  {revenueSources.length > 1 && (
                    <button
                      onClick={() => removeRevenueSource(index)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <button onClick={addRevenueSource} className="btn-secondary flex items-center gap-2">
            <Plus size={18} />
            Add Revenue Source
          </button>
        </div>
      )}

      {step === 'categories' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Budget Categories</h2>
            <div className="text-right">
              <div className="text-sm text-muted">Total Budget</div>
              <div className={`text-lg font-bold ${
                Math.abs(totalBudget - totalRevenue) < 1000 ? 'text-accent' : 'text-amber-500'
              }`}>
                {formatCurrency(totalBudget, false)}
              </div>
              {Math.abs(totalBudget - totalRevenue) >= 1000 && (
                <div className="text-xs text-amber-600">
                  {totalBudget > totalRevenue ? 'Over' : 'Under'} revenue by{' '}
                  {formatCurrency(Math.abs(totalBudget - totalRevenue), false)}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            {categories.map((category, index) => (
              <div key={index} className="p-4 border border-border rounded-lg">
                <div className="flex items-start gap-4">
                  <div
                    className="p-3 rounded-xl text-white shrink-0"
                    style={{ background: category.color }}
                  >
                    <ServiceIconComponent icon={category.icon || 'building'} size={24} />
                  </div>

                  <div className="flex-1 grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="label text-sm">Name</label>
                      <input
                        type="text"
                        value={category.name || ''}
                        onChange={(e) => updateCategory(index, { name: e.target.value })}
                        placeholder="e.g., Police & Safety"
                        className="input"
                      />
                    </div>

                    <div>
                      <label className="label text-sm">Amount</label>
                      <input
                        type="number"
                        value={category.amount || ''}
                        onChange={(e) => updateCategory(index, { amount: Number(e.target.value) })}
                        min={0}
                        step={1000}
                        className="input"
                      />
                    </div>

                    <div>
                      <label className="label text-sm">Icon</label>
                      <select
                        value={category.icon}
                        onChange={(e) => updateCategory(index, { icon: e.target.value as ServiceIcon })}
                        className="input"
                      >
                        {SERVICE_ICONS.map((icon) => (
                          <option key={icon.value} value={icon.value}>
                            {icon.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="label text-sm">Color</label>
                      <div className="flex gap-2 flex-wrap">
                        {COLORS.map((color) => (
                          <button
                            key={color}
                            onClick={() => updateCategory(index, { color })}
                            className={`w-8 h-8 rounded-full border-2 ${
                              category.color === color ? 'border-foreground' : 'border-transparent'
                            }`}
                            style={{ background: color }}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="label text-sm">
                        Fixed/Non-discretionary: {category.fixedPercentage}%
                      </label>
                      <input
                        type="range"
                        value={category.fixedPercentage}
                        onChange={(e) =>
                          updateCategory(index, { fixedPercentage: Number(e.target.value) })
                        }
                        min={0}
                        max={100}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted">
                        <span>Fully discretionary</span>
                        <span>Fully fixed</span>
                      </div>
                    </div>
                  </div>

                  {categories.length > 1 && (
                    <button
                      onClick={() => removeCategory(index)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <button onClick={addCategory} className="btn-secondary flex items-center gap-2">
            <Plus size={18} />
            Add Category
          </button>
        </div>
      )}

      {step === 'review' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Review Your Jurisdiction</h2>

          <div className="grid sm:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-medium text-muted">Basic Info</h3>
              <dl className="space-y-2">
                <div className="flex justify-between">
                  <dt className="text-muted">Name</dt>
                  <dd className="font-medium">{name}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted">Type</dt>
                  <dd className="font-medium capitalize">{type}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted">State</dt>
                  <dd className="font-medium">{state}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted">Population</dt>
                  <dd className="font-medium">{population.toLocaleString()}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted">Median Home Value</dt>
                  <dd className="font-medium">{formatCurrency(medianHomeValue, false)}</dd>
                </div>
              </dl>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium text-muted">Budget Summary</h3>
              <dl className="space-y-2">
                <div className="flex justify-between">
                  <dt className="text-muted">Total Revenue</dt>
                  <dd className="font-medium">{formatCurrency(totalRevenue, false)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted">Total Budget</dt>
                  <dd className="font-medium">{formatCurrency(totalBudget, false)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted">Per Capita</dt>
                  <dd className="font-medium">
                    {formatCurrency(totalBudget / population, false)}/resident
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted">Daily per Resident</dt>
                  <dd className="font-medium">
                    {formatCurrency(totalBudget / population / 365)}/day
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium text-muted">Budget Categories</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {categories.map((cat, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 rounded-lg"
                  style={{ background: `${cat.color}15` }}
                >
                  <div
                    className="p-2 rounded-lg text-white"
                    style={{ background: cat.color }}
                  >
                    <ServiceIconComponent icon={cat.icon || 'building'} size={18} />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{cat.name}</div>
                    <div className="text-sm text-muted">
                      {formatCurrency(cat.amount || 0, false)} •{' '}
                      {cat.fixedPercentage}% fixed
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
        <button
          onClick={() => {
            const stepOrder: Step[] = ['basics', 'revenue', 'categories', 'review'];
            const currentIndex = stepOrder.indexOf(step);
            if (currentIndex > 0) {
              setStep(stepOrder[currentIndex - 1]);
            }
          }}
          disabled={step === 'basics'}
          className="btn-secondary flex items-center gap-2 disabled:opacity-50"
        >
          <ChevronLeft size={18} />
          Back
        </button>

        {step === 'review' ? (
          <button
            onClick={handleFinish}
            disabled={!canProceed()}
            className="btn-primary flex items-center gap-2 disabled:opacity-50"
          >
            <Check size={18} />
            Create Jurisdiction
          </button>
        ) : (
          <button
            onClick={() => {
              const stepOrder: Step[] = ['basics', 'revenue', 'categories', 'review'];
              const currentIndex = stepOrder.indexOf(step);
              if (currentIndex < stepOrder.length - 1) {
                setStep(stepOrder[currentIndex + 1]);
              }
            }}
            disabled={!canProceed()}
            className="btn-primary flex items-center gap-2 disabled:opacity-50"
          >
            Next
            <ChevronRight size={18} />
          </button>
        )}
      </div>
    </div>
  );
}
