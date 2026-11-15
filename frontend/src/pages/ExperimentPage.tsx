import React, { useState } from 'react';
import {
  PlayCircle,
  Cpu,
  Sliders,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  Info,
  Sparkles,
  Layers,
  ShieldCheck
} from 'lucide-react';
import { Dataset, PreprocessResponse, Experiment, ExperimentRunRequest } from '../types';
import { api } from '../services/api';
import { ActivePage } from '../components/Sidebar';

interface ExperimentPageProps {
  dataset: Dataset | null;
  preprocessing: PreprocessResponse | null;
  onNavigate: (page: ActivePage) => void;
  onExperimentComplete: (exp: Experiment) => void;
}

export const ExperimentPage: React.FC<ExperimentPageProps> = ({
  dataset,
  preprocessing,
  onNavigate,
  onExperimentComplete
}) => {
  const [selectedAlgo, setSelectedAlgo] = useState<'AEMA' | 'K-Means' | 'DBSCAN' | 'Agglomerative' | 'GMM'>('AEMA');

  // AEMA Parameters
  const [aemaClusters, setAemaClusters] = useState<number>(3);
  const [aemaEnsembleSize, setAemaEnsembleSize] = useState<number>(7);
  const [aemaAdaptiveWeighting, setAemaAdaptiveWeighting] = useState<boolean>(true);
  const [aemaQualityMetric, setAemaQualityMetric] = useState<'silhouette' | 'calinski_harabasz' | 'composite'>('composite');
  const [aemaWeightR, setAemaWeightR] = useState<number>(0.40);
  const [aemaWeightF, setAemaWeightF] = useState<number>(0.30);
  const [aemaWeightC, setAemaWeightC] = useState<number>(0.30);
  const [aemaArchivalThreshold, setAemaArchivalThreshold] = useState<number>(0.30);
  const [aemaSeed, setAemaSeed] = useState<number>(42);

  // K-Means Parameters
  const [kmClusters, setKmClusters] = useState<number>(3);
  const [kmInit, setKmInit] = useState<'k-means++' | 'random'>('k-means++');

  // DBSCAN Parameters
  const [dbscanEps, setDbscanEps] = useState<number>(0.5);
  const [dbscanMinSamples, setDbscanMinSamples] = useState<number>(5);

  // Agglomerative Parameters
  const [aggClusters, setAggClusters] = useState<number>(3);
  const [aggLinkage, setAggLinkage] = useState<'average' | 'ward' | 'complete'>('average');
  const [aggMetric, setAggMetric] = useState<'cosine' | 'euclidean'>('cosine');

  // GMM Parameters
  const [gmmComponents, setGmmComponents] = useState<number>(3);
  const [gmmCovariance, setGmmCovariance] = useState<'full' | 'diag'>('full');

  const [running, setRunning] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [latestExp, setLatestExp] = useState<Experiment | null>(null);

  if (!dataset) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-xl mx-auto space-y-4">
        <PlayCircle className="w-12 h-12 text-slate-300 mx-auto" />
        <h3 className="text-base font-bold text-slate-800">No Dataset Selected</h3>
        <p className="text-xs text-slate-500">Please upload or load a dataset before running clustering experiments.</p>
        <button
          onClick={() => onNavigate('upload')}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition"
        >
          Select Dataset
        </button>
      </div>
    );
  }

  const handleRun = async () => {
    setError(null);
    setRunning(true);
    try {
      const payload: ExperimentRunRequest = {
        dataset_id: dataset.id,
        preprocessing_id: preprocessing?.id,
        algorithm: selectedAlgo
      };

      if (selectedAlgo === 'AEMA') {
        payload.aema_config = {
          n_clusters: aemaClusters,
          ensemble_size: aemaEnsembleSize,
          adaptive_weighting: aemaAdaptiveWeighting,
          quality_metric: aemaQualityMetric,
          weight_recency: aemaWeightR,
          weight_frequency: aemaWeightF,
          weight_cluster: aemaWeightC,
          archival_threshold: aemaArchivalThreshold,
          random_state: aemaSeed
        };
      } else if (selectedAlgo === 'K-Means') {
        payload.kmeans_config = {
          n_clusters: kmClusters,
          init: kmInit,
          random_state: 42
        };
      } else if (selectedAlgo === 'DBSCAN') {
        payload.dbscan_config = {
          eps: dbscanEps,
          min_samples: dbscanMinSamples,
          metric: 'euclidean'
        };
      } else if (selectedAlgo === 'Agglomerative') {
        payload.agglomerative_config = {
          n_clusters: aggClusters,
          linkage: aggLinkage,
          metric: aggMetric
        };
      } else if (selectedAlgo === 'GMM') {
        payload.gmm_config = {
          n_components: gmmComponents,
          covariance_type: gmmCovariance,
          random_state: 42
        };
      }

      const res = await api.runExperiment(payload);
      setLatestExp(res);
      onExperimentComplete(res);
    } catch (err: any) {
      setError(err.message || 'Experiment execution failed.');
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Header Profile */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
            Experiment Studio
          </span>
          <h2 className="text-xl font-bold text-slate-900 mt-1">{dataset.original_name}</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {dataset.row_count} rows • {dataset.column_count} features • Preprocessing:{' '}
            {preprocessing ? (
              <span className="text-emerald-600 font-semibold font-mono">Custom Matrix Active</span>
            ) : (
              <span className="text-slate-500 font-mono">Auto-Clean Defaults</span>
            )}
          </p>
        </div>

        <button
          disabled={running}
          onClick={handleRun}
          className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition disabled:opacity-50 self-start md:self-auto"
        >
          {running ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Executing {selectedAlgo}...</span>
            </>
          ) : (
            <>
              <PlayCircle className="w-4 h-4 fill-white text-blue-600" />
              <span>Run {selectedAlgo} Experiment</span>
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

      {/* Completion Banner if finished */}
      {latestExp && (
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-emerald-950 text-sm">
                Experiment Finished in {latestExp.execution_time_ms.toFixed(1)} ms
              </h3>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => onNavigate('results')}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition"
              >
                Inspect Results Dashboard
              </button>
              <button
                onClick={() => onNavigate('visualizations')}
                className="px-3.5 py-1.5 rounded-lg bg-white border border-emerald-300 text-emerald-800 text-xs font-semibold hover:bg-emerald-100/50 transition"
              >
                View 2D PCA Projections
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white/80 p-3 rounded-xl border border-emerald-100">
              <span className="text-[10px] text-slate-500 font-medium">Clusters Discovered</span>
              <p className="text-base font-mono font-bold text-slate-900 mt-0.5">k={latestExp.clusters_count}</p>
            </div>
            <div className="bg-white/80 p-3 rounded-xl border border-emerald-100">
              <span className="text-[10px] text-slate-500 font-medium">Silhouette Score</span>
              <p className="text-base font-mono font-bold text-emerald-600 mt-0.5">
                {latestExp.metrics.silhouette_score !== null && latestExp.metrics.silhouette_score !== undefined
                  ? latestExp.metrics.silhouette_score.toFixed(4)
                  : 'N/A'}
              </p>
            </div>
            <div className="bg-white/80 p-3 rounded-xl border border-emerald-100">
              <span className="text-[10px] text-slate-500 font-medium">Davies-Bouldin Index</span>
              <p className="text-base font-mono font-bold text-slate-800 mt-0.5">
                {latestExp.metrics.davies_bouldin_index !== null && latestExp.metrics.davies_bouldin_index !== undefined
                  ? latestExp.metrics.davies_bouldin_index.toFixed(4)
                  : 'N/A'}
              </p>
            </div>
            <div className="bg-white/80 p-3 rounded-xl border border-emerald-100">
              <span className="text-[10px] text-slate-500 font-medium">Noise / Archived</span>
              <p className="text-base font-mono font-bold text-slate-700 mt-0.5">
                {latestExp.noise_points} ({(latestExp.metrics.noise_ratio * 100).toFixed(1)}%)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Algorithm Selection Tabs */}
      <div className="flex border-b border-slate-200 space-x-2 overflow-x-auto">
        {[
          { id: 'AEMA', label: 'AEMA (Adaptive Ensemble)', badge: 'Primary Research' },
          { id: 'K-Means', label: 'K-Means', badge: 'Centroid' },
          { id: 'DBSCAN', label: 'DBSCAN', badge: 'Density-Based' },
          { id: 'Agglomerative', label: 'Agglomerative', badge: 'Hierarchical' },
          { id: 'GMM', label: 'Gaussian Mixture', badge: 'Probabilistic' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedAlgo(tab.id as any)}
            className={`px-4 py-3 text-xs font-semibold border-b-2 flex items-center space-x-2 transition whitespace-nowrap ${
              selectedAlgo === tab.id
                ? 'border-blue-600 text-blue-600 bg-blue-50/30'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded font-normal ${
              selectedAlgo === tab.id ? 'bg-blue-100 text-blue-700 font-semibold' : 'bg-slate-100 text-slate-500'
            }`}>
              {tab.badge}
            </span>
          </button>
        ))}
      </div>

      {/* AEMA Parameter Controls */}
      {selectedAlgo === 'AEMA' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Cluster & Ensemble Configuration */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                <Layers className="w-4 h-4 text-blue-600" />
                <span>Ensemble Architecture</span>
              </h3>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                    <span>Target Number of Clusters (k)</span>
                    <span className="font-mono font-bold text-blue-600">{aemaClusters}</span>
                  </div>
                  <input
                    type="range"
                    min={2}
                    max={15}
                    value={aemaClusters}
                    onChange={(e) => setAemaClusters(Number(e.target.value))}
                    className="w-full accent-blue-600"
                  />
                  <span className="text-[10px] text-slate-400">Tested range in paper: k ∈ &#123;8, 12, 18, 24, 30&#125;</span>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                    <span>Ensemble Size (Base Partitions M)</span>
                    <span className="font-mono font-bold text-blue-600">{aemaEnsembleSize}</span>
                  </div>
                  <input
                    type="range"
                    min={3}
                    max={15}
                    value={aemaEnsembleSize}
                    onChange={(e) => setAemaEnsembleSize(Number(e.target.value))}
                    className="w-full accent-blue-600"
                  />
                  <span className="text-[10px] text-slate-400">Synthesizes varied initializations and distance metrics</span>
                </div>

                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <label className="flex items-center space-x-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={aemaAdaptiveWeighting}
                      onChange={(e) => setAemaAdaptiveWeighting(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                    />
                    <div>
                      <span className="text-xs font-semibold text-slate-800">Dynamic Quality Weighting</span>
                      <p className="text-[11px] text-slate-400">
                        Weights each partition by its internal validation score using softmax normalization.
                      </p>
                    </div>
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Quality Weighting Metric</label>
                  <select
                    value={aemaQualityMetric}
                    onChange={(e) => setAemaQualityMetric(e.target.value as any)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-slate-50 focus:outline-none focus:border-blue-500"
                  >
                    <option value="composite">Composite Index (Silhouette + DB-inv + CH-log)</option>
                    <option value="silhouette">Silhouette Score Focus</option>
                    <option value="calinski_harabasz">Calinski-Harabasz Dispersion Focus</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Cognitive Scoring & Strategic Archival */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Adaptive Sample Scoring & Archival (Eq. 6 & 7)</span>
              </h3>

              <p className="text-xs text-slate-500">
                Score(x<sub>i</sub>) = w<sub>r</sub>·R<sub>i</sub> + w<sub>f</sub>·F<sub>i</sub> + w<sub>c</sub>·C<sub>i</sub>
              </p>

              <div className="space-y-3.5">
                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                    <span>Recency / Density Proxy Weight (w<sub>r</sub>)</span>
                    <span className="font-mono font-bold text-blue-600">{aemaWeightR.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={aemaWeightR}
                    onChange={(e) => setAemaWeightR(Number(e.target.value))}
                    className="w-full accent-blue-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                    <span>Consensus Agreement Frequency (w<sub>f</sub>)</span>
                    <span className="font-mono font-bold text-blue-600">{aemaWeightF.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={aemaWeightF}
                    onChange={(e) => setAemaWeightF(Number(e.target.value))}
                    className="w-full accent-blue-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                    <span>Cluster Size / Coherence Proxy (w<sub>c</sub>)</span>
                    <span className="font-mono font-bold text-blue-600">{aemaWeightC.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={aemaWeightC}
                    onChange={(e) => setAemaWeightC(Number(e.target.value))}
                    className="w-full accent-blue-600"
                  />
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                    <span>Strategic Archival Threshold (τ)</span>
                    <span className="font-mono font-bold text-rose-600">{aemaArchivalThreshold.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min={0.05}
                    max={0.60}
                    step={0.05}
                    value={aemaArchivalThreshold}
                    onChange={(e) => setAemaArchivalThreshold(Number(e.target.value))}
                    className="w-full accent-rose-600"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Points with Score &lt; τ are archived into an outlier partition (paper benchmark default τ=0.30).
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Baseline Hyperparameter Controls */}
      {selectedAlgo === 'K-Means' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4 max-w-xl">
          <h3 className="font-bold text-slate-900 text-sm">K-Means Configuration</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Number of Clusters (k)</label>
              <input
                type="number"
                min={2}
                max={20}
                value={kmClusters}
                onChange={(e) => setKmClusters(Number(e.target.value))}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Centroid Initialization</label>
              <select
                value={kmInit}
                onChange={(e) => setKmInit(e.target.value as any)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-slate-50"
              >
                <option value="k-means++">k-means++ (Smart seeding)</option>
                <option value="random">Random initialization</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {selectedAlgo === 'DBSCAN' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4 max-w-xl">
          <h3 className="font-bold text-slate-900 text-sm">DBSCAN Configuration</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Neighborhood Radius (Epsilon ε)</label>
              <input
                type="number"
                step={0.1}
                min={0.1}
                max={10.0}
                value={dbscanEps}
                onChange={(e) => setDbscanEps(Number(e.target.value))}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Minimum Core Samples</label>
              <input
                type="number"
                min={2}
                max={50}
                value={dbscanMinSamples}
                onChange={(e) => setDbscanMinSamples(Number(e.target.value))}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs"
              />
            </div>
          </div>
        </div>
      )}

      {selectedAlgo === 'Agglomerative' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4 max-w-xl">
          <h3 className="font-bold text-slate-900 text-sm">Agglomerative Hierarchical Configuration</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Target Clusters (k)</label>
              <input
                type="number"
                min={2}
                max={20}
                value={aggClusters}
                onChange={(e) => setAggClusters(Number(e.target.value))}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Linkage Criterion</label>
              <select
                value={aggLinkage}
                onChange={(e) => setAggLinkage(e.target.value as any)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-slate-50"
              >
                <option value="average">Average Linkage (AEMA Paper Default)</option>
                <option value="complete">Complete Linkage</option>
                <option value="ward">Ward Linkage (Variance Minimizing)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Distance Metric</label>
              <select
                value={aggMetric}
                onChange={(e) => setAggMetric(e.target.value as any)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-slate-50"
              >
                <option value="cosine">Cosine Distance (AEMA Paper Default)</option>
                <option value="euclidean">Euclidean Distance</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {selectedAlgo === 'GMM' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4 max-w-xl">
          <h3 className="font-bold text-slate-900 text-sm">Gaussian Mixture Model Configuration</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Number of Components</label>
              <input
                type="number"
                min={2}
                max={20}
                value={gmmComponents}
                onChange={(e) => setGmmComponents(Number(e.target.value))}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Covariance Type</label>
              <select
                value={gmmCovariance}
                onChange={(e) => setGmmCovariance(e.target.value as any)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-slate-50"
              >
                <option value="full">Full Covariance (Unrestricted)</option>
                <option value="diag">Diagonal Covariance (Axis-Aligned)</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
