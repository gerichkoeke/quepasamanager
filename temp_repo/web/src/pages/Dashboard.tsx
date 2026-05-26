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
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header section - WAHA / technical style */}
        <header className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h1 className="text-2xl font-normal text-gray-800 dark:text-white tracking-tight">Visão Geral</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Status da API WAHA / Motor</p>
          </div>
          {metrics && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-sm text-gray-700 dark:text-gray-200">
                <Database className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <span className="font-medium text-gray-900 dark:text-white">{metrics.messages_processed.toLocaleString('pt-BR')}</span> Mensagens
              </div>
              <div className={`flex items-center gap-2 px-3 py-1.5 border rounded text-sm ${metrics.rabbitmq_connected ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800'}`}>
                <div className={`w-2 h-2 rounded-full ${metrics.rabbitmq_connected ? 'bg-green-500' : 'bg-red-500'}`} />
                RabbitMQ
              </div>
            </div>
          )}
        </header>

        {/* Core Metrics Grid - Material Design / Admin style */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded shadow-sm border border-gray-200 dark:border-gray-700 border-t-4 border-t-blue-500 flex flex-col justify-between h-32">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Instâncias WhatsApp</h3>
            <div className="flex items-end justify-between mt-auto">
              <p className="text-4xl font-light text-gray-800 dark:text-white">{metrics?.instances?.quepasa_active || 0}</p>
              <Smartphone className="w-8 h-8 text-blue-500/20 dark:text-blue-400/20" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded shadow-sm border border-gray-200 dark:border-gray-700 border-t-4 border-t-indigo-500 flex flex-col justify-between h-32">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Caixas Chatwoot</h3>
            <div className="flex items-end justify-between mt-auto">
              <p className="text-4xl font-light text-gray-800 dark:text-white">{metrics?.instances?.chatwoot_connections || 0}</p>
              <MessageCircle className="w-8 h-8 text-indigo-500/20 dark:text-indigo-400/20" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded shadow-sm border border-gray-200 dark:border-gray-700 border-t-4 border-t-purple-500 flex flex-col justify-between h-32">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Sessões de Bot Ativas</h3>
            <div className="flex items-end justify-between mt-auto">
              <p className="text-4xl font-light text-gray-800 dark:text-white">{metrics?.active_bots || 0}</p>
              <Bot className="w-8 h-8 text-purple-500/20 dark:text-purple-400/20" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded shadow-sm border border-gray-200 dark:border-gray-700 border-t-4 border-t-emerald-500 flex flex-col justify-between h-32">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Eventos (24h)</h3>
            <div className="flex items-end justify-between mt-auto">
              <p className="text-4xl font-light text-gray-800 dark:text-white">{metrics?.recent_events_count || 0}</p>
              <Activity className="w-8 h-8 text-emerald-500/20 dark:text-emerald-400/20" />
            </div>
          </div>
        </div>

        {/* Data Lists - Table style like React Admin */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-8">
          {/* Top Sessions */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex items-center justify-between">
               <h3 className="text-sm font-medium text-gray-800 dark:text-gray-200">Principais Sessões / Interações</h3>
               <TrendingUp className="w-4 h-4 text-gray-400" />
            </div>
            <div>
              {!metrics?.topSessions || metrics.topSessions.length === 0 ? (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400 text-sm">Nenhum dado disponível.</div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
                       <th className="font-medium px-4 py-2">ID</th>
                       <th className="font-medium px-4 py-2 text-right">Eventos</th>
                       <th className="font-medium px-4 py-2 w-24">Atividade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.topSessions.map((session) => (
                      <tr key={session.sessionId} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 last:border-0">
                        <td className="px-4 py-2 text-sm font-mono text-gray-700 dark:text-gray-300 truncate max-w-[200px]">{session.sessionId}</td>
                        <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 text-right">{session.eventCount}</td>
                        <td className="px-4 py-2">
                           <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-700 rounded-sm overflow-hidden">
                             <div className="bg-blue-500 h-full" style={{ width: `${(session.eventCount / metrics.topSessions[0].eventCount) * 100}%` }} />
                           </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex items-center justify-between">
               <h3 className="text-sm font-medium text-gray-800 dark:text-gray-200">Logs Recentes</h3>
               <Activity className="w-4 h-4 text-gray-400" />
            </div>
            <div>
              {!metrics?.recent_activity || metrics.recent_activity.length === 0 ? (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400 text-sm">Nenhum dado disponível.</div>
              ) : (
                <ul className="divide-y divide-gray-100 dark:divide-gray-700">
                  {metrics.recent_activity.map((activity) => {
                    const isIncoming = activity.event_type.includes('Entrada');
                    return (
                      <li key={activity.id} className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                         <div className={`mt-1 flex-shrink-0 w-2 h-2 rounded-full ${isIncoming ? 'bg-green-500' : 'bg-blue-500'}`} />
                         <div className="flex-1 min-w-0">
                           <p className="text-sm text-gray-800 dark:text-gray-200">
                             <span className="font-medium">{isIncoming ? 'IN' : 'OUT'}</span>
                             <span className="text-gray-400 dark:text-gray-500 mx-2">|</span>
                             {activity.event_type.split(' - ')[1]}
                           </p>
                           <p className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-1 truncate">{activity.session_name}</p>
                         </div>
                         <div className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
                           {formatTimestamp(activity.timestamp).split(' ')[1]}
                         </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};
