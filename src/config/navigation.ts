import {
  LayoutDashboard,
  Stethoscope,
  Building2,
  Settings,
  Calendar,
  FlaskConical,
  Pill,
  Activity,
  FileText,
  Wallet,
  Package,
  Users,
  ShieldCheck,
  HeartPulse,
  ClipboardList,
  BedDouble,
  MessageSquare,
} from 'lucide-react';
import { NavSection } from '@/types/navigation';

export const navigationConfig: NavSection[] = [
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    path: '/',
  },
  {
    label: 'Chat',
    icon: MessageSquare,
    path: '/chat',
  },
  {
    label: 'Assistencial',
    icon: Stethoscope,
    submenu: [
      {
        label: 'Atendimentos',
        path: '/assistencial/atendimentos',
        icon: Users,
        description: 'Análise tempo real',
      },
      {
        label: 'Internação',
        path: '/assistencial/internacao',
        icon: BedDouble,
        description: 'Gestão de leitos',
      },
      {
        label: 'Agendas',
        path: '/assistencial/agendas',
        icon: Calendar,
        description: 'Agendamentos',
      },
      {
        label: 'Exames Laboratoriais',
        path: '/assistencial/exames-lab',
        icon: FlaskConical,
      },
      {
        label: 'Farmácia',
        path: '/assistencial/farmacia',
        icon: Pill,
      },
      {
        label: 'UTI',
        path: '/assistencial/uti',
        icon: HeartPulse,
      },
      {
        label: 'CCIH',
        path: '/assistencial/ccih',
        icon: ShieldCheck,
        description: 'Controle Infecção',
      },
    ],
  },
  {
    label: 'Gerencial',
    icon: Building2,
    submenu: [
      {
        label: 'Financeiro',
        path: '/gerencial/financeiro',
        icon: Wallet,
      },
      {
        label: 'Faturamento',
        path: '/gerencial/faturamento',
        icon: FileText,
      },
      {
        label: 'Estoque',
        path: '/gerencial/estoque',
        icon: Package,
      },
      {
        label: 'Relatórios',
        path: '/gerencial/relatorios',
        icon: ClipboardList,
      },
    ],
  },
  {
    label: 'Configurações',
    icon: Settings,
    path: '/configuracoes',
  },
];
