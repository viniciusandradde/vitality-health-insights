import { Treemap, ResponsiveContainer, Tooltip } from 'recharts';
import type { TreeMapData } from '@/types/dashboard';

interface TreeMapChartProps {
  data: TreeMapData[];
  height?: number;
  dataKey?: string;
}

const COLORS = [
  'hsl(200, 98%, 39%)',
  'hsl(142, 76%, 36%)',
  'hsl(38, 92%, 50%)',
  'hsl(0, 72%, 50%)',
  'hsl(262, 83%, 58%)',
  'hsl(24, 95%, 53%)',
  'hsl(280, 100%, 70%)',
  'hsl(210, 100%, 56%)',
];

const getColor = (index: number) => COLORS[index % COLORS.length];

export function TreeMapChart({
  data,
  height = 300,
  dataKey = 'value',
}: TreeMapChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <Treemap
        data={data}
        dataKey={dataKey}
        stroke="hsl(var(--border))"
        fill="hsl(var(--card))"
      >
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
          }}
          formatter={(value: number, name: string, props: any) => {
            const item = props.payload;
            return [`${value} leitos-dia`, item.name || 'Centro de Custo'];
          }}
          labelFormatter={() => 'Leito-Dia por Centro de Custo'}
        />
      </Treemap>
    </ResponsiveContainer>
  );
}
