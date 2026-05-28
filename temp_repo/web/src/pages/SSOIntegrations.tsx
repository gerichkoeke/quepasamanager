import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Shield, Save, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export const SSOIntegrations: React.FC = () => {
  const [ssoConfig, setSsoConfig] = useState({
    enabled: false,
    provider: 'keycloak',
    entryPoint: '',
    issuer: '',
    cert: '',
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simular carregamento das configs
    setTimeout(() => {
       const saved = localStorage.getItem('sso_config');
       if (saved) {
         setSsoConfig(JSON.parse(saved));
       }
       setIsLoading(false);
    }, 500);
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      // Simular save API
      await new Promise(resolve => setTimeout(resolve, 800));
      localStorage.setItem('sso_config', JSON.stringify(ssoConfig));
      toast.success('Configurações de SSO salvas com sucesso');
    } catch (error) {
      toast.error('Erro ao salvar configurações de SSO');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (field: string, value: string | boolean) => {
    setSsoConfig(prev => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Autenticação SSO / SAML</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Configure o login único (Single Sign-On) integrado com seu Active Directory (via Keycloak)</p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <Card title={<div className="flex items-center gap-2"><Shield className="w-5 h-5 text-indigo-500" /> Provedor de Identidade</div>}>
            <div className="space-y-6">
              
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Ativar SSO (SAML)</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Permite que os usuários façam login usando as credenciais da rede</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={ssoConfig.enabled}
                    onChange={(e) => handleChange('enabled', e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 dark:peer-focus:ring-primary/80 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                </label>
              </div>

              {ssoConfig.enabled && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Provedor
                    </label>
                    <select
                      value={ssoConfig.provider}
                      onChange={(e) => handleChange('provider', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors dark:bg-gray-700 dark:text-white"
                    >
                      <option value="keycloak">Keycloak</option>
                      <option value="custom">Outro (Custom SAML)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      URL de Login do Provedor de Identidade (Single Sign-On Service URL)
                    </label>
                    <input
                      type="url"
                      value={ssoConfig.entryPoint}
                      onChange={(e) => handleChange('entryPoint', e.target.value)}
                      placeholder="https://keycloak.suaempresa.com.br/realms/master/protocol/saml"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Emissor do Provedor de Identidade (Entity ID)
                    </label>
                    <input
                      type="text"
                      value={ssoConfig.issuer}
                      onChange={(e) => handleChange('issuer', e.target.value)}
                      placeholder="https://keycloak.suaempresa.com.br/realms/master"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Certificado Público X.509
                    </label>
                    <textarea
                      value={ssoConfig.cert}
                      onChange={(e) => handleChange('cert', e.target.value)}
                      placeholder="-----BEGIN CERTIFICATE-----...-----END CERTIFICATE-----"
                      rows={6}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors dark:bg-gray-700 dark:text-white font-mono text-xs"
                    />
                  </div>
                  
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
                     <p className="text-sm text-blue-800 dark:text-blue-300 flex gap-2">
                       <CheckCircle className="w-5 h-5 flex-shrink-0" />
                       Após salvar o certificado e URL, ao acessar a página de login, o sistema identificará que o SSO está ativo e permitirá a autenticação direcionada para o formato do Chatwoot com os usuários do seu AD.
                     </p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" variant="primary" isLoading={isSaving} size="lg">
              <Save className="w-5 h-5 mr-2" />
              Salvar Configurações
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
};
