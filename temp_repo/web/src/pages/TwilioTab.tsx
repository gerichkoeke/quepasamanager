import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Check, X, Settings, Eye, EyeOff } from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { api } from '../services/api';
import { TwilioMapping, CreateTwilioMappingRequest } from '../types';
import toast from 'react-hot-toast';

export const TwilioTab: React.FC = () => {
  const [mappings, setMappings] = useState<TwilioMapping[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [editingMapping, setEditingMapping] = useState<TwilioMapping | null>(null);
  const [setupMapping, setSetupMapping] = useState<TwilioMapping | null>(null);
  const [showToken, setShowToken] = useState(false);
  const [showApiToken, setShowApiToken] = useState(false);
  const [formData, setFormData] = useState<CreateTwilioMappingRequest>({
    name: '',
    phoneNumber: '',
    useMessagingService: false,
    accountSid: '',
    authToken: '',
    chatwootBaseUrl: '',
    chatwootApiToken: '',
    chatwootAccountId: '',
    active: true,
  });

  useEffect(() => {
    loadMappings();
  }, []);

  const loadMappings = async () => {
    try {
      setIsLoading(true);
      const data = await api.getTwilioMappings();
      setMappings(data);
    } catch (error: any) {
      toast.error('Falha ao carregar mapeamentos Twilio');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (mapping?: TwilioMapping) => {
    if (mapping) {
      setEditingMapping(mapping);
      setFormData({
        name: mapping.name || '',
        phoneNumber: mapping.phoneNumber || '',
        useMessagingService: mapping.useMessagingService || false,
        accountSid: mapping.accountSid || '',
        authToken: '••••••••••••••', // Placeholder
        chatwootBaseUrl: mapping.chatwootBaseUrl || '',
        chatwootApiToken: '••••••••••••••', // Placeholder
        chatwootAccountId: mapping.chatwootAccountId || '',
        active: mapping.active,
      });
    } else {
      setEditingMapping(null);
      setFormData({
        name: '',
        phoneNumber: '',
        useMessagingService: false,
        accountSid: '',
        authToken: '',
        chatwootBaseUrl: '',
        chatwootApiToken: '',
        chatwootAccountId: '',
        active: true,
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingMapping(null);
    setShowToken(false);
    setShowApiToken(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingMapping) {
        const updateData: Partial<CreateTwilioMappingRequest> = {
          name: formData.name,
          phoneNumber: formData.phoneNumber,
          useMessagingService: formData.useMessagingService,
          accountSid: formData.accountSid,
          chatwootBaseUrl: formData.chatwootBaseUrl,
          chatwootAccountId: formData.chatwootAccountId,
          active: formData.active,
        };
        if (formData.authToken && formData.authToken !== '••••••••••••••') {
          updateData.authToken = formData.authToken;
        }
        if (formData.chatwootApiToken && formData.chatwootApiToken !== '••••••••••••••') {
          updateData.chatwootApiToken = formData.chatwootApiToken;
        }
        await api.updateTwilioMapping(editingMapping.id, updateData);
        toast.success('Mapeamento atualizado');
      } else {
        await api.createTwilioMapping(formData);
        toast.success('Mapeamento criado');
      }
      handleCloseModal();
      loadMappings();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Falha ao salvar mapeamento Twilio');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este mapeamento?')) return;
    try {
      await api.deleteTwilioMapping(id);
      toast.success('Mapeamento excluído');
      loadMappings();
    } catch (error: any) {
      toast.error('Falha ao excluir mapeamento Twilio');
    }
  };

  const handleOpenSetupModal = (mapping: TwilioMapping) => {
    setSetupMapping(mapping);
    setShowSetupModal(true);
  };

  const handleCloseSetupModal = () => {
    setShowSetupModal(false);
    setSetupMapping(null);
  };

  const handleConfirmSetup = async () => {
    if (!setupMapping) return;

    try {
      toast.loading('Configurando integração Twilio -> Chatwoot...', { id: 'setup-twilio' });
      await api.setupTwilioChatwootIntegration(setupMapping.id);
      toast.success('Integração Twilio configurada!', { id: 'setup-twilio' });
      handleCloseSetupModal();
      loadMappings();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Falha ao configurar integração Twilio', { id: 'setup-twilio' });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Twilio → Chatwoot</h1>
          <p className="text-gray-600 mt-1">Gerencie integrações Twilio-Chatwoot</p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Canal Twilio
        </Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-cw-bg-light">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Número</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Chatwoot URL</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Inbox ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {mappings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    Nenhum canal Twilio configurado
                  </td>
                </tr>
              ) : (
                mappings.map((mapping) => (
                  <tr key={mapping.id} className="hover:bg-cw-bg-light">
                    <td className="px-6 py-4 text-sm text-gray-900">{mapping.name || '-'}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{mapping.phoneNumber}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{mapping.chatwootBaseUrl}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{mapping.chatwootInboxId || '-'}</td>
                    <td className="px-6 py-4">
                      {mapping.active ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <Check className="w-3 h-3 mr-1" />
                          Ativo
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          <X className="w-3 h-3 mr-1" />
                          Inativo
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenModal(mapping)}
                        className="text-primary hover:text-primary"
                        title="Editar canal"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenSetupModal(mapping)}
                        className="text-green-600 hover:text-green-800"
                        title="Configurar integração Chatwoot"
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(mapping.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Excluir canal"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={editingMapping ? 'Editar Canal Twilio' : 'Novo Canal Twilio'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome da Caixa de Entrada *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Twilio SMS"
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Número de Telefone *
            </label>
            <input
              type="text"
              required
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              placeholder="+1234567890"
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="useMessagingService"
              checked={formData.useMessagingService}
              onChange={(e) => setFormData({ ...formData, useMessagingService: e.target.checked })}
              className="mr-2"
            />
            <label htmlFor="useMessagingService" className="text-sm text-gray-700">Usar um Serviço de Mensagens do Twilio</label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              SID da Conta *
            </label>
            <input
              type="text"
              required
              value={formData.accountSid}
              onChange={(e) => setFormData({ ...formData, accountSid: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Token de autenticação *
            </label>
            <div className="relative">
              <input
                type={showToken ? "text" : "password"}
                required={!editingMapping}
                value={formData.authToken}
                onChange={(e) => setFormData({ ...formData, authToken: e.target.value })}
                placeholder={editingMapping ? "Deixe vazio para manter" : "Twilio Auth Token"}
                className="w-full px-3 py-2 pr-10 border rounded-lg"
              />
              <button
                type="button"
                onClick={() => setShowToken(!showToken)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <hr className="my-4" />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Chatwoot URL *
            </label>
            <input
              type="url"
              required
              value={formData.chatwootBaseUrl}
              onChange={(e) => setFormData({ ...formData, chatwootBaseUrl: e.target.value })}
              placeholder="https://app.chatwoot.com"
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Account ID *
            </label>
            <input
              type="text"
              required
              value={formData.chatwootAccountId}
              onChange={(e) => setFormData({ ...formData, chatwootAccountId: e.target.value })}
              placeholder="1"
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Chatwoot API Token *
            </label>
            <div className="relative">
              <input
                type={showApiToken ? "text" : "password"}
                required={!editingMapping}
                value={formData.chatwootApiToken}
                onChange={(e) => setFormData({ ...formData, chatwootApiToken: e.target.value })}
                placeholder={editingMapping ? "Deixe vazio para manter" : "Token de acesso"}
                className="w-full px-3 py-2 pr-10 border rounded-lg"
              />
              <button
                type="button"
                onClick={() => setShowApiToken(!showApiToken)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showApiToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center pt-2">
            <input
              type="checkbox"
              id="active"
              checked={formData.active}
              onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              className="mr-2"
            />
            <label htmlFor="active" className="text-sm text-gray-700">Ativo</label>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="secondary" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary">
              {editingMapping ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={showSetupModal}
        onClose={handleCloseSetupModal}
        title="Configurar Integração Chatwoot (Twilio)"
      >
        <div className="space-y-4">
          <div className="bg-primary bg-opacity-5 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-primary font-medium mb-2">
              Esta ação irá:
            </p>
            <ul className="text-sm text-primary list-disc list-inside space-y-1">
              <li>Criar uma inbox SMS/WhatsApp do Twilio no Chatwoot</li>
              <li>Sincronizar webhook no provedor se necessário</li>
            </ul>
          </div>

          {setupMapping && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Canal Twilio
              </label>
              <input
                type="text"
                value={`${setupMapping.name} (${setupMapping.phoneNumber})`}
                disabled
                className="w-full px-3 py-2 border rounded-lg bg-gray-100 text-gray-600"
              />
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="secondary" onClick={handleCloseSetupModal}>
              Cancelar
            </Button>
            <Button type="button" variant="primary" onClick={handleConfirmSetup}>
              Configurar Integração
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
