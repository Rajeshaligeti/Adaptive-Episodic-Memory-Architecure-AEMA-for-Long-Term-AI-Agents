import React, { useState } from 'react';
import {
  GitCompare,
  Play,
  RefreshCw,
  Trophy,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  BarChart3,
  Sparkles
} from 'lucide-react';
import { Dataset, PreprocessResponse, CompareAlgorithmsResponse } from '../types';
import { api } from '../services/api';
import { MetricsComparisonChart } from '../charts/MetricsComparisonChart';
import { ActivePage } from '../components/Sidebar';

interface ComparisonPageProps {
  dataset: Dataset | null;
  preprocessing: PreprocessResponse | null;
  onNavigate: (page: ActivePage) => void;
}

export const ComparisonPage: React.FC<ComparisonPageProps> = ({
  dataset,
  preprocessing,
  onNavigate
}) => {
  const [selectedAlgos, setSelectedAlgos] = useState<string[]>([
    'AEMA',
    'K-Means',
    'DBSCAN',
    'Agglomerative',
    'GMM'
  ]);
  const [targetK, setTargetK] = useState<number>(3);
  const [running, setRunning] = useState<boolean>(false);
  const [comparison, setComparison] = useState<CompareAlgorithmsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!dataset) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-xl mx-auto space-y-4">
        <GitCompare className="w-12 h-12 text-slate-300 mx-auto" />
        <h3 className="text-base font-bold text-slate-800">No Dataset Selected</h3>
        <p className="text-xs text-slate-500">Please upload or load a dataset before launching comparative algorithm benchmarks.</p>
        <button
          onClick={() => onNavigate('upload')}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition"
        >
          Select Dataset
        </button>
      </div>
    );
  }

  const toggleAlgo = (name: string) => {
    if (selectedAlgos.includes(name)) {
      if (selectedAlgos.length > 1) {
        setSelectedAlgos(selectedAlgos.filter((a) => a !== name));
      }
    } else {
      setSelectedAlgos([...selectedAlgos, name]);
    }
  };

  const handleRunComparison = async () => {
    setError(null);
    setRunning(true);
    try {
      const res = await api.compareAlgorithms(
        dataset.id,
        targetK,
        selectedAlgos,
        preprocessing?.id
      );
      setComparison(res);
    } catch (err: any) {
      setError(err.message || 'Comparison benchmark failed.');
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Benchmark Control Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
            Multi-Algorithm Benchmark Suite
          </span>
          <h2 className="text-xl font-bold text-slate-900 mt-1">{dataset.original_name}</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Compare AEMA against standard baselines under identical preprocessing and scaling conditions.
          </p>
        </div>

        <button
          disabled={running}
          onClick={handleRunComparison}
          className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition disabled:opacity-50 self-start md:self-auto"
        >
          {running ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Benchmarking {selectedAlgos.length} Algorithms...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-white" />
              <span>Execute Comparison Benchmark</span>
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Target Clusters & Algorithm Checklist */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Select Candidate Algorithms & Target Clusters</h3>
            <p className="text-xs text-slate-500 mt-0.5">Choose baseline algorithms to evaluate against AEMA</p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-600 font-medium">Target Clusters (k):</span>
            <input
              type="number"
              min={2}
              max={15}
              value={targetK}
              onChange={(e) => setTargetK(Math.max(2, Number(e.target.value)))}
              className="w-16 px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-bold text-center"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2.5">
          {['AEMA', 'K-Means', 'DBSCAN', 'Agglomerative', 'GMM'].map((algo) => {
            const isSelected = selectedAlgos.includes(algo);
            return (
              <button
                key={algo}
                onClick={() => toggleAlgo(algo)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition flex items-center space-x-2 ${
                  isSelected
                    ? algo === 'AEMA'
                      ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                      : 'bg-slate-900 border-slate-900 text-white shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>{algo}</span>
                {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Benchmark Results */}
      {comparison && (
        <div className="space-y-6">
          {/* Best Performers Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider">Best Silhouette Score</p>
                <h4 className="text-base font-extrabold text-emerald-950 mt-0.5">
                  {comparison.best_by_silhouette || 'N/A'}
                </h4>
                <p className="text-[10px] text-emerald-700">Highest cohesion & cluster separation</p>
              </div>
            </div>

            <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-4 flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-blue-800 tracking-wider">Best Davies-Bouldin</p>
                <h4 className="text-base font-extrabold text-blue-950 mt-0.5">
                  {comparison.best_by_davies_bouldin || 'N/A'}
                </h4>
                <p className="text-[10px] text-blue-700">Lowest cluster scatter / separation ratio</p>
              </div>
            </div>

            <div className="bg-purple-50/70 border border-purple-200 rounded-2xl p-4 flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-purple-800 tracking-wider">Best Calinski-Harabasz</p>
                <h4 className="text-base font-extrabold text-purple-950 mt-0.5">
                  {comparison.best_by_calinski_harabasz || 'N/A'}
                </h4>
                <p className="text-[10px] text-purple-700">Maximum between-cluster dispersion</p>
              </div>
            </div>
          </div>

          {/* Comparative Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Benchmark Comparison Matrix</h3>
              <p className="text-xs text-slate-500 mt-0.5">Evaluated with k={comparison.target_clusters} under identical preprocessing</p>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs divide-y divide-slate-200">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Algorithm</th>
                    <th className="px-4 py-3 font-semibold">Clusters (k)</th>
                    <th className="px-4 py-3 font-semibold">Noise Points</th>
                    <th className="px-4 py-3 font-semibold">
                      Silhouette Score
                      <span className="block text-[10px] text-slate-400 font-normal">Higher is better ([-1, 1])</span>
                    </th>
                    <th className="px-4 py-3 font-semibold">
                      Davies-Bouldin Index
                      <span className="block text-[10px] text-slate-400 font-normal">Lower is better (&gt;=0)</span>
                    </th>
                    <th className="px-4 py-3 font-semibold">
                      Calinski-Harabasz
                      <span className="block text-[10px] text-slate-400 font-normal">Higher is better</span>
                    </th>
                    <th className="px-4 py-3 font-semibold">Runtime</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {comparison.comparison_table.map((row) => {
                    const isAema = row.algorithm === 'AEMA';
                    const isBestSil = row.algorithm === comparison.best_by_silhouette;
                    const isBestDb = row.algorithm === comparison.best_by_davies_bouldin;
                    const isBestCh = row.algorithm === comparison.best_by_calinski_harabasz;

                    return (
                      <tr
                        key={row.algorithm}
                        className={`transition-colors ${isAema ? 'bg-blue-50/40 hover:bg-blue-50/70 font-semibold' : 'hover:bg-slate-50'}`}
                      >
                        <td className="px-4 py-3 flex items-center space-x-2">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            isAema ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-800'
                          }`}>
                            {row.algorithm}
                          </span>
                          {isAema && (
                            <span className="text-[10px] text-blue-700 uppercase font-semibold">Adaptive</span>
                          )}
                        </td>
                        <td className="px-4 py-3 font-mono text-slate-700">{row.clusters_count}</td>
                        <td className="px-4 py-3 font-mono text-slate-500">{row.noise_points}</td>
                        <td className="px-4 py-3 font-mono">
                          {row.silhouette_score !== null && row.silhouette_score !== undefined ? (
                            <span className={`inline-flex items-center space-x-1 ${isBestSil ? 'text-emerald-600 font-bold' : 'text-slate-700'}`}>
                              <span>{row.silhouette_score.toFixed(4)}</span>
                              {isBestSil && <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1 rounded">Best</span>}
                            </span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 font-mono">
                          {row.davies_bouldin_index !== null && row.davies_bouldin_index !== undefined ? (
                            <span className={`inline-flex items-center space-x-1 ${isBestDb ? 'text-blue-600 font-bold' : 'text-slate-700'}`}>
                              <span>{row.davies_bouldin_index.toFixed(4)}</span>
                              {isBestDb && <span className="text-[10px] bg-blue-100 text-blue-700 px-1 rounded">Best</span>}
                            </span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 font-mono">
                          {row.calinski_harabasz_index !== null && row.calinski_harabasz_index !== undefined ? (
                            <span className={`inline-flex items-center space-x-1 ${isBestCh ? 'text-purple-600 font-bold' : 'text-slate-700'}`}>
                              <span>{row.calinski_harabasz_index.toFixed(1)}</span>
                              {isBestCh && <span className="text-[10px] bg-purple-100 text-purple-700 px-1 rounded">Best</span>}
                            </span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 font-mono text-slate-500">
                          {row.execution_time_ms.toFixed(1)} ms
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Interactive Chart */}
          <MetricsComparisonChart data={comparison.comparison_table} />
        </div>
      )}
    </div>
  );
};
