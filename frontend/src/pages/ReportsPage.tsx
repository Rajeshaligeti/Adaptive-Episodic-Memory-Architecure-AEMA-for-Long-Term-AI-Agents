import React, { useState } from 'react';
import {
  FileText,
  Download,
  FileSpreadsheet,
  FileCode,
  CheckCircle2,
  Clock,
  Printer,
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Experiment, Dataset } from '../types';
import { api } from '../services/api';
import { ActivePage } from '../components/Sidebar';

interface ReportsPageProps {
  experiment: Experiment | null;
  dataset: Dataset | null;
  onNavigate: (page: ActivePage) => void;
}

export const ReportsPage: React.FC<ReportsPageProps> = ({
  experiment,
  dataset,
  onNavigate
}) => {
  const [downloadingPdf, setDownloadingPdf] = useState<boolean>(false);

  if (!experiment) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-xl mx-auto space-y-4">
        <FileText className="w-12 h-12 text-slate-300 mx-auto" />
        <h3 className="text-base font-bold text-slate-800">No Experiment Selected for Reporting</h3>
        <p className="text-xs text-slate-500">Run an experiment first to generate peer-review ready reports and download result files.</p>
        <button
          onClick={() => onNavigate('experiment')}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition"
        >
          Go to Experiment Studio
        </button>
      </div>
    );
  }

  const handleDownloadPdf = () => {
    const url = api.getPdfReportUrl(experiment.id);
    window.open(url, '_blank');
  };

  const handleDownloadCsv = () => {
    const url = api.getResultsCsvUrl(experiment.id);
    window.open(url, '_blank');
  };

  const handleDownloadJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(experiment, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `AEMA_Experiment_${experiment.id.slice(0, 8)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Header Profile */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
            Export & Report Center
          </span>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            Publication-Ready Analytical Outputs
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Download executive PDF reports, structured CSV cluster assignments, and raw JSON configurations.
          </p>
        </div>

        <button
          onClick={handleDownloadPdf}
          className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition self-start md:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Download PDF Report</span>
        </button>
      </div>

      {/* Export Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* PDF Option */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4 hover-card-elevate">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Official PDF Report</h3>
            <p className="text-xs text-slate-500 mt-1 leading-normal">
              Formatted executive summary document including executive metric cards, cluster distributions, and theoretical equations.
            </p>
          </div>
          <button
            onClick={handleDownloadPdf}
            className="w-full flex items-center justify-center space-x-1.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Generate PDF</span>
          </button>
        </div>

        {/* CSV Option */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4 hover-card-elevate">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Clustered Dataset (CSV)</h3>
            <p className="text-xs text-slate-500 mt-1 leading-normal">
              Transformed features matched with predicted <code>cluster_label</code> columns (and <code>_ground_truth</code> when available).
            </p>
          </div>
          <button
            onClick={handleDownloadCsv}
            className="w-full flex items-center justify-center space-x-1.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>

        {/* JSON Option */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4 hover-card-elevate">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <FileCode className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Metadata & Config (JSON)</h3>
            <p className="text-xs text-slate-500 mt-1 leading-normal">
              Machine-readable experiment configuration parameters, runtime performance, and validation metrics for replication.
            </p>
          </div>
          <button
            onClick={handleDownloadJson}
            className="w-full flex items-center justify-center space-x-1.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* Report Preview Specification */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="font-bold text-slate-900 text-sm">Included Report Contents & Metadata</h3>
          <p className="text-xs text-slate-500 mt-0.5">Every generated report incorporates full verification metadata</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="space-y-2 text-slate-600">
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="font-medium">Application Header:</span>
              <span className="font-semibold text-slate-800">AEMA LAB v1.0.0</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="font-medium">Experiment ID:</span>
              <span className="font-mono text-slate-800">{experiment.id}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="font-medium">Selected Algorithm:</span>
              <span className="font-semibold text-blue-600">{experiment.algorithm_name}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="font-medium">Timestamp:</span>
              <span className="font-mono text-slate-800">{experiment.created_at}</span>
            </div>
          </div>

          <div className="space-y-2 text-slate-600">
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="font-medium">Discovered Clusters:</span>
              <span className="font-mono font-bold text-slate-800">{experiment.clusters_count}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="font-medium">Silhouette Score:</span>
              <span className="font-mono font-bold text-emerald-600">
                {experiment.metrics.silhouette_score !== null && experiment.metrics.silhouette_score !== undefined
                  ? experiment.metrics.silhouette_score.toFixed(4)
                  : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="font-medium">Davies-Bouldin Index:</span>
              <span className="font-mono font-bold text-rose-600">
                {experiment.metrics.davies_bouldin_index !== null && experiment.metrics.davies_bouldin_index !== undefined
                  ? experiment.metrics.davies_bouldin_index.toFixed(4)
                  : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="font-medium">Execution Latency:</span>
              <span className="font-mono font-bold text-slate-800">{experiment.execution_time_ms.toFixed(2)} ms</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
