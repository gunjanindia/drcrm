'use client';

import React, { useState } from 'react';
import {
  TrendingUp,
  PhoneCall,
  MapPin,
  CalendarCheck,
  Award,
  ArrowUpRight,
  Filter,
  BarChart3,
  LineChart,
} from 'lucide-react';
import { MonthlyGrowthMetric, DEFAULT_MONTHLY_GROWTH } from '@/lib/client-360-data';

export interface MonthlyGrowthChartProps {
  metrics?: MonthlyGrowthMetric[];
  businessName?: string;
}

export const MonthlyGrowthChart: React.FC<MonthlyGrowthChartProps> = ({
  metrics = DEFAULT_MONTHLY_GROWTH,
  businessName = 'Your Verified Business',
}) => {
  const [selectedMetric, setSelectedMetric] = useState<'all' | 'calls' | 'visits' | 'appointments' | 'rank'>('all');
  const [timeRange, setTimeRange] = useState<'3m' | '6m'>('6m');

  const filteredMetrics = timeRange === '3m' ? metrics.slice(-3) : metrics;

  // Calculate Growth Rates from start to finish
  const first = filteredMetrics[0];
  const last = filteredMetrics[filteredMetrics.length - 1];

  const callsGrowth = Math.round(((last.calls - first.calls) / first.calls) * 100);
  const visitsGrowth = Math.round(((last.visits - first.visits) / first.visits) * 100);
  const appointmentsGrowth = Math.round(((last.appointments - first.appointments) / first.appointments) * 100);

  // SVG Chart Dimensions
  const svgWidth = 650;
  const svgHeight = 220;
  const paddingX = 40;
  const paddingY = 30;

  const maxCalls = Math.max(...filteredMetrics.map((m) => m.calls), 1);
  const maxVisits = Math.max(...filteredMetrics.map((m) => m.visits), 1);
  const maxAppointments = Math.max(...filteredMetrics.map((m) => m.appointments), 1);

  // Point generator
  const getX = (idx: number) => paddingX + (idx / (filteredMetrics.length - 1)) * (svgWidth - 2 * paddingX);
  const getY = (val: number, maxVal: number) => svgHeight - paddingY - (val / maxVal) * (svgHeight - 2 * paddingY);
  const getRankY = (rank: number) => paddingY + ((rank - 1) / 7) * (svgHeight - 2 * paddingY); // Rank 1 is top, Rank 8 is bottom

  // Create SVG path string
  const createPath = (values: number[], maxVal: number) => {
    return values
      .map((val, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(val, maxVal)}`)
      .join(' ');
  };

  const createRankPath = (ranks: number[]) => {
    return ranks
      .map((rank, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getRankY(rank)}`)
      .join(' ');
  };

  return (
    <div className="space-y-6">
      {/* 4 Summary Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div
          onClick={() => setSelectedMetric('rank')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            selectedMetric === 'rank'
              ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 shadow-sm'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
          }`}
        >
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Google Local Rank
            </span>
            <div className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Award className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            #{last.rank} <span className="text-xs font-normal text-slate-400">in Ranchi</span>
          </div>
          <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5 mt-1">
            <ArrowUpRight className="w-3 h-3" /> Climbed from #{first.rank}
          </span>
        </div>

        <div
          onClick={() => setSelectedMetric('calls')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            selectedMetric === 'calls'
              ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 shadow-sm'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
          }`}
        >
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Google Direct Calls
            </span>
            <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <PhoneCall className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {last.calls} <span className="text-xs font-normal text-slate-400">calls/mo</span>
          </div>
          <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5 mt-1">
            <ArrowUpRight className="w-3 h-3" /> +{callsGrowth}% Growth
          </span>
        </div>

        <div
          onClick={() => setSelectedMetric('visits')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            selectedMetric === 'visits'
              ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 shadow-sm'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
          }`}
        >
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Profile & Map Views
            </span>
            <div className="w-6 h-6 rounded-lg bg-sky-500/10 text-sky-500 flex items-center justify-center">
              <MapPin className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {last.visits.toLocaleString('en-IN')} <span className="text-xs font-normal text-slate-400">views</span>
          </div>
          <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5 mt-1">
            <ArrowUpRight className="w-3 h-3" /> +{visitsGrowth}% Growth
          </span>
        </div>

        <div
          onClick={() => setSelectedMetric('appointments')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            selectedMetric === 'appointments'
              ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 shadow-sm'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
          }`}
        >
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Appointments Booked
            </span>
            <div className="w-6 h-6 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <CalendarCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {last.appointments} <span className="text-xs font-normal text-slate-400">inquiries</span>
          </div>
          <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5 mt-1">
            <ArrowUpRight className="w-3 h-3" /> +{appointmentsGrowth}% Growth
          </span>
        </div>
      </div>

      {/* Main Interactive Chart Box */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        {/* Chart Header & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              Monthly Growth & Momentum Curve
            </h4>
            <p className="text-xs text-slate-500">
              Verified rise in visibility, patient calls, visits, and direct bookings
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Metric Mode Filter */}
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setSelectedMetric('all')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  selectedMetric === 'all' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500'
                }`}
              >
                All Metrics
              </button>
              <button
                onClick={() => setSelectedMetric('rank')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  selectedMetric === 'rank' ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-xs' : 'text-slate-500'
                }`}
              >
                Rank
              </button>
              <button
                onClick={() => setSelectedMetric('calls')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  selectedMetric === 'calls' ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs' : 'text-slate-500'
                }`}
              >
                Calls
              </button>
              <button
                onClick={() => setSelectedMetric('visits')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  selectedMetric === 'visits' ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-xs' : 'text-slate-500'
                }`}
              >
                Visits
              </button>
            </div>

            {/* Time range toggle */}
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setTimeRange('3m')}
                className={`px-2 py-1 rounded-lg ${timeRange === '3m' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500'}`}
              >
                3M
              </button>
              <button
                onClick={() => setTimeRange('6m')}
                className={`px-2 py-1 rounded-lg ${timeRange === '6m' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500'}`}
              >
                6M
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Interactive SVG Chart */}
        <div className="w-full overflow-x-auto">
          <div className="min-w-[550px] relative">
            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-56 overflow-visible">
              {/* Grid Lines */}
              {[0.25, 0.5, 0.75, 1].map((ratio, i) => {
                const y = paddingY + ratio * (svgHeight - 2 * paddingY);
                return (
                  <line
                    key={i}
                    x1={paddingX}
                    y1={y}
                    x2={svgWidth - paddingX}
                    y2={y}
                    className="stroke-slate-100 dark:stroke-slate-800"
                    strokeDasharray="4 4"
                  />
                );
              })}

              {/* Calls Line (Emerald) */}
              {(selectedMetric === 'all' || selectedMetric === 'calls') && (
                <g>
                  <path
                    d={createPath(filteredMetrics.map((m) => m.calls), maxCalls)}
                    fill="none"
                    className="stroke-emerald-500"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                  {filteredMetrics.map((m, idx) => (
                    <circle
                      key={idx}
                      cx={getX(idx)}
                      cy={getY(m.calls, maxCalls)}
                      r="5"
                      className="fill-white stroke-emerald-500"
                      strokeWidth="2.5"
                    />
                  ))}
                </g>
              )}

              {/* Visits Line (Sky) */}
              {(selectedMetric === 'all' || selectedMetric === 'visits') && (
                <g>
                  <path
                    d={createPath(filteredMetrics.map((m) => m.visits), maxVisits)}
                    fill="none"
                    className="stroke-sky-500"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                  {filteredMetrics.map((m, idx) => (
                    <circle
                      key={idx}
                      cx={getX(idx)}
                      cy={getY(m.visits, maxVisits)}
                      r="5"
                      className="fill-white stroke-sky-500"
                      strokeWidth="2.5"
                    />
                  ))}
                </g>
              )}

              {/* Appointments Line (Purple) */}
              {(selectedMetric === 'all' || selectedMetric === 'appointments') && (
                <g>
                  <path
                    d={createPath(filteredMetrics.map((m) => m.appointments), maxAppointments)}
                    fill="none"
                    className="stroke-purple-500"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  {filteredMetrics.map((m, idx) => (
                    <circle
                      key={idx}
                      cx={getX(idx)}
                      cy={getY(m.appointments, maxAppointments)}
                      r="4.5"
                      className="fill-white stroke-purple-500"
                      strokeWidth="2"
                    />
                  ))}
                </g>
              )}

              {/* Rank Line (Amber - Inverted where Rank 1 is top) */}
              {(selectedMetric === 'all' || selectedMetric === 'rank') && (
                <g>
                  <path
                    d={createRankPath(filteredMetrics.map((m) => m.rank))}
                    fill="none"
                    className="stroke-amber-500"
                    strokeWidth="3.5"
                    strokeDasharray="6 3"
                    strokeLinecap="round"
                  />
                  {filteredMetrics.map((m, idx) => (
                    <circle
                      key={idx}
                      cx={getX(idx)}
                      cy={getRankY(m.rank)}
                      r="5.5"
                      className="fill-amber-500 stroke-white"
                      strokeWidth="2"
                    />
                  ))}
                </g>
              )}

              {/* X-Axis Month Labels & Data Tooltip Badges */}
              {filteredMetrics.map((m, idx) => (
                <g key={idx}>
                  <text
                    x={getX(idx)}
                    y={svgHeight - 6}
                    textAnchor="middle"
                    className="text-[10px] font-bold fill-slate-400"
                  >
                    {m.month}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-6 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-500" />
            <span className="text-slate-600 dark:text-slate-300 font-medium">Map Pack Rank (1st is Top)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-slate-600 dark:text-slate-300 font-medium">Customer Phone Calls</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-sky-500" />
            <span className="text-slate-600 dark:text-slate-300 font-medium">Map Profile Views & Visits</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-purple-500" />
            <span className="text-slate-600 dark:text-slate-300 font-medium">Appointments Booked</span>
          </div>
        </div>

        {/* Month by Month Breakdown Table */}
        <div className="overflow-x-auto pt-2">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-400 uppercase text-[10px] font-bold">
              <tr>
                <th className="p-2.5 rounded-l-xl">Month</th>
                <th className="p-2.5 text-amber-600">Local Rank</th>
                <th className="p-2.5 text-emerald-600">Direct Calls</th>
                <th className="p-2.5 text-sky-600">Profile Visits</th>
                <th className="p-2.5 text-purple-600 rounded-r-xl">Appointments</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {filteredMetrics.map((row, i) => (
                <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/50">
                  <td className="p-2.5 font-bold text-slate-900 dark:text-white">{row.month}</td>
                  <td className="p-2.5 font-bold text-amber-500">#{row.rank}</td>
                  <td className="p-2.5 font-bold text-emerald-600">+{row.calls} calls</td>
                  <td className="p-2.5">{row.visits.toLocaleString('en-IN')}</td>
                  <td className="p-2.5 font-bold text-purple-600">{row.appointments}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
