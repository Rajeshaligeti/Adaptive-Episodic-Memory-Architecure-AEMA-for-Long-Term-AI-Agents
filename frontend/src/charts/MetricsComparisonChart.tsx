import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell
} from 'recharts';
import { AlgorithmComparisonItem } from '../types';

interface MetricsComparisonChartProps {
  data: AlgorithmComparisonItem[];
}

export const MetricsComparisonChart: React.FC<MetricsComparisonChartProps> = ({ data }) => {
  // Format data for chart
  const formattedData = data.map((d) => ({
    name: d.algorithm,
    silhouette: d.silhouette_score ?? 0,
    daviesBouldin: d.davies_bouldin_index ?? 0,
    calinskiHarabasz: d.calinski_harabasz_index ? Math.log10(d.calinski_harabasz_index + 1) : 0, // Log-scaled for display
    rawCalinski: d.calinski_harabasz_index,
    isAema: d.algorithm === 'AEMA'
  }));

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 pb-3 border-b border-slate-100">
        <div>
          <h3 className="font-semibold text-slate-800 text-base">Algorithm Metric Benchmarking</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Silhouette Score (higher is better) vs Davies-Bouldin Index (lower is better)
          </p>
        </div>
      </div>

      <div className="w-full h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={formattedData} margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
            <XAxis dataKey="name" stroke="#94A3B8" tick={{ fontSize: 12, fontWeight: 500 }} />
            <YAxis stroke="#94A3B8" tick={{ fontSize: 11 }} />
            <Tooltip
              content={({ payload }) => {
                if (!payload || payload.length === 0) return null;
                const d = payload[0].payload;
                return (
                  <div className="bg-slate-900 text-white text-xs rounded-lg p-3 shadow-lg font-sans border border-slate-700">
                    <p className="font-bold text-sm mb-1.5 text-blue-400">{d.name}</p>
                    <div className="space-y-1 text-slate-300">
                      <p>
                        Silhouette Score: <span className="font-mono font-semibold text-emerald-400">{d.silhouette.toFixed(4)}</span>
                        <span className="text-slate-400 text-[10px] ml-1">(higher=better)</span>
                      </p>
                      <p>
                        Davies-Bouldin Index: <span className="font-mono font-semibold text-rose-400">{d.daviesBouldin.toFixed(4)}</span>
                        <span className="text-slate-400 text-[10px] ml-1">(lower=better)</span>
                      </p>
                      {d.rawCalinski !== null && (
                        <p>
                          Calinski-Harabasz: <span className="font-mono font-semibold text-amber-400">{d.rawCalinski.toFixed(1)}</span>
                          <span className="text-slate-400 text-[10px] ml-1">(higher=better)</span>
                        </p>
                      )}
                    </div>
                  </div>
                );
              }}
            />
            <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />
            <Bar dataKey="silhouette" name="Silhouette Score (Higher Better)" fill="#10B981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="daviesBouldin" name="Davies-Bouldin Index (Lower Better)" fill="#EF4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
