import { ReactNode } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { ModuleHeader } from './ModuleHeader';
import { ModuleFilters } from './ModuleFilters';
import { ModuleActions } from './ModuleActions';
import type { ModuleFilter, FilterValues } from '@/types/filters';

interface ModuleLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  filters?: ModuleFilter[];
  filterValues?: FilterValues;
  onFilterChange?: (filters: FilterValues) => void;
  actions?: ReactNode;
  showExport?: boolean;
  onExport?: () => void;
}

export function ModuleLayout({
  title,
  subtitle,
  children,
  filters,
  filterValues,
  onFilterChange,
  actions,
  showExport = true,
  onExport,
}: ModuleLayoutProps) {
  return (
    <AppLayout title={title} subtitle={subtitle}>
      <div className="space-y-6">
        {/* Filtros */}
        {filters && filters.length > 0 && (
          <ModuleFilters
            filters={filters}
            values={filterValues || {}}
            onChange={onFilterChange || (() => {})}
          />
        )}

        {/* Ações */}
        {(actions || showExport) && (
          <ModuleActions onExport={onExport} customActions={actions} />
        )}

        {/* Conteúdo */}
        {children}
      </div>
    </AppLayout>
  );
}
