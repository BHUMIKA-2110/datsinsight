import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BarChart3, Database, Brain, TrendingUp, FileDown, Sparkles, ArrowRight, Shield, Zap, Layers } from 'lucide-react';

const features = [
  { icon: Database, title: 'Dataset Management', desc: 'Upload CSV/Excel files, view summaries, and manage multiple datasets per user.' },
  { icon: Sparkles, title: 'Automated Cleaning', desc: 'Handle missing values, remove duplicates, normalize columns with one click.' },
  { icon: TrendingUp, title: 'Exploratory Analysis', desc: 'Summary statistics, correlation matrices, and distribution plots for every column.' },
  { icon: BarChart3, title: 'Interactive Visualizations', desc: 'Bar, line, area, scatter, histogram, and pie charts with column selection.' },
  { icon: Brain, title: 'Machine Learning', desc: 'Train Linear Regression, Logistic Regression, and Decision Tree models in-browser.' },
  { icon: FileDown, title: 'PDF Reports', desc: 'Generate multi-page academic reports with dataset profiles, charts, and ML results.' },
];

const techStack = [
  { name: 'React 18', desc: 'Component architecture' },
  { name: 'TypeScript', desc: 'Type safety' },
  { name: 'Tailwind CSS', desc: 'Responsive design' },
  { name: 'Recharts', desc: 'Data visualizations' },
  { name: 'ml.js', desc: 'In-browser ML' },
  { name: 'PapaParse', desc: 'CSV parsing' },
  { name: 'simple-statistics', desc: 'Statistical analysis' },
  { name: 'jsPDF', desc: 'Report generation' },
];

const methodology = [
  { step: '1', title: 'Upload', desc: 'Import CSV or Excel datasets' },
  { step: '2', title: 'Clean', desc: 'Handle missing data & duplicates' },
  { step: '3', title: 'Explore', desc: 'Run EDA & visualize patterns' },
  { step: '4', title: 'Model', desc: 'Train predictive ML models' },
  { step: '5', title: 'Report', desc: 'Export academic PDF report' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between h-16 px-6">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-foreground">DataInsight Pro</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/auth">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link to="/auth">
              <Button size="sm">Get Started <ArrowRight className="h-3.5 w-3.5 ml-1" /></Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <Sparkles className="h-3.5 w-3.5" /> Data Analysis Platform
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
            End-to-End Data Analysis<br />
            <span className="text-primary">& Visualization Platform</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
            A professional-grade web application for uploading datasets, performing automated cleaning,
            running exploratory data analysis, building predictive models, and exporting academic reports — all in the browser.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link to="/auth">
              <Button size="lg" className="h-12 px-8 text-base">
                Launch Platform <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            <a href="#features">
              <Button variant="outline" size="lg" className="h-12 px-8 text-base">
                View Features
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-y bg-muted/30">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-8 px-6 text-center">
          <div>
            <p className="text-3xl font-bold text-foreground">6+</p>
            <p className="text-sm text-muted-foreground mt-1">Analysis Modules</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-foreground">3</p>
            <p className="text-sm text-muted-foreground mt-1">ML Algorithms</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-foreground">100%</p>
            <p className="text-sm text-muted-foreground mt-1">Client-Side Processing</p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-3">Platform Features</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">Complete data analysis pipeline from upload to report generation</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map(f => (
              <Card key={f.title} className="glass-card hover:shadow-md transition-all hover:-translate-y-0.5">
                <CardContent className="pt-6">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <f.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Methodology */}
      <section className="py-20 px-6 bg-muted/30 border-y">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-3">Methodology</h2>
            <p className="text-muted-foreground">A structured 5-step data analysis workflow</p>
          </div>
          <div className="flex flex-col md:flex-row items-start justify-between gap-4">
            {methodology.map((m, i) => (
              <div key={m.step} className="flex-1 text-center">
                <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-lg font-bold mx-auto mb-3">
                  {m.step}
                </div>
                <h4 className="font-semibold text-foreground mb-1">{m.title}</h4>
                <p className="text-xs text-muted-foreground">{m.desc}</p>
                {i < methodology.length - 1 && (
                  <ArrowRight className="h-4 w-4 text-muted-foreground mx-auto mt-3 hidden md:block rotate-0" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-3">Technology Stack</h2>
            <p className="text-muted-foreground">Built with modern, production-ready technologies</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {techStack.map(t => (
              <div key={t.name} className="bg-card border rounded-xl p-4 text-center hover:shadow-sm transition-shadow">
                <p className="font-semibold text-foreground text-sm">{t.name}</p>
                <p className="text-xs text-muted-foreground mt-1">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Architecture */}
      <section className="py-20 px-6 bg-muted/30 border-y">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-3">System Architecture</h2>
            <p className="text-muted-foreground">Secure, scalable, and performant design</p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            <Card className="glass-card">
              <CardContent className="pt-6 text-center">
                <Shield className="h-8 w-8 text-primary mx-auto mb-3" />
                <h4 className="font-semibold text-foreground mb-2">Authentication</h4>
                <p className="text-xs text-muted-foreground">Email/password + Google OAuth with row-level security on all data</p>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="pt-6 text-center">
                <Zap className="h-8 w-8 text-accent mx-auto mb-3" />
                <h4 className="font-semibold text-foreground mb-2">Client-Side Processing</h4>
                <p className="text-xs text-muted-foreground">All data parsing, cleaning, and ML training happens in-browser for privacy</p>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="pt-6 text-center">
                <Layers className="h-8 w-8 text-warning mx-auto mb-3" />
                <h4 className="font-semibold text-foreground mb-2">Cloud Storage</h4>
                <p className="text-xs text-muted-foreground">Datasets and metadata stored securely with per-user access control</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">Ready to Analyse Your Data?</h2>
          <p className="text-muted-foreground mb-8">Create an account and start exploring your datasets in minutes.</p>
          <Link to="/auth">
            <Button size="lg" className="h-12 px-10 text-base">
              Get Started Free <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-lg bg-primary flex items-center justify-center">
              <BarChart3 className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <span className="font-medium">DataInsight Pro</span>
          </div>
          <p>DataInsight Pro © {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
}
