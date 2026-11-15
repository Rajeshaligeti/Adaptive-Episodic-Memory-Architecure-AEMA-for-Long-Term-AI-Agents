import React, { useEffect, useState } from 'react';
import { ActivePage } from './Sidebar';
import { Sparkles, Activity, CheckCircle2, AlertCircle } from 'lucide-react';

interface HeaderProps {
  activePage: ActivePage;
  onQuickLoadSample: (key: string) => void;
  isLoadingSample?: boolean;
}

const PAGE_TITLES: Record<ActivePage, { title: string; desc: string }> = {
  landing: {
    title: 'Adaptive Ensemble-Based Machine Learning',
    desc: 'Empowering precision clustering through adaptive component weighting and consensus matrix optimization'
  },
  dashboard: {
    title: 'Research & Operations Dashboard',
    desc: 'System health, pipeline activities, benchmark comparisons, and dataset metrics'
  },
  upload: {
    title: 'Dataset Upload & Validation',
    desc: 'Secure ingestion for tabular CSV, Excel, and verified episodic benchmark corpora'
  },
  explorer: {
    title: 'Data Profiler & Explorer',
    desc: 'Interactive schema inspection, missing-value matrices, and summary distributions'
  },
  preprocessing: {
    title: 'Automated Preprocessing Studio',
    desc: 'Missing-value imputation, exact deduplication, one-hot encoding, and feature scaling'
  },
  experiment: {
    title: 'AEMA Clustering Experimentation',
    desc: 'Configure base partitions, dynamic validation-index weights, and strategic archival thresholds'
  },
  comparison: {
    title: 'Multi-Algorithm Benchmark Suite',
    desc: 'Side-by-side empirical comparison against K-Means, DBSCAN, Agglomerative, and GMM'
  },
  results: {
    title: 'Evaluation Metrics & Results',
    desc: 'Silhouette Score, Davies-Bouldin Index, Calinski-Harabasz Index, and cluster compositions'
  },
  visualizations: {
    title: 'High-Dimensional Projections',
    desc: 'Interactive 2D PCA coordinate mappings, t-SNE manifolds, and cluster size distributions'
  },
  reports: {
    title: 'Scientific Reports & Export Center',
    desc: 'Generate executive PDF reports, download CSV assignments, and review full metadata'
  },
  history: {
    title: 'Experiment Archive & Run History',
    desc: 'Inspect, compare, and audit past runs with persistent SQLite/PostgreSQL storage'
  },
  about: {
    title: 'About AEMA Research Framework',
    desc: 'Mathematical foundations, ICSCNA 2026 paper citations, methodology, and limitations'
  }
};

export const Header: React.FC<HeaderProps> = ({
  activePage,
  onQuickLoadSample,
  isLoadingSample
}) => {
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);

  useEffect(() => {
    // Ping backend health
    fetch('/health')
      .then((res) => {
        if (res.ok) setBackendOnline(true);
        else setBackendOnline(false);
      })
      .catch(() => setBackendOnline(false));
  }, []);

  const meta = PAGE_TITLES[activePage] || { title: 'AEMA LAB', desc: 'Clustering Platform' };

  return (
    <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-slate-200 px-8 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          {meta.title}
        </h1>
        <p className="text-xs text-slate-500 mt-0.5 max-w-2xl">{meta.desc}</p>
      </div>

      <div className="flex items-center space-x-3 shrink-0">
        {/* Backend status indicator */}
        <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium border bg-slate-50 border-slate-200 text-slate-600">
          {backendOnline === true ? (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[11px] text-emerald-700 font-semibold">Backend Live</span>
            </>
          ) : backendOnline === false ? (
            <>
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              <span className="text-[11px] text-rose-600 font-semibold">API Disconnected</span>
            </>
          ) : (
            <>
              <Activity className="w-3 h-3 text-slate-400 animate-spin" />
              <span className="text-[11px] text-slate-500">Checking...</span>
            </>
          )}
        </div>

        {/* Quick Benchmark Load Menu */}
        <div className="relative group">
          <button
            disabled={isLoadingSample}
            className="flex items-center space-x-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm transition disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Load Benchmark Data</span>
          </button>

          <div className="absolute right-0 mt-1 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-40 hidden group-hover:block transition-all">
            <div className="px-3 py-1 text-[10px] uppercase font-bold tracking-wider text-slate-400">
              Verified Benchmark Datasets
            </div>
            <button
              onClick={() => onQuickLoadSample('aema_corpus')}
              className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex flex-col"
            >
              <span className="font-semibold text-slate-900">AEMA Episodic Corpus</span>
              <span className="text-[10px] text-slate-500">800 fact records from research paper</span>
            </button>
            <button
              onClick={() => onQuickLoadSample('iris')}
              className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex flex-col"
            >
              <span className="font-semibold text-slate-900">Fisher's Iris (Benchmark)</span>
              <span className="text-[10px] text-slate-500">150 rows, 4 features, 3 species</span>
            </button>
            <button
              onClick={() => onQuickLoadSample('customer_segmentation')}
              className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex flex-col"
            >
              <span className="font-semibold text-slate-900">Customer Segmentation</span>
              <span className="text-[10px] text-slate-500">200 mall shoppers with income & score</span>
            </button>
            <button
              onClick={() => onQuickLoadSample('wine')}
              className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex flex-col"
            >
              <span className="font-semibold text-slate-900">Wine Chemical Analysis</span>
              <span className="text-[10px] text-slate-500">178 samples, 13 chemical features</span>
            </button>
            <button
              onClick={() => onQuickLoadSample('synthetic_moons')}
              className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex flex-col"
            >
              <span className="font-semibold text-slate-900">Non-Convex Moons</span>
              <span className="text-[10px] text-slate-500">300 complex interlocking geometric samples</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
