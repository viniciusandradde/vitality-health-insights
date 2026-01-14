import { KPICard } from '@/components/dashboard/KPICard';
import type { ModuleKPI } from '@/types/modules';

interface KPIListProps {
  kpis: ModuleKPI[];
  columns?: 1 | 2 | 3 | 4;
}

export function KPIList({ kpis, columns = 4 }: KPIListProps) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={`grid ${gridCols[columns]} gap-4`}>
      {kpis.map((kpi) => (
        <KPICard
          key={kpi.id}
          title={kpi.title}
          value={kpi.value}
          icon={kpi.icon}
          trend={kpi.trend}
          variant={kpi.variant}
          description={kpi.description}
        />
      ))}
    </div>
  );
}
