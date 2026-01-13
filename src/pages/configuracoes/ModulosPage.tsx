import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { ConfigLayout, ModuleCard } from '@/components/configuracoes';
import { mockModules, mockSubscription } from '@/data/mockSettings';
import { toast } from 'sonner';

export default function ModulosPage() {
  const [modules, setModules] = useState(mockModules);

  const handleToggle = (moduleId: string, enabled: boolean) => {
    setModules(modules.map((m) => (m.id === moduleId ? { ...m, enabled } : m)));
    const module = modules.find((m) => m.id === moduleId);
    toast.success(`${module?.name} ${enabled ? 'ativado' : 'desativado'}`);
  };

  const assistenciais = modules.filter((m) => m.category === 'assistencial');
  const gerenciais = modules.filter((m) => m.category === 'gerencial');

  return (
    <AppLayout>
      <ConfigLayout title="Módulos" description="Ative ou desative módulos do sistema">
        <div className="space-y-8">
          <div>
            <h3 className="font-medium text-foreground mb-4">Módulos Assistenciais</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {assistenciais.map((module) => (
                <ModuleCard
                  key={module.id}
                  module={module}
                  currentPlan={mockSubscription.plan_id}
                  onToggle={handleToggle}
                />
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-medium text-foreground mb-4">Módulos Gerenciais</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {gerenciais.map((module) => (
                <ModuleCard
                  key={module.id}
                  module={module}
                  currentPlan={mockSubscription.plan_id}
                  onToggle={handleToggle}
                />
              ))}
            </div>
          </div>
        </div>
      </ConfigLayout>
    </AppLayout>
  );
}
