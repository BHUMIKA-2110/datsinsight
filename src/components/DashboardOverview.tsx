import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Database, Rows3, Columns3, AlertTriangle, Copy } from 'lucide-react';

export default function DashboardOverview() {
  const { summary, datasetName, activeData } = useData();

  if (!summary) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-muted-foreground animate-fade-in">
        <Database className="h-16 w-16 mb-4 opacity-30" />
        <h2 className="text-xl font-semibold text-foreground mb-2">No Dataset Loaded</h2>
        <p className="text-sm">Upload a CSV or Excel file to get started</p>
      </div>
    );
  }

  const stats = [
    { label: 'Rows', value: activeData.length.toLocaleString(), icon: Rows3, color: 'text-primary' },
    { label: 'Columns', value: summary.columnCount, icon: Columns3, color: 'text-accent' },
    { label: 'Missing Values', value: summary.missingTotal.toLocaleString(), icon: AlertTriangle, color: 'text-warning' },
    { label: 'Duplicate Rows', value: summary.duplicateRows, icon: Copy, color: 'text-destructive' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Viewing: <span className="font-medium text-foreground">{datasetName}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <Card key={s.label} className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
              <s.icon className={`h-4 w-4 ${s.color}`} />
            </CardHeader>
            <CardContent>
              <div className="stat-value">{s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="section-title">Column Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-3 font-medium text-muted-foreground">Column</th>
                  <th className="text-left py-2 px-3 font-medium text-muted-foreground">Type</th>
                  <th className="text-right py-2 px-3 font-medium text-muted-foreground">Missing</th>
                  <th className="text-right py-2 px-3 font-medium text-muted-foreground">Unique</th>
                </tr>
              </thead>
              <tbody>
                {summary.columns.map(col => (
                  <tr key={col.name} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="py-2 px-3 font-mono text-xs">{col.name}</td>
                    <td className="py-2 px-3">
                      <span className="px-2 py-0.5 rounded-full text-xs bg-secondary text-secondary-foreground">{col.type}</span>
                    </td>
                    <td className="py-2 px-3 text-right">
                      <span className={col.missing > 0 ? 'text-warning font-medium' : ''}>{col.missing}</span>
                    </td>
                    <td className="py-2 px-3 text-right">{col.unique}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
