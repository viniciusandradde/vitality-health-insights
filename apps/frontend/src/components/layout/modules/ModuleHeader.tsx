import { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface ModuleHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string | number;
  actions?: ReactNode;
}

export function ModuleHeader({ title, subtitle, badge, actions }: ModuleHeaderProps) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-4">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              {title}
              {badge && (
                <span className="text-sm font-normal text-muted-foreground">({badge})</span>
              )}
            </h1>
            {subtitle && (
              <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </CardContent>
    </Card>
  );
}
