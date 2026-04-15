import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { FileDown, Loader2 } from 'lucide-react';
import { useState } from 'react';
import jsPDF from 'jspdf';

export default function ReportExport() {
  const { summary, datasetName, activeData, modelResults } = useData();
  const { toast } = useToast();
  const [generating, setGenerating] = useState(false);

  const generatePDF = async () => {
    if (!summary) {
      toast({ title: 'No data', description: 'Upload a dataset first', variant: 'destructive' });
      return;
    }
    setGenerating(true);
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      let y = 20;

      // Title
      doc.setFontSize(22);
      doc.setTextColor(33, 97, 201);
      doc.text('DataInsight Pro Report', pageWidth / 2, y, { align: 'center' });
      y += 12;
      doc.setFontSize(11);
      doc.setTextColor(100, 100, 100);
      doc.text(`Dataset: ${datasetName}`, pageWidth / 2, y, { align: 'center' });
      y += 6;
      doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, y, { align: 'center' });
      y += 15;

      // Summary
      doc.setFontSize(14);
      doc.setTextColor(30, 30, 30);
      doc.text('Dataset Summary', 20, y);
      y += 8;
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      const summaryLines = [
        `Rows: ${activeData.length}`,
        `Columns: ${summary.columnCount}`,
        `Missing Values: ${summary.missingTotal}`,
        `Duplicate Rows: ${summary.duplicateRows}`,
      ];
      summaryLines.forEach(line => { doc.text(line, 25, y); y += 6; });
      y += 5;

      // Column details
      doc.setFontSize(14);
      doc.setTextColor(30, 30, 30);
      doc.text('Column Details', 20, y);
      y += 8;
      doc.setFontSize(9);
      doc.setTextColor(80, 80, 80);
      doc.text('Name', 25, y);
      doc.text('Type', 90, y);
      doc.text('Missing', 130, y);
      doc.text('Unique', 160, y);
      y += 5;
      doc.setDrawColor(200);
      doc.line(25, y, 185, y);
      y += 3;
      doc.setTextColor(40, 40, 40);
      summary.columns.forEach(col => {
        if (y > 270) { doc.addPage(); y = 20; }
        doc.text(col.name.slice(0, 30), 25, y);
        doc.text(col.type, 90, y);
        doc.text(String(col.missing), 130, y);
        doc.text(String(col.unique), 160, y);
        y += 5;
      });

      // ML Results
      if (modelResults.length > 0) {
        doc.addPage();
        y = 20;
        doc.setFontSize(14);
        doc.setTextColor(30, 30, 30);
        doc.text('Machine Learning Results', 20, y);
        y += 10;
        modelResults.forEach((result, idx) => {
          if (y > 250) { doc.addPage(); y = 20; }
          doc.setFontSize(12);
          doc.setTextColor(33, 97, 201);
          doc.text(`Model ${idx + 1}: ${result.modelType}`, 25, y);
          y += 7;
          doc.setFontSize(10);
          doc.setTextColor(60, 60, 60);
          doc.text(`Target: ${result.targetColumn}`, 30, y); y += 5;
          doc.text(`Features: ${result.featureColumns.join(', ')}`, 30, y); y += 7;
          Object.entries(result.metrics).forEach(([k, v]) => {
            doc.text(`${k}: ${typeof v === 'number' ? v.toFixed(4) : v}`, 30, y);
            y += 5;
          });
          y += 5;
        });
      }

      doc.save(`${datasetName || 'analysis'}_report.pdf`);
      toast({ title: 'Report generated!', description: 'PDF downloaded' });
    } catch (err: unknown) {
      toast({ title: 'Export failed', description: (err as Error).message, variant: 'destructive' });
    }
    setGenerating(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Export Report</h1>
        <p className="text-muted-foreground text-sm mt-1">Generate a PDF report of your analysis</p>
      </div>
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <FileDown className="h-16 w-16 text-primary opacity-60" />
        <p className="text-muted-foreground text-sm text-center max-w-md">
          Export your dataset summary, column details, and machine learning results as a downloadable PDF report.
        </p>
        <Button size="lg" onClick={generatePDF} disabled={generating || !summary}>
          {generating ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Generating...</> : <><FileDown className="h-4 w-4 mr-2" /> Download PDF Report</>}
        </Button>
      </div>
    </div>
  );
}
