import React from 'react';
import {
  Layers,
  Cpu,
  BarChart3,
  Sliders,
  FileCheck,
  ArrowRight,
  Sparkles,
  GitCompare,
  Database,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { ActivePage } from '../components/Sidebar';

interface LandingPageProps {
  onNavigate: (page: ActivePage) => void;
  onLoadSample: (key: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate, onLoadSample }) => {
  return (
    <div className="space-y-12 max-w-6xl mx-auto pb-12">
      {/* Hero Section */}
      <div className="relative rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white p-8 md:p-12 overflow-hidden shadow-xl border border-slate-700">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl space-y-5">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/30 text-blue-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Research-Backed ML Framework • ICSCNA 2026</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Adaptive Episodic Memory Architecture
          </h1>

          <p className="text-slate-300 text-sm md:text-base leading-relaxed">
            <strong>AEMA LAB</strong> provides an adaptive episodic memory and machine learning clustering pipeline that
            dynamically weights base clustering partitions, computes consensus co-association matrices,
            and applies cognitive sample confidence scoring to discover robust data structures.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate('dashboard')}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold shadow-lg shadow-blue-600/30 transition-all hover:translate-y-[-1px]"
            >
              <span>Launch Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onLoadSample('aema_corpus')}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 text-sm font-semibold transition"
            >
              <Database className="w-4 h-4 text-blue-400" />
              <span>Load 800-Fact Research Corpus</span>
            </button>
            <button
              onClick={() => onNavigate('about')}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-transparent hover:bg-slate-800/60 text-slate-300 text-sm font-semibold transition"
            >
              <span>Methodology & Equations</span>
            </button>
          </div>
        </div>
      </div>

      {/* Key Capabilities */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Key Architectural Capabilities</h2>
          <p className="text-xs text-slate-500">How AEMA improves clustering robustness and data governance</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover-card-elevate space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Consensus Partitioning</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Synthesizes diverse base clusterers (Agglomerative, K-Means, GMM) into a unified co-association
              consensus matrix C, eliminating single-algorithm structural bias.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover-card-elevate space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Sliders className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Adaptive Quality Weighting</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Dynamically scores base partitions using internal validation indices (Silhouette, Davies-Bouldin,
              Calinski-Harabasz) with softmax temperature weighting.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover-card-elevate space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Strategic Archival</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Applies the paper's verified formula Score(x_i) = w_r*R + w_f*F + w_c*C to prune low-confidence
              outliers into an archived partition while preserving protected data.
            </p>
          </div>
        </div>
      </div>

      {/* 6-Stage End-to-End Workflow */}
      <div className="bg-white rounded-2xl p-7 border border-slate-200 shadow-sm space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Structured 6-Stage Workflow</h2>
          <p className="text-xs text-slate-500">From raw data ingestion to peer-review ready analytical reports</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
          {[
            { step: '01', title: 'Data Ingestion', desc: 'CSV/Excel upload, duplicate check, and schema profiling' },
            { step: '02', title: 'Preprocessing', desc: 'Missing imputation, encoding, and robust feature scaling' },
            { step: '03', title: 'Base Ensembles', desc: 'Generate M diverse base partitions with varied seeds' },
            { step: '04', title: 'Adaptive Weight', desc: 'Internal validation indices assign soft quality weights' },
            { step: '05', title: 'Consensus Dissimilarity', desc: 'Average-linkage agglomerative clustering on 1 - C' },
            { step: '06', title: 'Evaluation & Reports', desc: 'Compute Silhouette, PCA mappings, and export PDF' },
          ].map((item, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2">
              <div className="text-xs font-mono font-bold text-blue-600">{item.step}</div>
              <h4 className="font-bold text-slate-900 text-xs">{item.title}</h4>
              <p className="text-[11px] text-slate-500 leading-normal">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Verified Research Note */}
      <div className="rounded-2xl p-6 bg-blue-50/70 border border-blue-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
            <h4 className="font-bold text-blue-900 text-sm">Empirical Research Grounding</h4>
          </div>
          <p className="text-xs text-blue-800 leading-relaxed max-w-3xl">
            Based on the conference paper <em>"Adaptive Episodic Memory Architecture (AEMA) for Long-Term AI Agents"</em>,
            communicated to ICSCNA 2026 (Paper ID: ICSCNA_230) by Aligeti Rajesh, S Ruthika, P Akhila, and D Sathish
            (Dept. of CSE AI&ML, B.V. Raju Institute of Technology).
          </p>
        </div>
        <button
          onClick={() => onNavigate('about')}
          className="shrink-0 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition"
        >
          Read Paper Citation
        </button>
      </div>
    </div>
  );
};
