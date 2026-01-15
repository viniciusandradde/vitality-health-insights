import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { ConfigLayout } from '@/components/configuracoes';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { getTenantSettings, updateTenantSettings } from '@/lib/api/settings';
import { toast } from 'sonner';
import type { TenantSettings } from '@/types/settings';

export default function OrganizacaoPage() {
  const [settings, setSettings] = useState<TenantSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    cnpj: '',
    phone: '',
    email: '',
    street: '',
    city: '',
    state: '',
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await getTenantSettings();
      setSettings(data);
      setFormData({
        name: data.name || '',
        cnpj: data.contact?.cnpj || '',
        phone: data.contact?.phone || '',
        email: data.contact?.email || '',
        street: data.address?.street || '',
        city: data.address?.city || '',
        state: data.address?.state || '',
      });
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Erro ao carregar configurações');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateTenantSettings({
        name: formData.name,
        contact: {
          cnpj: formData.cnpj,
          phone: formData.phone,
          email: formData.email,
        },
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zip: settings?.address?.zip || '',
          country: settings?.address?.country || 'Brasil',
        },
      });
      toast.success('Configurações salvas com sucesso');
      await loadSettings();
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <ConfigLayout title="Organização" description="Configurações do hospital">
          <div className="flex items-center justify-center p-8">
            <p className="text-gray-500">Carregando configurações...</p>
          </div>
        </ConfigLayout>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <ConfigLayout title="Organização" description="Configurações do hospital">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Hospital</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cnpj">CNPJ</Label>
              <Input
                id="cnpj"
                value={formData.cnpj}
                onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <Separator />

          <h3 className="font-medium text-foreground">Endereço</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="street">Logradouro</Label>
              <Input
                id="street"
                value={formData.street}
                onChange={(e) => setFormData({ ...formData, street: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">Cidade</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">Estado</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              />
            </div>
          </div>

          <Separator />

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </div>
      </ConfigLayout>
    </AppLayout>
  );
}
