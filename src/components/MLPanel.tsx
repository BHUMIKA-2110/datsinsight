import { useState, useMemo } from 'react';
import { useData } from '@/contexts/DataContext';
import { trainModel, type ModelType } from '@/lib/mlModels';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line } from 'recharts';
import { Brain, Loader2 } from 'lucide-react';

export default function MLPanel() {
  const { activeData, summary, modelResults, setModelResults } = useData();
  const { toast } = useToast();
  const [targetCol, setTargetCol] = useState('');
  const [featureCols, setFeatureCols] = useState<string[]>([]);
  const [modelType, setModelType] = useState<ModelType>('linear-regression');
  const [training, setTraining] = useState(false);

  const numericCols = useMemo(() => summary?.columns.filter(c => c.type === 'number').map(c => c.name) || [], [summary]);

  if (!summary || activeData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-muted-foreground animate-fade-in">
        <Brain className="h-16 w-16 mb-4 opacity-30" />
        <h2 className="text-xl font-semibold text-foreground mb-2">No Data for Modelling</h2>
        <p className="text-sm">Upload a dataset first</p>
      </div>
    );
  }

  const availableFeatures = numericCols.filter(c => c !== targetCol);

  const toggleFeature = (col: string) => {
    setFeatureCols(prev => prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col]);
  };

  const handleTrain = () => {
    if (!targetCol || featureCols.length === 0) {
      toast({ title: 'Select target and features', variant: 'destructive' });
      return;
    }
    setTraining(true);
    setTimeout(() => {
      try {
        const result = trainModel(activeData, targetCol, featureCols, modelType);
        setModelResults([...modelResults, result]);
        toast({ title: 'Model trained!', description: `${modelType} completed` });
      } catch (err: unknown) {
        toast({ title: 'Training failed', description: (err as Error).message, variant: 'destructive' });
      }
      setTraining(false);
    }, 100);
  };

  const latestResult = modelResults[modelResults.length - 1];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Machine Learning</h1>
        <p className="text-muted-foreground text-sm mt-1">Train predictive models on your data</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="glass-card">
          <CardHeader><CardTitle className="section-title">Model Configuration</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm text-muted-foreground mb-2 block">Model Type</Label>
              <Select value={modelType} onValueChange={v => setModelType(v as ModelType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="linear-regression">Linear Regression</SelectItem>
                  <SelectItem value="logistic-regression">Logistic Regression</SelectItem>
                  <SelectItem value="decision-tree">Decision Tree</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground mb-2 block">Target Variable</Label>
              <Select value={targetCol} onValueChange={v => { setTargetCol(v); setFeatureCols([]); }}>
                <SelectTrigger><SelectValue placeholder="Select target" /></SelectTrigger>
                <SelectContent>{numericCols.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground mb-2 block">Features</Label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {availableFeatures.map(col => (
                  <div key={col} className="flex items-center gap-2">
                    <Checkbox checked={featureCols.includes(col)} onCheckedChange={() => toggleFeature(col)} id={col} />
                    <label htmlFor={col} className="text-sm font-mono cursor-pointer">{col}</label>
                  </div>
                ))}
              </div>
            </div>
            <Button className="w-full" onClick={handleTrain} disabled={training || !targetCol || featureCols.length === 0}>
              {training ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Training...</> : <><Brain className="h-4 w-4 mr-2" /> Train Model</>}
            </Button>
          </CardContent>
        </Card>

        {latestResult && (
          <Card className="glass-card">
            <CardHeader><CardTitle className="section-title">Results: {latestResult.modelType}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(latestResult.metrics).map(([k, v]) => (
                  <div key={k} className="bg-muted/50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">{k}</p>
                    <p className="text-lg font-bold font-mono text-foreground">{typeof v === 'number' ? v.toFixed(4) : v}</p>
                  </div>
                ))}
              </div>
              {latestResult.coefficients && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Coefficients</p>
                  <div className="font-mono text-xs space-y-1">
                    {latestResult.featureColumns.map((f, i) => (
                      <div key={f} className="flex justify-between"><span>{f}:</span><span>{latestResult.coefficients![i]?.toFixed(4)}</span></div>
                    ))}
                    {latestResult.intercept !== undefined && <div className="flex justify-between"><span>intercept:</span><span>{latestResult.intercept.toFixed(4)}</span></div>}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {latestResult && (
        <Card className="glass-card">
          <CardHeader><CardTitle className="section-title">Predicted vs Actual</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="actual" name="Actual" type="number" />
                <YAxis dataKey="predicted" name="Predicted" />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} />
                <Scatter name="Predictions" data={latestResult.actuals.map((a, i) => ({ actual: a, predicted: latestResult.predictions[i] }))} fill="hsl(var(--primary))" />
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
