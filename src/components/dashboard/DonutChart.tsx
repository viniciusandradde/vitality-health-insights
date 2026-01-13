import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface DonutChartData {
  name: string;
  value: number;
  color?: string;
}

interface DonutChartProps {
  data: DonutChartData[];
  height?: number;
  innerRadius?: number;
  outerRadius?: number;
  showLegend?: boolean;
  showCenterLabel?: boolean;
  centerLabel?: string;
}

const DEFAULT_COLORS = [
  'hsl(0, 72%, 50%)', // Vermelho para ocupado
  'hsl(142, 76%, 36%)', // Verde para livre
  'hsl(38, 92%, 50%)', // Amarelo
  'hsl(200, 98%, 39%)', // Azul
  'hsl(262, 83%, 58%)', // Roxo
];

export function DonutChart({
  data,
  height = 250,
  innerRadius = 60,
  outerRadius = 90,
  showLegend = true,
  showCenterLabel = true,
  centerLabel,
}: DonutChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const percentualOcupado = data.length > 0 && total > 0
    ? Number(((data[0].value / total) * 100).toFixed(2))
    : 0;

  const displayLabel = centerLabel || `${percentualOcupado}%`;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          paddingAngle={2}
          dataKey="value"
          startAngle={90}
          endAngle={-270}
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length]}
            />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
          }}
          formatter={(value: number, name: string) => [
            `${value} (${((value / total) * 100).toFixed(2)}%)`,
            name,
          ]}
        />
        {showLegend && (
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value) => {
              const item = data.find((d) => d.name === value);
              const percent = item && total > 0 ? ((item.value / total) * 100).toFixed(2) : '0';
              return `${value} (${percent}%)`;
            }}
          />
        )}
        {showCenterLabel && (
          <text
            x="50%"
            y="50%"
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={24}
            fontWeight="bold"
            fill="hsl(var(--foreground))"
          >
            {displayLabel}
          </text>
        )}
      </PieChart>
    </ResponsiveContainer>
  );
}
