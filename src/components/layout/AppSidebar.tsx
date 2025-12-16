import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown, ChevronRight, Menu, X, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { navigationConfig } from '@/config/navigation';
import { useSidebarStore } from '@/stores/sidebarStore';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

export function AppSidebar() {
  const location = useLocation();
  const { isOpen, toggle } = useSidebarStore();
  const [expandedSections, setExpandedSections] = useState<string[]>(['Assistencial']);

  const toggleSection = (label: string) => {
    setExpandedSections((prev) =>
      prev.includes(label)
        ? prev.filter((l) => l !== label)
        : [...prev, label]
    );
  };

  const isActive = (path: string) => location.pathname === path;
  const isInSection = (submenu: typeof navigationConfig[0]['submenu']) =>
    submenu?.some((item) => location.pathname.startsWith(item.path));

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm lg:hidden"
            onClick={toggle}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          width: isOpen ? 280 : 0,
          opacity: isOpen ? 1 : 0,
        }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className={cn(
          'fixed left-0 top-0 z-50 h-screen bg-card border-r border-border overflow-hidden',
          'lg:relative lg:z-0',
          !isOpen && 'lg:w-0'
        )}
      >
        <div className="flex h-full flex-col w-[280px]">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between border-b border-border px-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <Activity className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-foreground">VSA Analytics</span>
                <span className="text-xs text-muted-foreground">Health Platform</span>
              </div>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggle}
              className="lg:hidden"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 px-3 py-4">
            <nav className="space-y-1">
              {navigationConfig.map((section) => {
                const isExpanded = expandedSections.includes(section.label);
                const sectionActive = section.path
                  ? isActive(section.path)
                  : isInSection(section.submenu);

                if (section.path && !section.submenu) {
                  return (
                    <Link
                      key={section.label}
                      to={section.path}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                        isActive(section.path)
                          ? 'bg-primary text-primary-foreground'
                          : 'text-foreground hover:bg-accent'
                      )}
                    >
                      <section.icon className="h-5 w-5" />
                      {section.label}
                      {section.badge && (
                        <span className="ml-auto rounded-full bg-primary/20 px-2 py-0.5 text-xs">
                          {section.badge}
                        </span>
                      )}
                    </Link>
                  );
                }

                return (
                  <div key={section.label}>
                    <button
                      onClick={() => toggleSection(section.label)}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                        sectionActive
                          ? 'bg-accent text-foreground'
                          : 'text-foreground hover:bg-accent'
                      )}
                    >
                      <section.icon className="h-5 w-5" />
                      {section.label}
                      <span className="ml-auto">
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </span>
                    </button>

                    <AnimatePresence>
                      {isExpanded && section.submenu && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="ml-4 mt-1 space-y-1 border-l border-border pl-3">
                            {section.submenu.map((item) => (
                              <Link
                                key={item.path}
                                to={item.path}
                                className={cn(
                                  'flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors',
                                  isActive(item.path)
                                    ? 'bg-primary text-primary-foreground'
                                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                                )}
                              >
                                {item.icon && <item.icon className="h-4 w-4" />}
                                <span className="truncate">{item.label}</span>
                              </Link>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </nav>
          </ScrollArea>

          {/* Footer */}
          <div className="border-t border-border p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                <span className="text-sm font-semibold text-primary">HS</span>
              </div>
              <div className="flex-1 truncate">
                <p className="text-sm font-medium text-foreground">Hospital São Paulo</p>
                <p className="text-xs text-muted-foreground">Plano Professional</p>
              </div>
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Mobile menu button */}
      {!isOpen && (
        <Button
          variant="ghost"
          size="icon"
          onClick={toggle}
          className="fixed left-4 top-4 z-50 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </Button>
      )}
    </>
  );
}
