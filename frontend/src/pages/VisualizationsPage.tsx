import React, { useState } from 'react';
import {
  PieChart,
  BarChart3,
  Layers,
  Sparkles,
  HelpCircle,
  Eye,
  FileText
} from 'lucide-react';
import { Experiment } from '../types';
import { PcaScatterChart } from '../charts/PcaScatterChart';
import { ClusterDistributionChart } from '../charts/ClusterDistributionChart';
import { ActivePage } from '../components/Sidebar';

interface VisualizationsPageProps {
  experiment: Experiment | null;
  onNavigate: (page: ActivePage) => void;
}

export const VisualizationsPage: React.FC<VisualizationsPageProps> = ({
  experiment,
  onNavigate
}) => {
  const [viewMode, setViewMode] = useState<'pca' | 'tsne'>('pca');

  if (!experiment) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-xl mx-auto space-y-4">
        <PieChart className="w-12 h-12 text-slate-300 mx-auto" />
        <h3 className="text-base font-bold text-slate-800">No Visualization Data Available</h3>
        <p className="text-xs text-slate-500">Run an experiment first to generate 2D PCA projections and cluster distributions.</p>
        <button
          onClick={() => onNavigate('experiment')}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition"
        >
          Go to Experiment Studio
        </button>
      </div>
    );
  }

  const vis = experiment.visualizations;
  const hasTsne = vis.tsne_2d && vis.tsne_2d.length > 0;
  const currentPoints = viewMode === 'tsne' && hasTsne ? vis.tsne_2d! : vis.pca_2d;

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Header Profile */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
            High-Dimensional Coordinate Projection
          </span>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            {experiment.algorithm_name} Manifold & Scatter Analysis
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Plotted from actual transformed features and real cluster assignments (no synthetic mock coordinates).
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-xl self-start md:self-auto">
          <button
            onClick={() => setViewMode('pca')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              viewMode === 'pca'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            2D PCA Projection
          </button>
          <button
            disabled={!hasTsne}
            onClick={() => setViewMode('tsne')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              viewMode === 'tsne'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            } disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            2D t-SNE Manifold
          </button>
        </div>
      </div>

      {/* Main Scatter Plot */}
      <PcaScatterChart
        data={currentPoints}
        title={viewMode === 'pca' ? '2D Principal Component Projection (PCA)' : '2D t-SNE Non-Linear Manifold'}
        subtitle={
          viewMode === 'pca'
            ? 'Dimensionality reduced via orthogonal linear combinations maximizing global variance'
            : 'Preserves local neighborhood topologies and non-linear cluster separation'
        }
        explainedVariance={viewMode === 'pca' ? vis.explained_variance_ratio : undefined}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cluster Size Distribution */}
        <div className="lg:col-span-2">
          <ClusterDistributionChart data={vis.cluster_distribution} />
        </div>

        {/* Feature Importance Proxy (PCA Loadings) */}
        {vis.feature_importance_proxy && Object.keys(vis.feature_importance_proxy).length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3.5">
            <div className="border-b border-slate-100 pb-2.5">
              <h4 className="font-bold text-slate-900 text-xs">Feature Importance Proxy</h4>
              <p className="text-[11px] text-slate-400">Contribution to primary principal axes</p>
            </div>

            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
              {Object.entries(vis.feature_importance_proxy).map(([feat, score]) => (
                <div key={feat} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-mono text-slate-700 truncate max-w-[140px]" title={feat}>
                      {feat}
                    </span>
                    <span className="font-mono text-blue-600 font-semibold">{score.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-600 h-1.5 rounded-full"
                      style={{ width: `${Math.min(100, score)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
