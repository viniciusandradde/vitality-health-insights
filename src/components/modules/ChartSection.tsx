import { ChartCard } from '@/components/dashboard/ChartCard';
import {
  SimpleAreaChart,
  SimpleBarChart,
  SimplePieChart,
  SimpleLineChart,
  MultiLineChart,
} from '@/components/dashboard/Charts';
import { GaugeChart } from '@/components/dashboard/GaugeChart';
import type { ChartData } from '@/types/modules';

interface Chart {
  id: string;
  title: string;
  description?: string;
  type: 'line' | 'bar' | 'area' | 'pie' | 'gauge' | 'multi-line';
  data: ChartData[];
  dataKey?: string;
  xAxisKey?: string;
  lines?: { dataKey: string; color: string; name: string }[];
  config?: Record<string, any>;
  height?: number;
}

interface ChartSectionProps {
  charts: Chart[];
  columns?: 1 | 2 | 3;
}

export function ChartSection({ charts, columns = 2 }: ChartSectionProps) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 lg:grid-cols-2',
    3: 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3',
  };

  const renderChart = (chart: Chart) => {
    const commonProps = {
      data: chart.data,
      dataKey: chart.dataKey || 'value',
      xAxisKey: chart.xAxisKey || 'name',
      height: chart.height || 250,
    };

    switch (chart.type) {
      case 'line':
        return <SimpleLineChart {...commonProps} />;
      case 'bar':
        return <SimpleBarChart {...commonProps} />;
      case 'area':
        return <SimpleAreaChart {...commonProps} />;
      case 'pie':
        return <SimplePieChart data={chart.data} height={chart.height || 250} />;
      case 'gauge':
        return (
          <div className="flex items-center justify-center py-4">
            <GaugeChart
              value={Number(chart.data[0]?.value || 0)}
              label={chart.title}
              size="lg"
            />
          </div>
        );
      case 'multi-line':
        return (
          <MultiLineChart
            data={chart.data}
            xAxisKey={chart.xAxisKey || 'name'}
            lines={chart.lines || []}
            height={chart.height || 250}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className={`grid ${gridCols[columns]} gap-6`}>
      {charts.map((chart) => (
        <ChartCard
          key={chart.id}
          title={chart.title}
          description={chart.description}
        >
          {renderChart(chart)}
        </ChartCard>
      ))}
    </div>
  );
}
