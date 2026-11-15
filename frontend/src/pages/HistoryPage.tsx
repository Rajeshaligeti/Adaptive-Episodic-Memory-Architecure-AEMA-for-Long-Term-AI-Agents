import React, { useEffect, useState } from 'react';
import {
  History,
  Trash2,
  Eye,
  FileText,
  Activity,
  CheckCircle2,
  RefreshCw,
  Search,
  Filter
} from 'lucide-react';
import { Experiment } from '../types';
import { api } from '../services/api';
import { ActivePage } from '../components/Sidebar';

interface HistoryPageProps {
  onSelectExperiment: (expId: string) => void;
  onNavigate: (page: ActivePage) => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({
  onSelectExperiment,
  onNavigate
}) => {
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterAlgo, setFilterAlgo] = useState<string>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadExperiments();
  }, []);

  const loadExperiments = async () => {
    setLoading(true);
    try {
      const data = await api.listExperiments();
      setExperiments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this experiment record?')) {
      return;
    }
    setDeletingId(id);
    try {
      await api.deleteExperiment(id);
      setExperiments(experiments.filter((e) => e.id !== id));
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = experiments.filter((e) => {
    if (filterAlgo !== 'all' && e.algorithm_name !== filterAlgo) return false;
    return true;
  });

  return (
    <div className="space-y-7 max-w-6xl mx-auto pb-12">
      {/* Header Profile */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
            Database Persistence
          </span>
          <h2 className="text-xl font-bold text-slate-900 mt-1">Experiment Archive & Run History</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit, inspect, and compare all past clustering runs stored in the SQLite/PostgreSQL database.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={filterAlgo}
            onChange={(e) => setFilterAlgo(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-slate-50 focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Algorithms</option>
            <option value="AEMA">AEMA Only</option>
            <option value="K-Means">K-Means Only</option>
            <option value="DBSCAN">DBSCAN Only</option>
            <option value="Agglomerative">Agglomerative Only</option>
            <option value="GMM">GMM Only</option>
          </select>

          <button
            onClick={loadExperiments}
            className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition"
            title="Refresh History"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        {loading ? (
          <div className="py-16 text-center text-slate-400 text-xs flex justify-center items-center space-x-2">
            <Activity className="w-4 h-4 animate-spin" />
            <span>Loading experiment archive...</span>
          </div>
        ) : filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs divide-y divide-slate-200">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-3.5 py-2.5 font-semibold">Algorithm</th>
                  <th className="px-3.5 py-2.5 font-semibold">Experiment ID</th>
                  <th className="px-3.5 py-2.5 font-semibold">Clusters (k)</th>
                  <th className="px-3.5 py-2.5 font-semibold">Silhouette</th>
                  <th className="px-3.5 py-2.5 font-semibold">Davies-Bouldin</th>
                  <th className="px-3.5 py-2.5 font-semibold">Runtime</th>
                  <th className="px-3.5 py-2.5 font-semibold">Date</th>
                  <th className="px-3.5 py-2.5 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filtered.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-3.5 py-3">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        exp.algorithm_name === 'AEMA'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {exp.algorithm_name}
                      </span>
                    </td>
                    <td className="px-3.5 py-3 font-mono text-slate-500 text-[11px]">
                      {exp.id.slice(0, 8)}...
                    </td>
                    <td className="px-3.5 py-3 font-mono font-semibold text-slate-800">
                      k={exp.clusters_count}
                    </td>
                    <td className="px-3.5 py-3 font-mono font-bold text-emerald-600">
                      {exp.metrics.silhouette_score !== null && exp.metrics.silhouette_score !== undefined
                        ? exp.metrics.silhouette_score.toFixed(4)
                        : '-'}
                    </td>
                    <td className="px-3.5 py-3 font-mono text-slate-700">
                      {exp.metrics.davies_bouldin_index !== null && exp.metrics.davies_bouldin_index !== undefined
                        ? exp.metrics.davies_bouldin_index.toFixed(4)
                        : '-'}
                    </td>
                    <td className="px-3.5 py-3 font-mono text-slate-500">
                      {exp.execution_time_ms.toFixed(1)} ms
                    </td>
                    <td className="px-3.5 py-3 text-slate-400 text-[11px]">
                      {exp.created_at.slice(0, 10)}
                    </td>
                    <td className="px-3.5 py-3 text-right space-x-1.5">
                      <button
                        onClick={() => onSelectExperiment(exp.id)}
                        className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold transition"
                        title="Inspect Results"
                      >
                        Inspect
                      </button>
                      <button
                        onClick={() => window.open(api.getPdfReportUrl(exp.id), '_blank')}
                        className="px-2.5 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-semibold transition"
                        title="Download PDF"
                      >
                        PDF
                      </button>
                      <button
                        disabled={deletingId === exp.id}
                        onClick={() => handleDelete(exp.id)}
                        className="px-2 py-1 rounded hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition"
                        title="Delete Experiment"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center text-slate-400 space-y-2">
            <p className="text-xs">No matching experiments found in database.</p>
            <button
              onClick={() => onNavigate('experiment')}
              className="text-xs text-blue-600 font-semibold hover:underline"
            >
              Run a new experiment
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
