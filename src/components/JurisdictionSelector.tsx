'use client';

import { useState } from 'react';
import { useBudgetStore } from '@/store/budgetStore';
import { getSampleJurisdiction } from '@/data/sampleData';
import { JurisdictionBuilder } from '@/components/JurisdictionBuilder';
import { Building2, TreePine, MapPin, PlusCircle, X } from 'lucide-react';

export function JurisdictionSelector() {
  const {
    jurisdiction,
    setJurisdiction,
    setBudgetCategories,
    setRevenueSources,
    setResidentProfile,
  } = useBudgetStore();

  const [showBuilder, setShowBuilder] = useState(false);

  const loadSampleData = (type: 'township' | 'city') => {
    const data = getSampleJurisdiction(type);
    setJurisdiction(data.jurisdiction);
    setBudgetCategories(data.categories);
    setRevenueSources(data.revenue);
    // Pre-fill with average resident
    setResidentProfile(data.averageResident);
  };

  if (jurisdiction) {
    return (
      <div className="card flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <MapPin className="text-primary" size={24} />
          </div>
          <div>
            <div className="font-semibold">{jurisdiction.name}</div>
            <div className="text-sm text-muted">
              {jurisdiction.type.charAt(0).toUpperCase() + jurisdiction.type.slice(1)} •{' '}
              {jurisdiction.population.toLocaleString()} residents • FY {jurisdiction.fiscalYear}
            </div>
          </div>
        </div>
        <button
          onClick={() => {
            useBudgetStore.getState().resetAll();
          }}
          className="text-sm text-primary hover:underline"
        >
          Change
        </button>
      </div>
    );
  }

  if (showBuilder) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Create Your Jurisdiction</h2>
          <button
            onClick={() => setShowBuilder(false)}
            className="btn-secondary flex items-center gap-2"
          >
            <X size={16} />
            Cancel
          </button>
        </div>
        <JurisdictionBuilder />
      </div>
    );
  }

  return (
    <div className="card">
      <h2 className="text-xl font-semibold mb-2">Welcome to Budget Builder</h2>
      <p className="text-secondary-foreground mb-6">
        Understand how your tax dollars support your community. Select a sample jurisdiction
        to explore, or create your own.
      </p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Small Township Option */}
        <button
          onClick={() => loadSampleData('township')}
          className="group p-6 text-left border-2 border-border rounded-xl hover:border-primary transition-all"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl group-hover:bg-green-200 dark:group-hover:bg-green-900/50 transition-colors">
              <TreePine className="text-green-600" size={28} />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Small Township</h3>
              <p className="text-sm text-muted">~3,200 residents</p>
            </div>
          </div>
          <p className="text-sm text-secondary-foreground">
            Liberty Township, OH - A tight-knit community with a $2.8M budget focused on
            essential services.
          </p>
          <div className="mt-3 text-sm text-primary font-medium group-hover:underline">
            Explore this township →
          </div>
        </button>

        {/* Medium City Option */}
        <button
          onClick={() => loadSampleData('city')}
          className="group p-6 text-left border-2 border-border rounded-xl hover:border-primary transition-all"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
              <Building2 className="text-blue-600" size={28} />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Medium City</h3>
              <p className="text-sm text-muted">~28,500 residents</p>
            </div>
          </div>
          <p className="text-sm text-secondary-foreground">
            City of Riverside, OH - A growing city with a $42M budget and full range of
            municipal services.
          </p>
          <div className="mt-3 text-sm text-primary font-medium group-hover:underline">
            Explore this city →
          </div>
        </button>

        {/* Create Your Own Option */}
        <button
          onClick={() => setShowBuilder(true)}
          className="group p-6 text-left border-2 border-dashed border-border rounded-xl hover:border-primary transition-all"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl group-hover:bg-purple-200 dark:group-hover:bg-purple-900/50 transition-colors">
              <PlusCircle className="text-purple-600" size={28} />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Create Your Own</h3>
              <p className="text-sm text-muted">Custom data</p>
            </div>
          </div>
          <p className="text-sm text-secondary-foreground">
            Enter your own jurisdiction&apos;s budget data to create a custom visualization
            for your community.
          </p>
          <div className="mt-3 text-sm text-primary font-medium group-hover:underline">
            Start building →
          </div>
        </button>
      </div>
    </div>
  );
}
