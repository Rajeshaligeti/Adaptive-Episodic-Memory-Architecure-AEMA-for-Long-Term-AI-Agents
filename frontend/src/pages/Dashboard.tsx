import React, { useEffect, useState } from 'react';
import {
  Upload,
  PlayCircle,
  GitCompare,
  Database,
  CheckCircle2,
  Clock,
  ChevronRight,
  TrendingUp,
  Activity,
  Layers
} from 'lucide-react';
import { ActivePage } from '../components/Sidebar';
import { api } from '../services/api';
import { StatsOverview, Experiment } from '../types';

interface DashboardProps {
  onNavigate: (page: ActivePage) => void;
  onSelectExperiment: (expId: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate, onSelectExperiment }) => {
  const [stats, setStats] = useState<StatsOverview | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const data = await api.getStatsOverview();
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-10">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Datasets</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-0.5">
              {stats?.total_datasets ?? 0}
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Available for clustering</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <PlayCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Experiments Run</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-0.5">
              {stats?.total_experiments ?? 0}
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Completed pipelines</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">AEMA Ensemble</p>
            <h3 className="text-2xl font-bold text-emerald-600 mt-0.5">
              {stats?.algorithm_distribution?.['AEMA'] ?? 0}
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Adaptive executions</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <GitCompare className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Baselines</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-0.5">
              {(stats?.total_experiments ?? 0) - (stats?.algorithm_distribution?.['AEMA'] ?? 0)}
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Comparative benchmarks</p>
          </div>
        </div>
      </div>

      {/* Quick Launch Actions */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-2xl p-6 text-white border border-slate-800 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold">Launch a Machine Learning Task</h3>
            <p className="text-xs text-slate-300 mt-1">
              Select an action to ingest data, configure an AEMA ensemble, or run a 5-way comparative benchmark.
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={() => onNavigate('upload')}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload CSV/Excel</span>
            </button>
            <button
              onClick={() => onNavigate('experiment')}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition"
            >
              <PlayCircle className="w-3.5 h-3.5" />
              <span>Run AEMA</span>
            </button>
            <button
              onClick={() => onNavigate('comparison')}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition"
            >
              <GitCompare className="w-3.5 h-3.5" />
              <span>Compare Algorithms</span>
            </button>
          </div>
        </div>
      </div>

      {/* Recent Experiments Activity */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Recent Experiment Runs</h3>
            <p className="text-xs text-slate-500 mt-0.5">History of completed clustering executions and validation metrics</p>
          </div>
          <button
            onClick={() => onNavigate('history')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center space-x-1"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {loading ? (
          <div className="py-12 flex justify-center items-center text-slate-400 text-xs">
            <Activity className="w-4 h-4 animate-spin mr-2" />
            <span>Loading recent activity...</span>
          </div>
        ) : stats?.recent_experiments && stats.recent_experiments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] tracking-wider">
                  <th className="py-2.5 font-semibold">Algorithm</th>
                  <th className="py-2.5 font-semibold">Dataset</th>
                  <th className="py-2.5 font-semibold">Clusters</th>
                  <th className="py-2.5 font-semibold">Silhouette</th>
                  <th className="py-2.5 font-semibold">Runtime</th>
                  <th className="py-2.5 font-semibold">Status</th>
                  <th className="py-2.5 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stats.recent_experiments.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded font-semibold text-[11px] ${
                        item.algorithm === 'AEMA'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {item.algorithm}
                      </span>
                    </td>
                    <td className="py-3 font-medium text-slate-800 truncate max-w-[180px]">
                      {item.dataset_name}
                    </td>
                    <td className="py-3 font-mono text-slate-600">
                      k={item.clusters_count}
                    </td>
                    <td className="py-3 font-mono font-semibold text-emerald-600">
                      {item.silhouette_score !== null && item.silhouette_score !== undefined
                        ? item.silhouette_score.toFixed(4)
                        : '-'}
                    </td>
                    <td className="py-3 font-mono text-slate-500">
                      {item.execution_time_ms.toFixed(1)} ms
                    </td>
                    <td className="py-3">
                      <span className="inline-flex items-center space-x-1 text-emerald-600 text-[11px] font-medium">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Completed</span>
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => onSelectExperiment(item.id)}
                        className="px-2.5 py-1 text-[11px] font-semibold text-blue-600 hover:bg-blue-50 rounded-md transition"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-slate-400 space-y-2">
            <p className="text-xs">No experiments recorded yet.</p>
            <button
              onClick={() => onNavigate('upload')}
              className="text-xs text-blue-600 font-semibold hover:underline"
            >
              Upload a dataset to run your first experiment
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
