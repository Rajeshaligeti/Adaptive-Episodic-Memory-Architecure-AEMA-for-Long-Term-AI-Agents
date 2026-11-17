import React, { useState, useEffect } from 'react';
import { Sidebar, ActivePage } from './components/Sidebar';
import { Header } from './components/Header';
import { LandingPage } from './pages/LandingPage';
import { Dashboard } from './pages/Dashboard';
import { DatasetUpload } from './pages/DatasetUpload';
import { DataExplorer } from './pages/DataExplorer';
import { PreprocessingPage } from './pages/PreprocessingPage';
import { ExperimentPage } from './pages/ExperimentPage';
import { ComparisonPage } from './pages/ComparisonPage';
import { ResultsDashboard } from './pages/ResultsDashboard';
import { VisualizationsPage } from './pages/VisualizationsPage';
import { ReportsPage } from './pages/ReportsPage';
import { HistoryPage } from './pages/HistoryPage';
import { AboutPage } from './pages/AboutPage';
import { AlertTriangle, CheckCircle, Info, X } from 'lucide-react';

import { Dataset, PreprocessResponse, Experiment } from './types';
import { api } from './services/api';

interface NotificationToast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

export function App() {
  const [activePage, setActivePage] = useState<ActivePage>('landing');
  const [activeDataset, setActiveDataset] = useState<Dataset | null>(null);
  const [activePreprocessing, setActivePreprocessing] = useState<PreprocessResponse | null>(null);
  const [activeExperiment, setActiveExperiment] = useState<Experiment | null>(null);
  const [loadingSample, setLoadingSample] = useState<boolean>(false);
  const [toasts, setToasts] = useState<NotificationToast[]>([]);
  const [backendError, setBackendError] = useState<string | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleQuickLoadSample = async (key: string) => {
    setLoadingSample(true);
    setBackendError(null);
    showToast(`Loading research benchmark: ${key}...`, 'info');
    try {
      const ds = await api.loadSampleDataset(key);
      setActiveDataset(ds);
      setActivePreprocessing(null);
      setActiveExperiment(null);
      showToast(`Loaded ${ds.original_name} (${ds.row_count} rows, ${ds.column_count} columns)`, 'success');
      setActivePage('explorer');
    } catch (err: any) {
      console.error('Failed to load sample dataset:', err);
      const msg = err.message || 'Failed to connect to backend server on port 8000';
      setBackendError(msg);
      showToast(`Failed to load benchmark: ${msg}`, 'error');
    } finally {
      setLoadingSample(false);
    }
  };

  // Attempt automatic connection & preload existing dataset if available
  useEffect(() => {
    const checkInitialStatus = async () => {
      try {
        const datasets = await api.listDatasets();
        if (datasets && datasets.length > 0) {
          // Find AEMA corpus if already loaded, else pick first
          const aemaDs = datasets.find((d) => d.original_name.includes('corpus') || d.original_name.includes('aema')) || datasets[0];
          setActiveDataset(aemaDs);
        }
      } catch (err) {
        // Backend not yet reachable on mount; user will start it or click benchmark
      }
    };
    checkInitialStatus();
  }, []);

  const handleSelectExperimentById = async (expId: string) => {
    try {
      const exp = await api.getExperiment(expId);
      setActiveExperiment(exp);
      // Also load dataset if possible
      try {
        const ds = await api.getDataset(exp.dataset_id);
        setActiveDataset(ds);
      } catch {}
      setActivePage('results');
    } catch (err: any) {
      console.error('Failed to retrieve experiment details:', err);
      showToast(`Failed to load experiment: ${err.message}`, 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-row font-sans text-slate-800 antialiased">
      {/* Dark Navy / Charcoal Sidebar */}
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        datasetName={activeDataset?.original_name}
      />

      {/* Main Content Workspace */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <Header
          activePage={activePage}
          onQuickLoadSample={handleQuickLoadSample}
          isLoadingSample={loadingSample}
        />

        {/* Informative banner if backend is offline or had error */}
        {backendError && (
          <div className="mx-8 mt-4 p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-xs text-amber-900 shadow-sm">
            <div className="flex items-center space-x-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <div>
                <span className="font-bold">Backend Connection Notice: </span>
                <span>The FastAPI backend needs to be started on port 8000: </span>
                <code className="bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded font-mono text-[11px]">
                  python -m uvicorn app.main:app --port 8000
                </code>
              </div>
            </div>
            <button
              onClick={() => setBackendError(null)}
              className="text-amber-700 hover:text-amber-900 text-xs font-semibold px-2 py-1"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Global Toast Notifications */}
        <div className="fixed bottom-6 right-6 z-50 flex flex-col space-y-2 pointer-events-none">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-center space-x-2.5 px-4 py-3 rounded-xl shadow-lg border text-xs font-medium transition-all transform animate-in slide-in-from-bottom-2 ${
                toast.type === 'success'
                  ? 'bg-emerald-900/95 text-white border-emerald-700'
                  : toast.type === 'error'
                  ? 'bg-rose-900/95 text-white border-rose-700'
                  : 'bg-slate-900/95 text-white border-slate-700'
              }`}
            >
              {toast.type === 'success' && <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />}
              {toast.type === 'error' && <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />}
              {toast.type === 'info' && <Info className="w-4 h-4 text-blue-400 shrink-0" />}
              <span>{toast.message}</span>
              <button
                onClick={() => removeToast(toast.id)}
                className="ml-2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          {activePage === 'landing' && (
            <LandingPage
              onNavigate={setActivePage}
              onLoadSample={handleQuickLoadSample}
            />
          )}

          {activePage === 'dashboard' && (
            <Dashboard
              onNavigate={setActivePage}
              onSelectExperiment={handleSelectExperimentById}
            />
          )}

          {activePage === 'upload' && (
            <DatasetUpload
              onDatasetLoaded={(ds) => {
                setActiveDataset(ds);
                setActivePreprocessing(null);
                setActiveExperiment(null);
              }}
              onNavigate={setActivePage}
              activeDataset={activeDataset}
            />
          )}

          {activePage === 'explorer' && (
            <DataExplorer
              dataset={activeDataset}
              onNavigate={setActivePage}
            />
          )}

          {activePage === 'preprocessing' && (
            <PreprocessingPage
              dataset={activeDataset}
              onNavigate={setActivePage}
              onPreprocessingDone={(prep) => setActivePreprocessing(prep)}
            />
          )}

          {activePage === 'experiment' && (
            <ExperimentPage
              dataset={activeDataset}
              preprocessing={activePreprocessing}
              onNavigate={setActivePage}
              onExperimentComplete={(exp) => setActiveExperiment(exp)}
            />
          )}

          {activePage === 'comparison' && (
            <ComparisonPage
              dataset={activeDataset}
              preprocessing={activePreprocessing}
              onNavigate={setActivePage}
            />
          )}

          {activePage === 'results' && (
            <ResultsDashboard
              experiment={activeExperiment}
              onNavigate={setActivePage}
            />
          )}

          {activePage === 'visualizations' && (
            <VisualizationsPage
              experiment={activeExperiment}
              onNavigate={setActivePage}
            />
          )}

          {activePage === 'reports' && (
            <ReportsPage
              experiment={activeExperiment}
              dataset={activeDataset}
              onNavigate={setActivePage}
            />
          )}

          {activePage === 'history' && (
            <HistoryPage
              onSelectExperiment={handleSelectExperimentById}
              onNavigate={setActivePage}
            />
          )}

          {activePage === 'about' && <AboutPage />}
        </main>
      </div>
    </div>
  );
}

export default App;
