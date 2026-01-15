import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  Legend,
} from 'recharts';

const COLORS = [
  'hsl(200, 98%, 39%)',
  'hsl(142, 76%, 36%)',
  'hsl(38, 92%, 50%)',
  'hsl(0, 72%, 50%)',
  'hsl(262, 83%, 58%)',
];

interface BaseChartProps {
  data: any[];
  dataKey: string;
  xAxisKey?: string;
  height?: number;
}

export function SimpleLineChart({ data, dataKey, xAxisKey = 'name', height = 200 }: BaseChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis 
          dataKey={xAxisKey} 
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
        />
        <YAxis 
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
          }}
        />
        <Line
          type="monotone"
          dataKey={dataKey}
          stroke="hsl(200, 98%, 39%)"
          strokeWidth={2}
          dot={{ fill: 'hsl(200, 98%, 39%)', strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function SimpleBarChart({ data, dataKey, xAxisKey = 'name', height = 200 }: BaseChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis 
          dataKey={xAxisKey} 
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
        />
        <YAxis 
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
          }}
        />
        <Bar dataKey={dataKey} fill="hsl(200, 98%, 39%)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function SimpleAreaChart({ data, dataKey, xAxisKey = 'name', height = 200 }: BaseChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(200, 98%, 39%)" stopOpacity={0.3} />
            <stop offset="95%" stopColor="hsl(200, 98%, 39%)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis 
          dataKey={xAxisKey} 
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
        />
        <YAxis 
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
          }}
        />
        <Area
          type="monotone"
          dataKey={dataKey}
          stroke="hsl(200, 98%, 39%)"
          strokeWidth={2}
          fill="url(#colorGradient)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

interface PieChartData {
  name: string;
  value: number;
}

export function SimplePieChart({ data, height = 200 }: { data: PieChartData[]; height?: number }) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  // Formatação padronizada do tooltip
  const formatTooltip = (value: number, name: string) => {
    const percent = total > 0 ? ((value / total) * 100).toFixed(2) : '0';
    return [`${name}: ${value} (${percent}%)`, ''];
  };

  // Formatação padronizada da legenda
  const formatLegend = (value: string) => {
    const item = data.find((d) => d.name === value);
    if (!item) return value;
    const percent = total > 0 ? ((item.value / total) * 100).toFixed(2) : '0';
    return `${value}: ${item.value} (${percent}%)`;
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={50}
          outerRadius={70}
          paddingAngle={2}
          dataKey="value"
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
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
        <Legend
          verticalAlign="bottom"
          height={50}
          iconType="circle"
          formatter={formatLegend}
          wrapperStyle={{
            paddingTop: '16px',
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

interface MultiLineChartProps {
  data: any[];
  lines: { dataKey: string; color: string; name: string }[];
  xAxisKey?: string;
  height?: number;
}

export function MultiLineChart({ data, lines, xAxisKey = 'name', height = 200 }: MultiLineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis 
          dataKey={xAxisKey} 
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
        />
        <YAxis 
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
          }}
        />
        {lines.map((line) => (
          <Line
            key={line.dataKey}
            type="monotone"
            dataKey={line.dataKey}
            stroke={line.color}
            strokeWidth={2}
            name={line.name}
            dot={{ fill: line.color, strokeWidth: 2 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
