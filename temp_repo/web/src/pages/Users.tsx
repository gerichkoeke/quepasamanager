import React, { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Plus, Trash, Shield, ShieldAlert, QrCode } from 'lucide-react';
import { api } from '../services/api';
import toast from 'react-hot-toast';
import { QRCodeSVG } from 'qrcode.react';

const AVAILABLE_MODULES = [
  { id: 'all', name: 'Acesso Total (Administrador)' },
  { id: 'instancias', name: 'Instâncias WhatsApp' },
  { id: 'disparador', name: 'Disparador de Mensagens' },
  { id: 'sessoes_bot', name: 'Sessões Bot' },
  { id: 'logs', name: 'Visualizar Logs' },
  { id: 'integracoes', name: 'Gerenciar Integrações' },
  { id: 'sso', name: 'SSO / Keycloak' },
  { id: 'configuracoes', name: 'Configurações do Sistema' },
];

export const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  // Form states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedModules, setSelectedModules] = useState<string[]>(['instancias']);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const data = await api.getUsers();
      setUsers(data);
    } catch (err) {
      toast.error('Erro ao carregar usuários');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (user?: any) => {
    if (user) {
      setEditingUserId(user.id);
      setUsername(user.username);
      setPassword(''); // keep blank unless changing
      setSelectedModules(user.modules || []);
    } else {
      setEditingUserId(null);
      setUsername('');
      setPassword('');
      setSelectedModules(['instancias']);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return toast.error('Usuário é obrigatório');
    if (!editingUserId && (!password || password.length < 6)) return toast.error('Senha deve ter pelo menos 6 caracteres');

    try {
      if (editingUserId) {
        const updateData: any = { username, modules: selectedModules };
        if (password) updateData.password = password;
        await api.updateUser(editingUserId, updateData);
        toast.success('Usuário atualizado');
      } else {
        await api.createUser({ username, password, modules: selectedModules });
        toast.success('Usuário criado com sucesso');
      }
      setShowModal(false);
      loadUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao salvar usuário');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(\`Tem certeza que deseja excluir o usuário \${name}?\`)) return;
    try {
      await api.deleteUser(id);
      toast.success('Usuário excluído');
      loadUsers();
    } catch (err) {
      toast.error('Erro ao excluir usuário');
    }
  };

  const handleToggleModule = (modId: string) => {
    if (modId === 'all') {
      if (selectedModules.includes('all')) {
        setSelectedModules([]);
      } else {
        setSelectedModules(['all']); // if toggling into ALL, just set to ALL
      }
      return;
    }

    // if a normal module is selected, remove "all"
    let updated = selectedModules.filter(m => m !== 'all');
    if (updated.includes(modId)) {
      updated = updated.filter(m => m !== modId);
    } else {
      updated.push(modId);
    }
    setSelectedModules(updated);
  };

  const [mfaData, setMfaData] = useState<{userId: string, qr: string, secret: string} | null>(null);
  const [mfaCodeInput, setMfaCodeInput] = useState('');

  const handleGenerateMfa = async (user: any) => {
    try {
      const data = await api.generateUserMfa(user.id);
      setMfaData({ userId: user.id, qr: data.otpauth, secret: data.secret });
      setMfaCodeInput('');
    } catch {
      toast.error('Erro ao gerar MFA');
    }
  };

  const handleConfirmMfa = async () => {
    if (!mfaData || mfaCodeInput.length < 6) return;
    try {
      await api.enableUserMfa(mfaData.userId, { token: mfaCodeInput });
      toast.success('MFA habilitado para este usuário');
      setMfaData(null);
      loadUsers();
    } catch(err: any) {
      toast.error(err.response?.data?.error || 'Token inválido');
    }
  };

  const handleDisableMfa = async (user: any) => {
    if (!window.confirm(`Desativar o MFA para ${user.username}?`)) return;
    try {
      await api.disableUserMfa(user.id);
      toast.success('MFA desativado');
      loadUsers();
    } catch {
      toast.error('Erro ao desativar MFA');
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              Usuários
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Gerencie quem tem acesso ao painel e quais módulos podem acessar.
            </p>
          </div>
          <Button variant="primary" onClick={() => handleOpenModal()}>
            <Plus className="w-5 h-5 mr-2" />
            Novo Usuário
          </Button>
        </div>

        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-800 dark:text-gray-300">
                <tr>
                  <th className="px-4 py-3">Usuário</th>
                  <th className="px-4 py-3">Módulos de Acesso</th>
                  <th className="px-4 py-3">MFA</th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                      {user.username}
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                      {user.modules.includes('all') ? (
                        <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-medium">Acesso Total</span>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {user.modules.map((m: string) => {
                            const mod = AVAILABLE_MODULES.find(am => am.id === m);
                            return mod ? <span key={m} className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded text-xs">{mod.name}</span> : null;
                          })}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                       {user.mfaEnabled ? (
                         <div className="flex items-center gap-3">
                           <span className="flex items-center gap-1 text-green-600"><Shield className="w-4 h-4"/> Habilitado</span>
                           <Button variant="ghost" size="sm" onClick={() => handleDisableMfa(user)} className="text-red-500 hover:text-red-700">Desativar</Button>
                         </div>
                       ) : (
                         <div className="flex items-center gap-3">
                           <span className="flex items-center gap-1 text-gray-400"><ShieldAlert className="w-4 h-4"/> Não</span>
                           <Button variant="ghost" size="sm" onClick={() => handleGenerateMfa(user)} className="text-primary hover:bg-primary/10">
                             <QrCode className="w-4 h-4 mr-1" />
                             Configurar
                           </Button>
                         </div>
                       )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="secondary" size="sm" onClick={() => handleOpenModal(user)}>
                          Editar
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => handleDelete(user.id, user.username)}>
                          <Trash className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && !isLoading && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                      Nenhum usuário cadastrado. Use as configurações locais para o admin padrão.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 animate-in fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  {editingUserId ? 'Editar Usuário' : 'Novo Usuário'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Usuário (Login)
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors dark:bg-gray-700 dark:text-white"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Senha {editingUserId && '(Deixe em branco para não alterar)'}
                    </label>
                    <input
                      type="password"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors dark:bg-gray-700 dark:text-white"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required={!editingUserId}
                      minLength={editingUserId ? 0 : 6}
                    />
                  </div>
                  
                  <div>
                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 mt-4 border-t dark:border-gray-700 pt-4">
                        Módulos de Acesso permitidos
                     </label>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {AVAILABLE_MODULES.map(mod => (
                           <label key={mod.id} className="flex items-center gap-2 text-sm text-gray-800 dark:text-gray-200 cursor-pointer p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700/50">
                             <input 
                               type="checkbox" 
                               checked={selectedModules.includes('all') ? true : selectedModules.includes(mod.id)}
                               disabled={selectedModules.includes('all') && mod.id !== 'all'}
                               onChange={() => handleToggleModule(mod.id)}
                               className="rounded border-gray-300 text-primary focus:ring-primary"
                             />
                             {mod.name}
                           </label>
                        ))}
                     </div>
                  </div>

                  <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <Button type="button" variant="ghost" onClick={handleCloseModal}>
                      Cancelar
                    </Button>
                    <Button type="submit" variant="primary">
                      {editingUserId ? 'Salvar Alterações' : 'Criar Usuário'}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {mfaData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 animate-in fade-in">
             <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full">
                <div className="p-6 text-center">
                   <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Configurar MFA (2FA)</h2>
                   <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                      Peça para o usuário escanear este QR Code com o aplicativo Google Authenticator ou Authy.
                   </p>
                   <div className="flex justify-center mb-6 bg-white p-4 rounded-lg inline-block">
                     <QRCodeSVG value={mfaData.qr} size={200} />
                   </div>
                   <p className="text-sm font-mono bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 p-2 rounded mb-6 select-all">
                     {mfaData.secret}
                   </p>
                   
                   <div className="space-y-4 text-left">
                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Insira o código de 6 dígitos gerado no app para confirmar:
                     </label>
                     <input
                       type="text"
                       placeholder="000000"
                       className="w-full px-4 py-2 text-center tracking-widest text-lg border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary outline-none bg-transparent"
                       value={mfaCodeInput}
                       onChange={(e) => setMfaCodeInput(e.target.value.replace(/\D/g, '').slice(0,6))}
                     />
                     <div className="flex justify-end gap-2 pt-4">
                        <Button variant="ghost" onClick={() => setMfaData(null)}>Cancelar</Button>
                        <Button variant="primary" onClick={handleConfirmMfa} disabled={mfaCodeInput.length !== 6}>Verificar e Habilitar</Button>
                     </div>
                   </div>
                </div>
             </div>
          </div>
        )}

      </div>
    </Layout>
  );
};
