import { LucideIcon } from 'lucide-react';

export interface NavItem {
  label: string;
  path: string;
  icon?: LucideIcon;
  badge?: number | string;
  description?: string;
  submenu?: NavItem[];
}

export interface NavSection {
  label: string;
  icon: LucideIcon;
  path?: string;
  badge?: number;
  submenu?: NavItem[];
}
