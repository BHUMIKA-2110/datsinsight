import { useState, useMemo } from 'react';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import {
  BarChart, Bar, LineChart, Line, ScatterChart, Scatter, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts';
import { TrendingUp, BarChart3, PieChartIcon, Activity } from 'lucide-react';

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

const tooltipStyle = { background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 };

export default function VisualizationPanel() {
  const { activeData, summary } = useData();
  const [xCol, setXCol] = useState('');
  const [yCol, setYCol] = useState('');

  const allCols = useMemo(() => summary?.columns.map(c => c.name) || [], [summary]);
  const numericCols = useMemo(() => summary?.columns.filter(c => c.type === 'number').map(c => c.name) || [], [summary]);
  const categoricalCols = useMemo(() => summary?.columns.filter(c => c.type === 'string' && c.unique <= 20).map(c => c.name) || [], [summary]);

  const chartData = useMemo(() => {
    if (!xCol) return [];
    return activeData.slice(0, 500).map((row, i) => ({
      x: row[xCol] ?? i,
      y: yCol ? Number(row[yCol]) || 0 : undefined,
      name: String(row[xCol] ?? i),
    }));
  }, [activeData, xCol, yCol]);

  // Histogram data for a numeric column
  const histogramData = useMemo(() => {
    if (!xCol || !numericCols.includes(xCol)) return [];
    const values = activeData.map(r => Number(r[xCol])).filter(v => !isNaN(v));
    if (values.length === 0) return [];
    const min = Math.min(...values);
    const max = Math.max(...values);
    const bins = 15;
    const step = (max - min) / bins || 1;
    const buckets = Array.from({ length: bins }, (_, i) => ({
      range: `${(min + i * step).toFixed(1)}`,
      count: 0,
    }));
    values.forEach(v => {
      const idx = Math.min(Math.floor((v - min) / step), bins - 1);
      buckets[idx].count++;
    });
    return buckets;
  }, [activeData, xCol, numericCols]);

  // Pie data for categorical columns
  const pieData = useMemo(() => {
    if (!xCol || !categoricalCols.includes(xCol)) return [];
    const counts: Record<string, number> = {};
    activeData.forEach(r => {
      const val = String(r[xCol] ?? 'N/A');
      counts[val] = (counts[val] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([name, value]) => ({ name, value }));
  }, [activeData, xCol, categoricalCols]);

  if (!summary || activeData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-muted-foreground animate-fade-in">
        <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
          <TrendingUp className="h-10 w-10 text-primary/40" />
        </div>
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

      <Card className="glass-card">
        <CardContent className="pt-5">
          <div className="flex flex-wrap gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">X-Axis / Column</Label>
              <Select value={xCol} onValueChange={setXCol}>
                <SelectTrigger className="w-52"><SelectValue placeholder="Select column" /></SelectTrigger>
                <SelectContent>{allCols.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Y-Axis (numeric)</Label>
              <Select value={yCol} onValueChange={setYCol}>
                <SelectTrigger className="w-52"><SelectValue placeholder="Select numeric column" /></SelectTrigger>
                <SelectContent>{numericCols.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Histogram for numeric X column */}
      {xCol && histogramData.length > 0 && (
        <Card className="glass-card">
          <CardHeader><CardTitle className="section-title flex items-center gap-2"><BarChart3 className="h-4 w-4 text-primary" /> Distribution: {xCol}</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={histogramData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="range" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" height={50} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="count" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Pie chart for categorical X column */}
      {xCol && pieData.length > 0 && (
        <Card className="glass-card">
          <CardHeader><CardTitle className="section-title flex items-center gap-2"><PieChartIcon className="h-4 w-4 text-accent" /> Category Distribution: {xCol}</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} innerRadius={50} paddingAngle={3} strokeWidth={0}>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* X vs Y charts */}
      {xCol && yCol && chartData.length > 0 && (
        <Tabs defaultValue="bar">
          <TabsList className="grid grid-cols-4 w-full max-w-md">
            <TabsTrigger value="bar" className="gap-1"><BarChart3 className="h-3.5 w-3.5" /> Bar</TabsTrigger>
            <TabsTrigger value="line" className="gap-1"><Activity className="h-3.5 w-3.5" /> Line</TabsTrigger>
            <TabsTrigger value="area" className="gap-1"><TrendingUp className="h-3.5 w-3.5" /> Area</TabsTrigger>
            <TabsTrigger value="scatter" className="gap-1"><PieChartIcon className="h-3.5 w-3.5" /> Scatter</TabsTrigger>
          </TabsList>

          <TabsContent value="bar" className="mt-4">
            <Card className="glass-card">
              <CardHeader><CardTitle className="section-title">{yCol} by {xCol}</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={60} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="y" name={yCol} fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="line" className="mt-4">
            <Card className="glass-card">
              <CardHeader><CardTitle className="section-title">{yCol} by {xCol}</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={60} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Line type="monotone" dataKey="y" name={yCol} stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 2 }} activeDot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="area" className="mt-4">
            <Card className="glass-card">
              <CardHeader><CardTitle className="section-title">{yCol} by {xCol}</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={60} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Area type="monotone" dataKey="y" name={yCol} stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.15} strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="scatter" className="mt-4">
            <Card className="glass-card">
              <CardHeader><CardTitle className="section-title">{xCol} vs {yCol}</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <ScatterChart>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="x" name={xCol} type="number" tick={{ fontSize: 11 }} />
                    <YAxis dataKey="y" name={yCol} tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={tooltipStyle} />
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
