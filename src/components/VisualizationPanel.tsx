import { useState, useMemo } from 'react';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart, Bar, LineChart, Line, ScatterChart, Scatter,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts';
import { TrendingUp } from 'lucide-react';

export default function VisualizationPanel() {
  const { activeData, summary } = useData();
  const [xCol, setXCol] = useState('');
  const [yCol, setYCol] = useState('');

  const allCols = useMemo(() => summary?.columns.map(c => c.name) || [], [summary]);
  const numericCols = useMemo(() => summary?.columns.filter(c => c.type === 'number').map(c => c.name) || [], [summary]);

  const chartData = useMemo(() => {
    if (!xCol) return [];
    return activeData.slice(0, 500).map((row, i) => ({
      x: row[xCol] ?? i,
      y: yCol ? Number(row[yCol]) || 0 : undefined,
      name: String(row[xCol] ?? i),
    }));
  }, [activeData, xCol, yCol]);

  if (!summary || activeData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-muted-foreground animate-fade-in">
        <TrendingUp className="h-16 w-16 mb-4 opacity-30" />
        <h2 className="text-xl font-semibold text-foreground mb-2">No Data to Visualise</h2>
        <p className="text-sm">Upload a dataset first</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Visualizations</h1>
        <p className="text-muted-foreground text-sm mt-1">Create interactive charts from your data</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Select value={xCol} onValueChange={setXCol}>
          <SelectTrigger className="w-48"><SelectValue placeholder="X-Axis / Column" /></SelectTrigger>
          <SelectContent>{allCols.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={yCol} onValueChange={setYCol}>
          <SelectTrigger className="w-48"><SelectValue placeholder="Y-Axis (numeric)" /></SelectTrigger>
          <SelectContent>{numericCols.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      {xCol && yCol && chartData.length > 0 && (
        <Tabs defaultValue="bar">
          <TabsList>
            <TabsTrigger value="bar">Bar Chart</TabsTrigger>
            <TabsTrigger value="line">Line Chart</TabsTrigger>
            <TabsTrigger value="scatter">Scatter Plot</TabsTrigger>
          </TabsList>

          <TabsContent value="bar" className="mt-4">
            <Card className="glass-card">
              <CardHeader><CardTitle className="section-title">Bar Chart: {yCol} by {xCol}</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={60} />
                    <YAxis />
                    <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} />
                    <Bar dataKey="y" name={yCol} fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="line" className="mt-4">
            <Card className="glass-card">
              <CardHeader><CardTitle className="section-title">Line Chart: {yCol} by {xCol}</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={60} />
                    <YAxis />
                    <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} />
                    <Line type="monotone" dataKey="y" name={yCol} stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="scatter" className="mt-4">
            <Card className="glass-card">
              <CardHeader><CardTitle className="section-title">Scatter: {xCol} vs {yCol}</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <ScatterChart>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="x" name={xCol} type="number" />
                    <YAxis dataKey="y" name={yCol} />
                    <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} />
                    <Scatter name="Data" data={chartData} fill="hsl(var(--accent))" />
                  </ScatterChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
