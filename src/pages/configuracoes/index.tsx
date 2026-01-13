import { Link } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePermissions } from '@/hooks/usePermissions';
import { mockTenantSettings, mockSubscription, mockUsers } from '@/data/mockSettings';
import {
  User,
  Building2,
  Users,
  LayoutGrid,
  Plug,
  Bell,
  Shield,
  CreditCard,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';

const quickLinks = [
  { label: 'Perfil', path: '/configuracoes/perfil', icon: User, resource: 'profile', description: 'Edite seu perfil pessoal' },
  { label: 'Organização', path: '/configuracoes/organizacao', icon: Building2, resource: 'organization', description: 'Configurações do hospital' },
  { label: 'Equipe', path: '/configuracoes/equipe', icon: Users, resource: 'team', description: 'Gerencie usuários' },
  { label: 'Módulos', path: '/configuracoes/modulos', icon: LayoutGrid, resource: 'modules', description: 'Ative e desative módulos' },
  { label: 'Integrações', path: '/configuracoes/integracoes', icon: Plug, resource: 'integrations', description: 'Conecte sistemas externos' },
  { label: 'Notificações', path: '/configuracoes/notificacoes', icon: Bell, resource: 'notifications', description: 'Configure alertas' },
  { label: 'Segurança', path: '/configuracoes/seguranca', icon: Shield, resource: 'security', description: 'Logs e auditoria' },
  { label: 'Plano', path: '/configuracoes/plano', icon: CreditCard, resource: 'billing', description: 'Assinatura e faturas' },
];

export default function ConfiguracoesIndex() {
  const { canView } = usePermissions();
  const visibleLinks = quickLinks.filter((link) => canView(link.resource));

  const pendingUsers = mockUsers.filter((u) => u.status === 'pending').length;
  const usagePercent = Math.round((mockSubscription.usage.users.current / mockSubscription.usage.users.limit) * 100);

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Configurações</h1>
          <p className="text-muted-foreground mt-1">Gerencie as configurações do {mockTenantSettings.name}</p>
        </div>

        {/* Alertas */}
        {pendingUsers > 0 && (
          <Card className="border-warning/30 bg-warning/5">
            <CardContent className="flex items-center gap-3 p-4">
              <AlertCircle className="h-5 w-5 text-warning" />
              <p className="text-sm text-foreground">
                {pendingUsers} convite{pendingUsers > 1 ? 's' : ''} pendente{pendingUsers > 1 ? 's' : ''} de aceitação
              </p>
              <Link to="/configuracoes/equipe" className="text-sm text-primary hover:underline ml-auto">
                Ver equipe
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Quick Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {visibleLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link key={link.path} to={link.path}>
                <Card className="h-full hover:border-primary/30 hover:bg-accent/50 transition-colors cursor-pointer group">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        <Icon className="h-5 w-5" />
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <h3 className="font-medium text-foreground mt-3">{link.label}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{link.description}</p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Plano Atual</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-bold text-foreground">{mockSubscription.plan_name}</p>
              <Badge variant="outline" className="mt-2 bg-success/20 text-success border-success/30">
                Ativo
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Usuários</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-bold text-foreground">
                {mockSubscription.usage.users.current} / {mockSubscription.usage.users.limit}
              </p>
              <p className="text-sm text-muted-foreground mt-1">{usagePercent}% utilizado</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Módulos Ativos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-bold text-foreground">{mockTenantSettings.modules_enabled.length}</p>
              <p className="text-sm text-muted-foreground mt-1">módulos habilitados</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
