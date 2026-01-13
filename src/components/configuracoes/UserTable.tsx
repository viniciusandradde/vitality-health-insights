import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MoreHorizontal, Search, UserPlus, Edit, UserX, Mail } from 'lucide-react';
import { RoleBadge } from './RoleBadge';
import { StatusBadge } from './StatusBadge';
import type { TenantUser, AppRole } from '@/types/settings';
import { usePermissions } from '@/hooks/usePermissions';

interface UserTableProps {
  users: TenantUser[];
  onInvite?: () => void;
  onEdit?: (user: TenantUser) => void;
  onDisable?: (user: TenantUser) => void;
  onResendInvite?: (user: TenantUser) => void;
}

export function UserTable({
  users,
  onInvite,
  onEdit,
  onDisable,
  onResendInvite,
}: UserTableProps) {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<AppRole | 'all'>('all');
  const { canCreate, canEdit, canDelete } = usePermissions();

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.full_name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase()) ||
      user.department?.toLowerCase().includes(search.toLowerCase());

    const matchesRole = roleFilter === 'all' || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Nunca';
    return format(new Date(dateString), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar usuários..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 w-full sm:w-64"
            />
          </div>
          <Select
            value={roleFilter}
            onValueChange={(value) => setRoleFilter(value as AppRole | 'all')}
          >
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Filtrar por role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os roles</SelectItem>
              <SelectItem value="master">Master</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="analyst">Analista</SelectItem>
              <SelectItem value="viewer">Visualizador</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {canCreate('team') && (
          <Button onClick={onInvite} className="w-full sm:w-auto">
            <UserPlus className="h-4 w-4 mr-2" />
            Convidar Usuário
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuário</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="hidden md:table-cell">Departamento</TableHead>
              <TableHead className="hidden lg:table-cell">Último Acesso</TableHead>
              <TableHead>Status</TableHead>
              {(canEdit('team') || canDelete('team')) && (
                <TableHead className="w-12"></TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Nenhum usuário encontrado
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={user.avatar_url} alt={user.full_name} />
                        <AvatarFallback className="bg-primary/10 text-primary text-sm">
                          {getInitials(user.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-foreground">{user.full_name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <RoleBadge role={user.role} />
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">
                    {user.department || '-'}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-muted-foreground text-sm">
                    {formatDate(user.last_login_at)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={user.status} />
                  </TableCell>
                  {(canEdit('team') || canDelete('team')) && (
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {canEdit('team') && (
                            <DropdownMenuItem onClick={() => onEdit?.(user)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                          )}
                          {user.status === 'pending' && (
                            <DropdownMenuItem onClick={() => onResendInvite?.(user)}>
                              <Mail className="h-4 w-4 mr-2" />
                              Reenviar Convite
                            </DropdownMenuItem>
                          )}
                          {canDelete('team') && user.status !== 'disabled' && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => onDisable?.(user)}
                                className="text-destructive focus:text-destructive"
                              >
                                <UserX className="h-4 w-4 mr-2" />
                                Desativar
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Footer */}
      <div className="text-sm text-muted-foreground">
        {filteredUsers.length} de {users.length} usuários
      </div>
    </div>
  );
}
