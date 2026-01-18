'use client';

import { useBudgetStore } from '@/store/budgetStore';
import { JurisdictionSelector } from '@/components/JurisdictionSelector';
import { ResidentCalculator } from '@/components/ResidentCalculator';
import { ContributionDashboard } from '@/components/ContributionDashboard';
import { BudgetSimulator } from '@/components/BudgetSimulator';
import { InfographicGenerator } from '@/components/InfographicGenerator';
import { DataManager } from '@/components/DataManager';
import { Calculator, Sliders, Image, BarChart3, Database } from 'lucide-react';

export default function Home() {
  const { jurisdiction, activeTab, setActiveTab, contribution } = useBudgetStore();

  const tabs = [
    { id: 'calculator' as const, label: 'My Impact', icon: Calculator },
    { id: 'simulator' as const, label: 'Budget Simulator', icon: Sliders },
    { id: 'infographic' as const, label: 'Share', icon: Image },
    { id: 'data' as const, label: 'Data', icon: Database },
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <BarChart3 className="text-primary" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold">Budget Builder</h1>
              <p className="text-sm text-muted">Understand your community contribution</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Jurisdiction Selection */}
        <JurisdictionSelector />

        {/* Tab Navigation (only show when jurisdiction is selected) */}
        {jurisdiction && (
          <>
            <nav className="flex gap-2 overflow-x-auto pb-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                // Data tab is always available, others require contribution
                const isDisabled = tab.id !== 'calculator' && tab.id !== 'data' && !contribution;

                return (
                  <button
                    key={tab.id}
                    onClick={() => !isDisabled && setActiveTab(tab.id)}
                    disabled={isDisabled}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : isDisabled
                        ? 'bg-secondary/50 text-muted cursor-not-allowed'
                        : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                    }`}
                  >
                    <Icon size={18} />
                    {tab.label}
                  </button>
                );
              })}
            </nav>

            {/* Tab Content */}
            <div className="space-y-6">
              {activeTab === 'calculator' && (
                <div className="grid lg:grid-cols-2 gap-6">
                  <ResidentCalculator />
                  <ContributionDashboard />
                </div>
              )}

              {activeTab === 'simulator' && <BudgetSimulator />}

              {activeTab === 'infographic' && <InfographicGenerator />}

              {activeTab === 'data' && <DataManager />}
            </div>
          </>
        )}

        {/* Intro content when no jurisdiction selected */}
        {!jurisdiction && (
          <div className="grid md:grid-cols-3 gap-6 mt-8">
            <div className="card text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calculator className="text-primary" size={24} />
              </div>
              <h3 className="font-semibold mb-2">Calculate Your Contribution</h3>
              <p className="text-sm text-secondary-foreground">
                Answer a few questions about your household to see exactly how much you
                contribute to your community.
              </p>
            </div>
            <div className="card text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sliders className="text-primary" size={24} />
              </div>
              <h3 className="font-semibold mb-2">Simulate Budget Changes</h3>
              <p className="text-sm text-secondary-foreground">
                Explore trade-offs by adjusting budget priorities. See what&apos;s fixed,
                what&apos;s flexible, and the real implications.
              </p>
            </div>
            <div className="card text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Image className="text-primary" size={24} />
              </div>
              <h3 className="font-semibold mb-2">Share Your Impact</h3>
              <p className="text-sm text-secondary-foreground">
                Generate shareable infographics showing your personal contribution and
                help others understand civic finance.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-secondary/30 border-t border-border mt-12">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center text-sm text-muted">
            <p className="mb-2">
              Budget Builder helps residents understand their community contribution
              by translating annual taxes into daily costs.
            </p>
            <p>
              Built with transparency in mind. Data shown is for educational purposes.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
