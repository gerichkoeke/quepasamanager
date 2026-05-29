import React, { useEffect, useState } from 'react';
import { Save, ShieldCheck, ShieldAlert } from 'lucide-react';
import { Layout } from '../components/Layout';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { api } from '../services/api';
import { Settings as SettingsType } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import toast from 'react-hot-toast';
import { QRCodeSVG } from 'qrcode.react';

export const Settings: React.FC = () => {
  const { companyName, setCompanyName, logoUrl, setLogoUrl } = useTheme();

  const [localCompanyName, setLocalCompanyName] = useState(companyName);
  const [localLogoUrl, setLocalLogoUrl] = useState(logoUrl);

  const [settings, setSettings] = useState<SettingsType>({
    quepasa_url: '',
    quepasa_user: '',
    quepasa_password: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [authConfig, setAuthConfig] = useState({ configured: false, mfaEnabled: false });
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [mfaSecret, setMfaSecret] = useState('');
  const [mfaQrUrl, setMfaQrUrl] = useState('');
  const [mfaTokenInput, setMfaTokenInput] = useState('');
  const [isGeneratingMfa, setIsGeneratingMfa] = useState(false);
  const [isEnablingMfa, setIsEnablingMfa] = useState(false);

  useEffect(() => {
    loadSettings();
    loadAuthConfig();
  }, []);

  const loadAuthConfig = async () => {
    try {
      const config = await api.getLocalAuthConfig();
      setAuthConfig(config);
    } catch (error) {
      console.error('Failed to load local auth config', error);
    }
  };

  const handleSaveAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminUsername && !adminPassword) {
      return toast.error('Preencha um usuário ou senha para salvar.');
    }
    try {
      await api.setupLocalAuth({ username: adminUsername, password: adminPassword });
      toast.success('Credenciais locais atualizadas');
      setAdminPassword('');
      loadAuthConfig();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao salvar credenciais locais');
    }
  };

  const handleGenerateMfa = async () => {
    try {
      setIsGeneratingMfa(true);
      const data = await api.generateMfa();
      setMfaSecret(data.secret);
      setMfaQrUrl(data.otpauth);
    } catch (e: any) {
      toast.error('Erro ao gerar MFA');
    } finally {
      setIsGeneratingMfa(false);
    }
  };

  const handleEnableMfa = async () => {
    if (!mfaTokenInput || !mfaSecret) return;
    try {
      setIsEnablingMfa(true);
      const res = await api.enableMfa({ secret: mfaSecret, token: mfaTokenInput });
      if (res.success) {
        toast.success('MFA ativado com sucesso!');
        setMfaSecret('');
        setMfaQrUrl('');
        setMfaTokenInput('');
        loadAuthConfig();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Token inválido');
    } finally {
      setIsEnablingMfa(false);
    }
  };

  const handleDisableMfa = async () => {
    if (!window.confirm('Tem certeza que deseja desativar a verificação em duas etapas?')) return;
    try {
      await api.disableMfa();
      toast.success('MFA desativado');
      loadAuthConfig();
    } catch (error) {
      toast.error('Erro ao desativar MFA');
    }
  };

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const data = await api.getSettings();

      // Check if quepasa password exists
      const quepasaPasswordExists = !!data.quepasa_url && data.quepasa_password === '';
      setHasQuepasaPassword(quepasaPasswordExists);

      // Show placeholder bullets if keys exist
      const maskedSettings = { ...data };
      if (quepasaPasswordExists) {
        maskedSettings.quepasa_password = '••••••••••••••••';
      }

      setSettings(maskedSettings);
      setIsEditingQuepasaPassword(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Falha ao carregar configurações');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);

      // Only send fields that have values (don't send empty strings to preserve existing values)
      const settingsToSave: Partial<SettingsType> = {};

      // Quepasa fields
      if (settings.quepasa_url) settingsToSave.quepasa_url = settings.quepasa_url;
      if (settings.quepasa_user) settingsToSave.quepasa_user = settings.quepasa_user;
      if (settings.quepasa_password && settings.quepasa_password !== '••••••••••••••••' && isEditingQuepasaPassword) {
        settingsToSave.quepasa_password = settings.quepasa_password;
      }

      // Whitelabel fields
      if (localCompanyName) setCompanyName(localCompanyName);
      if (localLogoUrl) setLogoUrl(localLogoUrl);

      await api.updateSettings(settingsToSave as SettingsType);
      toast.success('Configurações salvas com sucesso');

      // Update flags if we just saved passwords
      if (settingsToSave.quepasa_password) {
        setHasQuepasaPassword(true);
      }

      // Reload to show placeholder bullets again
      await loadSettings();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Falha ao salvar configurações');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (field: keyof SettingsType, value: string) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleQuepasaPasswordFocus = () => {
    // Clear placeholder when user focuses on the field
    if (hasQuepasaPassword && settings.quepasa_password === '••••••••••••••••') {
      setSettings((prev) => ({ ...prev, quepasa_password: '' }));
    }
    setIsEditingQuepasaPassword(true);
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
          <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
          <p className="text-gray-600 mt-1">Configure sua conexão Quepasa</p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Whitelabel Settings */}
          <Card title="Configurações de Whitelabel (Aparência)">
            <div className="space-y-4">
              <div>
                <label htmlFor="company_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nome da Empresa / Plataforma
                </label>
                <input
                  id="company_name"
                  type="text"
                  value={localCompanyName}
                  onChange={(e) => setLocalCompanyName(e.target.value)}
                  placeholder="Ex: Minha Empresa"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label htmlFor="logo_url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  URL da Logo
                </label>
                <input
                  id="logo_url"
                  type="text"
                  value={localLogoUrl}
                  onChange={(e) => setLocalLogoUrl(e.target.value)}
                  placeholder="/logoastra.png ou https://..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          </Card>

          {/* Access / Security Settings */}
          <Card title="Acesso Local e Segurança (Opcional)">
            <div className="space-y-6">
               <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg flex items-start gap-3">
                 <ShieldCheck className="w-6 h-6 text-blue-600 dark:text-blue-400 mt-1" />
                 <div>
                   <h3 className="text-sm font-medium text-blue-900 dark:text-blue-300">Autenticação Local</h3>
                   <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                     Você pode definir um nome de usuário e senha para logar sem precisar digitar o Token API.
                     {authConfig.configured && ' Uma conta local já está configurada.'}
                   </p>
                 </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Novo Usuário</label>
                   <input
                     type="text"
                     placeholder={authConfig.configured ? "Atualizar usuário" : "admin"}
                     value={adminUsername}
                     onChange={(e) => setAdminUsername(e.target.value)}
                     className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors dark:bg-gray-700 dark:text-white"
                   />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nova Senha</label>
                   <input
                     type="password"
                     placeholder="Sua senha secreta"
                     value={adminPassword}
                     onChange={(e) => setAdminPassword(e.target.value)}
                     className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors dark:bg-gray-700 dark:text-white"
                   />
                 </div>
               </div>
               <div className="flex justify-end">
                 <Button type="button" variant="secondary" onClick={handleSaveAuth}>
                   Salvar Credenciais
                 </Button>
               </div>

               {/* MFA Integration */}
               {authConfig.configured && (
                 <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-4">
                      Verificação em duas etapas (MFA)
                    </h3>
                    
                    {authConfig.mfaEnabled ? (
                      <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg flex items-center justify-between">
                         <div className="flex items-center gap-3">
                           <ShieldCheck className="w-6 h-6 text-green-600 dark:text-green-400" />
                           <span className="text-green-800 dark:text-green-300 font-medium">MFA Habilitado</span>
                         </div>
                         <Button variant="danger" size="sm" onClick={handleDisableMfa}>
                           Desativar
                         </Button>
                      </div>
                    ) : (
                      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                        {!mfaSecret ? (
                          <div className="flex items-center justify-between">
                             <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                               <ShieldAlert className="w-6 h-6" />
                               <span>MFA não está habilitado</span>
                             </div>
                             <Button variant="outline" size="sm" onClick={handleGenerateMfa} disabled={isGeneratingMfa}>
                               Configurar MFA
                             </Button>
                          </div>
                        ) : (
                          <div className="space-y-4">
                             <p className="text-sm text-gray-600 dark:text-gray-400">
                               Escaneie o QR Code abaixo com seu aplicativo (Google Authenticator, Authy):
                             </p>
                             <div className="bg-white p-4 rounded inline-block">
                                <QRCodeSVG value={mfaQrUrl} size={150} />
                             </div>
                             <div className="max-w-xs">
                               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Código de Verificação</label>
                               <div className="flex gap-2">
                                 <input
                                   type="text"
                                   placeholder="000000"
                                   value={mfaTokenInput}
                                   onChange={(e) => setMfaTokenInput(e.target.value)}
                                   maxLength={6}
                                   className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors dark:bg-gray-700 dark:text-white"
                                 />
                                 <Button variant="primary" onClick={handleEnableMfa} disabled={isEnablingMfa || mfaTokenInput.length < 6}>
                                   Ativar
                                 </Button>
                               </div>
                             </div>
                          </div>
                        )}
                      </div>
                    )}
                 </div>
               )}
            </div>
          </Card>

          {/* Quepasa Settings */}
          <Card title="Configuração Quepasa">
            <div className="space-y-4">
              <div>
                <label htmlFor="quepasa_url" className="block text-sm font-medium text-gray-700 mb-2">
                  URL Base Quepasa
                </label>
                <input
                  id="quepasa_url"
                  type="url"
                  value={settings.quepasa_url || ''}
                  onChange={(e) => handleChange('quepasa_url', e.target.value)}
                  placeholder="https://quepasa.example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors"
                />
                <p className="mt-1 text-sm text-gray-500">
                  URL base da sua instância Quepasa (sem barra no final)
                </p>
              </div>

              <div>
                <label htmlFor="quepasa_user" className="block text-sm font-medium text-gray-700 mb-2">
                  Usuário Quepasa (E-mail)
                </label>
                <input
                  id="quepasa_user"
                  type="email"
                  value={settings.quepasa_user || ''}
                  onChange={(e) => handleChange('quepasa_user', e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors"
                />
                <p className="mt-1 text-sm text-gray-500">
                  E-mail da conta Quepasa responsável pela conexão
                </p>
              </div>

              <div>
                <label htmlFor="quepasa_password" className="block text-sm font-medium text-gray-700 mb-2">
                  Senha Quepasa
                  {hasQuepasaPassword && (
                    <span className="ml-2 text-xs text-green-600 font-normal">
                      ✓ Salva (oculta por segurança)
                    </span>
                  )}
                </label>
                <input
                  id="quepasa_password"
                  type="password"
                  value={settings.quepasa_password || ''}
                  onChange={(e) => handleChange('quepasa_password', e.target.value)}
                  onFocus={handleQuepasaPasswordFocus}
                  placeholder={!hasQuepasaPassword || (hasQuepasaPassword && settings.quepasa_password === '') ? "Digite a Senha Quepasa" : ""}
                  autoComplete="off"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors"
                />
                <p className="mt-1 text-sm text-gray-500">
                  {hasQuepasaPassword
                    ? "Senha salva. Deixe vazio para mantê-la, ou digite uma nova para atualizar."
                    : "Senha da conta Quepasa (X-QUEPASA-PASSWORD)"}
                </p>
              </div>
            </div>
          </Card>

          {/* Save Button */}
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
