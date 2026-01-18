'use client';

import { useRef, useCallback, useState } from 'react';
import { useBudgetStore } from '@/store/budgetStore';
import {
  formatCurrency,
  formatPercentage,
  roundDaily,
  getEverydayComparison,
} from '@/lib/calculations';
import { ServiceIconComponent } from '@/components/ui/Icons';
import { Download, Share2, QrCode, Loader2 } from 'lucide-react';

export function InfographicGenerator() {
  const { jurisdiction, contribution, residentProfile, budgetCategories } = useBudgetStore();
  const infographicRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState<'png' | 'pdf' | null>(null);

  const handleDownload = useCallback(async () => {
    if (!infographicRef.current) {
      alert('Unable to find infographic element.');
      return;
    }

    setIsExporting('png');
    try {
      const html2canvasModule = await import('html2canvas');
      const html2canvas = html2canvasModule.default;

      const canvas = await html2canvas(infographicRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true,
      });

      const link = document.createElement('a');
      link.download = `${jurisdiction?.name || 'budget'}-contribution.png`;
      link.href = canvas.toDataURL('image/png');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error generating image:', error);
      alert('Failed to generate image. Please try again.');
    } finally {
      setIsExporting(null);
    }
  }, [jurisdiction?.name]);

  const handleDownloadPDF = useCallback(async () => {
    if (!infographicRef.current) {
      alert('Unable to find infographic element.');
      return;
    }

    setIsExporting('pdf');
    try {
      const html2canvasModule = await import('html2canvas');
      const html2canvas = html2canvasModule.default;
      const jspdfModule = await import('jspdf');
      const { jsPDF } = jspdfModule;

      const canvas = await html2canvas(infographicRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true,
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
    } finally {
      setIsExporting(null);
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
          <button
            onClick={handleDownload}
            disabled={isExporting !== null}
            className="btn-primary flex items-center gap-2 disabled:opacity-50"
          >
            {isExporting === 'png' ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
            {isExporting === 'png' ? 'Generating...' : 'Download PNG'}
          </button>
          <button
            onClick={handleDownloadPDF}
            disabled={isExporting !== null}
            className="btn-secondary flex items-center gap-2 disabled:opacity-50"
          >
            {isExporting === 'pdf' ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
            {isExporting === 'pdf' ? 'Generating...' : 'Download PDF'}
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

      {/* The Infographic Card - Using inline styles with hex colors for html2canvas compatibility */}
      <div
        ref={infographicRef}
        style={{
          fontFamily: 'system-ui, -apple-system, sans-serif',
          backgroundColor: '#ffffff',
          color: '#111827',
          borderRadius: '1rem',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          maxWidth: '32rem',
          margin: '0 auto',
        }}
      >
        {/* Header */}
        <div style={{
          background: 'linear-gradient(to right, #2563eb, #1e40af)',
          color: '#ffffff',
          padding: '1.5rem',
        }}>
          <div style={{ fontSize: '0.875rem', fontWeight: 500, opacity: 0.8, marginBottom: '0.25rem' }}>MY CONTRIBUTION TO</div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{jurisdiction.name}</h3>
          <div style={{ fontSize: '0.875rem', opacity: 0.8, marginTop: '0.25rem' }}>
            {jurisdiction.type.charAt(0).toUpperCase() + jurisdiction.type.slice(1)} • {jurisdiction.state} • FY {jurisdiction.fiscalYear}
          </div>
        </div>

        {/* Main Stats */}
        <div style={{
          padding: '1.5rem',
          background: 'linear-gradient(to bottom, #eff6ff, #ffffff)',
        }}>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '0.875rem', color: '#4b5563', marginBottom: '0.25rem' }}>Annual Contribution</div>
            <div style={{ fontSize: '2.25rem', fontWeight: 700, color: '#2563eb' }}>
              {formatCurrency(contribution.totalAnnual, false)}
            </div>
            <div style={{ fontSize: '1.25rem', color: '#374151', marginTop: '0.5rem' }}>
              = <span style={{ fontWeight: 600 }}>{formatCurrency(roundedDaily)}</span>/day
            </div>
            <div style={{
              marginTop: '0.5rem',
              display: 'inline-block',
              padding: '0.25rem 0.75rem',
              backgroundColor: '#dcfce7',
              color: '#15803d',
              borderRadius: '9999px',
              fontSize: '0.875rem',
              fontWeight: 500,
            }}>
              {getEverydayComparison(roundedDaily)}
            </div>
          </div>

          {/* Revenue Breakdown */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#4b5563', marginBottom: '0.75rem' }}>WHERE IT COMES FROM</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {[
                { name: 'Property Tax', amount: contribution.breakdown.propertyTax },
                { name: 'Income/Wage Tax', amount: contribution.breakdown.incomeTax + contribution.breakdown.wageTax },
                { name: 'Sales Tax', amount: contribution.breakdown.salesTax },
                { name: 'Utilities & Fees', amount: contribution.breakdown.utilityFees + contribution.breakdown.otherFees },
              ]
                .filter((r) => r.amount > 0)
                .map((source) => {
                  const pct = (source.amount / contribution.totalAnnual) * 100;
                  return (
                    <div key={source.name} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: '7rem', fontSize: '0.875rem', color: '#4b5563', flexShrink: 0 }}>{source.name}</div>
                      <div style={{ flex: 1, height: '1rem', backgroundColor: '#e5e7eb', borderRadius: '9999px', overflow: 'hidden' }}>
                        <div
                          style={{ height: '100%', backgroundColor: '#3b82f6', borderRadius: '9999px', width: `${pct}%` }}
                        />
                      </div>
                      <div style={{ width: '5rem', textAlign: 'right', fontSize: '0.875rem', fontWeight: 500, flexShrink: 0 }}>
                        {formatCurrency(source.amount, false)}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Services Grid */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#4b5563', marginBottom: '0.75rem' }}>WHAT IT SUPPORTS (DAILY)</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
              {topServices.map((service) => (
                <div
                  key={service.categoryId}
                  style={{
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    color: '#ffffff',
                    textAlign: 'center',
                    background: service.color,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.25rem' }}>
                    <ServiceIconComponent icon={service.icon} size={20} />
                  </div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>{service.categoryName}</div>
                  <div style={{ fontSize: '1.125rem', fontWeight: 700 }}>{formatCurrency(roundDaily(service.daily, dailyRounding))}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Collective Impact */}
          <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: '#f3f4f6', borderRadius: '0.5rem' }}>
            <div style={{ color: '#4b5563' }}>
              You&apos;re <strong>1 of {jurisdiction.population.toLocaleString()}</strong> residents
            </div>
            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>
              Together, we fund {formatCurrency(jurisdiction.totalBudget, false)} in services
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '1rem 1.5rem',
          backgroundColor: '#f9fafb',
          borderTop: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
            Generated by Budget Builder
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: '#6b7280' }}>
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
