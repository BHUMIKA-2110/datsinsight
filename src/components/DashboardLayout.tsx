import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { DataProvider } from '@/contexts/DataContext';
import { Outlet } from 'react-router-dom';
import ThemeToggle from '@/components/ThemeToggle';

export default function DashboardLayout() {
  return (
    <DataProvider>
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <div className="flex-1 flex flex-col min-w-0">
            <header className="h-14 flex items-center justify-between border-b px-4 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
              <div className="flex items-center">
                <SidebarTrigger className="mr-4" />
                <span className="text-sm font-medium text-muted-foreground">Data Analysis Platform</span>
              </div>
              <ThemeToggle />
            </header>
            <main className="flex-1 p-6 overflow-auto">
              <Outlet />
            </main>
          </div>
        </div>
      </SidebarProvider>
    </DataProvider>
  );
}
