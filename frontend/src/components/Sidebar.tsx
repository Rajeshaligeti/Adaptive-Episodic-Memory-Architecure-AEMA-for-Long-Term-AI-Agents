import React from 'react';
import {
  LayoutDashboard,
  Upload,
  Database,
  Sliders,
  PlayCircle,
  GitCompare,
  BarChart2,
  PieChart,
  FileText,
  History,
  Info,
  Home,
  Layers,
  ChevronRight
} from 'lucide-react';

export type ActivePage =
  | 'landing'
  | 'dashboard'
  | 'upload'
  | 'explorer'
  | 'preprocessing'
  | 'experiment'
  | 'comparison'
  | 'results'
  | 'visualizations'
  | 'reports'
  | 'history'
  | 'about';

interface SidebarProps {
  activePage: ActivePage;
  setActivePage: (page: ActivePage) => void;
  datasetName?: string | null;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activePage,
  setActivePage,
  datasetName
}) => {
  const navItems = [
    { id: 'landing', label: 'Welcome & Overview', icon: Home, section: 'Getting Started' },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, section: 'Core Workspace' },
    { id: 'upload', label: 'Dataset Upload', icon: Upload, section: 'Core Workspace' },
    { id: 'explorer', label: 'Data Explorer', icon: Database, section: 'Data Engineering' },
    { id: 'preprocessing', label: 'Preprocessing Studio', icon: Sliders, section: 'Data Engineering' },
    { id: 'experiment', label: 'AEMA Experiment', icon: PlayCircle, section: 'Machine Learning' },
    { id: 'comparison', label: 'Algorithm Benchmark', icon: GitCompare, section: 'Machine Learning' },
    { id: 'results', label: 'Results Dashboard', icon: BarChart2, section: 'Analytics' },
    { id: 'visualizations', label: '2D / 3D Projections', icon: PieChart, section: 'Analytics' },
    { id: 'reports', label: 'Reports & Exports', icon: FileText, section: 'Outputs' },
    { id: 'history', label: 'Experiment History', icon: History, section: 'Outputs' },
    { id: 'about', label: 'About AEMA Research', icon: Info, section: 'Documentation' }
  ];

  // Group by sections
  const sections = ['Getting Started', 'Core Workspace', 'Data Engineering', 'Machine Learning', 'Analytics', 'Outputs', 'Documentation'];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen fixed left-0 top-0 z-30 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80 flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-md shadow-blue-500/20 text-white font-bold text-lg">
          <Layers className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center space-x-1.5">
            <span className="font-extrabold text-white tracking-tight text-lg">AEMA</span>
            <span className="text-xs px-1.5 py-0.5 font-bold uppercase rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
              LAB
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium truncate max-w-[130px]">Adaptive Intelligence</p>
        </div>
      </div>

      {/* Active Dataset Pill if chosen */}
      {datasetName && (
        <div className="mx-4 mt-3 p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60 text-xs">
          <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-0.5">Active Dataset</div>
          <div className="text-blue-300 font-medium truncate" title={datasetName}>
            {datasetName}
          </div>
        </div>
      )}

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {sections.map((section) => {
          const items = navItems.filter((item) => item.section === section);
          if (items.length === 0) return null;
          return (
            <div key={section} className="space-y-1">
              <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                {section}
              </div>
              {items.map((item) => {
                const Icon = item.icon;
                const isActive = activePage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActivePage(item.id as ActivePage)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>
                    {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-80" />}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="p-3.5 border-t border-slate-800 text-[11px] text-slate-400 bg-slate-950/40">
        <div className="flex items-center justify-between text-slate-400">
          <span>ICSCNA 2026</span>
          <span className="font-mono text-[10px] text-slate-400">v1.0.0</span>
        </div>
        <div className="text-[10px] text-slate-400 truncate mt-0.5">BVRIT AI & ML Research</div>
      </div>
    </aside>
  );
};
