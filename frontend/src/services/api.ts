import {
  Dataset,
  DatasetPreview,
  PreprocessConfig,
  PreprocessResponse,
  Experiment,
  ExperimentRunRequest,
  CompareAlgorithmsResponse,
  StatsOverview
} from '../types';

const API_BASE = (import.meta as any).env?.VITE_API_URL || '/api';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorDetail = 'Network request failed';
    try {
      const err = await res.json();
      errorDetail = err.detail || err.message || JSON.stringify(err);
    } catch {
      errorDetail = await res.text();
    }
    throw new Error(errorDetail || `HTTP ${res.status}: ${res.statusText}`);
  }
  return res.json();
}

export const api = {
  // Stats
  async getStatsOverview(): Promise<StatsOverview> {
    const res = await fetch(`${API_BASE}/stats/overview`);
    return handleResponse<StatsOverview>(res);
  },

  // Datasets
  async listDatasets(): Promise<Dataset[]> {
    const res = await fetch(`${API_BASE}/datasets`);
    return handleResponse<Dataset[]>(res);
  },

  async getDataset(id: string): Promise<Dataset> {
    const res = await fetch(`${API_BASE}/datasets/${id}`);
    return handleResponse<Dataset>(res);
  },

  async getDatasetPreview(id: string, limit = 50): Promise<DatasetPreview> {
    const res = await fetch(`${API_BASE}/datasets/${id}/preview?limit=${limit}`);
    return handleResponse<DatasetPreview>(res);
  },

  async uploadDataset(file: File): Promise<Dataset> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/datasets/upload`, {
      method: 'POST',
      body: formData
    });
    return handleResponse<Dataset>(res);
  },

  async loadSampleDataset(sampleKey: string): Promise<Dataset> {
    const res = await fetch(`${API_BASE}/datasets/sample/${sampleKey}`, {
      method: 'POST'
    });
    return handleResponse<Dataset>(res);
  },

  async deleteDataset(id: string): Promise<{ message: string; id: string }> {
    const res = await fetch(`${API_BASE}/datasets/${id}`, {
      method: 'DELETE'
    });
    return handleResponse<{ message: string; id: string }>(res);
  },

  async preprocessDataset(datasetId: string, config: PreprocessConfig): Promise<PreprocessResponse> {
    const res = await fetch(`${API_BASE}/datasets/${datasetId}/preprocess`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    });
    return handleResponse<PreprocessResponse>(res);
  },

  // Experiments
  async runExperiment(request: ExperimentRunRequest): Promise<Experiment> {
    const res = await fetch(`${API_BASE}/experiments/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });
    return handleResponse<Experiment>(res);
  },

  async compareAlgorithms(
    datasetId: string,
    targetClusters = 3,
    algorithms = ['AEMA', 'K-Means', 'DBSCAN', 'Agglomerative', 'GMM'],
    preprocessingId?: string
  ): Promise<CompareAlgorithmsResponse> {
    const res = await fetch(`${API_BASE}/experiments/compare`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dataset_id: datasetId,
        preprocessing_id: preprocessingId,
        algorithms,
        target_clusters: targetClusters
      })
    });
    return handleResponse<CompareAlgorithmsResponse>(res);
  },

  async listExperiments(): Promise<Experiment[]> {
    const res = await fetch(`${API_BASE}/experiments`);
    return handleResponse<Experiment[]>(res);
  },

  async getExperiment(id: string): Promise<Experiment> {
    const res = await fetch(`${API_BASE}/experiments/${id}`);
    return handleResponse<Experiment>(res);
  },

  async deleteExperiment(id: string): Promise<{ message: string; id: string }> {
    const res = await fetch(`${API_BASE}/experiments/${id}`, {
      method: 'DELETE'
    });
    return handleResponse<{ message: string; id: string }>(res);
  },

  // Download links
  getPdfReportUrl(experimentId: string): string {
    return `${API_BASE}/experiments/${experimentId}/report`;
  },

  getResultsCsvUrl(experimentId: string): string {
    return `${API_BASE}/experiments/${experimentId}/download-csv`;
  }
};
