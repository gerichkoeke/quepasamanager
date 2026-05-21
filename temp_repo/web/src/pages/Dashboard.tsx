import React, { useEffect, useState } from 'react';
import { Activity, MessageSquare, TrendingUp, Share2, Server, MessageCircle, Smartphone, Bot, Database } from 'lucide-react';
import { Layout } from '../components/Layout';
import { api } from '../services/api';
import { Metrics } from '../types';
import toast from 'react-hot-toast';

export const Dashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      setIsLoading(true);
      const data = await api.getMetrics();
      setMetrics(data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Falha ao carregar métricas');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('pt-BR');
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[80vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 font-medium">Carregando painel...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
        <header className="flex flex-col md:flex-row md:items-end justify-between border-b pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Visão Geral</h1>
            <p className="text-gray-500 mt-2">Métricas e performance das suas integrações do WhatsApp</p>
          </div>
          {metrics && (
            <div className="mt-4 md:mt-0 flex items-center gap-3">
              <span className="flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">
                <Database className="w-4 h-4 text-gray-500" />
                {metrics.messages_processed.toLocaleString('pt-BR')} Mensagens
              </span>
              <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${metrics.rabbitmq_connected ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                <Share2 className="w-4 h-4" />
                RabbitMQ {metrics.rabbitmq_connected ? 'Operante' : 'Falha'}
              </span>
            </div>
          )}
        </header>

        {/* Primary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Conexões WhatsApp</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-2">{metrics?.instances?.quepasa_active || 0}</h3>
              </div>
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                <Smartphone className="w-6 h-6" />
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-4 leading-tight">Instâncias do WhatsApp ativas e conectadas</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Caixas Chatwoot</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-2">{metrics?.instances?.chatwoot_connections || 0}</h3>
              </div>
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <MessageCircle className="w-6 h-6" />
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-4 leading-tight">Caixas de entrada integradas e redirecionando</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Sessões Bot Nativo</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-2">{metrics?.total_sessions || 0}</h3>
              </div>
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                <Bot className="w-6 h-6" />
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-4 leading-tight">Usuários atualmente interagindo com menus</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Eventos (24h)</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-2">{metrics?.recent_events_count || 0}</h3>
              </div>
              <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                <Activity className="w-6 h-6" />
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-4 leading-tight">Volume de tráfego processado recentemente</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Sessions */}
          <div className="bg-white border rounded-2xl shadow-sm overflow-hidden flex flex-col">
            <div className="px-6 py-5 border-b bg-gray-50/50">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-gray-400" />
                Usuários mais Ativos
              </h3>
            </div>
            <div className="p-0 flex-1">
              {!metrics?.topSessions || metrics.topSessions.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 text-gray-400">
                  <MessageSquare className="w-10 h-10 mb-3 opacity-20" />
                  <p className="text-sm">Nenhum histórico recente</p>
                </div>
              ) : (
                <div className="divide-y">
                  {metrics.topSessions.map((session, index) => (
                    <div key={session.sessionId} className="flex items-center justify-between p-4 px-6 hover:bg-gray-50 transition-colors group">
                      <div className="flex items-center gap-4">
                        <span className="text-xs font-bold text-gray-300 w-4 text-right">{index + 1}</span>
                        <div>
                          <p className="text-sm font-semibold text-gray-900 font-mono">{session.sessionId}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                          {session.eventCount} interações
                        </span>
                        <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="bg-indigo-500 h-full rounded-full transition-all duration-1000"
                            style={{ width: `${(session.eventCount / metrics.topSessions[0].eventCount) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white border rounded-2xl shadow-sm overflow-hidden flex flex-col">
            <div className="px-6 py-5 border-b bg-gray-50/50">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Activity className="w-5 h-5 text-gray-400" />
                Atividade Recente (Logs)
              </h3>
            </div>
            <div className="p-0 flex-1">
              {!metrics?.recent_activity || metrics.recent_activity.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 text-gray-400">
                  <Server className="w-10 h-10 mb-3 opacity-20" />
                  <p className="text-sm">Nenhuma atividade detectada</p>
                </div>
              ) : (
                <div className="divide-y relative">
                  <div className="absolute left-10 top-0 bottom-0 w-px bg-gray-100 z-0"></div>
                  {metrics.recent_activity.map((activity) => {
                    const isIncoming = activity.event_type.includes('Entrada');
                    return (
                      <div key={activity.id} className="flex items-center p-4 px-6 hover:bg-gray-50 transition-colors relative z-10 group">
                         <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ring-4 ring-white ${isIncoming ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
                           {isIncoming ? (
                             <MessageSquare className="w-4 h-4 translate-y-px" />
                           ) : (
                             <Share2 className="w-4 h-4 -translate-y-px" />
                           )}
                         </div>
                         <div className="ml-4 flex-1">
                           <p className="text-sm font-medium text-gray-900">{isIncoming ? 'Recebida' : 'Enviada'} <span className="font-normal text-gray-500">via</span> {activity.event_type.split(' - ')[1]}</p>
                           <p className="text-xs text-gray-500 mt-0.5 font-mono">{activity.session_name}</p>
                         </div>
                         <div className="text-xs font-medium text-gray-400">
                           {formatTimestamp(activity.timestamp).split(' ')[1]}
                         </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};
