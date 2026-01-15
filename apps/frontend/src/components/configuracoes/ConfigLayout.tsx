import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Settings,
  User,
  Building2,
  Users,
  LayoutGrid,
  Plug,
  Bell,
  Shield,
  CreditCard,
  ChevronRight,
} from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';

interface ConfigLayoutProps {
  children: ReactNode;
  title: string;
  description?: string;
}

const configMenuItems = [
  { label: 'Visão Geral', path: '/configuracoes', icon: Settings, resource: 'profile' },
  { label: 'Perfil', path: '/configuracoes/perfil', icon: User, resource: 'profile' },
  { label: 'Organização', path: '/configuracoes/organizacao', icon: Building2, resource: 'organization' },
  { label: 'Equipe', path: '/configuracoes/equipe', icon: Users, resource: 'team' },
  { label: 'Módulos', path: '/configuracoes/modulos', icon: LayoutGrid, resource: 'modules' },
  { label: 'Integrações', path: '/configuracoes/integracoes', icon: Plug, resource: 'integrations' },
  { label: 'Notificações', path: '/configuracoes/notificacoes', icon: Bell, resource: 'notifications' },
  { label: 'Segurança', path: '/configuracoes/seguranca', icon: Shield, resource: 'security' },
  { label: 'Plano e Faturamento', path: '/configuracoes/plano', icon: CreditCard, resource: 'billing' },
];

export function ConfigLayout({ children, title, description }: ConfigLayoutProps) {
  const location = useLocation();
  const { canView } = usePermissions();

  const visibleItems = configMenuItems.filter((item) => canView(item.resource));

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-6">
      {/* Menu lateral */}
      <Card className="lg:w-64 shrink-0">
        <ScrollArea className="h-auto lg:h-[calc(100vh-12rem)]">
          <nav className="p-2">
            {visibleItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="flex-1">{item.label}</span>
                  {isActive && <ChevronRight className="h-4 w-4" />}
                </Link>
              );
            })}
          </nav>
        </ScrollArea>
      </Card>

      {/* Conteúdo */}
      <div className="flex-1 min-w-0">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          {description && (
            <p className="text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        <Card>
          <CardContent className="p-6">{children}</CardContent>
        </Card>
      </div>
    </div>
  );
}
