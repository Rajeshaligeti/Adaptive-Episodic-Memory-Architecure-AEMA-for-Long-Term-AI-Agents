import React from 'react';
import {
  BarChart2,
  PieChart,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Layers
} from 'lucide-react';
import { Experiment } from '../types';
import { ClusterDistributionChart } from '../charts/ClusterDistributionChart';
import { ActivePage } from '../components/Sidebar';

interface ResultsDashboardProps {
  experiment: Experiment | null;
  onNavigate: (page: ActivePage) => void;
}

export const ResultsDashboard: React.FC<ResultsDashboardProps> = ({
  experiment,
  onNavigate
}) => {
  if (!experiment) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-xl mx-auto space-y-4">
        <BarChart2 className="w-12 h-12 text-slate-300 mx-auto" />
        <h3 className="text-base font-bold text-slate-800">No Experiment Results Available</h3>
        <p className="text-xs text-slate-500">Run an experiment first to inspect detailed evaluation metrics and cluster assignments.</p>
        <button
          onClick={() => onNavigate('experiment')}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition"
        >
          Go to Experiment Studio
        </button>
      </div>
    );
  }

  const m = experiment.metrics;

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Experiment Header */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              {experiment.algorithm_name} Pipeline Result
            </span>
            <span className="text-xs text-slate-400 font-mono">ID: {experiment.id.slice(0, 8)}</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            Cluster Partitioning & Metric Evaluation
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Executed on {experiment.created_at} • Total execution time: {experiment.execution_time_ms.toFixed(2)} ms
          </p>
        </div>

        <div className="flex space-x-2 self-start md:self-auto">
          <button
            onClick={() => onNavigate('visualizations')}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition"
          >
            <PieChart className="w-3.5 h-3.5" />
            <span>2D PCA Projections</span>
          </button>
          <button
            onClick={() => onNavigate('reports')}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Export PDF Report</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Clusters (k)</span>
          <p className="text-2xl font-black text-slate-900 mt-1 font-mono">{m.clusters_count}</p>
          <span className="text-[10px] text-slate-500">Discovered</span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Silhouette</span>
          <p className="text-2xl font-black text-emerald-600 mt-1 font-mono">
            {m.silhouette_score !== null && m.silhouette_score !== undefined
              ? m.silhouette_score.toFixed(4)
              : 'N/A'}
          </p>
          <span className="text-[10px] text-emerald-600 font-semibold">Higher is better</span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Davies-Bouldin</span>
          <p className="text-2xl font-black text-slate-900 mt-1 font-mono">
            {m.davies_bouldin_index !== null && m.davies_bouldin_index !== undefined
              ? m.davies_bouldin_index.toFixed(4)
              : 'N/A'}
          </p>
          <span className="text-[10px] text-rose-500 font-semibold">Lower is better</span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Calinski-Harabasz</span>
          <p className="text-2xl font-black text-slate-900 mt-1 font-mono">
            {m.calinski_harabasz_index !== null && m.calinski_harabasz_index !== undefined
              ? m.calinski_harabasz_index.toFixed(1)
              : 'N/A'}
          </p>
          <span className="text-[10px] text-amber-600 font-semibold">Higher is better</span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Noise / Outliers</span>
          <p className="text-2xl font-black text-slate-800 mt-1 font-mono">
            {m.noise_points}
          </p>
          <span className="text-[10px] text-slate-500 font-mono">{(m.noise_ratio * 100).toFixed(1)}% archived</span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Execution Time</span>
          <p className="text-2xl font-black text-blue-600 mt-1 font-mono">
            {m.execution_time_ms.toFixed(1)}
          </p>
          <span className="text-[10px] text-slate-500">milliseconds</span>
        </div>
      </div>

      {/* Ground Truth Validation Metrics if available */}
      {m.adjusted_rand_index !== null && m.adjusted_rand_index !== undefined && (
        <div className="bg-purple-50/60 border border-purple-200 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-100 px-2 py-0.5 rounded">
              Supervised Ground-Truth Evaluation
            </span>
            <h4 className="text-sm font-bold text-purple-950 mt-1">
              External Class Alignment Metrics
            </h4>
            <p className="text-xs text-purple-800 mt-0.5">
              Calculated against the excluded target column without data leakage.
            </p>
          </div>
          <div className="flex space-x-6 text-right">
            <div>
              <span className="text-[10px] text-purple-700 font-bold uppercase">Adjusted Rand Index (ARI)</span>
              <p className="text-lg font-mono font-black text-purple-900">{m.adjusted_rand_index.toFixed(4)}</p>
            </div>
            {m.normalized_mutual_info !== null && m.normalized_mutual_info !== undefined && (
              <div>
                <span className="text-[10px] text-purple-700 font-bold uppercase">Normalized Mutual Info (NMI)</span>
                <p className="text-lg font-mono font-black text-purple-900">{m.normalized_mutual_info.toFixed(4)}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Cluster Size Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ClusterDistributionChart data={m.cluster_distribution} />
        </div>

        {/* Metric Interpretation Reference Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3.5">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-2.5">
            <HelpCircle className="w-4 h-4 text-blue-600" />
            <h4 className="font-bold text-slate-900 text-xs">Metric Interpretation Guide</h4>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="font-bold text-emerald-700">Silhouette Score:</span>
              <span className="text-slate-400 text-[10px] ml-1">Range [-1, 1]</span>
              <p className="text-slate-600 text-[11px] mt-0.5 leading-normal">
                Measures how similar a sample is to its own cluster compared to neighboring clusters. Values &gt; 0.5 indicate dense, well-separated clustering.
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <span className="font-bold text-rose-700">Davies-Bouldin Index:</span>
              <span className="text-slate-400 text-[10px] ml-1">Range [0, ∞)</span>
              <p className="text-slate-600 text-[11px] mt-0.5 leading-normal">
                Ratio of within-cluster scatter to between-cluster separation. <strong>Lower values indicate better clustering</strong>.
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <span className="font-bold text-amber-700">Calinski-Harabasz Index:</span>
              <span className="text-slate-400 text-[10px] ml-1">Range [0, ∞)</span>
              <p className="text-slate-600 text-[11px] mt-0.5 leading-normal">
                Variance ratio criterion. Computes ratio of between-cluster dispersion to within-cluster dispersion. <strong>Higher values indicate superior definition</strong>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
