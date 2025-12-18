/**
 * Seletor de agente especializado
 */

import { agents } from '@/config/agents';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Bot, Check } from 'lucide-react';

interface AgentSelectorProps {
  selectedAgentId: string | null;
  onSelectAgent: (agentId: string | null) => void;
}

export function AgentSelector({ selectedAgentId, onSelectAgent }: AgentSelectorProps) {
  const selectedAgent = agents.find((a) => a.id === selectedAgentId);
  const SelectedIcon = selectedAgent?.icon || Bot;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <SelectedIcon className="h-4 w-4" />
          <span>{selectedAgent?.name || 'Selecionar Agente'}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel>Agentes Disponíveis</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => onSelectAgent(null)}
          className={cn(
            'flex items-center gap-2',
            !selectedAgentId && 'bg-accent'
          )}
        >
          {!selectedAgentId && <Check className="h-4 w-4" />}
          <span className={cn(!selectedAgentId && 'ml-6')}>
            Automático (Supervisor)
          </span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {agents.map((agent) => {
          const AgentIcon = agent.icon || Bot;
          const isSelected = selectedAgentId === agent.id;
          return (
            <DropdownMenuItem
              key={agent.id}
              onClick={() => onSelectAgent(agent.id)}
              className={cn(
                'flex items-start gap-2 py-3',
                isSelected && 'bg-accent'
              )}
            >
              {isSelected ? (
                <Check className="h-4 w-4 mt-0.5" />
              ) : (
                <div className="h-4 w-4" />
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <AgentIcon
                    className="h-4 w-4"
                    style={{ color: agent.color }}
                  />
                  <span className="font-medium">{agent.name}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {agent.description}
                </p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {agent.capabilities.slice(0, 3).map((cap) => (
                    <Badge
                      key={cap}
                      variant="secondary"
                      className="text-[10px] px-1.5 py-0"
                    >
                      {cap}
                    </Badge>
                  ))}
                </div>
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

