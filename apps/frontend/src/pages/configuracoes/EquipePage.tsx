import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { ConfigLayout, UserTable, UserInviteDialog } from '@/components/configuracoes';
import { getUsers } from '@/lib/api/settings';
import { toast } from 'sonner';
import type { TenantUser, AppRole } from '@/types/settings';

export default function EquipePage() {
  const [users, setUsers] = useState<TenantUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteOpen, setInviteOpen] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await getUsers();
      setUsers(data);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = (data: { email: string; name: string; role: AppRole; department?: string }) => {
    const newUser: TenantUser = {
      id: `user-${Date.now()}`,
      email: data.email,
      full_name: data.name,
      role: data.role,
      department: data.department,
      status: 'pending',
      created_at: new Date().toISOString(),
    };
    setUsers([...users, newUser]);
    toast.success(`Convite enviado para ${data.email}`);
  };

  if (loading) {
    return (
      <AppLayout>
        <ConfigLayout title="Equipe" description="Gerencie os usuários da sua organização">
          <div className="flex items-center justify-center p-8">
            <p className="text-gray-500">Carregando usuários...</p>
          </div>
        </ConfigLayout>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <ConfigLayout title="Equipe" description="Gerencie os usuários da sua organização">
        <UserTable
          users={users}
          onInvite={() => setInviteOpen(true)}
          onEdit={(user) => toast.info(`Editar ${user.full_name}`)}
          onDisable={(user) => toast.warning(`Desativar ${user.full_name}`)}
          onResendInvite={(user) => toast.success(`Convite reenviado para ${user.email}`)}
        />
        <UserInviteDialog open={inviteOpen} onOpenChange={setInviteOpen} onInvite={handleInvite} />
      </ConfigLayout>
    </AppLayout>
  );
}
