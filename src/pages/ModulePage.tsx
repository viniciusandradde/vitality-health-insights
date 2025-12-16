import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Construction } from 'lucide-react';

interface ModulePageProps {
  title: string;
  subtitle?: string;
}

export function ModulePage({ title, subtitle }: ModulePageProps) {
  return (
    <AppLayout title={title} subtitle={subtitle}>
      <Card className="flex min-h-[400px] items-center justify-center">
        <CardContent className="text-center">
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-primary/10 p-4">
              <Construction className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h2 className="mb-2 text-xl font-semibold text-foreground">
            Módulo em Desenvolvimento
          </h2>
          <p className="max-w-md text-muted-foreground">
            Este módulo está sendo desenvolvido e estará disponível em breve.
            Acompanhe as atualizações para novidades.
          </p>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
