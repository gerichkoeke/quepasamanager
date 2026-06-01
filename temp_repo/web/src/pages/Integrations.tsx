import React, { useState } from 'react';
import { Save, Plug, HardDrive } from 'lucide-react';
import { Layout } from '../components/Layout';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import toast from 'react-hot-toast';

export const Integrations: React.FC = () => {
  const [softdeskUrl, setSoftdeskUrl] = useState('');
  const [softdeskToken, setSoftdeskToken] = useState('');
  const [directTicketCreation, setDirectTicketCreation] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    // Simular carregamento (pré-estrutura)
    setTimeout(() => {
      setIsSaving(false);
      toast.success('Configurações de integração salvas com sucesso (Pré-estrutura)');
    }, 800);
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Plug className="w-8 h-8 text-primary" />
            Integrações
          </h1>
          <p className="text-gray-600 mt-1">Configure integrações com sistemas externos de atendimento</p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <Card title="Sistema de Chamados (Softdesk)">
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-lg p-4 mb-6">
                <h4 className="font-semibold mb-1 flex items-center gap-2">
                  <HardDrive className="w-4 h-4" />
                  Módulo em Construção
                </h4>
                <p className="text-sm">
                  Esta é uma pré-estrutura para a integração com o Softdesk. 
                  A funcionalidade de criação direta de chamados via protocolo entrará em operação futuramente.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL da API Softdesk
                </label>
                <input
                  type="url"
                  value={softdeskUrl}
                  onChange={(e) => setSoftdeskUrl(e.target.value)}
                  placeholder="https://exemplo.softdesk.com.br/api/api.php"
                  className="w-full px-4 py-2 border border-cw-border-light rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hash API (Token)
                </label>
                <input
                  type="password"
                  value={softdeskToken}
                  onChange={(e) => setSoftdeskToken(e.target.value)}
                  placeholder="Digite o hash-api"
                  className="w-full px-4 py-2 border border-cw-border-light rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors"
                />
              </div>

              <div className="pt-4 mt-4 border-t border-cw-border-light">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={directTicketCreation}
                    onChange={(e) => setDirectTicketCreation(e.target.checked)}
                    className="w-5 h-5 text-primary rounded border-cw-border-light focus:ring-primary"
                  />
                  <div>
                    <span className="block text-sm font-medium text-gray-900">
                      Abertura de Chamado Direta
                    </span>
                    <span className="block text-sm text-gray-500">
                      Quando ativo, solicitações de novo atendimento abrem um chamado diretamente no sistema e retornam o protocolo.
                    </span>
                  </div>
                </label>
              </div>
            </div>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" variant="primary" isLoading={isSaving} size="lg">
              <Save className="w-5 h-5 mr-2" />
              Salvar Integrações
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
};
