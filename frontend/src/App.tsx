import React, { useState } from 'react';
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

import { Dataset, PreprocessResponse, Experiment } from './types';
import { api } from './services/api';

export function App() {
  const [activePage, setActivePage] = useState<ActivePage>('landing');
  const [activeDataset, setActiveDataset] = useState<Dataset | null>(null);
  const [activePreprocessing, setActivePreprocessing] = useState<PreprocessResponse | null>(null);
  const [activeExperiment, setActiveExperiment] = useState<Experiment | null>(null);
  const [loadingSample, setLoadingSample] = useState<boolean>(false);

  const handleQuickLoadSample = async (key: string) => {
    setLoadingSample(true);
    try {
      const ds = await api.loadSampleDataset(key);
      setActiveDataset(ds);
      setActivePreprocessing(null);
      setActiveExperiment(null);
      setActivePage('explorer');
    } catch (err) {
      console.error('Failed to load sample dataset:', err);
    } finally {
      setLoadingSample(false);
    }
  };

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
    } catch (err) {
      console.error('Failed to retrieve experiment details:', err);
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
