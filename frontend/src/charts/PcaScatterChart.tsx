import React, { useMemo } from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { PCA2DPoint } from '../types';

interface PcaScatterChartProps {
  data: PCA2DPoint[];
  title?: string;
  subtitle?: string;
  explainedVariance?: number[];
}

const CLUSTER_COLORS = [
  '#4F46E5', // Indigo (Cluster 0)
  '#10B981', // Emerald (Cluster 1)
  '#F59E0B', // Amber (Cluster 2)
  '#EF4444', // Rose (Cluster 3)
  '#06B6D4', // Cyan (Cluster 4)
  '#8B5CF6', // Purple (Cluster 5)
  '#EC4899', // Pink (Cluster 6)
  '#14B8A6', // Teal (Cluster 7)
  '#F97316', // Orange (Cluster 8)
  '#6366F1', // Blue-violet (Cluster 9)
];

const NOISE_COLOR = '#94A3B8'; // Slate for noise (-1)

export const PcaScatterChart: React.FC<PcaScatterChartProps> = ({
  data,
  title = "2D Principal Component Projection (PCA)",
  subtitle,
  explainedVariance
}) => {
  // Group points by cluster
  const clusterGroups = useMemo(() => {
    const groups: Record<number, PCA2DPoint[]> = {};
    for (const pt of data) {
      if (!groups[pt.cluster]) {
        groups[pt.cluster] = [];
      }
      groups[pt.cluster].push(pt);
    }
    return groups;
  }, [data]);

  const clusters = Object.keys(clusterGroups).map(Number).sort((a, b) => a - b);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 pb-3 border-b border-slate-100">
        <div>
          <h3 className="font-semibold text-slate-800 text-base">{title}</h3>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
        {explainedVariance && explainedVariance.length >= 2 && (
          <div className="mt-2 sm:mt-0 flex items-center space-x-2 text-xs text-slate-500 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
            <span>Variance Explained:</span>
            <span className="font-semibold text-blue-600 font-mono">
              PC1: {(explainedVariance[0] * 100).toFixed(1)}%
            </span>
            <span>|</span>
            <span className="font-semibold text-indigo-600 font-mono">
              PC2: {(explainedVariance[1] * 100).toFixed(1)}%
            </span>
          </div>
        )}
      </div>

      <div className="w-full h-80">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis
              type="number"
              dataKey="x"
              name="PC 1"
              unit=""
              stroke="#94A3B8"
              tick={{ fontSize: 11 }}
              tickLine={{ stroke: '#CBD5E1' }}
              label={{ value: 'Principal Component 1', position: 'bottom', offset: 0, fill: '#64748B', fontSize: 11 }}
            />
            <YAxis
              type="number"
              dataKey="y"
              name="PC 2"
              unit=""
              stroke="#94A3B8"
              tick={{ fontSize: 11 }}
              tickLine={{ stroke: '#CBD5E1' }}
              label={{ value: 'Principal Component 2', angle: -90, position: 'insideLeft', offset: 10, fill: '#64748B', fontSize: 11 }}
            />
            <ZAxis range={[35, 35]} />
            <Tooltip
              cursor={{ strokeDasharray: '3 3' }}
              content={({ payload }) => {
                if (!payload || payload.length === 0) return null;
                const pt = payload[0].payload as PCA2DPoint;
                return (
                  <div className="bg-slate-900 text-white text-xs rounded-lg p-2.5 shadow-lg border border-slate-700 font-sans">
                    <p className="font-semibold border-b border-slate-700 pb-1 mb-1">
                      {pt.cluster === -1 ? 'Noise / Archived Point' : `Cluster ${pt.cluster}`} (Sample #{pt.id})
                    </p>
                    <p className="font-mono text-slate-300">PC1 (X): {pt.x.toFixed(4)}</p>
                    <p className="font-mono text-slate-300">PC2 (Y): {pt.y.toFixed(4)}</p>
                  </div>
                );
              }}
            />
            <Legend
              verticalAlign="top"
              align="right"
              wrapperStyle={{ paddingBottom: '10px', fontSize: '12px' }}
            />
            {clusters.map((cl) => {
              const isNoise = cl === -1;
              const color = isNoise
                ? NOISE_COLOR
                : CLUSTER_COLORS[cl % CLUSTER_COLORS.length];
              const groupName = isNoise ? 'Noise (-1)' : `Cluster ${cl}`;
              return (
                <Scatter
                  key={cl}
                  name={groupName}
                  data={clusterGroups[cl]}
                  fill={color}
                  fillOpacity={0.8}
                />
              );
            })}
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
