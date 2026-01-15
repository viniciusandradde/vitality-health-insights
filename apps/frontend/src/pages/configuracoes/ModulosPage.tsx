import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { ConfigLayout, ModuleCard } from '@/components/configuracoes';
import { getModules, updateModule, getSubscription } from '@/lib/api/settings';
import { toast } from 'sonner';
import type { SystemModule } from '@/types/settings';

export default function ModulosPage() {
  const [modules, setModules] = useState<Record<string, SystemModule>>({});
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [modulesData, subData] = await Promise.all([
        getModules(),
        getSubscription(),
      ]);
      setModules(modulesData);
      setSubscription(subData);
    } catch (error) {
      console.error('Error loading modules:', error);
      toast.error('Erro ao carregar módulos');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (moduleId: string, enabled: boolean) => {
    try {
      await updateModule(moduleId, enabled);
      setModules((prev) => ({
        ...prev,
        [moduleId]: { ...prev[moduleId], enabled },
      }));
      const module = modules[moduleId];
      toast.success(`${module?.name || moduleId} ${enabled ? 'ativado' : 'desativado'}`);
    } catch (error) {
      console.error('Error updating module:', error);
      toast.error('Erro ao atualizar módulo');
    }
  };

  const modulesList = Object.values(modules);
  const assistenciais = modulesList.filter((m) => {
    const assistencialModules = ['atendimentos', 'internacao', 'ambulatorio', 'agendas', 'exames-lab', 'exames-imagem', 'transfusional', 'farmacia', 'ccih', 'fisioterapia', 'nutricao', 'uti'];
    return assistencialModules.includes(m.id);
  });
  const gerenciais = modulesList.filter((m) => {
    const gerencialModules = ['estoque', 'faturamento', 'financeiro', 'higienizacao', 'lavanderia', 'sesmt', 'ti', 'hotelaria', 'spp'];
    return gerencialModules.includes(m.id);
  });

  if (loading) {
    return (
      <AppLayout>
        <ConfigLayout title="Módulos" description="Ative ou desative módulos do sistema">
          <div className="flex items-center justify-center p-8">
            <p className="text-gray-500">Carregando módulos...</p>
          </div>
        </ConfigLayout>
      </AppLayout>
    );
  }

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
