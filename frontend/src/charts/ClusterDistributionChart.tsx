import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { ClusterDistribution } from '../types';
import { BarChart3, AlertCircle } from 'lucide-react';

interface ClusterDistributionChartProps {
  data: ClusterDistribution[];
}

const BAR_COLORS = [
  '#4F46E5', '#10B981', '#F59E0B', '#EF4444',
  '#06B6D4', '#8B5CF6', '#EC4899', '#14B8A6'
];

export const ClusterDistributionChart: React.FC<ClusterDistributionChartProps> = ({ data = [] }) => {
  const hasData = Array.isArray(data) && data.length > 0;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
      <div className="mb-4 pb-3 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-slate-800 text-base">Cluster Size Distribution</h3>
          <p className="text-xs text-slate-500 mt-0.5">Observation count and percentage share per partition</p>
        </div>
        <span className="text-xs font-mono text-slate-400 font-semibold">
          {hasData ? `${data.length} Partitions` : '0 Partitions'}
        </span>
      </div>

      {!hasData ? (
        <div className="w-full h-72 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-slate-100 rounded-xl space-y-2">
          <BarChart3 className="w-8 h-8 text-slate-300" />
          <p className="text-xs font-semibold text-slate-600">No partition distribution points available</p>
          <p className="text-[11px] text-slate-400 max-w-xs">
            Cluster distributions appear once the model completes partitioning.
          </p>
        </div>
      ) : (
        <div className="w-full h-72 min-h-[288px]">
          <ResponsiveContainer width="100%" height={288} minWidth={100} minHeight={288}>
            <BarChart data={data} margin={{ top: 10, right: 20, bottom: 25, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis
                dataKey="label"
                stroke="#94A3B8"
                tick={{ fontSize: 11 }}
                tickLine={{ stroke: '#CBD5E1' }}
              />
              <YAxis
                stroke="#94A3B8"
                tick={{ fontSize: 11 }}
                tickLine={{ stroke: '#CBD5E1' }}
                label={{ value: 'Observations', angle: -90, position: 'insideLeft', offset: 10, fill: '#64748B', fontSize: 11 }}
              />
              <Tooltip
                content={({ payload }) => {
                  if (!payload || payload.length === 0) return null;
                  const d = payload[0].payload as ClusterDistribution;
                  return (
                    <div className="bg-slate-900 text-white text-xs rounded-lg p-2.5 shadow-lg font-sans">
                      <p className="font-semibold mb-1">{d.label}</p>
                      <p className="text-slate-300">Count: <span className="font-mono font-bold text-white">{d.count}</span></p>
                      <p className="text-slate-300">Percentage: <span className="font-mono font-bold text-blue-400">{d.percentage}%</span></p>
                    </div>
                  );
                }}
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {data.map((entry, index) => {
                  const color = entry.cluster === -1
                    ? '#94A3B8'
                    : BAR_COLORS[index % BAR_COLORS.length];
                  return <Cell key={`cell-${index}`} fill={color} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Summary Table below chart */}
      {hasData && (
        <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          {data.map((d, idx) => (
            <div key={idx} className="bg-slate-50 p-2 rounded-lg border border-slate-100 flex items-center justify-between">
              <span className="font-medium text-slate-700">{d.label}:</span>
              <span className="font-mono font-bold text-slate-900">
                {d.count} <span className="text-slate-400 font-normal">({d.percentage}%)</span>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
