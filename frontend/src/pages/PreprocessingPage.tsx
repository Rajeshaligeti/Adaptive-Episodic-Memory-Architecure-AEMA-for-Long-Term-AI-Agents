import React, { useState } from 'react';
import {
  Sliders,
  CheckCircle2,
  AlertCircle,
  Play,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  RefreshCw,
  Layers
} from 'lucide-react';
import { Dataset, PreprocessConfig, PreprocessResponse } from '../types';
import { api } from '../services/api';
import { ActivePage } from '../components/Sidebar';

interface PreprocessingPageProps {
  dataset: Dataset | null;
  onNavigate: (page: ActivePage) => void;
  onPreprocessingDone: (prep: PreprocessResponse) => void;
}

export const PreprocessingPage: React.FC<PreprocessingPageProps> = ({
  dataset,
  onNavigate,
  onPreprocessingDone
}) => {
  const [handleMissing, setHandleMissing] = useState<PreprocessConfig['handle_missing']>('median');
  const [removeDuplicates, setRemoveDuplicates] = useState<boolean>(true);
  const [scalingMethod, setScalingMethod] = useState<PreprocessConfig['scaling_method']>('standard');
  const [categoricalEncoding, setCategoricalEncoding] = useState<PreprocessConfig['categorical_encoding']>('one_hot');
  const [targetColumn, setTargetColumn] = useState<string>('');
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  
  const [processing, setProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PreprocessResponse | null>(null);

  if (!dataset) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-xl mx-auto space-y-4">
        <Sliders className="w-12 h-12 text-slate-300 mx-auto" />
        <h3 className="text-base font-bold text-slate-800">No Dataset Selected</h3>
        <p className="text-xs text-slate-500">Select or upload a dataset before configuring preprocessing transformations.</p>
        <button
          onClick={() => onNavigate('upload')}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition"
        >
          Select Dataset
        </button>
      </div>
    );
  }

  const handleRunPreprocessing = async () => {
    setError(null);
    setProcessing(true);
    try {
      const config: PreprocessConfig = {
        handle_missing: handleMissing,
        remove_duplicates: removeDuplicates,
        scaling_method: scalingMethod,
        categorical_encoding: categoricalEncoding,
        target_column: targetColumn ? targetColumn : undefined,
        selected_features: selectedFeatures.length > 0 ? selectedFeatures : undefined
      };
      const res = await api.preprocessDataset(dataset.id, config);
      setResult(res);
      onPreprocessingDone(res);
    } catch (err: any) {
      setError(err.message || 'Preprocessing failed.');
    } finally {
      setProcessing(false);
    }
  };

  const toggleFeature = (col: string) => {
    if (selectedFeatures.includes(col)) {
      setSelectedFeatures(selectedFeatures.filter((c) => c !== col));
    } else {
      setSelectedFeatures([...selectedFeatures, col]);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Header Profile */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
            Preprocessing Pipeline
          </span>
          <h2 className="text-xl font-bold text-slate-900 mt-1">{dataset.original_name}</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Initial input: {dataset.row_count} rows • {dataset.column_count} features ({dataset.summary.total_missing} null values, {dataset.summary.duplicate_rows} duplicates)
          </p>
        </div>

        <button
          disabled={processing}
          onClick={handleRunPreprocessing}
          className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition disabled:opacity-50 self-start md:self-auto"
        >
          {processing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Transforming Pipeline...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-white" />
              <span>Execute Preprocessing</span>
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

      {/* Preprocessing Summary if executed */}
      {result && (
        <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-emerald-950 text-sm">Preprocessing Matrix Generated</h3>
            </div>
            <button
              onClick={() => onNavigate('experiment')}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition"
            >
              <span>Continue to AEMA Experiment</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white/80 p-3 rounded-xl border border-emerald-100">
              <span className="text-[10px] text-slate-500 font-medium">Rows (Before → After)</span>
              <p className="text-sm font-mono font-bold text-slate-900 mt-0.5">
                {result.rows_before} → {result.rows_after}
              </p>
            </div>
            <div className="bg-white/80 p-3 rounded-xl border border-emerald-100">
              <span className="text-[10px] text-slate-500 font-medium">Features (In → Out)</span>
              <p className="text-sm font-mono font-bold text-slate-900 mt-0.5">
                {result.features_in} → {result.features_out}
              </p>
            </div>
            <div className="bg-white/80 p-3 rounded-xl border border-emerald-100">
              <span className="text-[10px] text-slate-500 font-medium">Duplicates Removed</span>
              <p className="text-sm font-mono font-bold text-slate-900 mt-0.5">
                {result.duplicates_removed}
              </p>
            </div>
            <div className="bg-white/80 p-3 rounded-xl border border-emerald-100">
              <span className="text-[10px] text-slate-500 font-medium">Scaling & Encoding</span>
              <p className="text-sm font-mono font-bold text-emerald-700 mt-0.5 uppercase text-xs">
                {scalingMethod} • {categoricalEncoding}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Configuration Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Missing Values & Deduplication */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Data Cleansing Strategy</h3>
            <p className="text-xs text-slate-500 mt-0.5">Handle missing records and prevent duplicate bias</p>
          </div>

          <div className="space-y-3">
            <label className="block text-xs font-semibold text-slate-700">Missing Value Imputation</label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { id: 'median', label: 'Median (Robust)', desc: 'Numeric median / Mode for text' },
                { id: 'mean', label: 'Mean (Standard)', desc: 'Numeric mean / Mode for text' },
                { id: 'most_frequent', label: 'Most Frequent', desc: 'Impute modal value' },
                { id: 'drop_rows', label: 'Drop Incomplete', desc: 'Prune rows with nulls' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setHandleMissing(opt.id as any)}
                  className={`p-3 text-left rounded-xl border transition ${
                    handleMissing === opt.id
                      ? 'border-blue-500 bg-blue-50/50 text-blue-900 font-semibold'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="text-xs">{opt.label}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5 font-normal">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <label className="flex items-center space-x-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={removeDuplicates}
                onChange={(e) => setRemoveDuplicates(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
              />
              <div>
                <span className="text-xs font-semibold text-slate-800">Exact Duplicate Detection & Removal</span>
                <p className="text-[11px] text-slate-400">Preserves only unique feature records to eliminate artificial density clusters.</p>
              </div>
            </label>
          </div>
        </div>

        {/* Feature Scaling & Categorical Encoding */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Feature Transformation</h3>
            <p className="text-xs text-slate-500 mt-0.5">Scale numeric features and encode categorical text</p>
          </div>

          <div className="space-y-3">
            <label className="block text-xs font-semibold text-slate-700">Feature Scaling Method</label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { id: 'standard', label: 'StandardScaler', desc: 'Zero mean, unit variance (z-score)' },
                { id: 'minmax', label: 'MinMaxScaler', desc: 'Rescales features to [0, 1]' },
                { id: 'robust', label: 'RobustScaler', desc: 'Median & IQR (resistant to outliers)' },
                { id: 'none', label: 'None (Raw)', desc: 'Preserves original magnitudes' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setScalingMethod(opt.id as any)}
                  className={`p-3 text-left rounded-xl border transition ${
                    scalingMethod === opt.id
                      ? 'border-blue-500 bg-blue-50/50 text-blue-900 font-semibold'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="text-xs">{opt.label}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5 font-normal">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 pt-2 border-t border-slate-100">
            <label className="block text-xs font-semibold text-slate-700">Categorical Encoding</label>
            <div className="grid grid-cols-3 gap-2 text-xs">
              {[
                { id: 'one_hot', label: 'One-Hot', desc: 'Dummy binary matrix' },
                { id: 'ordinal', label: 'Ordinal', desc: 'Integer ranking' },
                { id: 'none', label: 'Drop / Ignore', desc: 'Exclude text columns' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setCategoricalEncoding(opt.id as any)}
                  className={`p-2.5 text-center rounded-xl border transition ${
                    categoricalEncoding === opt.id
                      ? 'border-blue-500 bg-blue-50/50 text-blue-900 font-semibold'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="text-xs">{opt.label}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5 font-normal">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Target Column (Ground Truth Separation) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div>
          <h3 className="font-bold text-slate-900 text-sm">Ground-Truth Column Separation (Optional)</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            If your dataset includes known class labels (e.g. <code>species</code>, <code>target</code>), select it here. It will be <strong>excluded from clustering</strong> to prevent data leakage, and used solely to compute Adjusted Rand Index (ARI) and Normalized Mutual Information (NMI).
          </p>
        </div>

        <div className="max-w-md">
          <select
            value={targetColumn}
            onChange={(e) => setTargetColumn(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:outline-none focus:border-blue-500"
          >
            <option value="">-- No Ground Truth Column (Unsupervised Only) --</option>
            {dataset.columns.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name} ({c.dtype})
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
