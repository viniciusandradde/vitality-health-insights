import { AppLayout } from '@/components/layout/AppLayout';
import { ConfigLayout } from '@/components/configuracoes';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function NotificacoesPage() {
  return (
    <AppLayout>
      <ConfigLayout title="Notificações" description="Configure suas preferências de alertas">
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-medium text-foreground">Canais de Notificação</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Email</Label>
                  <p className="text-sm text-muted-foreground">Receber notificações por email</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Push</Label>
                  <p className="text-sm text-muted-foreground">Notificações no navegador</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>WhatsApp</Label>
                  <p className="text-sm text-muted-foreground">Alertas críticos via WhatsApp</p>
                </div>
                <Switch />
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="font-medium text-foreground">Tipos de Alerta</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Alertas Críticos</Label>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label>Avisos</Label>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label>Informativos</Label>
                <Switch />
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>Frequência</Label>
            <Select defaultValue="realtime">
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="realtime">Tempo real</SelectItem>
                <SelectItem value="hourly">A cada hora</SelectItem>
                <SelectItem value="daily">Diário</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end">
            <Button>Salvar Preferências</Button>
          </div>
        </div>
      </ConfigLayout>
    </AppLayout>
  );
}
