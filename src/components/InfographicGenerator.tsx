'use client';

import { useRef, useCallback } from 'react';
import { useBudgetStore } from '@/store/budgetStore';
import {
  formatCurrency,
  formatPercentage,
  roundDaily,
  getEverydayComparison,
} from '@/lib/calculations';
import { ServiceIconComponent } from '@/components/ui/Icons';
import { Download, Share2, QrCode } from 'lucide-react';

export function InfographicGenerator() {
  const { jurisdiction, contribution, residentProfile, budgetCategories } = useBudgetStore();
  const infographicRef = useRef<HTMLDivElement>(null);

  const handleDownload = useCallback(async () => {
    if (!infographicRef.current) return;

    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(infographicRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
      });

      const link = document.createElement('a');
      link.download = `${jurisdiction?.name || 'budget'}-contribution.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Error generating image:', error);
      alert('Failed to generate image. Please try again.');
    }
  }, [jurisdiction?.name]);

  const handleDownloadPDF = useCallback(async () => {
    if (!infographicRef.current) return;

    try {
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');

      const canvas = await html2canvas(infographicRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width / 2, canvas.height / 2],
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
      pdf.save(`${jurisdiction?.name || 'budget'}-contribution.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  }, [jurisdiction?.name]);

  if (!jurisdiction || !contribution || !residentProfile) {
    return (
      <div className="card text-center py-12">
        <p className="text-muted">Complete the calculator to generate your infographic</p>
      </div>
    );
  }

  const dailyRounding = jurisdiction.config.dailyRounding;
  const roundedDaily = roundDaily(contribution.totalDaily, dailyRounding);
  const topServices = contribution.serviceAllocations
    .sort((a, b) => b.daily - a.daily)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Download buttons */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Your Personal Impact Card</h2>
        <p className="text-secondary-foreground mb-4">
          Download and share to help others understand their community contribution
        </p>
        <div className="flex flex-wrap gap-3">
          <button onClick={handleDownload} className="btn-primary flex items-center gap-2">
            <Download size={18} />
            Download PNG
          </button>
          <button onClick={handleDownloadPDF} className="btn-secondary flex items-center gap-2">
            <Download size={18} />
            Download PDF
          </button>
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: `My ${jurisdiction.name} Contribution`,
                  text: `My daily contribution to ${jurisdiction.name} is ${formatCurrency(roundedDaily)} - ${getEverydayComparison(roundedDaily)}`,
                  url: window.location.href,
                });
              } else {
                navigator.clipboard.writeText(window.location.href);
                alert('Link copied to clipboard!');
              }
            }}
            className="btn-secondary flex items-center gap-2"
          >
            <Share2 size={18} />
            Share
          </button>
        </div>
      </div>

      {/* The Infographic Card */}
      <div
        ref={infographicRef}
        className="bg-white text-gray-900 rounded-2xl overflow-hidden shadow-xl max-w-lg mx-auto"
        style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6">
          <div className="text-sm font-medium opacity-80 mb-1">MY CONTRIBUTION TO</div>
          <h3 className="text-2xl font-bold">{jurisdiction.name}</h3>
          <div className="text-sm opacity-80 mt-1">
            {jurisdiction.type.charAt(0).toUpperCase() + jurisdiction.type.slice(1)} • {jurisdiction.state} • FY {jurisdiction.fiscalYear}
          </div>
        </div>

        {/* Main Stats */}
        <div className="p-6 bg-gradient-to-b from-blue-50 to-white">
          <div className="text-center mb-6">
            <div className="text-sm text-gray-600 mb-1">Annual Contribution</div>
            <div className="text-4xl font-bold text-blue-600">
              {formatCurrency(contribution.totalAnnual, false)}
            </div>
            <div className="text-xl text-gray-700 mt-2">
              = <span className="font-semibold">{formatCurrency(roundedDaily)}</span>/day
            </div>
            <div className="mt-2 inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
              {getEverydayComparison(roundedDaily)}
            </div>
          </div>

          {/* Revenue Breakdown */}
          <div className="mb-6">
            <div className="text-sm font-semibold text-gray-600 mb-3">WHERE IT COMES FROM</div>
            <div className="space-y-2">
              {[
                { name: 'Property Tax', amount: contribution.breakdown.propertyTax },
                { name: 'Income/Wage Tax', amount: contribution.breakdown.incomeTax + contribution.breakdown.wageTax },
                { name: 'Utilities & Fees', amount: contribution.breakdown.utilityFees + contribution.breakdown.otherFees },
              ]
                .filter((r) => r.amount > 0)
                .map((source) => {
                  const pct = (source.amount / contribution.totalAnnual) * 100;
                  return (
                    <div key={source.name} className="flex items-center gap-2">
                      <div className="w-24 text-sm text-gray-600">{source.name}</div>
                      <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="w-20 text-right text-sm font-medium">
                        {formatCurrency(source.amount, false)}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Services Grid */}
          <div className="mb-6">
            <div className="text-sm font-semibold text-gray-600 mb-3">WHAT IT SUPPORTS (DAILY)</div>
            <div className="grid grid-cols-2 gap-2">
              {topServices.map((service) => (
                <div
                  key={service.categoryId}
                  className="p-3 rounded-lg text-white text-center"
                  style={{ background: service.color }}
                >
                  <ServiceIconComponent icon={service.icon} size={20} className="mx-auto mb-1" />
                  <div className="text-xs opacity-90">{service.categoryName}</div>
                  <div className="text-lg font-bold">{formatCurrency(roundDaily(service.daily, dailyRounding))}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Collective Impact */}
          <div className="text-center p-4 bg-gray-100 rounded-lg">
            <div className="text-gray-600">
              You're <strong>1 of {jurisdiction.population.toLocaleString()}</strong> residents
            </div>
            <div className="text-sm text-gray-500 mt-1">
              Together, we fund {formatCurrency(jurisdiction.totalBudget, false)} in services
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <div className="text-xs text-gray-500">
            Generated by Budget Builder
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <QrCode size={12} />
            Scan to try it yourself
          </div>
        </div>
      </div>

      {/* Community Poster Option */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Community Budget Poster</h3>
        <p className="text-secondary-foreground mb-4">
          A shareable overview of how {jurisdiction.name}&apos;s budget works, using an &quot;average resident&quot; profile.
        </p>

        <div className="bg-secondary/30 rounded-xl p-6">
          <div className="text-center mb-6">
            <h4 className="text-xl font-bold">{jurisdiction.name} Budget at a Glance</h4>
            <p className="text-secondary-foreground">FY {jurisdiction.fiscalYear}</p>
          </div>

          {/* Budget Overview */}
          <div className="grid sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-card p-4 rounded-lg text-center">
              <div className="text-3xl font-bold text-primary">
                {formatCurrency(jurisdiction.totalBudget / 1000000, false)}M
              </div>
              <div className="text-sm text-muted">Total Budget</div>
            </div>
            <div className="bg-card p-4 rounded-lg text-center">
              <div className="text-3xl font-bold text-primary">
                {jurisdiction.population.toLocaleString()}
              </div>
              <div className="text-sm text-muted">Residents</div>
            </div>
            <div className="bg-card p-4 rounded-lg text-center">
              <div className="text-3xl font-bold text-primary">
                {formatCurrency(jurisdiction.totalBudget / jurisdiction.population, false)}
              </div>
              <div className="text-sm text-muted">Per Resident</div>
            </div>
          </div>

          {/* Categories breakdown */}
          <div className="space-y-2">
            {budgetCategories
              .sort((a, b) => b.amount - a.amount)
              .map((cat) => {
                const pct = (cat.amount / jurisdiction.totalBudget) * 100;
                return (
                  <div key={cat.id} className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0"
                      style={{ background: cat.color }}
                    >
                      <ServiceIconComponent icon={cat.icon} size={16} />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">{cat.name}</span>
                        <span>{formatPercentage(pct, 0)}</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${pct}%`, background: cat.color }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>

          {/* Why budgets feel tight */}
          <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
            <h5 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">
              Why Budgets Feel Tight
            </h5>
            <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1">
              <li>• Most expenses (salaries, contracts, debt) are fixed commitments</li>
              <li>• Revenue growth often lags behind cost increases</li>
              <li>• Federal and state mandates require spending in specific areas</li>
              <li>• Infrastructure maintenance costs grow as systems age</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
