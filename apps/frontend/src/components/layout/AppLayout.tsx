import { ReactNode } from 'react';
import { AppSidebar } from './AppSidebar';
import { Header } from './Header';
import { cn } from '@/lib/utils';
import { useSidebarStore } from '@/stores/sidebarStore';

interface AppLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export function AppLayout({ children, title, subtitle }: AppLayoutProps) {
  const { isOpen } = useSidebarStore();

  return (
    <div className="flex min-h-screen w-full bg-background">
      <AppSidebar />
      
      <div className={cn(
        'flex flex-1 flex-col transition-all duration-200',
        isOpen ? 'lg:ml-0' : 'lg:ml-0'
      )}>
        <Header title={title} subtitle={subtitle} />
        
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
