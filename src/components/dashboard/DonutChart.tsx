import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, Label } from 'recharts';

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
  centerTitle?: string;
  centerSubtitle?: string;
  showSegmentLabels?: boolean;
  legendFormat?: 'compact' | 'detailed';
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
  centerTitle,
  centerSubtitle,
  showSegmentLabels = true,
  legendFormat = 'detailed',
}: DonutChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const percentualPrincipal = data.length > 0 && total > 0
    ? Number(((data[0].value / total) * 100).toFixed(2))
    : 0;

  const displayLabel = centerLabel || `${percentualPrincipal}%`;

  // Função para renderizar labels nos segmentos
  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name, value }: any) => {
    if (!showSegmentLabels || percent < 0.05) return null; // Não mostrar label se segmento muito pequeno

    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="hsl(var(--foreground))"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize={11}
        fontWeight="500"
      >
        {`${value} (${(percent * 100).toFixed(1)}%)`}
      </text>
    );
  };

  // Formatação padronizada da legenda
  const formatLegend = (value: string) => {
    const item = data.find((d) => d.name === value);
    if (!item) return value;

    const percent = total > 0 ? ((item.value / total) * 100).toFixed(2) : '0';
    
    if (legendFormat === 'compact') {
      return `${value} (${percent}%)`;
    } else {
      return `${value}: ${item.value} (${percent}%)`;
    }
  };

  // Formatação padronizada do tooltip
  const formatTooltip = (value: number, name: string) => {
    const percent = total > 0 ? ((value / total) * 100).toFixed(2) : '0';
    return [`${name}: ${value} (${percent}%)`, ''];
  };

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
          label={showSegmentLabels ? renderCustomLabel : false}
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length]}
            />
          ))}
          {showCenterLabel && (
            <Label
              content={({ viewBox }) => {
                if (!viewBox || !viewBox.cx || !viewBox.cy) return null;
                return (
                  <g>
                    {centerTitle && (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy - 10}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize={14}
                        fontWeight="600"
                        fill="hsl(var(--muted-foreground))"
                      >
                        {centerTitle}
                      </text>
                    )}
                    <text
                      x={viewBox.cx}
                      y={viewBox.cy + (centerTitle ? 8 : 0)}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize={28}
                      fontWeight="bold"
                      fill="hsl(var(--foreground))"
                    >
                      {displayLabel}
                    </text>
                    {centerSubtitle && (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy + (centerTitle ? 22 : 18)}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize={12}
                        fill="hsl(var(--muted-foreground))"
                      >
                        {centerSubtitle}
                      </text>
                    )}
                  </g>
                );
              }}
            />
          )}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
            padding: '8px 12px',
          }}
          formatter={formatTooltip}
        />
        {showLegend && (
          <Legend
            verticalAlign="bottom"
            height={legendFormat === 'detailed' ? 50 : 36}
            iconType="circle"
            formatter={formatLegend}
            wrapperStyle={{
              paddingTop: '16px',
            }}
          />
        )}
      </PieChart>
    </ResponsiveContainer>
  );
}
