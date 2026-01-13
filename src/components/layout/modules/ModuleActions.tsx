import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Download, RefreshCw } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { ExportFormat } from '@/types/exports';

interface ModuleActionsProps {
  onExport?: () => void;
  onRefresh?: () => void;
  customActions?: ReactNode;
  exportFormats?: ExportFormat[];
}

export function ModuleActions({
  onExport,
  onRefresh,
  customActions,
  exportFormats = ['csv', 'xlsx', 'pdf'],
}: ModuleActionsProps) {
  const handleExport = (format: ExportFormat) => {
    if (onExport) {
      // Em produção, isso chamaria uma função de exportação com o formato
      console.log(`Exportando em formato ${format}`);
      onExport();
    }
  };

  return (
    <div className="flex items-center justify-end gap-2">
      {customActions}

      {onRefresh && (
        <Button variant="outline" size="sm" onClick={onRefresh} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Atualizar
        </Button>
      )}

      {onExport && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Exportar
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {exportFormats.includes('csv') && (
              <DropdownMenuItem onClick={() => handleExport('csv')}>
                Exportar como CSV
              </DropdownMenuItem>
            )}
            {exportFormats.includes('xlsx') && (
              <DropdownMenuItem onClick={() => handleExport('xlsx')}>
                Exportar como Excel
              </DropdownMenuItem>
            )}
            {exportFormats.includes('pdf') && (
              <DropdownMenuItem onClick={() => handleExport('pdf')}>
                Exportar como PDF
              </DropdownMenuItem>
            )}
            {exportFormats.includes('json') && (
              <DropdownMenuItem onClick={() => handleExport('json')}>
                Exportar como JSON
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
