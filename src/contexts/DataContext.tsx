import { createContext, useContext, useState, type ReactNode } from 'react';
import type { DataRow, DatasetSummary } from '@/lib/dataProcessing';
import type { ModelResult } from '@/lib/mlModels';

interface DataCtx {
  rawData: DataRow[];
  setRawData: (d: DataRow[]) => void;
  cleanedData: DataRow[];
  setCleanedData: (d: DataRow[]) => void;
  summary: DatasetSummary | null;
  setSummary: (s: DatasetSummary | null) => void;
  datasetName: string;
  setDatasetName: (n: string) => void;
  datasetId: string | null;
  setDatasetId: (id: string | null) => void;
  modelResults: ModelResult[];
  setModelResults: (r: ModelResult[]) => void;
  activeData: DataRow[];
}

const DataContext = createContext<DataCtx | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [rawData, setRawData] = useState<DataRow[]>([]);
  const [cleanedData, setCleanedData] = useState<DataRow[]>([]);
  const [summary, setSummary] = useState<DatasetSummary | null>(null);
  const [datasetName, setDatasetName] = useState('');
  const [datasetId, setDatasetId] = useState<string | null>(null);
  const [modelResults, setModelResults] = useState<ModelResult[]>([]);

  const activeData = cleanedData.length > 0 ? cleanedData : rawData;

  return (
    <DataContext.Provider value={{
      rawData, setRawData, cleanedData, setCleanedData,
      summary, setSummary, datasetName, setDatasetName,
      datasetId, setDatasetId, modelResults, setModelResults, activeData
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
