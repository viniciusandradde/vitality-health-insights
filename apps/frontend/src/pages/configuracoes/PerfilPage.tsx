import { AppLayout } from '@/components/layout/AppLayout';
import { ConfigLayout } from '@/components/configuracoes';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Camera } from 'lucide-react';

export default function PerfilPage() {
  return (
    <AppLayout>
      <ConfigLayout title="Perfil" description="Gerencie suas informações pessoais">
        <div className="space-y-6">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="bg-primary/10 text-primary text-xl">CS</AvatarFallback>
              </Avatar>
              <Button size="icon" variant="outline" className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full">
                <Camera className="h-4 w-4" />
              </Button>
            </div>
            <div>
              <h3 className="font-medium text-foreground">Dr. Carlos Silva</h3>
              <p className="text-sm text-muted-foreground">admin@hospital.com</p>
            </div>
          </div>

          <Separator />

          {/* Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome completo</Label>
              <Input id="name" defaultValue="Dr. Carlos Silva" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue="admin@hospital.com" disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input id="phone" defaultValue="(11) 99999-0001" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Departamento</Label>
              <Input id="department" defaultValue="Diretoria" />
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
