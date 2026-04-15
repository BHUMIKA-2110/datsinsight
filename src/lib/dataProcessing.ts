import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import * as ss from 'simple-statistics';

export type DataRow = Record<string, unknown>;
export type DataColumn = {
  name: string;
  type: 'number' | 'string' | 'date' | 'boolean' | 'mixed';
  missing: number;
  unique: number;
};

export interface DatasetSummary {
  rowCount: number;
  columnCount: number;
  columns: DataColumn[];
  missingTotal: number;
  duplicateRows: number;
}

export interface ColumnStats {
  mean?: number;
  median?: number;
  std?: number;
  min?: number;
  max?: number;
  q1?: number;
  q3?: number;
  mode?: string;
  count: number;
  missing: number;
  unique: number;
}

export function parseFile(file: File): Promise<DataRow[]> {
  return new Promise((resolve, reject) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext === 'csv' || ext === 'tsv') {
      Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => resolve(results.data as DataRow[]),
        error: (err) => reject(err),
      });
    } else if (ext === 'xlsx' || ext === 'xls') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const wb = XLSX.read(e.target?.result, { type: 'array' });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(sheet) as DataRow[];
        resolve(data);
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    } else {
      reject(new Error('Unsupported file type'));
    }
  });
}

export function inferColumnType(values: unknown[]): DataColumn['type'] {
  const nonNull = values.filter(v => v != null && v !== '');
  if (nonNull.length === 0) return 'mixed';
  const types = new Set(nonNull.map(v => {
    if (typeof v === 'number' || (!isNaN(Number(v)) && v !== '')) return 'number';
    if (typeof v === 'boolean') return 'boolean';
    if (v instanceof Date || !isNaN(Date.parse(String(v)))) return 'date';
    return 'string';
  }));
  if (types.size === 1) return types.values().next().value as DataColumn['type'];
  if (types.has('number') && types.size <= 2) return 'number';
  return 'mixed';
}

export function getDatasetSummary(data: DataRow[]): DatasetSummary {
  if (data.length === 0) return { rowCount: 0, columnCount: 0, columns: [], missingTotal: 0, duplicateRows: 0 };
  
  const colNames = Object.keys(data[0]);
  const columns: DataColumn[] = colNames.map(name => {
    const values = data.map(row => row[name]);
    const missing = values.filter(v => v == null || v === '' || (typeof v === 'number' && isNaN(v))).length;
    const unique = new Set(values.filter(v => v != null && v !== '')).size;
    return { name, type: inferColumnType(values), missing, unique };
  });

  const missingTotal = columns.reduce((s, c) => s + c.missing, 0);
  const seen = new Set<string>();
  let duplicateRows = 0;
  data.forEach(row => {
    const key = JSON.stringify(row);
    if (seen.has(key)) duplicateRows++;
    else seen.add(key);
  });

  return { rowCount: data.length, columnCount: colNames.length, columns, missingTotal, duplicateRows };
}

export function getColumnStats(data: DataRow[], colName: string): ColumnStats {
  const values = data.map(r => r[colName]);
  const missing = values.filter(v => v == null || v === '' || (typeof v === 'number' && isNaN(v))).length;
  const nonNull = values.filter(v => v != null && v !== '');
  const unique = new Set(nonNull).size;
  
  const nums = nonNull.map(Number).filter(n => !isNaN(n));
  if (nums.length > 0) {
    const sorted = [...nums].sort((a, b) => a - b);
    return {
      mean: ss.mean(nums),
      median: ss.median(sorted),
      std: nums.length > 1 ? ss.standardDeviation(nums) : 0,
      min: ss.min(nums),
      max: ss.max(nums),
      q1: ss.quantile(sorted, 0.25),
      q3: ss.quantile(sorted, 0.75),
      count: nums.length,
      missing,
      unique,
    };
  }
  
  const freq: Record<string, number> = {};
  nonNull.forEach(v => { freq[String(v)] = (freq[String(v)] || 0) + 1; });
  const mode = Object.entries(freq).sort((a, b) => b[1] - a[1])[0]?.[0];

  return { count: nonNull.length, missing, unique, mode };
}

export function getCorrelationMatrix(data: DataRow[], numericCols: string[]): { cols: string[]; matrix: number[][] } {
  const cols = numericCols;
  const vectors = cols.map(col => data.map(r => Number(r[col])).filter(n => !isNaN(n)));
  const matrix = cols.map((_, i) =>
    cols.map((_, j) => {
      if (i === j) return 1;
      const minLen = Math.min(vectors[i].length, vectors[j].length);
      if (minLen < 3) return 0;
      const a = vectors[i].slice(0, minLen);
      const b = vectors[j].slice(0, minLen);
      try { return ss.sampleCorrelation(a, b); } catch { return 0; }
    })
  );
  return { cols, matrix };
}

export function getDistribution(data: DataRow[], col: string, bins = 20): { bin: string; count: number }[] {
  const nums = data.map(r => Number(r[col])).filter(n => !isNaN(n));
  if (nums.length === 0) return [];
  const min = ss.min(nums);
  const max = ss.max(nums);
  if (min === max) return [{ bin: String(min), count: nums.length }];
  const binWidth = (max - min) / bins;
  const result: { bin: string; count: number }[] = [];
  for (let i = 0; i < bins; i++) {
    const lo = min + i * binWidth;
    const hi = lo + binWidth;
    const count = nums.filter(n => n >= lo && (i === bins - 1 ? n <= hi : n < hi)).length;
    result.push({ bin: `${lo.toFixed(1)}-${hi.toFixed(1)}`, count });
  }
  return result;
}

// Data cleaning functions
export function dropMissingRows(data: DataRow[], columns?: string[]): DataRow[] {
  const cols = columns || Object.keys(data[0] || {});
  return data.filter(row => cols.every(c => row[c] != null && row[c] !== '' && !(typeof row[c] === 'number' && isNaN(row[c] as number))));
}

export function fillMissing(data: DataRow[], col: string, strategy: 'mean' | 'median' | 'mode' | 'zero'): DataRow[] {
  const values = data.map(r => r[col]);
  const nums = values.map(Number).filter(n => !isNaN(n));
  let fillVal: unknown;
  if (strategy === 'mean') fillVal = nums.length ? ss.mean(nums) : 0;
  else if (strategy === 'median') fillVal = nums.length ? ss.median(nums) : 0;
  else if (strategy === 'zero') fillVal = 0;
  else {
    const freq: Record<string, number> = {};
    values.filter(v => v != null && v !== '').forEach(v => { freq[String(v)] = (freq[String(v)] || 0) + 1; });
    fillVal = Object.entries(freq).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '';
  }
  return data.map(row => {
    if (row[col] == null || row[col] === '' || (typeof row[col] === 'number' && isNaN(row[col] as number))) {
      return { ...row, [col]: fillVal };
    }
    return row;
  });
}

export function removeDuplicates(data: DataRow[]): DataRow[] {
  const seen = new Set<string>();
  return data.filter(row => {
    const key = JSON.stringify(row);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function normalizeColumn(data: DataRow[], col: string): DataRow[] {
  const nums = data.map(r => Number(r[col])).filter(n => !isNaN(n));
  if (nums.length === 0) return data;
  const min = ss.min(nums);
  const max = ss.max(nums);
  const range = max - min || 1;
  return data.map(row => {
    const v = Number(row[col]);
    if (isNaN(v)) return row;
    return { ...row, [col]: (v - min) / range };
  });
}
