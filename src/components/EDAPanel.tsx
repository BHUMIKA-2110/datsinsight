import { useState, useMemo } from 'react';
import { useData } from '@/contexts/DataContext';
import { getColumnStats, getCorrelationMatrix, getDistribution } from '@/lib/dataProcessing';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Activity } from 'lucide-react';

export default function EDAPanel() {
  const { activeData, summary } = useData();
  const [selectedCol, setSelectedCol] = useState('');

  const numericCols = useMemo(() => summary?.columns.filter(c => c.type === 'number').map(c => c.name) || [], [summary]);

  const stats = useMemo(() => selectedCol ? getColumnStats(activeData, selectedCol) : null, [activeData, selectedCol]);

  const correlation = useMemo(() => {
    if (numericCols.length < 2) return null;
    return getCorrelationMatrix(activeData, numericCols.slice(0, 10));
  }, [activeData, numericCols]);

  const distribution = useMemo(() => {
    if (!selectedCol || !numericCols.includes(selectedCol)) return [];
    return getDistribution(activeData, selectedCol);
  }, [activeData, selectedCol, numericCols]);

  if (!summary || activeData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-muted-foreground animate-fade-in">
        <Activity className="h-16 w-16 mb-4 opacity-30" />
        <h2 className="text-xl font-semibold text-foreground mb-2">No Data to Analyse</h2>
        <p className="text-sm">Upload a dataset first</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Exploratory Data Analysis</h1>
        <p className="text-muted-foreground text-sm mt-1">Summary statistics, distributions, and correlations</p>
      </div>

      <Tabs defaultValue="stats">
        <TabsList>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
          <TabsTrigger value="correlation">Correlation</TabsTrigger>
        </TabsList>

        <TabsContent value="stats" className="space-y-4 mt-4">
          <Select value={selectedCol} onValueChange={setSelectedCol}>
            <SelectTrigger className="w-64"><SelectValue placeholder="Select column" /></SelectTrigger>
            <SelectContent>{summary.columns.map(c => <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>)}</SelectContent>
          </Select>
          {stats && (
            <Card className="glass-card">
              <CardHeader><CardTitle className="section-title">{selectedCol}</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {stats.mean !== undefined && <StatBox label="Mean" value={stats.mean.toFixed(3)} />}
                  {stats.median !== undefined && <StatBox label="Median" value={stats.median.toFixed(3)} />}
                  {stats.std !== undefined && <StatBox label="Std Dev" value={stats.std.toFixed(3)} />}
                  {stats.min !== undefined && <StatBox label="Min" value={stats.min.toFixed(3)} />}
                  {stats.max !== undefined && <StatBox label="Max" value={stats.max.toFixed(3)} />}
                  {stats.q1 !== undefined && <StatBox label="Q1" value={stats.q1.toFixed(3)} />}
                  {stats.q3 !== undefined && <StatBox label="Q3" value={stats.q3.toFixed(3)} />}
                  {stats.mode !== undefined && <StatBox label="Mode" value={stats.mode} />}
                  <StatBox label="Count" value={String(stats.count)} />
                  <StatBox label="Missing" value={String(stats.missing)} />
                  <StatBox label="Unique" value={String(stats.unique)} />
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="distribution" className="space-y-4 mt-4">
          <Select value={selectedCol} onValueChange={setSelectedCol}>
            <SelectTrigger className="w-64"><SelectValue placeholder="Select numeric column" /></SelectTrigger>
            <SelectContent>{numericCols.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
          {distribution.length > 0 && (
            <Card className="glass-card">
              <CardHeader><CardTitle className="section-title">Distribution of {selectedCol}</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={distribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="bin" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={60} />
                    <YAxis />
                    <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="correlation" className="mt-4">
          {correlation && correlation.cols.length > 1 ? (
            <Card className="glass-card">
              <CardHeader><CardTitle className="section-title">Correlation Matrix</CardTitle></CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="text-xs">
                    <thead>
                      <tr>
                        <th className="p-1"></th>
                        {correlation.cols.map(c => <th key={c} className="p-1 font-mono truncate max-w-[80px]" title={c}>{c.slice(0, 8)}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {correlation.cols.map((row, i) => (
                        <tr key={row}>
                          <td className="p-1 font-mono font-medium truncate max-w-[80px]" title={row}>{row.slice(0, 8)}</td>
                          {correlation.matrix[i].map((val, j) => (
                            <td key={j} className="p-1 text-center font-mono" style={{
                              backgroundColor: `hsl(${val > 0 ? '217 91%' : '0 84%'} ${Math.min(Math.abs(val) * 50 + 5, 50)}%)`,
                              color: Math.abs(val) > 0.6 ? 'white' : undefined,
                            }}>
                              {val.toFixed(2)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ) : (
            <p className="text-muted-foreground text-sm">Need at least 2 numeric columns for correlation</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-muted/50 rounded-lg p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold font-mono text-foreground mt-1">{value}</p>
    </div>
  );
}
