import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { supabase } from '@/integrations/supabase/client';
import { parseFile, getDatasetSummary } from '@/lib/dataProcessing';
import { SAMPLE_DATASETS } from '@/lib/sampleDatasets';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileSpreadsheet, Trash2, Loader2, Beaker } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export default function DatasetManager() {
  const { user } = useAuth();
  const { setRawData, setCleanedData, setSummary, setDatasetName, setDatasetId, setModelResults } = useData();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const queryClient = useQueryClient();

  const { data: datasets = [] } = useQuery({
    queryKey: ['datasets', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from('datasets').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const handleUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    try {
      const data = await parseFile(file);
      const summary = getDatasetSummary(data);
      const filePath = `${user.id}/${Date.now()}_${file.name}`;
      await supabase.storage.from('datasets').upload(filePath, file);
      const { data: ds, error } = await supabase.from('datasets').insert({
        user_id: user.id, name: file.name.replace(/\.[^.]+$/, ''), file_name: file.name,
        row_count: summary.rowCount, column_count: summary.columnCount,
        columns: summary.columns as any,
        metadata: { missingTotal: summary.missingTotal, duplicateRows: summary.duplicateRows } as any,
      } as any).select().single();
      if (error) throw error;
      setRawData(data);
      setCleanedData([]);
      setSummary(summary);
      setDatasetName(file.name);
      setDatasetId(ds.id);
      setModelResults([]);
      queryClient.invalidateQueries({ queryKey: ['datasets'] });
      toast({ title: 'Dataset uploaded!', description: `${summary.rowCount} rows, ${summary.columnCount} columns` });
    } catch (err: unknown) {
      toast({ title: 'Upload failed', description: (err as Error).message, variant: 'destructive' });
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }, [user, setRawData, setCleanedData, setSummary, setDatasetName, setDatasetId, setModelResults, queryClient, toast]);

  const loadDataset = useCallback(async (ds: typeof datasets[0]) => {
    try {
      const { data: fileData, error } = await supabase.storage.from('datasets').download(
        `${user!.id}/${ds.file_name}`
      );
      if (error) {
        // Try listing files to find the correct path
        const { data: files } = await supabase.storage.from('datasets').list(user!.id);
        const match = files?.find(f => f.name.endsWith(ds.file_name));
        if (match) {
          const { data: fd } = await supabase.storage.from('datasets').download(`${user!.id}/${match.name}`);
          if (fd) {
            const file = new File([fd], ds.file_name);
            const parsedData = await parseFile(file);
            const summary = getDatasetSummary(parsedData);
            setRawData(parsedData);
            setCleanedData([]);
            setSummary(summary);
            setDatasetName(ds.name);
            setDatasetId(ds.id);
            setModelResults([]);
            return;
          }
        }
        throw error;
      }
      const file = new File([fileData], ds.file_name);
      const parsedData = await parseFile(file);
      const summary = getDatasetSummary(parsedData);
      setRawData(parsedData);
      setCleanedData([]);
      setSummary(summary);
      setDatasetName(ds.name);
      setDatasetId(ds.id);
      setModelResults([]);
      toast({ title: 'Dataset loaded', description: ds.name });
    } catch {
      // Fallback: use stored metadata
      const cols = Array.isArray(ds.columns) ? ds.columns : [];
      setSummary({
        rowCount: ds.row_count || 0, columnCount: ds.column_count || 0,
        columns: cols as unknown as ReturnType<typeof getDatasetSummary>['columns'],
        missingTotal: (ds.metadata as Record<string, number>)?.missingTotal || 0,
        duplicateRows: (ds.metadata as Record<string, number>)?.duplicateRows || 0,
      });
      setDatasetName(ds.name);
      setDatasetId(ds.id);
      toast({ title: 'Metadata loaded', description: 'File data could not be loaded, showing saved metadata.' });
    }
  }, [user, setRawData, setCleanedData, setSummary, setDatasetName, setDatasetId, setModelResults, toast]);

  const deleteDataset = async (id: string) => {
    await supabase.from('datasets').delete().eq('id', id);
    queryClient.invalidateQueries({ queryKey: ['datasets'] });
    toast({ title: 'Dataset deleted' });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Datasets</h1>
          <p className="text-muted-foreground text-sm mt-1">Upload and manage your data files</p>
        </div>
        <label className="cursor-pointer">
          <input type="file" accept=".csv,.xlsx,.xls,.tsv" className="hidden" onChange={handleUpload} disabled={uploading} />
          <Button asChild disabled={uploading}>
            <span>{uploading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Uploading...</> : <><Upload className="h-4 w-4 mr-2" /> Upload Dataset</>}</span>
          </Button>
        </label>
      </div>

      {/* Sample Datasets */}
      <Card className="glass-card border-dashed">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2"><Beaker className="h-4 w-4 text-accent" /> Sample Datasets</CardTitle>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 gap-3">
          {SAMPLE_DATASETS.map(sd => (
            <button key={sd.id} className="text-left border rounded-lg p-3 hover:border-primary/40 hover:bg-primary/5 transition-all" onClick={() => {
              const data = sd.loader();
              const s = getDatasetSummary(data);
              setRawData(data); setCleanedData([]); setSummary(s); setDatasetName(sd.name); setDatasetId(null); setModelResults([]);
              toast({ title: `${sd.name} loaded`, description: `${s.rowCount} rows, ${s.columnCount} columns` });
            }}>
              <p className="font-medium text-foreground text-sm">{sd.name}</p>
              <p className="text-xs text-muted-foreground mt-1">{sd.description}</p>
              <p className="text-xs text-muted-foreground mt-1">{sd.rows} rows · {sd.cols} cols</p>
            </button>
          ))}
        </CardContent>
      </Card>

      {datasets.length === 0 ? (
        <Card className="glass-card">
          <CardContent className="flex flex-col items-center py-12">
            <FileSpreadsheet className="h-12 w-12 text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground text-sm">No uploaded datasets yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {datasets.map(ds => (
            <Card key={ds.id} className="glass-card hover:border-primary/30 transition-colors cursor-pointer" onClick={() => loadDataset(ds)}>
              <CardContent className="flex items-center justify-between py-4">
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="h-8 w-8 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">{ds.name}</p>
                    <p className="text-xs text-muted-foreground">{ds.row_count} rows · {ds.column_count} cols · {new Date(ds.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={e => { e.stopPropagation(); deleteDataset(ds.id); }}>
                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
