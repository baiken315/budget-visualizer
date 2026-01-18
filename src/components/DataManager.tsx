'use client';

import { useState, useRef } from 'react';
import { useBudgetStore } from '@/store/budgetStore';
import { Jurisdiction, BudgetCategory, RevenueSource, ResidentProfile } from '@/types';
import { Download, Upload, FileJson, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';

interface JurisdictionData {
  jurisdiction: Jurisdiction;
  budgetCategories: BudgetCategory[];
  revenueSources: RevenueSource[];
  averageResident?: ResidentProfile;
}

// Template for new jurisdictions
const createTemplate = (): JurisdictionData => ({
  jurisdiction: {
    id: 'my-jurisdiction',
    name: 'My Jurisdiction',
    type: 'city',
    state: 'XX',
    population: 50000,
    medianHomeValue: 300000,
    totalBudget: 50000000,
    fiscalYear: '2025',
    governanceStructure: 'Council-Manager',
    config: {
      maxCategories: 8,
      emphasis: 'balanced_services',
      showFixedCosts: true,
      comparisonPhrase: 'city services',
      dailyRounding: 0.01,
    },
  },
  budgetCategories: [
    {
      id: 'police',
      jurisdictionId: 'my-jurisdiction',
      name: 'Police & Public Safety',
      amount: 15000000,
      fixedPercentage: 80,
      icon: 'shield',
      color: '#3b82f6',
      description: 'Law enforcement, dispatch, and public safety',
      constraints: ['Union contracts', 'Minimum staffing requirements'],
    },
    {
      id: 'fire',
      jurisdictionId: 'my-jurisdiction',
      name: 'Fire & EMS',
      amount: 10000000,
      fixedPercentage: 75,
      icon: 'flame',
      color: '#ef4444',
      description: 'Fire protection and emergency medical services',
      constraints: ['Equipment costs', 'Training mandates'],
    },
    {
      id: 'public-works',
      jurisdictionId: 'my-jurisdiction',
      name: 'Public Works',
      amount: 8000000,
      fixedPercentage: 50,
      icon: 'truck',
      color: '#6b7280',
      description: 'Streets, sanitation, and infrastructure',
      constraints: ['Equipment leases'],
    },
    {
      id: 'parks',
      jurisdictionId: 'my-jurisdiction',
      name: 'Parks & Recreation',
      amount: 5000000,
      fixedPercentage: 35,
      icon: 'trees',
      color: '#10b981',
      description: 'Parks, recreation facilities, and programs',
      constraints: ['Facility maintenance'],
    },
    {
      id: 'admin',
      jurisdictionId: 'my-jurisdiction',
      name: 'Administration',
      amount: 7000000,
      fixedPercentage: 70,
      icon: 'building',
      color: '#8b5cf6',
      description: 'Government operations, finance, and legal',
      constraints: ['Staff salaries', 'Insurance'],
    },
    {
      id: 'other',
      jurisdictionId: 'my-jurisdiction',
      name: 'Other Services',
      amount: 5000000,
      fixedPercentage: 40,
      icon: 'users',
      color: '#f59e0b',
      description: 'Library, community services, and other programs',
      constraints: [],
    },
  ],
  revenueSources: [
    {
      id: 'property-tax',
      jurisdictionId: 'my-jurisdiction',
      type: 'property_tax',
      name: 'Property Tax',
      amount: 25000000,
      rate: 0.012, // $1.20 per $100 as decimal (1.20/100 = 0.012)
      base: 1.0, // 100% assessment ratio
      description: 'Tax on real property',
      payer: 'mixed',
      residentialShare: 70,
    },
    {
      id: 'sales-tax',
      jurisdictionId: 'my-jurisdiction',
      type: 'sales_tax',
      name: 'Local Sales Tax',
      amount: 12000000,
      rate: 0.01, // 1% local portion
      description: 'Local portion of sales tax',
      payer: 'mixed',
      residentialShare: 60,
    },
    {
      id: 'utility-fees',
      jurisdictionId: 'my-jurisdiction',
      type: 'utility_fees',
      name: 'Utility Fees',
      amount: 8000000,
      rate: 75, // $75/month base
      description: 'Water, sewer, and trash fees',
      payer: 'mixed',
      residentialShare: 75,
    },
    {
      id: 'grants',
      jurisdictionId: 'my-jurisdiction',
      type: 'grants',
      name: 'Intergovernmental',
      amount: 3000000,
      description: 'State and federal grants',
      payer: 'government',
      residentialShare: 0,
    },
    {
      id: 'other',
      jurisdictionId: 'my-jurisdiction',
      type: 'other',
      name: 'Other Revenue',
      amount: 2000000,
      description: 'Permits, fines, fees, and miscellaneous',
      payer: 'mixed',
      residentialShare: 50,
    },
  ],
  averageResident: {
    jurisdictionId: 'my-jurisdiction',
    housingStatus: 'own',
    homeValue: 300000,
    householdIncome: 75000,
    worksLocally: true,
    householdSize: 2.5,
  },
});

export function DataManager() {
  const {
    jurisdiction,
    budgetCategories,
    revenueSources,
    residentProfile,
    setJurisdiction,
    setBudgetCategories,
    setRevenueSources,
    setResidentProfile,
  } = useBudgetStore();

  const [showJson, setShowJson] = useState(false);
  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Create current data object
  const currentData: JurisdictionData | null = jurisdiction ? {
    jurisdiction,
    budgetCategories,
    revenueSources,
    averageResident: residentProfile || undefined,
  } : null;

  // Download template
  const downloadTemplate = () => {
    const template = createTemplate();
    const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'jurisdiction-template.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Download current configuration
  const downloadCurrent = () => {
    if (!currentData) return;
    const blob = new Blob([JSON.stringify(currentData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentData.jurisdiction.id}-config.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Validate imported data
  const validateData = (data: unknown): data is JurisdictionData => {
    if (!data || typeof data !== 'object') return false;
    const d = data as Record<string, unknown>;

    // Check jurisdiction
    if (!d.jurisdiction || typeof d.jurisdiction !== 'object') return false;
    const j = d.jurisdiction as Record<string, unknown>;
    if (!j.id || !j.name || !j.type || !j.population || !j.totalBudget) return false;

    // Check budget categories
    if (!Array.isArray(d.budgetCategories) || d.budgetCategories.length === 0) return false;

    // Check revenue sources
    if (!Array.isArray(d.revenueSources) || d.revenueSources.length === 0) return false;

    return true;
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);

        if (!validateData(data)) {
          setImportStatus({
            type: 'error',
            message: 'Invalid data format. Please check your JSON structure matches the template.',
          });
          return;
        }

        // Update all stores
        setJurisdiction(data.jurisdiction);
        setBudgetCategories(data.budgetCategories);
        setRevenueSources(data.revenueSources);
        if (data.averageResident) {
          setResidentProfile(data.averageResident);
        }

        setImportStatus({
          type: 'success',
          message: `Successfully loaded ${data.jurisdiction.name}!`,
        });

        // Clear status after 3 seconds
        setTimeout(() => setImportStatus(null), 3000);
      } catch {
        setImportStatus({
          type: 'error',
          message: 'Failed to parse JSON file. Please check the file format.',
        });
      }
    };
    reader.readAsText(file);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4">Data Management</h3>
      <p className="text-sm text-secondary-foreground mb-4">
        Import your own jurisdiction data or export the current configuration.
      </p>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 mb-4">
        <button
          onClick={downloadTemplate}
          className="btn-secondary flex items-center gap-2"
        >
          <Download size={16} />
          Download Template
        </button>

        <label className="btn-secondary flex items-center gap-2 cursor-pointer">
          <Upload size={16} />
          Import JSON
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>

        {currentData && (
          <button
            onClick={downloadCurrent}
            className="btn-secondary flex items-center gap-2"
          >
            <FileJson size={16} />
            Export Current
          </button>
        )}
      </div>

      {/* Status Message */}
      {importStatus && (
        <div
          className={`p-3 rounded-lg flex items-center gap-2 mb-4 ${
            importStatus.type === 'success'
              ? 'bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400'
              : 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400'
          }`}
        >
          {importStatus.type === 'success' ? (
            <CheckCircle size={16} />
          ) : (
            <AlertCircle size={16} />
          )}
          {importStatus.message}
        </div>
      )}

      {/* Show/Hide JSON */}
      {currentData && (
        <div className="border-t border-border pt-4">
          <button
            onClick={() => setShowJson(!showJson)}
            className="flex items-center gap-2 text-sm text-primary hover:underline mb-3"
          >
            {showJson ? <EyeOff size={14} /> : <Eye size={14} />}
            {showJson ? 'Hide' : 'View'} Current JSON
          </button>

          {showJson && (
            <pre className="bg-secondary/50 p-4 rounded-lg text-xs overflow-x-auto max-h-96 overflow-y-auto">
              {JSON.stringify(currentData, null, 2)}
            </pre>
          )}
        </div>
      )}

      {/* Help Text */}
      <div className="mt-4 text-xs text-muted space-y-1">
        <p><strong>Tips for creating your own data:</strong></p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Download the template to see the required structure</li>
          <li>Property tax rate should be expressed as a decimal (e.g., $1.12/$100 = 0.0112)</li>
          <li>All budget amounts should sum to approximately match totalBudget</li>
          <li>residentialShare is 0-100 representing % paid by residents vs businesses</li>
          <li>Available icons: shield, flame, truck, trees, building, book, heart, users, home, road, droplet, wallet, hammer, gift, scale</li>
        </ul>
      </div>
    </div>
  );
}
