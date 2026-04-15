import { useState, useMemo } from 'react';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, Search, ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react';

export default function DataPreview() {
  const { activeData, summary } = useData();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [sortCol, setSortCol] = useState('');
  const [sortAsc, setSortAsc] = useState(true);
  const pageSize = 25;

  const columns = useMemo(() => summary?.columns.map(c => c.name) || [], [summary]);

  const filtered = useMemo(() => {
    if (!search) return activeData;
    const q = search.toLowerCase();
    return activeData.filter(row =>
      Object.values(row).some(v => String(v ?? '').toLowerCase().includes(q))
    );
  }, [activeData, search]);

  const sorted = useMemo(() => {
    if (!sortCol) return filtered;
    return [...filtered].sort((a, b) => {
      const va = a[sortCol], vb = b[sortCol];
      if (va == null) return 1;
      if (vb == null) return -1;
      const na = Number(va), nb = Number(vb);
      if (!isNaN(na) && !isNaN(nb)) return sortAsc ? na - nb : nb - na;
      return sortAsc ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va));
    });
  }, [filtered, sortCol, sortAsc]);

  const paged = useMemo(() => sorted.slice(page * pageSize, (page + 1) * pageSize), [sorted, page]);
  const totalPages = Math.ceil(sorted.length / pageSize);

  if (!summary || activeData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-muted-foreground animate-fade-in">
        <Table className="h-16 w-16 mb-4 opacity-30" />
        <h2 className="text-xl font-semibold text-foreground mb-2">No Data to Preview</h2>
        <p className="text-sm">Upload a dataset first</p>
      </div>
    );
  }

  const handleSort = (col: string) => {
    if (sortCol === col) setSortAsc(!sortAsc);
    else { setSortCol(col); setSortAsc(true); }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Data Preview</h1>
        <p className="text-muted-foreground text-sm mt-1">{sorted.length} rows · {columns.length} columns</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search across all columns..." value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} className="pl-9" />
        </div>
        <span className="text-xs text-muted-foreground">
          Page {page + 1} of {totalPages || 1}
        </span>
      </div>

      <Card className="glass-card overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 sticky top-0">
                <tr>
                  <th className="text-left py-2.5 px-3 text-xs text-muted-foreground font-medium w-12">#</th>
                  {columns.map(col => (
                    <th key={col} className="text-left py-2.5 px-3 text-xs font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors whitespace-nowrap" onClick={() => handleSort(col)}>
                      <span className="flex items-center gap-1">
                        {col}
                        {sortCol === col && <ArrowUpDown className="h-3 w-3 text-primary" />}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paged.map((row, i) => (
                  <tr key={i} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                    <td className="py-2 px-3 text-xs text-muted-foreground font-mono">{page * pageSize + i + 1}</td>
                    {columns.map(col => (
                      <td key={col} className="py-2 px-3 font-mono text-xs max-w-[200px] truncate" title={String(row[col] ?? '')}>
                        {row[col] == null || row[col] === '' ? <span className="text-muted-foreground/40 italic">null</span> : String(row[col])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
          <ChevronLeft className="h-4 w-4 mr-1" /> Previous
        </Button>
        <div className="flex gap-1">
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            const p = totalPages <= 5 ? i : Math.max(0, Math.min(page - 2, totalPages - 5)) + i;
            return (
              <Button key={p} variant={p === page ? 'default' : 'outline'} size="sm" className="w-8 h-8 p-0" onClick={() => setPage(p)}>
                {p + 1}
              </Button>
            );
          })}
        </div>
        <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>
          Next <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
