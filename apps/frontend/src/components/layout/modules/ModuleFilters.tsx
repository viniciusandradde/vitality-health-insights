import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, X } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import type { ModuleFilter, FilterValues, DateRangeFilter } from '@/types/filters';

interface ModuleFiltersProps {
  filters: ModuleFilter[];
  values: FilterValues;
  onChange: (values: FilterValues) => void;
}

export function ModuleFilters({ filters, values, onChange }: ModuleFiltersProps) {
  const handleFilterChange = (id: string, value: any) => {
    onChange({
      ...values,
      [id]: value,
    });
  };

  const handleClearFilter = (id: string) => {
    const newValues = { ...values };
    delete newValues[id];
    onChange(newValues);
  };

  const handleClearAll = () => {
    onChange({});
  };

  const hasActiveFilters = Object.keys(values).length > 0;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-wrap items-end gap-4">
          {filters.map((filter) => {
            switch (filter.type) {
              case 'select':
                return (
                  <div key={filter.id} className="flex-1 min-w-[180px]">
                    <Label htmlFor={filter.id} className="text-xs text-muted-foreground mb-1 block">
                      {filter.label}
                    </Label>
                    <Select
                      value={String(values[filter.id] || filter.defaultValue || '')}
                      onValueChange={(value) => handleFilterChange(filter.id, value)}
                    >
                      <SelectTrigger id={filter.id} className="bg-background">
                        <SelectValue placeholder={filter.placeholder || `Selecione ${filter.label}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {filter.options?.map((option) => (
                          <SelectItem
                            key={String(option.value)}
                            value={String(option.value)}
                            disabled={option.disabled}
                          >
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                );

              case 'multiselect':
                return (
                  <div key={filter.id} className="flex-1 min-w-[180px]">
                    <Label htmlFor={filter.id} className="text-xs text-muted-foreground mb-1 block">
                      {filter.label}
                    </Label>
                    <Select
                      value={String(values[filter.id] || '')}
                      onValueChange={(value) => handleFilterChange(filter.id, value)}
                    >
                      <SelectTrigger id={filter.id} className="bg-background">
                        <SelectValue placeholder={filter.placeholder || `Selecione ${filter.label}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {filter.options?.map((option) => (
                          <SelectItem
                            key={String(option.value)}
                            value={String(option.value)}
                            disabled={option.disabled}
                          >
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                );

              case 'date':
                return (
                  <div key={filter.id} className="flex-1 min-w-[180px]">
                    <Label htmlFor={filter.id} className="text-xs text-muted-foreground mb-1 block">
                      {filter.label}
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          id={filter.id}
                          variant="outline"
                          className={cn(
                            'w-full justify-start text-left font-normal bg-background',
                            !values[filter.id] && 'text-muted-foreground'
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {values[filter.id] ? (
                            format(new Date(values[filter.id] as string), 'PPP', { locale: ptBR })
                          ) : (
                            <span>{filter.placeholder || 'Selecione a data'}</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={values[filter.id] ? new Date(values[filter.id] as string) : undefined}
                          onSelect={(date) =>
                            handleFilterChange(filter.id, date ? format(date, 'yyyy-MM-dd') : null)
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                );

              case 'daterange':
                return (
                  <div key={filter.id} className="flex-1 min-w-[200px]">
                    <Label className="text-xs text-muted-foreground mb-1 block">
                      {filter.label}
                    </Label>
                    <div className="flex items-center gap-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              'flex-1 justify-start text-left font-normal bg-background',
                              !(values[filter.id] as DateRangeFilter)?.start && 'text-muted-foreground'
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {(values[filter.id] as DateRangeFilter)?.start ? (
                              format(new Date((values[filter.id] as DateRangeFilter).start), 'dd/MM/yyyy')
                            ) : (
                              <span>Início</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={
                              (values[filter.id] as DateRangeFilter)?.start
                                ? new Date((values[filter.id] as DateRangeFilter).start)
                                : undefined
                            }
                            onSelect={(date) => {
                              const current = (values[filter.id] as DateRangeFilter) || {};
                              handleFilterChange(filter.id, {
                                ...current,
                                start: date ? format(date, 'yyyy-MM-dd') : undefined,
                              });
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              'flex-1 justify-start text-left font-normal bg-background',
                              !(values[filter.id] as DateRangeFilter)?.end && 'text-muted-foreground'
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {(values[filter.id] as DateRangeFilter)?.end ? (
                              format(new Date((values[filter.id] as DateRangeFilter).end), 'dd/MM/yyyy')
                            ) : (
                              <span>Fim</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={
                              (values[filter.id] as DateRangeFilter)?.end
                                ? new Date((values[filter.id] as DateRangeFilter).end)
                                : undefined
                            }
                            onSelect={(date) => {
                              const current = (values[filter.id] as DateRangeFilter) || {};
                              handleFilterChange(filter.id, {
                                ...current,
                                end: date ? format(date, 'yyyy-MM-dd') : undefined,
                              });
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                );

              case 'text':
                return (
                  <div key={filter.id} className="flex-1 min-w-[200px]">
                    <Label htmlFor={filter.id} className="text-xs text-muted-foreground mb-1 block">
                      {filter.label}
                    </Label>
                    <Input
                      id={filter.id}
                      type="text"
                      placeholder={filter.placeholder}
                      value={String(values[filter.id] || '')}
                      onChange={(e) => handleFilterChange(filter.id, e.target.value)}
                      className="bg-background"
                    />
                  </div>
                );

              case 'number':
                return (
                  <div key={filter.id} className="flex-1 min-w-[150px]">
                    <Label htmlFor={filter.id} className="text-xs text-muted-foreground mb-1 block">
                      {filter.label}
                    </Label>
                    <Input
                      id={filter.id}
                      type="number"
                      placeholder={filter.placeholder}
                      value={String(values[filter.id] || '')}
                      onChange={(e) => handleFilterChange(filter.id, Number(e.target.value))}
                      className="bg-background"
                      min={filter.validation?.min}
                      max={filter.validation?.max}
                    />
                  </div>
                );

              default:
                return null;
            }
          })}

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={handleClearAll} className="gap-2">
              <X className="h-4 w-4" />
              Limpar Filtros
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
