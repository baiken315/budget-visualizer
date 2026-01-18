'use client';

import { useState, useEffect } from 'react';
import { useBudgetStore } from '@/store/budgetStore';
import { ResidentProfile, HousingStatus } from '@/types';
import { formatCurrency } from '@/lib/calculations';

export function ResidentCalculator() {
  const { jurisdiction, residentProfile, setResidentProfile, revenueSources } = useBudgetStore();

  const [housingStatus, setHousingStatus] = useState<HousingStatus>(
    residentProfile?.housingStatus || 'own'
  );
  const [homeValue, setHomeValue] = useState(
    residentProfile?.homeValue || jurisdiction?.medianHomeValue || 200000
  );
  const [householdIncome, setHouseholdIncome] = useState(
    residentProfile?.householdIncome || 65000
  );
  const [worksLocally, setWorksLocally] = useState(residentProfile?.worksLocally ?? true);
  const [householdSize, setHouseholdSize] = useState(residentProfile?.householdSize || 2);
  const [vehiclesRegistered, setVehiclesRegistered] = useState(residentProfile?.vehiclesRegistered || 2);

  // Update profile when inputs change
  useEffect(() => {
    if (!jurisdiction) return;

    const profile: ResidentProfile = {
      jurisdictionId: jurisdiction.id,
      housingStatus,
      homeValue: housingStatus === 'own' ? homeValue : undefined,
      householdIncome,
      worksLocally,
      householdSize,
      vehiclesRegistered,
    };

    setResidentProfile(profile);
  }, [
    jurisdiction,
    housingStatus,
    homeValue,
    householdIncome,
    worksLocally,
    householdSize,
    vehiclesRegistered,
    setResidentProfile,
  ]);

  if (!jurisdiction) {
    return (
      <div className="card text-center py-12">
        <p className="text-muted">Please select a jurisdiction to begin</p>
      </div>
    );
  }

  // Check if income tax applies
  const hasIncomeTax = revenueSources.some(
    (s) => s.type === 'income_tax' || s.type === 'wage_tax'
  );

  // Check if personal property tax (vehicle tax) applies
  const hasPersonalPropertyTax = revenueSources.some(
    (s) => s.type === 'property_tax' &&
           (s.id.includes('personal') || s.name.toLowerCase().includes('personal'))
  );

  return (
    <div className="card">
      <h2 className="text-xl font-semibold mb-6">Tell Us About Your Household</h2>
      <p className="text-secondary-foreground mb-6">
        Answer a few questions to see your personal contribution to {jurisdiction.name}
      </p>

      <div className="space-y-6">
        {/* Housing Status */}
        <div>
          <label className="label">Do you own or rent your home?</label>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setHousingStatus('own')}
              className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
                housingStatus === 'own'
                  ? 'border-primary bg-primary/10 text-primary font-medium'
                  : 'border-border hover:border-muted'
              }`}
            >
              Own
            </button>
            <button
              type="button"
              onClick={() => setHousingStatus('rent')}
              className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
                housingStatus === 'rent'
                  ? 'border-primary bg-primary/10 text-primary font-medium'
                  : 'border-border hover:border-muted'
              }`}
            >
              Rent
            </button>
          </div>
        </div>

        {/* Home Value (only for owners) */}
        {housingStatus === 'own' && (
          <div>
            <label className="label">
              Estimated home value
              <span className="font-normal text-muted ml-2">
                (Median: {formatCurrency(jurisdiction.medianHomeValue, false)})
              </span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none">$</span>
              <input
                type="number"
                value={homeValue}
                onChange={(e) => setHomeValue(Number(e.target.value))}
                className="input pl-7"
                min={50000}
                max={2000000}
                step={5000}
              />
            </div>
            <input
              type="range"
              value={homeValue}
              onChange={(e) => setHomeValue(Number(e.target.value))}
              className="w-full mt-2 accent-primary"
              min={50000}
              max={2000000}
              step={5000}
            />
          </div>
        )}

        {/* Household Income */}
        <div>
          <label className="label">Annual household income</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none">$</span>
            <input
              type="number"
              value={householdIncome}
              onChange={(e) => setHouseholdIncome(Number(e.target.value))}
              className="input pl-7"
              min={20000}
              max={500000}
              step={1000}
            />
          </div>
          <input
            type="range"
            value={householdIncome}
            onChange={(e) => setHouseholdIncome(Number(e.target.value))}
            className="w-full mt-2 accent-primary"
            min={20000}
            max={250000}
            step={1000}
          />
        </div>

        {/* Works Locally (only if income/wage tax exists) */}
        {hasIncomeTax && (
          <div>
            <label className="label">Do you work in {jurisdiction.name}?</label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setWorksLocally(true)}
                className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
                  worksLocally
                    ? 'border-primary bg-primary/10 text-primary font-medium'
                    : 'border-border hover:border-muted'
                }`}
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => setWorksLocally(false)}
                className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
                  !worksLocally
                    ? 'border-primary bg-primary/10 text-primary font-medium'
                    : 'border-border hover:border-muted'
                }`}
              >
                No
              </button>
            </div>
          </div>
        )}

        {/* Household Size */}
        <div>
          <label className="label">Household size</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setHouseholdSize(size)}
                className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
                  householdSize === size
                    ? 'border-primary bg-primary/10 text-primary font-medium'
                    : 'border-border hover:border-muted'
                }`}
              >
                {size}{size === 5 ? '+' : ''}
              </button>
            ))}
          </div>
        </div>

        {/* Vehicles (only if personal property tax exists) */}
        {hasPersonalPropertyTax && (
          <div>
            <label className="label">Vehicles registered in {jurisdiction.name}</label>
            <div className="flex gap-2">
              {[0, 1, 2, 3, 4].map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => setVehiclesRegistered(count)}
                  className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
                    vehiclesRegistered === count
                      ? 'border-primary bg-primary/10 text-primary font-medium'
                      : 'border-border hover:border-muted'
                  }`}
                >
                  {count}{count === 4 ? '+' : ''}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted mt-2">
              Personal property tax is assessed on vehicles at approximately $4.57 per $100 of value
            </p>
          </div>
        )}

        {housingStatus === 'rent' && (
          <div className="bg-secondary/50 p-4 rounded-lg">
            <p className="text-sm text-secondary-foreground">
              <strong>Note for renters:</strong> While you don&apos;t pay property tax directly,
              a portion of your rent typically covers your landlord&apos;s property taxes.
              This calculator focuses on other contributions you make to {jurisdiction.name}.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
