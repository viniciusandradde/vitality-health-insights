import { AppLayout } from '@/components/layout/AppLayout';
import { ConfigLayout } from '@/components/configuracoes';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { mockTenantSettings } from '@/data/mockSettings';

export default function OrganizacaoPage() {
  return (
    <AppLayout>
      <ConfigLayout title="Organização" description="Configurações do hospital">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Hospital</Label>
              <Input id="name" defaultValue={mockTenantSettings.name} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cnpj">CNPJ</Label>
              <Input id="cnpj" defaultValue={mockTenantSettings.cnpj} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input id="phone" defaultValue={mockTenantSettings.phone} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue={mockTenantSettings.email} />
            </div>
          </div>

          <Separator />

          <h3 className="font-medium text-foreground">Endereço</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="street">Logradouro</Label>
              <Input id="street" defaultValue={mockTenantSettings.address?.street} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">Cidade</Label>
              <Input id="city" defaultValue={mockTenantSettings.address?.city} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">Estado</Label>
              <Input id="state" defaultValue={mockTenantSettings.address?.state} />
            </div>
          </div>

          <Separator />

          <div className="flex justify-end">
            <Button>Salvar Alterações</Button>
          </div>
        </div>
      </ConfigLayout>
    </AppLayout>
  );
}
