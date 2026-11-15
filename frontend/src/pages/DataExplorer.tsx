import React, { useState, useEffect } from 'react';
import {
  Database,
  BarChart2,
  AlertTriangle,
  Copy,
  Table,
  CheckCircle2,
  ArrowRight,
  Filter,
  Search
} from 'lucide-react';
import { Dataset, DatasetPreview } from '../types';
import { api } from '../services/api';
import { ActivePage } from '../components/Sidebar';

interface DataExplorerProps {
  dataset: Dataset | null;
  onNavigate: (page: ActivePage) => void;
}

export const DataExplorer: React.FC<DataExplorerProps> = ({ dataset, onNavigate }) => {
  const [preview, setPreview] = useState<DatasetPreview | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    if (dataset) {
      loadPreview(dataset.id);
    }
  }, [dataset]);

  const loadPreview = async (id: string) => {
    setLoading(true);
    try {
      const data = await api.getDatasetPreview(id, 50);
      setPreview(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!dataset) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-xl mx-auto space-y-4">
        <Database className="w-12 h-12 text-slate-300 mx-auto" />
        <h3 className="text-base font-bold text-slate-800">No Dataset Selected</h3>
        <p className="text-xs text-slate-500">Please upload or load a dataset first to explore its schema and statistics.</p>
        <button
          onClick={() => onNavigate('upload')}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition"
        >
          Go to Dataset Upload
        </button>
      </div>
    );
  }

  const summary = dataset.summary;
  const filteredColumns = dataset.columns.filter((col) =>
    col.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-7 max-w-6xl mx-auto pb-12">
      {/* Overview Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
            Active Dataset Profile
          </span>
          <h2 className="text-xl font-bold text-slate-900 mt-1">{dataset.original_name}</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            File: <span className="font-mono text-slate-600">{dataset.filename}</span> • Size: {(dataset.file_size_bytes / 1024).toFixed(1)} KB
          </p>
        </div>

        <button
          onClick={() => onNavigate('preprocessing')}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition self-start md:self-auto"
        >
          <span>Configure Preprocessing</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Rows</span>
          <p className="text-xl font-extrabold text-slate-900 mt-0.5">{dataset.row_count}</p>
          <span className="text-[10px] text-slate-500">Sample instances</span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Features</span>
          <p className="text-xl font-extrabold text-slate-900 mt-0.5">{dataset.column_count}</p>
          <span className="text-[10px] text-slate-500">
            {summary.numeric_columns.length} numeric, {summary.categorical_columns.length} categorical
          </span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Missing Values</span>
          <p className={`text-xl font-extrabold mt-0.5 ${summary.total_missing > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
            {summary.total_missing}
          </p>
          <span className="text-[10px] text-slate-500">
            {summary.total_missing > 0 ? 'Needs imputation' : 'Complete dataset (clean)'}
          </span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Duplicate Rows</span>
          <p className={`text-xl font-extrabold mt-0.5 ${summary.duplicate_rows > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
            {summary.duplicate_rows}
          </p>
          <span className="text-[10px] text-slate-500">
            {summary.duplicate_rows > 0 ? 'Recommend deduplication' : 'No duplicates detected'}
          </span>
        </div>
      </div>

      {/* Column Schema & Statistics Profiling Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-3 gap-3">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Feature Profiling & Statistical Summaries</h3>
            <p className="text-xs text-slate-500 mt-0.5">Detailed data types, null rates, and distribution boundaries</p>
          </div>
          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search features..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs divide-y divide-slate-200">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-3.5 py-2.5 font-semibold">Feature Name</th>
                <th className="px-3.5 py-2.5 font-semibold">Data Type</th>
                <th className="px-3.5 py-2.5 font-semibold">Non-Null</th>
                <th className="px-3.5 py-2.5 font-semibold">Missing (Null)</th>
                <th className="px-3.5 py-2.5 font-semibold">Unique</th>
                <th className="px-3.5 py-2.5 font-semibold">Mean</th>
                <th className="px-3.5 py-2.5 font-semibold">Std Dev</th>
                <th className="px-3.5 py-2.5 font-semibold">[Min - Max]</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredColumns.map((col) => {
                const stat = summary.statistics[col.name];
                return (
                  <tr key={col.name} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-3.5 py-2 font-semibold text-slate-800 font-mono">
                      {col.name}
                    </td>
                    <td className="px-3.5 py-2">
                      <span className={`px-2 py-0.5 text-[10px] rounded font-mono font-medium ${
                        col.dtype.includes('int') || col.dtype.includes('float')
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-purple-50 text-purple-700 border border-purple-200'
                      }`}>
                        {col.dtype}
                      </span>
                    </td>
                    <td className="px-3.5 py-2 font-mono text-slate-600">{col.non_null_count}</td>
                    <td className="px-3.5 py-2 font-mono">
                      {col.null_count > 0 ? (
                        <span className="text-amber-600 font-semibold">{col.null_count}</span>
                      ) : (
                        <span className="text-slate-400">0</span>
                      )}
                    </td>
                    <td className="px-3.5 py-2 font-mono text-slate-600">{col.unique_count}</td>
                    <td className="px-3.5 py-2 font-mono text-slate-700">
                      {stat ? stat.mean.toFixed(2) : '-'}
                    </td>
                    <td className="px-3.5 py-2 font-mono text-slate-700">
                      {stat ? stat.std.toFixed(2) : '-'}
                    </td>
                    <td className="px-3.5 py-2 font-mono text-slate-600">
                      {stat ? `[${stat.min.toFixed(1)}, ${stat.max.toFixed(1)}]` : '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive Data Table Preview */}
      {preview && preview.rows.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Raw Data Inspection (First 50 Rows)</h3>
              <p className="text-xs text-slate-500 mt-0.5">Inspect values, formatting, and potential categorical levels</p>
            </div>
            <span className="text-xs text-slate-400 font-mono">50 of {preview.total_rows} rows</span>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl max-h-96">
            <table className="w-full text-left text-xs divide-y divide-slate-200">
              <thead className="bg-slate-50 sticky top-0 z-10">
                <tr>
                  <th className="px-3 py-2 font-semibold text-slate-500 w-12 text-center bg-slate-100">#</th>
                  {preview.columns.map((c) => (
                    <th key={c} className="px-3 py-2 font-semibold text-slate-700 whitespace-nowrap bg-slate-50">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {preview.rows.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50 font-mono text-slate-700">
                    <td className="px-3 py-1.5 text-slate-400 text-center bg-slate-50/50">{i + 1}</td>
                    {preview.columns.map((c) => (
                      <td key={c} className="px-3 py-1.5 whitespace-nowrap">
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
  );
};
