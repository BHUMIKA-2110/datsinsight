import { useMemo } from 'react';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Database, Rows3, Columns3, AlertTriangle, Copy, TrendingUp, BarChart3 } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const CHART_COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

export default function DashboardOverview() {
  const { summary, datasetName, activeData, modelResults } = useData();

  if (!summary) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-muted-foreground animate-fade-in">
        <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
          <Database className="h-10 w-10 text-primary/40" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Welcome to DataInsight Pro</h2>
        <p className="text-sm max-w-md text-center">Upload a CSV or Excel file from the <span className="font-medium text-foreground">Datasets</span> page to start your analysis journey.</p>
      </div>
    );
  }

  const stats = [
    { label: 'Total Rows', value: activeData.length.toLocaleString(), icon: Rows3, color: 'bg-primary/10 text-primary' },
    { label: 'Columns', value: summary.columnCount, icon: Columns3, color: 'bg-accent/10 text-accent' },
    { label: 'Missing Values', value: summary.missingTotal.toLocaleString(), icon: AlertTriangle, color: 'bg-warning/10 text-warning' },
    { label: 'Duplicates', value: summary.duplicateRows, icon: Copy, color: 'bg-destructive/10 text-destructive' },
  ];

  const typeDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    summary.columns.forEach(c => { counts[c.type] = (counts[c.type] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [summary]);

  const missingByCol = useMemo(() => {
    return summary.columns
      .filter(c => c.missing > 0)
      .sort((a, b) => b.missing - a.missing)
      .slice(0, 8)
      .map(c => ({ name: c.name, missing: c.missing, pct: Math.round((c.missing / activeData.length) * 100) }));
  }, [summary, activeData.length]);

  const dataQuality = useMemo(() => {
    const totalCells = activeData.length * summary.columnCount;
    const missingPct = totalCells > 0 ? ((totalCells - summary.missingTotal) / totalCells) * 100 : 100;
    return Math.round(missingPct);
  }, [summary, activeData.length]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Viewing: <span className="font-semibold text-foreground">{datasetName}</span>
          </p>
        </div>
        {modelResults.length > 0 && (
          <div className="flex items-center gap-2 bg-accent/10 text-accent px-3 py-1.5 rounded-lg text-sm font-medium">
            <TrendingUp className="h-4 w-4" />
            {modelResults.length} model{modelResults.length > 1 ? 's' : ''} trained
          </div>
        )}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <Card key={s.label} className="glass-card hover:shadow-md transition-shadow">
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center justify-between mb-3">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${s.color}`}>
                  <s.icon className="h-5 w-5" />
                </div>
              </div>
              <div className="stat-value">{s.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Data Quality + Type Distribution */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="section-title flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" /> Data Quality Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-3 mb-3">
              <span className="text-4xl font-bold text-foreground">{dataQuality}%</span>
              <span className="text-sm text-muted-foreground pb-1">completeness</span>
            </div>
            <Progress value={dataQuality} className="h-3 mb-4" />
            <p className="text-xs text-muted-foreground">
              {summary.missingTotal === 0
                ? '✓ No missing values detected — your data is fully complete.'
                : `${summary.missingTotal.toLocaleString()} missing values across ${missingByCol.length} column${missingByCol.length > 1 ? 's' : ''}. Use Data Cleaning to fix.`}
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="section-title">Column Type Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={typeDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} innerRadius={35} paddingAngle={4} strokeWidth={0}>
                  {typeDistribution.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-2">
              {typeDistribution.map((t, i) => (
                <div key={t.name} className="flex items-center gap-1.5 text-xs">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                  <span className="text-muted-foreground">{t.name} ({t.value})</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Missing values bar chart */}
      {missingByCol.length > 0 && (
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="section-title">Missing Values by Column</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={missingByCol} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={90} />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} formatter={(v: number) => [v, 'Missing']} />
                <Bar dataKey="missing" fill="hsl(var(--warning))" radius={[0, 6, 6, 0]} barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Column Overview Table */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="section-title">Column Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2.5 px-3 font-medium text-muted-foreground">Column</th>
                  <th className="text-left py-2.5 px-3 font-medium text-muted-foreground">Type</th>
                  <th className="text-right py-2.5 px-3 font-medium text-muted-foreground">Missing</th>
                  <th className="text-right py-2.5 px-3 font-medium text-muted-foreground">Unique</th>
                  <th className="text-right py-2.5 px-3 font-medium text-muted-foreground">Completeness</th>
                </tr>
              </thead>
              <tbody>
                {summary.columns.map(col => {
                  const completePct = activeData.length > 0 ? Math.round(((activeData.length - col.missing) / activeData.length) * 100) : 100;
                  return (
                    <tr key={col.name} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="py-2.5 px-3 font-mono text-xs font-medium">{col.name}</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded-full text-xs bg-secondary text-secondary-foreground font-medium">{col.type}</span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <span className={col.missing > 0 ? 'text-warning font-semibold' : 'text-muted-foreground'}>{col.missing}</span>
                      </td>
                      <td className="py-2.5 px-3 text-right text-muted-foreground">{col.unique}</td>
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Progress value={completePct} className="h-1.5 w-16" />
                          <span className="text-xs text-muted-foreground w-8 text-right">{completePct}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
