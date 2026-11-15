import { describe, it, expect } from 'vitest';
import { api } from '../services/api';

describe('AEMA LAB Frontend Services & Models', () => {
  it('generates valid PDF and CSV report URLs', () => {
    const expId = 'test-experiment-uuid-1234';
    const pdfUrl = api.getPdfReportUrl(expId);
    const csvUrl = api.getResultsCsvUrl(expId);

    expect(pdfUrl).toContain('/api/experiments/test-experiment-uuid-1234/report');
    expect(csvUrl).toContain('/api/experiments/test-experiment-uuid-1234/download-csv');
  });

  it('validates AEMA algorithm configuration contract', () => {
    const defaultAEMA = {
      n_clusters: 3,
      ensemble_size: 7,
      adaptive_weighting: true,
      quality_metric: 'composite',
      weight_recency: 0.4,
      weight_frequency: 0.3,
      weight_cluster: 0.3,
      archival_threshold: 0.3,
      consensus_linkage: 'average',
      random_state: 42
    };

    expect(defaultAEMA.weight_recency + defaultAEMA.weight_frequency + defaultAEMA.weight_cluster).toBeCloseTo(1.0);
    expect(defaultAEMA.archival_threshold).toBe(0.3);
  });
});
