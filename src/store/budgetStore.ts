import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  Jurisdiction,
  BudgetCategory,
  RevenueSource,
  ResidentProfile,
  ResidentContribution,
  BudgetScenario,
  CategoryAdjustment,
} from '@/types';
import { calculateResidentContribution } from '@/lib/calculations';

interface BudgetStore {
  // Current jurisdiction data
  jurisdiction: Jurisdiction | null;
  budgetCategories: BudgetCategory[];
  revenueSources: RevenueSource[];

  // Resident data
  residentProfile: ResidentProfile | null;
  contribution: ResidentContribution | null;

  // Budget simulator
  currentScenario: BudgetScenario | null;
  scenarioCategories: BudgetCategory[];

  // UI state
  activeTab: 'calculator' | 'simulator' | 'infographic' | 'data';

  // Actions
  setJurisdiction: (jurisdiction: Jurisdiction) => void;
  setBudgetCategories: (categories: BudgetCategory[]) => void;
  setRevenueSources: (sources: RevenueSource[]) => void;
  setResidentProfile: (profile: ResidentProfile) => void;
  calculateContribution: () => void;
  setActiveTab: (tab: BudgetStore['activeTab']) => void;

  // Scenario actions
  startScenario: () => void;
  adjustCategory: (categoryId: string, newAmount: number) => void;
  resetScenario: () => void;

  // Reset all
  resetAll: () => void;
}

export const useBudgetStore = create<BudgetStore>()(
  persist(
    (set, get) => ({
      // Initial state
      jurisdiction: null,
      budgetCategories: [],
      revenueSources: [],
      residentProfile: null,
      contribution: null,
      currentScenario: null,
      scenarioCategories: [],
      activeTab: 'calculator',

      // Actions
      setJurisdiction: (jurisdiction) => set({ jurisdiction }),

      setBudgetCategories: (categories) =>
        set({
          budgetCategories: categories,
          scenarioCategories: [...categories],
        }),

      setRevenueSources: (sources) => set({ revenueSources: sources }),

      setResidentProfile: (profile) => {
        set({ residentProfile: profile });
        // Auto-calculate contribution when profile changes
        get().calculateContribution();
      },

      calculateContribution: () => {
        const { jurisdiction, residentProfile, revenueSources, budgetCategories } = get();

        if (!jurisdiction || !residentProfile || revenueSources.length === 0 || budgetCategories.length === 0) {
          set({ contribution: null });
          return;
        }

        const contribution = calculateResidentContribution(
          residentProfile,
          jurisdiction,
          revenueSources,
          budgetCategories
        );

        set({ contribution });
      },

      setActiveTab: (tab) => set({ activeTab: tab }),

      // Scenario actions
      startScenario: () => {
        const { budgetCategories, residentProfile, jurisdiction } = get();
        if (!jurisdiction || !residentProfile) return;

        const scenario: BudgetScenario = {
          id: crypto.randomUUID(),
          jurisdictionId: jurisdiction.id,
          name: 'New Scenario',
          adjustments: [],
          createdAt: new Date(),
        };

        set({
          currentScenario: scenario,
          scenarioCategories: [...budgetCategories],
        });
      },

      adjustCategory: (categoryId, newAmount) => {
        const { scenarioCategories, currentScenario, budgetCategories } = get();
        if (!currentScenario) return;

        const updatedCategories = scenarioCategories.map((cat) =>
          cat.id === categoryId ? { ...cat, amount: newAmount } : cat
        );

        const originalCategory = budgetCategories.find((c) => c.id === categoryId);
        if (!originalCategory) return;

        // Update or add adjustment
        const existingAdjIndex = currentScenario.adjustments.findIndex(
          (a) => a.categoryId === categoryId
        );

        const adjustment: CategoryAdjustment = {
          categoryId,
          originalAmount: originalCategory.amount,
          newAmount,
          percentChange: ((newAmount - originalCategory.amount) / originalCategory.amount) * 100,
        };

        const updatedAdjustments =
          existingAdjIndex >= 0
            ? currentScenario.adjustments.map((a, i) =>
                i === existingAdjIndex ? adjustment : a
              )
            : [...currentScenario.adjustments, adjustment];

        set({
          scenarioCategories: updatedCategories,
          currentScenario: {
            ...currentScenario,
            adjustments: updatedAdjustments,
          },
        });
      },

      resetScenario: () => {
        const { budgetCategories } = get();
        set({
          currentScenario: null,
          scenarioCategories: [...budgetCategories],
        });
      },

      resetAll: () =>
        set({
          jurisdiction: null,
          budgetCategories: [],
          revenueSources: [],
          residentProfile: null,
          contribution: null,
          currentScenario: null,
          scenarioCategories: [],
          activeTab: 'calculator',
        }),
    }),
    {
      name: 'budget-store',
      partialize: (state) => ({
        jurisdiction: state.jurisdiction,
        budgetCategories: state.budgetCategories,
        revenueSources: state.revenueSources,
        residentProfile: state.residentProfile,
      }),
    }
  )
);
