'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  X,
  Sparkles,
  RefreshCw,
  FileText,
  TrendingUp,
  MapPin,
  Phone,
  Globe,
  Navigation,
  Calendar,
} from 'lucide-react';
import { Button } from '@/components/ui';
import {
  GbpDailyOrMonthlyInsight,
  parseGbpInsightsCsv,
  MONTH_NAMES,
  MONTH_SHORT_NAMES,
} from '@/lib/gbp-insights-engine';

export interface GbpInsightsUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsightsSaved: (insights: GbpDailyOrMonthlyInsight[]) => void;
  businessName?: string;
  clientId?: string;
  initialMonth?: number;
  initialYear?: number;
}

export const GbpInsightsUploadModal: React.FC<GbpInsightsUploadModalProps> = ({
  isOpen,
  onClose,
  onInsightsSaved,
  businessName = 'Life in Lights Academy',
  clientId,
  initialMonth,
  initialYear,
}) => {
  const [activeMode, setActiveMode] = useState<'upload' | 'paste' | 'google_api'>('upload');
  const [csvText, setCsvText] = useState<string>('');
  
  const now = new Date();
  const currentMonthNum = initialMonth || now.getMonth() + 1;
  const currentYearNum = initialYear || now.getFullYear();

  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonthNum);
  const [selectedYear, setSelectedYear] = useState<number>(currentYearNum);
  const [periodLabel, setPeriodLabel] = useState<string>(
    `${MONTH_SHORT_NAMES[currentMonthNum - 1] || 'Sep'} ${currentYearNum}`
  );
  const [parsedPreview, setParsedPreview] = useState<GbpDailyOrMonthlyInsight[] | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isFetchingGoogle, setIsFetchingGoogle] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      const m = initialMonth || now.getMonth() + 1;
      const y = initialYear || now.getFullYear();
      setSelectedMonth(m);
      setSelectedYear(y);
      setPeriodLabel(`${MONTH_SHORT_NAMES[m - 1] || 'Sep'} ${y}`);
      setParsedPreview(null);
      setErrorMessage(null);
      setSuccessMessage(null);
      setCsvText('');
    }
  }, [isOpen, initialMonth, initialYear]);

  if (!isOpen) return null;

  const handleMonthOrYearChange = (m: number, y: number) => {
    setSelectedMonth(m);
    setSelectedYear(y);
    const label = `${MONTH_SHORT_NAMES[m - 1] || 'Sep'} ${y}`;
    setPeriodLabel(label);

    // If preview already exists, update its period, month, and year
    if (parsedPreview && parsedPreview.length > 0) {
      const updated = parsedPreview.map((item) => ({
        ...item,
        month: m,
        year: y,
        monthName: MONTH_NAMES[m - 1],
        period: label,
      }));
      setParsedPreview(updated);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);
    setIsParsing(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        setCsvText(text);
        const parsed = parseGbpInsightsCsv(text, {
          month: selectedMonth,
          year: selectedYear,
          periodLabel,
        });
        if (parsed.length === 0) {
          setErrorMessage('Could not extract valid data rows from the CSV file. Please verify it is a Google Business Profile Insights export.');
          setParsedPreview(null);
        } else {
          setParsedPreview(parsed);
          setSuccessMessage(`Parsed ${parsed.length} insight row(s) for ${MONTH_NAMES[selectedMonth - 1]} ${selectedYear} successfully!`);
        }
      } catch (err: any) {
        setErrorMessage(err?.message || 'Failed to parse CSV file.');
        setParsedPreview(null);
      } finally {
        setIsParsing(false);
      }
    };

    reader.onerror = () => {
      setErrorMessage('Failed to read selected file.');
      setIsParsing(false);
    };

    reader.readAsText(file);
  };

  const handleParsePastedText = () => {
    if (!csvText.trim()) {
      setErrorMessage('Please paste the CSV content before parsing.');
      return;
    }

    setErrorMessage(null);
    try {
      const parsed = parseGbpInsightsCsv(csvText, {
        month: selectedMonth,
        year: selectedYear,
        periodLabel,
      });
      if (parsed.length === 0) {
        setErrorMessage('No valid insight rows found. Please make sure to include the header row.');
        setParsedPreview(null);
      } else {
        setParsedPreview(parsed);
        setSuccessMessage(`Parsed ${parsed.length} insight row(s) for ${MONTH_NAMES[selectedMonth - 1]} ${selectedYear} successfully!`);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to parse pasted text.');
      setParsedPreview(null);
    }
  };

  const handleFetchGoogleApi = async () => {
    setIsFetchingGoogle(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await fetch('/api/portal/insights/fetch-google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName,
          clientId,
          month: selectedMonth,
          year: selectedYear,
          periodLabel,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.data)) {
        setParsedPreview(data.data);
        setSuccessMessage(data.message || `Retrieved Google Business Profile insights for ${MONTH_NAMES[selectedMonth - 1]} ${selectedYear} successfully!`);
      } else {
        setErrorMessage(data.error || 'Failed to fetch insights from Google.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Network error fetching Google API insights.');
    } finally {
      setIsFetchingGoogle(false);
    }
  };

  const handleSaveCommit = async () => {
    if (!parsedPreview || parsedPreview.length === 0) {
      setErrorMessage('No parsed insights available to save.');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    const recordToSave = {
      ...parsedPreview[0],
      month: selectedMonth,
      year: selectedYear,
      monthName: MONTH_NAMES[selectedMonth - 1],
      period: periodLabel,
    };

    try {
      const res = await fetch('/api/portal/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId,
          insightRecord: recordToSave,
          month: selectedMonth,
          year: selectedYear,
          periodLabel,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        onInsightsSaved(data.data || [recordToSave]);
        onClose();
      } else {
        setErrorMessage(data.error || 'Failed to save insights to CRM profile.');
      }
    } catch (err: any) {
      // Fallback save in memory / context
      onInsightsSaved([recordToSave]);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                Import Google Business Profile Insights
              </h3>
              <p className="text-xs text-slate-500">
                Upload Google Maps CSV export or sync metrics for <strong>{businessName}</strong>.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5 text-xs">
          {/* Mode Switcher */}
          <div className="flex rounded-2xl bg-slate-100 dark:bg-slate-800 p-1 font-bold gap-1">
            <button
              onClick={() => setActiveMode('upload')}
              className={`flex-1 py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeMode === 'upload'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload CSV File</span>
            </button>
            <button
              onClick={() => setActiveMode('paste')}
              className={`flex-1 py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeMode === 'paste'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Paste Raw CSV</span>
            </button>
            <button
              onClick={() => setActiveMode('google_api')}
              className={`flex-1 py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeMode === 'google_api'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Google Maps API</span>
            </button>
          </div>

          {/* Month & Year Selection Controls */}
          <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 dark:text-slate-200 text-xs flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Select Reporting Month & Year:
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300">
                {periodLabel}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1 block">
                  Reporting Month:
                </label>
                <select
                  value={selectedMonth}
                  onChange={(e) => handleMonthOrYearChange(parseInt(e.target.value, 10), selectedYear)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  {MONTH_NAMES.map((mName, idx) => (
                    <option key={idx} value={idx + 1}>
                      {mName} ({MONTH_SHORT_NAMES[idx]})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1 block">
                  Reporting Year:
                </label>
                <select
                  value={selectedYear}
                  onChange={(e) => handleMonthOrYearChange(selectedMonth, parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  {[2024, 2025, 2026, 2027].map((yr) => (
                    <option key={yr} value={yr}>
                      {yr}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* MODE: Upload CSV File */}
          {activeMode === 'upload' && (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-indigo-200 dark:border-indigo-900/50 hover:border-indigo-500 rounded-3xl p-8 text-center cursor-pointer bg-indigo-50/30 dark:bg-indigo-950/20 transition-all space-y-3 group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mx-auto shadow-md group-hover:scale-105 transition-transform">
                <Upload className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <p className="font-bold text-slate-800 dark:text-slate-200">
                  Click to choose or drag & drop Google Business Profile CSV
                </p>
                <p className="text-[11px] text-slate-400">
                  Supports official Google Insights exports (Search & Maps views, Directions, Calls, Website clicks).
                </p>
              </div>
            </div>
          )}

          {/* MODE: Paste Raw CSV */}
          {activeMode === 'paste' && (
            <div className="space-y-3">
              <textarea
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                placeholder="Paste CSV rows here (e.g., Shop code,Business name,Address,Labels,Google Search – Mobile,Google Search – Desktop...)"
                rows={6}
                className="w-full p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-950 text-slate-200 font-mono text-[10px] leading-relaxed focus:ring-2 focus:ring-indigo-500"
              />
              <Button
                variant="outline"
                size="sm"
                icon={Sparkles}
                onClick={handleParsePastedText}
                className="w-full"
              >
                Parse Pasted CSV Data
              </Button>
            </div>
          )}

          {/* MODE: Google API Fetch */}
          {activeMode === 'google_api' && (
            <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-slate-900 dark:text-white">
                  Direct Google Business Profile API Sync
                </h4>
                <p className="text-[11px] text-slate-500 max-w-md mx-auto">
                  Queries the Google Business Profile Performance API for <strong>{businessName}</strong> using connected authorization tokens.
                </p>
              </div>
              <Button
                variant="primary"
                size="sm"
                icon={RefreshCw}
                disabled={isFetchingGoogle}
                onClick={handleFetchGoogleApi}
                className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md mx-auto"
              >
                {isFetchingGoogle ? 'Querying Google Performance API...' : 'Fetch Live Insights from Google'}
              </Button>
            </div>
          )}

          {/* Feedback messages */}
          {errorMessage && (
            <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Parsed Preview Card */}
          {parsedPreview && parsedPreview.length > 0 && (
            <div className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold uppercase tracking-wider text-slate-400 text-[10px] flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  Verified Insights Preview:
                </span>
                <span className="text-[10px] font-bold text-indigo-600">
                  {parsedPreview[0].period}
                </span>
              </div>

              <div className="font-bold text-sm text-slate-900 dark:text-white">
                {parsedPreview[0].businessName}
              </div>

              {/* Metrics Grid Preview */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-center">
                <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-[9px] text-slate-400 block font-semibold">Total Views</span>
                  <span className="text-base font-black text-indigo-600 dark:text-indigo-400">
                    {parsedPreview[0].totalViews}
                  </span>
                  <span className="text-[9px] text-slate-400 block">
                    {parsedPreview[0].totalSearchViews} Search / {parsedPreview[0].totalMapsViews} Maps
                  </span>
                </div>

                <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-[9px] text-slate-400 block font-semibold">Directions</span>
                  <span className="text-base font-black text-rose-600 dark:text-rose-400">
                    {parsedPreview[0].directions}
                  </span>
                  <span className="text-[9px] text-slate-400 block">Navigation requests</span>
                </div>

                <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-[9px] text-slate-400 block font-semibold">Phone Calls</span>
                  <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                    {parsedPreview[0].calls}
                  </span>
                  <span className="text-[9px] text-slate-400 block">Direct dials</span>
                </div>

                <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-[9px] text-slate-400 block font-semibold">Website Clicks</span>
                  <span className="text-base font-black text-sky-600 dark:text-sky-400">
                    {parsedPreview[0].websiteClicks}
                  </span>
                  <span className="text-[9px] text-slate-400 block">Web visits</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex items-center justify-between gap-3">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={CheckCircle2}
            disabled={!parsedPreview || parsedPreview.length === 0 || isSaving}
            onClick={handleSaveCommit}
            className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md font-bold"
          >
            {isSaving ? 'Saving Authentic Insights...' : 'Commit & Apply to Dashboard'}
          </Button>
        </div>
      </div>
    </div>
  );
};
