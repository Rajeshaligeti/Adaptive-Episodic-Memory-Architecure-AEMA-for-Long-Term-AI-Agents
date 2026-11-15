import React from 'react';
import {
  BookOpen,
  Layers,
  GraduationCap,
  Award,
  ShieldAlert,
  FileCheck2,
  ExternalLink,
  Sigma,
  Cpu,
  Brain
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white rounded-3xl p-8 md:p-10 border border-slate-700 shadow-xl space-y-4">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold">
          <GraduationCap className="w-3.5 h-3.5 text-blue-400" />
          <span>Academic Research Documentation</span>
        </div>

        <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight">
          AEMA: Adaptive Episodic Memory Architecture &amp; Ensemble Clustering
        </h1>

        <p className="text-slate-300 text-xs md:text-sm leading-relaxed max-w-3xl">
          A research-grounded framework bridging cognitive memory lifecycle management with adaptive
          consensus ensemble machine learning. Developed by the Department of CSE (Artificial Intelligence &amp;
          Machine Learning) at B. V. Raju Institute of Technology.
        </p>
      </div>

      {/* Official Citation Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-sm">Conference Paper Citation &amp; Authors</h3>
          </div>
          <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
            Paper ID: ICSCNA_230
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs text-slate-800 leading-relaxed">
          <p className="font-bold text-slate-900">
            "Adaptive Episodic Memory Architecture (AEMA) for Long-Term AI Agents"
          </p>
          <p className="text-slate-600 mt-1">
            <strong>Authors:</strong> Aligeti Rajesh, Shakkarikonda Ruthika, P. Akhila (Assistant Professor), D. Sathish (Assistant Professor)
          </p>
          <p className="text-slate-600 mt-0.5">
            <strong>Affiliation:</strong> Department of CSE (AI &amp; ML), B. V. Raju Institute of Technology (UGC Autonomous), Vishnupur, Narsapur, Telangana, India.
          </p>
          <p className="text-slate-600 mt-0.5">
            <strong>Conference:</strong> 4th International Conference on Sustainable Communication Networks and Application (ICSCNA 2026).
          </p>
        </div>
      </div>

      {/* Mathematical Formulations */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-7 space-y-6">
        <div className="border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <Sigma className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-base">Mathematical Methodology &amp; Governing Equations</h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            The mathematical formulation extracted directly from the verified manuscript and Colab research package:
          </p>
        </div>

        <div className="space-y-6 text-xs text-slate-700">
          {/* Equation 1 & 2 */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
            <h4 className="font-bold text-slate-900 text-xs">1. Experience Representation &amp; Embedding (Eq. 1 &amp; 2)</h4>
            <p className="text-slate-600 text-[11px]">
              Every interaction or data instance is structured with identification, textual content, temporal features, and semantic triples:
            </p>
            <div className="p-3 bg-white border border-slate-200 rounded-lg font-mono text-blue-900 font-semibold text-center text-xs">
              M<sub>i</sub> = &#123; ID<sub>i</sub>, x<sub>i</sub>, t<sub>i</sub>, s<sub>i</sub>, r<sub>i</sub>, o<sub>i</sub> &#125;
              <span className="mx-4 text-slate-300">|</span>
              e<sub>i</sub> = f<sub>SBERT</sub>(x<sub>i</sub>) &isin; &real;<sup>384</sup>
            </div>
          </div>

          {/* Equation 3 & 4 */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
            <h4 className="font-bold text-slate-900 text-xs">2. Cosine Distance &amp; Average Linkage Hierarchical Grouping (Eq. 3 &amp; 4)</h4>
            <p className="text-slate-600 text-[11px]">
              Pairwise semantic dissimilarity uses normalized cosine metrics, clustered via average-linkage agglomerative hierarchy:
            </p>
            <div className="p-3 bg-white border border-slate-200 rounded-lg font-mono text-blue-900 font-semibold text-center text-xs">
              d<sub>cos</sub>(u, v) = 1 - (u &middot; v) / (||u||<sub>2</sub> ||v||<sub>2</sub>)
              <span className="mx-4 text-slate-300">|</span>
              EP<sub>k</sub> = &#123; M<sub>i</sub> : c<sub>i</sub> = k &#125;
            </div>
          </div>

          {/* Consensus Matrix */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
            <h4 className="font-bold text-slate-900 text-xs">3. Consensus Co-Association Matrix Aggregation</h4>
            <p className="text-slate-600 text-[11px]">
              Given M diverse base partitions, each weighted by adaptive quality weight w<sub>m</sub> (where &sum; w<sub>m</sub> = 1):
            </p>
            <div className="p-3 bg-white border border-slate-200 rounded-lg font-mono text-blue-900 font-semibold text-center text-xs">
              C<sub>ij</sub> = &sum;<sub>m=1</sub><sup>M</sup> w<sub>m</sub> &middot; &Iopf;(c<sub>i</sub><sup>(m)</sup> == c<sub>j</sub><sup>(m)</sup>)
              <span className="mx-4 text-slate-300">|</span>
              D<sub>ij</sub> = 1 - C<sub>ij</sub>
            </div>
          </div>

          {/* Equation 6 & 7 */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
            <h4 className="font-bold text-slate-900 text-xs">4. Adaptive Importance Scoring &amp; Strategic Archival (Eq. 6 &amp; 7)</h4>
            <p className="text-slate-600 text-[11px]">
              A composite importance score combines normalized recency/density, retrieval frequency, and cluster size proxy:
            </p>
            <div className="p-3 bg-white border border-slate-200 rounded-lg font-mono text-blue-900 font-semibold text-center text-xs">
              Score(M<sub>i</sub>) = w<sub>r</sub> &middot; R<sub>i</sub> + w<sub>f</sub> &middot; F<sub>i</sub> + w<sub>c</sub> &middot; C<sub>i</sub>,
              &nbsp; subject to &nbsp; w<sub>r</sub> + w<sub>f</sub> + w<sub>c</sub> = 1
            </div>
            <p className="text-[11px] text-slate-600 mt-1">
              Archival rule: <code>Score(M_i) &lt; &tau; &rArr; archive M_i</code> (unless marked protected/important).
            </p>
          </div>
        </div>
      </div>

      {/* Verified Findings vs Documented Limitations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-3">
          <div className="flex items-center space-x-2 text-emerald-600">
            <FileCheck2 className="w-5 h-5" />
            <h3 className="font-bold text-slate-900 text-sm">Verified Research Findings</h3>
          </div>
          <ul className="space-y-2 text-xs text-slate-600 list-disc list-inside leading-relaxed">
            <li>Tested k ∈ &#123;8, 12, 18, 24, 30&#125; on 800 synthetic records.</li>
            <li>k = 8 produced the highest cosine silhouette score (0.6944).</li>
            <li>Exact duplicate detection retained 100% of unique triples with 0 record loss.</li>
            <li>Baseline weights (0.4, 0.3, 0.3) and validation weights (0.0, 0.5, 0.5) achieved 51.67% test accuracy.</li>
            <li>Archive fallback achieved 53.33% vs 51.67% for active-only retrieval.</li>
          </ul>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-3">
          <div className="flex items-center space-x-2 text-amber-600">
            <ShieldAlert className="w-5 h-5" />
            <h3 className="font-bold text-slate-900 text-sm">Documented Research Limitations</h3>
          </div>
          <ul className="space-y-2 text-xs text-slate-600 list-disc list-inside leading-relaxed">
            <li>Evaluation in paper was conducted on synthetic structured facts; does not measure free-form LLM reasoning.</li>
            <li>Clustering is organizational; it does not guarantee improved task accuracy across all data types.</li>
            <li>Weight selection on synthetic validation split did not produce a statistically verified generalization improvement.</li>
            <li>Exact duplicate detection does not perform lossy semantic compression.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
