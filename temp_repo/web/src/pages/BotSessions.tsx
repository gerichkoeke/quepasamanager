import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '../services/api';
import { Play, Pause, Trash2, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { Layout } from '../components/Layout';
import { Button } from '../components/Button';

export const BotSessions: React.FC = () => {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSessions = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const data = await api.getBotSessions();
      setSessions(data);
    } catch (error: any) {
      if (!silent) toast.error('Falha ao carregar sessões do bot');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente encerrar esta sessão (deletar do banco)? O bot voltará ao estado inicial na próxima mensagem deste usuário.')) return;
    try {
      await api.deleteBotSession(id);
      toast.success('Sessão deletada com sucesso');
      loadSessions(true);
    } catch (error) {
      toast.error('Falha ao deletar sessão');
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
              Sessões do Bot
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Acompanhe e gerencie o estado dos usuários no bot nativo e typebot
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Button
              variant="secondary"
              onClick={() => loadSessions()}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-medium">
                  <th className="p-4">Tipo</th>
                  <th className="p-4">Número (Usuário)</th>
                  <th className="p-4">Conexão ID</th>
                  <th className="p-4">Estado</th>
                  <th className="p-4">Última Atualização</th>
                  <th className="p-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-100">
                {sessions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-500">
                      Nenhuma sessão de bot encontrada.
                    </td>
                  </tr>
                ) : (
                  sessions.map((session) => (
                    <tr key={session.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 font-medium text-gray-500">
                         {session.botType === 'typebot' ? 'Typebot' : 'Nativo'}
                      </td>
                      <td className="p-4 font-medium text-gray-900">{session.phone}</td>
                      <td className="p-4 text-gray-600 truncate max-w-[150px]" title={session.quepasaMappingId}>
                        {session.quepasaMappingId}
                      </td>
                      <td className="p-4">
                        {session.state === 'paused' ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                            <Pause className="w-3.5 h-3.5" />
                            Com Humano (Pausado)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                            <Play className="w-3.5 h-3.5" />
                            No Bot (Em Andamento)
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-gray-500">
                        {format(new Date(session.updatedAt), 'dd/MM/yyyy HH:mm:ss')}
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleDelete(session.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors inline-block"
                          title="Encerrar/Deletar sessão"
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
        </div>
      </div>
    </Layout>
  );
};
