import React, { useState, useRef } from 'react';
import {
  Upload,
  FileSpreadsheet,
  FileText,
  CheckCircle2,
  AlertCircle,
  Database,
  ArrowRight,
  Sparkles,
  Info
} from 'lucide-react';
import { api } from '../services/api';
import { Dataset, DatasetPreview } from '../types';
import { ActivePage } from '../components/Sidebar';

interface DatasetUploadProps {
  onDatasetLoaded: (dataset: Dataset) => void;
  onNavigate: (page: ActivePage) => void;
  activeDataset?: Dataset | null;
}

export const DatasetUpload: React.FC<DatasetUploadProps> = ({
  onDatasetLoaded,
  onNavigate,
  activeDataset
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<DatasetPreview | null>(null);
  const [loadingBenchmarkKey, setLoadingBenchmarkKey] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setError(null);
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['csv', 'xlsx', 'xls'].includes(ext || '')) {
      setError('Please upload a valid CSV (.csv) or Excel (.xlsx, .xls) dataset.');
      return;
    }

    setUploading(true);
    try {
      const ds = await api.uploadDataset(file);
      onDatasetLoaded(ds);
      const prev = await api.getDatasetPreview(ds.id, 10);
      setPreview(prev);
    } catch (err: any) {
      setError(err.message || 'Failed to upload dataset.');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const loadBenchmark = async (sampleKey: string) => {
    setError(null);
    setLoadingBenchmarkKey(sampleKey);
    try {
      const ds = await api.loadSampleDataset(sampleKey);
      onDatasetLoaded(ds);
      const prev = await api.getDatasetPreview(ds.id, 10);
      setPreview(prev);
    } catch (err: any) {
      setError(err.message || 'Failed to load sample dataset. Please make sure the backend server is running on port 8000.');
    } finally {
      setLoadingBenchmarkKey(null);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Upload Zone */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-7 space-y-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Upload Custom Dataset</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Support for tabular CSV and Excel files up to 50MB. Columns and datatypes are automatically profiled.
          </p>
        </div>

        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-150 ${
            isDragging
              ? 'border-blue-500 bg-blue-50/50 scale-[1.005]'
              : 'border-slate-200 hover:border-blue-400 hover:bg-slate-50/60'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv, .xlsx, .xls"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                handleFile(e.target.files[0]);
              }
            }}
          />

          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3.5 shadow-sm">
            <Upload className="w-7 h-7" />
          </div>

          <h3 className="text-sm font-bold text-slate-800">
            {uploading ? 'Processing & Validating Dataset...' : 'Click to select or drag & drop dataset file'}
          </h3>
          <p className="text-xs text-slate-400 mt-1">Comma-separated values (.csv) or Microsoft Excel (.xlsx, .xls)</p>

          <div className="mt-4 flex items-center space-x-2 text-[11px] text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
            <span>Client & Server Verification Active</span>
            <span>•</span>
            <span>Max 50MB</span>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Verified Benchmark Library */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-7 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Or Load a Pre-Bundled Research Benchmark</h3>
            <p className="text-xs text-slate-500 mt-0.5">Verified datasets designed to test clustering boundaries and AEMA paper reproducibility</p>
          </div>
          <Sparkles className="w-4 h-4 text-amber-500" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1">
          <div
            onClick={() => loadBenchmark('aema_corpus')}
            className={`p-4 rounded-xl border cursor-pointer transition space-y-1.5 ${
              loadingBenchmarkKey === 'aema_corpus'
                ? 'border-blue-500 bg-blue-100/60 animate-pulse'
                : 'border-blue-200 bg-blue-50/40 hover:bg-blue-50 hover:border-blue-400'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-blue-900 text-xs">
                {loadingBenchmarkKey === 'aema_corpus' ? 'Loading AEMA Corpus...' : 'AEMA Research Corpus'}
              </span>
              <span className="text-[10px] font-bold text-blue-700 bg-blue-200/60 px-1.5 py-0.5 rounded">ICSCNA 2026</span>
            </div>
            <p className="text-[11px] text-slate-600">800 synthetic fact memories with importance, protection, age, and retrieval counts.</p>
          </div>

          <div
            onClick={() => loadBenchmark('iris')}
            className={`p-4 rounded-xl border cursor-pointer transition space-y-1.5 ${
              loadingBenchmarkKey === 'iris'
                ? 'border-blue-500 bg-blue-50 animate-pulse'
                : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100/80 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 text-xs">
                {loadingBenchmarkKey === 'iris' ? 'Loading Iris...' : "Fisher's Iris Benchmark"}
              </span>
              <span className="text-[10px] text-slate-500">150 rows</span>
            </div>
            <p className="text-[11px] text-slate-600">4 features (sepal & petal dimensions), 3 balanced classes with ground truth.</p>
          </div>

          <div
            onClick={() => loadBenchmark('customer_segmentation')}
            className={`p-4 rounded-xl border cursor-pointer transition space-y-1.5 ${
              loadingBenchmarkKey === 'customer_segmentation'
                ? 'border-blue-500 bg-blue-50 animate-pulse'
                : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100/80 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 text-xs">
                {loadingBenchmarkKey === 'customer_segmentation' ? 'Loading Customer Data...' : 'Customer Segmentation'}
              </span>
              <span className="text-[10px] text-slate-500">200 rows</span>
            </div>
            <p className="text-[11px] text-slate-600">Mall customer profiles: age, annual income, spending score, and categorical gender.</p>
          </div>

          <div
            onClick={() => loadBenchmark('wine')}
            className={`p-4 rounded-xl border cursor-pointer transition space-y-1.5 ${
              loadingBenchmarkKey === 'wine'
                ? 'border-blue-500 bg-blue-50 animate-pulse'
                : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100/80 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 text-xs">
                {loadingBenchmarkKey === 'wine' ? 'Loading Wine Data...' : 'Wine Chemical Dataset'}
              </span>
              <span className="text-[10px] text-slate-500">178 rows</span>
            </div>
            <p className="text-[11px] text-slate-600">13 continuous chemical constituents (alcohol, malic acid, flavonoids) for high-D clustering.</p>
          </div>

          <div
            onClick={() => loadBenchmark('synthetic_moons')}
            className={`p-4 rounded-xl border cursor-pointer transition space-y-1.5 ${
              loadingBenchmarkKey === 'synthetic_moons'
                ? 'border-blue-500 bg-blue-50 animate-pulse'
                : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100/80 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 text-xs">
                {loadingBenchmarkKey === 'synthetic_moons' ? 'Loading Moons...' : 'Non-Convex Moons'}
              </span>
              <span className="text-[10px] text-slate-500">300 rows</span>
            </div>
            <p className="text-[11px] text-slate-600">Interlocking non-linear geometric crescents to test non-spherical cluster detection.</p>
          </div>
        </div>
      </div>

      {/* Dataset Preview & Details if loaded */}
      {activeDataset && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-3 gap-3">
            <div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-base">{activeDataset.original_name}</h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {activeDataset.row_count} rows • {activeDataset.column_count} columns • {(activeDataset.file_size_bytes / 1024).toFixed(1)} KB
              </p>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => onNavigate('explorer')}
                className="px-3.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition"
              >
                Inspect in Data Explorer
              </button>
              <button
                onClick={() => onNavigate('preprocessing')}
                className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition"
              >
                <span>Proceed to Preprocessing</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Quick Preview Table */}
          {preview && preview.rows.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-semibold text-slate-700">Dataset Preview (First 10 Rows)</div>
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      {preview.columns.map((c) => (
                        <th key={c} className="px-3 py-2 font-semibold text-slate-600 whitespace-nowrap">
                          {c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {preview.rows.map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        {preview.columns.map((c) => (
                          <td key={c} className="px-3 py-1.5 font-mono text-slate-700 whitespace-nowrap">
                            {row[c] !== null && row[c] !== undefined ? String(row[c]) : <span className="text-slate-300">null</span>}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
