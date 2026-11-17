import React, { useEffect, useState, useRef } from 'react';
import { ActivePage } from './Sidebar';
import { Sparkles, Activity, CheckCircle2, AlertCircle, ChevronDown, Loader2 } from 'lucide-react';

interface HeaderProps {
  activePage: ActivePage;
  onQuickLoadSample: (key: string) => void;
  isLoadingSample?: boolean;
}

const PAGE_TITLES: Record<ActivePage, { title: string; desc: string }> = {
  landing: {
    title: 'Adaptive Episodic Memory Architecture',
    desc: 'Cognitive episodic memory lifecycle, adaptive component weighting, and robust clustering consensus'
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
  const [menuOpen, setMenuOpen] = useState(false);
  const [loadingKey, setLoadingKey] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Ping backend health
    const checkHealth = () => {
      fetch('/health')
        .then((res) => {
          if (res.ok) setBackendOnline(true);
          else setBackendOnline(false);
        })
        .catch(() => setBackendOnline(false));
    };

    checkHealth();
    const interval = setInterval(checkHealth, 5000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown when clicked outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectSample = (key: string) => {
    setLoadingKey(key);
    setMenuOpen(false);
    onQuickLoadSample(key);
  };

  useEffect(() => {
    if (!isLoadingSample) {
      setLoadingKey(null);
    }
  }, [isLoadingSample]);

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
              <span className="text-[11px] text-emerald-700 font-semibold">Backend Live (Port 8000)</span>
            </>
          ) : backendOnline === false ? (
            <>
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              <span className="text-[11px] text-rose-600 font-semibold">API Offline</span>
            </>
          ) : (
            <>
              <Activity className="w-3 h-3 text-slate-400 animate-spin" />
              <span className="text-[11px] text-slate-500">Checking...</span>
            </>
          )}
        </div>

        {/* Quick Benchmark Load Menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            disabled={isLoadingSample}
            className="flex items-center space-x-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm transition disabled:opacity-50"
          >
            {isLoadingSample ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            <span>{isLoadingSample ? 'Loading Benchmark...' : 'Load Benchmark Data'}</span>
            <ChevronDown className="w-3 h-3 opacity-80" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-1.5 w-64 bg-white rounded-xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="px-3 py-1 text-[10px] uppercase font-bold tracking-wider text-slate-400 border-b border-slate-100 mb-1">
                Verified Research Benchmarks
              </div>

              <button
                onClick={() => handleSelectSample('aema_corpus')}
                className="w-full text-left px-3 py-2 text-xs hover:bg-blue-50 transition flex flex-col group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-blue-900 group-hover:text-blue-700">AEMA Research Corpus</span>
                  <span className="text-[9px] bg-blue-100 text-blue-700 font-bold px-1.5 py-0.5 rounded">ICSCNA '26</span>
                </div>
                <span className="text-[10px] text-slate-500 mt-0.5">800 fact memories from research paper</span>
              </button>

              <button
                onClick={() => handleSelectSample('iris')}
                className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 transition flex flex-col group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900 group-hover:text-blue-600">Fisher's Iris Benchmark</span>
                  <span className="text-[9px] bg-slate-100 text-slate-600 font-semibold px-1.5 py-0.5 rounded">150 rows</span>
                </div>
                <span className="text-[10px] text-slate-500 mt-0.5">4 continuous features, 3 ground-truth classes</span>
              </button>

              <button
                onClick={() => handleSelectSample('customer_segmentation')}
                className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 transition flex flex-col group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900 group-hover:text-blue-600">Customer Segmentation</span>
                  <span className="text-[9px] bg-slate-100 text-slate-600 font-semibold px-1.5 py-0.5 rounded">200 rows</span>
                </div>
                <span className="text-[10px] text-slate-500 mt-0.5">Income, spending score, age profiles</span>
              </button>

              <button
                onClick={() => handleSelectSample('wine')}
                className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 transition flex flex-col group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900 group-hover:text-blue-600">Wine Chemical Analysis</span>
                  <span className="text-[9px] bg-slate-100 text-slate-600 font-semibold px-1.5 py-0.5 rounded">178 rows</span>
                </div>
                <span className="text-[10px] text-slate-500 mt-0.5">13 chemical properties for clustering</span>
              </button>

              <button
                onClick={() => handleSelectSample('synthetic_moons')}
                className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 transition flex flex-col group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900 group-hover:text-blue-600">Non-Convex Moons</span>
                  <span className="text-[9px] bg-slate-100 text-slate-600 font-semibold px-1.5 py-0.5 rounded">300 rows</span>
                </div>
                <span className="text-[10px] text-slate-500 mt-0.5">Interlocking non-linear crescent coordinates</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
