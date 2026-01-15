import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GaugeChartProps {
  value: number;
  max?: number;
  label: string;
  showValue?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'destructive';
}

export function GaugeChart({
  value,
  max = 100,
  label,
  showValue = true,
  size = 'md',
  variant = 'default',
}: GaugeChartProps) {
  const percentage = Math.min((value / max) * 100, 100);
  const angle = (percentage / 100) * 180;

  const sizes = {
    sm: { container: 'w-24 h-12', text: 'text-lg' },
    md: { container: 'w-36 h-18', text: 'text-2xl' },
    lg: { container: 'w-48 h-24', text: 'text-3xl' },
  };

  const getColor = () => {
    if (variant !== 'default') {
      const colors = {
        success: 'hsl(142, 76%, 36%)',
        warning: 'hsl(38, 92%, 50%)',
        destructive: 'hsl(0, 72%, 50%)',
      };
      return colors[variant];
    }
    
    if (percentage < 60) return 'hsl(142, 76%, 36%)';
    if (percentage < 85) return 'hsl(38, 92%, 50%)';
    return 'hsl(0, 72%, 50%)';
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className={cn('relative', sizes[size].container)}>
        <svg viewBox="0 0 100 50" className="w-full h-full">
          {/* Background arc */}
          <path
            d="M 10 50 A 40 40 0 0 1 90 50"
            fill="none"
            stroke="hsl(var(--border))"
            strokeWidth="8"
            strokeLinecap="round"
          />
          {/* Value arc */}
          <motion.path
            d="M 10 50 A 40 40 0 0 1 90 50"
            fill="none"
            stroke={getColor()}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray="126"
            initial={{ strokeDashoffset: 126 }}
            animate={{ strokeDashoffset: 126 - (126 * percentage) / 100 }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </svg>
        
        {showValue && (
          <div className="absolute inset-0 flex items-end justify-center pb-1">
            <span className={cn('font-bold text-foreground', sizes[size].text)}>
              {Math.round(percentage)}%
            </span>
          </div>
        )}
      </div>
      
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
    </div>
  );
}
