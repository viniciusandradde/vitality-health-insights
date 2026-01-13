import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import type { FilterValues } from '@/types/filters';

interface FilterBarProps {
  activeFilters: FilterValues;
  onRemoveFilter: (key: string) => void;
  onClearAll: () => void;
  getFilterLabel?: (key: string, value: any) => string;
}

export function FilterBar({
  activeFilters,
  onRemoveFilter,
  onClearAll,
  getFilterLabel,
}: FilterBarProps) {
  const activeFilterKeys = Object.keys(activeFilters).filter(
    (key) => activeFilters[key] !== null && activeFilters[key] !== undefined && activeFilters[key] !== ''
  );

  if (activeFilterKeys.length === 0) {
    return null;
  }

  const formatFilterValue = (key: string, value: any): string => {
    if (getFilterLabel) {
      return getFilterLabel(key, value);
    }

    if (Array.isArray(value)) {
      return value.join(', ');
    }

    if (typeof value === 'object' && value !== null) {
      if ('start' in value && 'end' in value) {
        return `${value.start} - ${value.end}`;
      }
      return JSON.stringify(value);
    }

    return String(value);
  };

  return (
    <Card>
      <CardContent className="p-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">Filtros ativos:</span>
          {activeFilterKeys.map((key) => (
            <Badge key={key} variant="secondary" className="gap-1">
              <span className="text-xs">
                {key}: {formatFilterValue(key, activeFilters[key])}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-destructive/20"
                onClick={() => onRemoveFilter(key)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearAll}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Limpar todos
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
