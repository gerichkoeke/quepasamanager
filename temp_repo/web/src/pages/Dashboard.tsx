import React, { useEffect, useState } from 'react';
import { Activity, TrendingUp, MessageCircle, Smartphone, Bot, Database } from 'lucide-react';
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
      <div className="max-w-[1400px] mx-auto space-y-8 pb-12 animate-in fade-in duration-500">
        
        {/* Header section - clean & minimal */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Dashboard Central</h1>
            <p className="text-sm text-gray-500 mt-1">Visão geral e saúde das integrações (últimas 24h)</p>
          </div>
          {metrics && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 shadow-sm">
                <Database className="w-4 h-4 text-gray-400" />
                <span className="font-medium text-gray-900">{metrics.messages_processed.toLocaleString('pt-BR')}</span> Msg Processadas
              </div>
              <div className={`flex items-center gap-2 px-3 py-1.5 border rounded-lg text-sm shadow-sm ${metrics.rabbitmq_connected ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                <div className={`w-2 h-2 rounded-full ${metrics.rabbitmq_connected ? 'bg-emerald-500' : 'bg-red-500'}`} />
                RabbitMQ {metrics.rabbitmq_connected ? 'Online' : 'Offline'}
              </div>
            </div>
          )}
        </header>

        {/* Core Metrics Grid - Removed heavy styling, more subtle */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)]">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <Smartphone className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-medium text-gray-600">Instâncias WhatsApp</h3>
            </div>
            <p className="text-3xl font-semibold text-gray-900">{metrics?.instances?.quepasa_active || 0}</p>
            <p className="text-xs text-gray-400 mt-2 font-medium uppercase tracking-wider">Ativas e Conectadas</p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)]">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                <MessageCircle className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-medium text-gray-600">Caixas Chatwoot</h3>
            </div>
            <p className="text-3xl font-semibold text-gray-900">{metrics?.instances?.chatwoot_connections || 0}</p>
            <p className="text-xs text-gray-400 mt-2 font-medium uppercase tracking-wider">Redirecionando Fluxo</p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)]">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                <Bot className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-medium text-gray-600">Sessões Bots (Ativas)</h3>
            </div>
            <p className="text-3xl font-semibold text-gray-900">{metrics?.active_bots || 0}</p>
            <p className="text-xs text-gray-400 mt-2 font-medium uppercase tracking-wider">Ocupação Atual Menus</p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)]">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-medium text-gray-600">Eventos Hoje</h3>
            </div>
            <p className="text-3xl font-semibold text-gray-900">{metrics?.recent_events_count || 0}</p>
            <p className="text-xs text-gray-400 mt-2 font-medium uppercase tracking-wider">Últimas 24 Horas</p>
          </div>
        </div>

        {/* Data Lists - Cleaner tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Sessions */}
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100/60 bg-gray-50/50 flex items-center gap-2">
               <TrendingUp className="w-4 h-4 text-gray-400" />
               <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Top Interações</h3>
            </div>
            <div className="p-0">
              {!metrics?.topSessions || metrics.topSessions.length === 0 ? (
                <div className="p-10 text-center text-gray-400 text-sm">Nenhum evento processado.</div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {metrics.topSessions.map((session, index) => (
                    <div key={session.sessionId} className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50/50 group">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono text-gray-400 w-4">{index + 1}.</span>
                        <p className="text-sm font-medium text-gray-800 font-mono truncate max-w-[200px] sm:max-w-xs">{session.sessionId}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-md">
                          {session.eventCount} evt
                        </span>
                        <div className="w-16 sm:w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="bg-blue-500 h-full rounded-full"
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
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100/60 bg-gray-50/50 flex items-center gap-2">
               <Activity className="w-4 h-4 text-gray-400" />
               <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Últimos Registros (Logs)</h3>
            </div>
            <div className="p-0">
              {!metrics?.recent_activity || metrics.recent_activity.length === 0 ? (
                <div className="p-10 text-center text-gray-400 text-sm">Sem rastros recentes.</div>
              ) : (
                <div className="divide-y divide-gray-50 relative">
                  {metrics.recent_activity.map((activity) => {
                    const isIncoming = activity.event_type.includes('Entrada');
                    return (
                      <div key={activity.id} className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50/50">
                         <div className={`w-2 h-2 rounded-full shrink-0 ${isIncoming ? 'bg-emerald-500' : 'bg-blue-500'}`} />
                         <div className="flex-1 min-w-0">
                           <p className="text-sm text-gray-800 truncate">
                             <span className="font-medium">{isIncoming ? 'Recebida' : 'Enviada'}</span> 
                             <span className="text-gray-400 mx-1">via</span> 
                             {activity.event_type.split(' - ')[1]}
                           </p>
                           <p className="text-xs text-gray-400 font-mono mt-0.5 truncate">{activity.session_name}</p>
                         </div>
                         <div className="text-xs font-medium text-gray-500 shrink-0">
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
