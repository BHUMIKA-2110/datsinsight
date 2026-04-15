import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { dropMissingRows, fillMissing, removeDuplicates, normalizeColumn, getDatasetSummary } from '@/lib/dataProcessing';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Eraser, Undo2, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function DataCleaning() {
  const { rawData, cleanedData, setCleanedData, setSummary, summary, activeData } = useData();
  const { toast } = useToast();
  const [selectedCol, setSelectedCol] = useState('');
  const [fillStrategy, setFillStrategy] = useState<'mean' | 'median' | 'mode' | 'zero'>('mean');
  const [log, setLog] = useState<string[]>([]);

  if (!summary || rawData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-muted-foreground animate-fade-in">
        <Eraser className="h-16 w-16 mb-4 opacity-30" />
        <h2 className="text-xl font-semibold text-foreground mb-2">No Data to Clean</h2>
        <p className="text-sm">Upload a dataset first</p>
      </div>
    );
  }

  const numericCols = summary.columns.filter(c => c.type === 'number').map(c => c.name);
  const colsWithMissing = summary.columns.filter(c => c.missing > 0).map(c => c.name);

  const apply = (data: ReturnType<typeof dropMissingRows>, msg: string) => {
    setCleanedData(data);
    const newSummary = getDatasetSummary(data);
    setSummary(newSummary);
    setLog(prev => [...prev, msg]);
    toast({ title: 'Cleaning applied', description: msg });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Data Cleaning</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Working with {activeData.length} rows · {summary.missingTotal} missing values · {summary.duplicateRows} duplicates
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="glass-card">
          <CardHeader><CardTitle className="section-title">Handle Missing Values</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full justify-start" onClick={() => apply(dropMissingRows(activeData), `Dropped rows with missing values → ${dropMissingRows(activeData).length} rows`)}>
              Drop All Rows with Missing Values
            </Button>
            <div className="space-y-2">
              <Select value={selectedCol} onValueChange={setSelectedCol}>
                <SelectTrigger><SelectValue placeholder="Select column" /></SelectTrigger>
                <SelectContent>{colsWithMissing.map(c => <SelectItem key={c} value={c}>{c} ({summary.columns.find(col => col.name === c)?.missing} missing)</SelectItem>)}</SelectContent>
              </Select>
              <Select value={fillStrategy} onValueChange={v => setFillStrategy(v as typeof fillStrategy)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="mean">Fill with Mean</SelectItem>
                  <SelectItem value="median">Fill with Median</SelectItem>
                  <SelectItem value="mode">Fill with Mode</SelectItem>
                  <SelectItem value="zero">Fill with Zero</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="w-full" disabled={!selectedCol} onClick={() => {
                if (selectedCol) apply(fillMissing(activeData, selectedCol, fillStrategy), `Filled ${selectedCol} with ${fillStrategy}`);
              }}>Fill Missing</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader><CardTitle className="section-title">Other Operations</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full justify-start" onClick={() => apply(removeDuplicates(activeData), `Removed duplicates → ${removeDuplicates(activeData).length} rows`)}>
              Remove Duplicate Rows
            </Button>
            <div className="space-y-2">
              <Select value={selectedCol} onValueChange={setSelectedCol}>
                <SelectTrigger><SelectValue placeholder="Column to normalize" /></SelectTrigger>
                <SelectContent>{numericCols.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
              <Button variant="outline" className="w-full" disabled={!selectedCol || !numericCols.includes(selectedCol)} onClick={() => {
                if (selectedCol) apply(normalizeColumn(activeData, selectedCol), `Normalized column: ${selectedCol}`);
              }}>Normalize (Min-Max)</Button>
            </div>
            <Button variant="secondary" className="w-full" onClick={() => { setCleanedData([]); const s = getDatasetSummary(rawData); setSummary(s); setLog([]); toast({ title: 'Reset to original data' }); }}>
              <Undo2 className="h-4 w-4 mr-2" /> Reset to Original
            </Button>
          </CardContent>
        </Card>
      </div>

      {log.length > 0 && (
        <Card className="glass-card">
          <CardHeader><CardTitle className="section-title">Cleaning Log</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {log.map((entry, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0" />
                  <span>{entry}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
