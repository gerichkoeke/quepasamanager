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
        
        {/* Header section */}
        <header className="flex flex-col md:flex-row md:items-center justify-between pb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Dashboard</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Gerencie seu ecossistema de comunicações.</p>
          </div>
          {metrics && (
            <div className="flex items-center gap-3 mt-4 md:mt-0">
              <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#15172b] border border-gray-100 dark:border-gray-800 rounded-full text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm">
                <Database className="w-4 h-4 text-primary" />
                <span>{metrics.messages_processed.toLocaleString('pt-BR')} Mensagens</span>
              </div>
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium shadow-sm border ${metrics.rabbitmq_connected ? 'bg-green-50 text-green-700 border-green-100 dark:bg-green-900/20 dark:border-green-800/30' : 'bg-red-50 text-red-700 border-red-100 dark:bg-red-900/20 dark:border-red-800/30'}`}>
                <div className={`w-2 h-2 rounded-full ${metrics.rabbitmq_connected ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500'} animate-pulse`} />
                Serviço de Fila (MQ)
              </div>
            </div>
          )}
        </header>

        {/* Core Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-[#15172b] p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-gray-100 dark:border-gray-800/60 flex flex-col justify-between h-40 transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)]">
            <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Instâncias WhatsApp</h3>
            <div className="flex items-center justify-between mt-auto">
              <p className="text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight">{metrics?.instances?.quepasa_active || 0}</p>
              <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                <Smartphone className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#15172b] p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-gray-100 dark:border-gray-800/60 flex flex-col justify-between h-40 transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)]">
            <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Caixas Chatwoot</h3>
            <div className="flex items-center justify-between mt-auto">
              <p className="text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight">{metrics?.instances?.chatwoot_connections || 0}</p>
              <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-indigo-500" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#15172b] p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-gray-100 dark:border-gray-800/60 flex flex-col justify-between h-40 transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)]">
            <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Sessões de Bot Ativas</h3>
            <div className="flex items-center justify-between mt-auto">
              <p className="text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight">{metrics?.active_bots || 0}</p>
              <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
                <Bot className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#15172b] p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-gray-100 dark:border-gray-800/60 flex flex-col justify-between h-40 transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)]">
            <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Eventos Recentes</h3>
            <div className="flex items-center justify-between mt-auto">
              <p className="text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight">{metrics?.recent_events_count || 0}</p>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                <Activity className="w-6 h-6 text-emerald-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Data Lists */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pb-8 mt-4">
          {/* Top Sessions */}
          <div className="bg-white dark:bg-[#15172b] border border-gray-100 dark:border-gray-800/60 rounded-3xl shadow-sm overflow-hidden flex flex-col">
            <div className="px-6 py-5 border-b border-gray-50 dark:border-gray-800/40 flex items-center justify-between bg-transparent">
               <h3 className="text-base font-bold text-gray-900 dark:text-white tracking-tight">Principais Sessões</h3>
               <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                 <TrendingUp className="w-4 h-4 text-blue-500" />
               </div>
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
                      <tr key={session.sessionId} className="border-b border-gray-50 dark:border-gray-800/40 hover:bg-slate-50 dark:hover:bg-gray-800/30 transition-colors last:border-0">
                        <td className="px-6 py-4 text-sm font-mono text-gray-600 dark:text-gray-300 truncate max-w-[200px]">{session.sessionId}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-700 dark:text-gray-200 text-right">{session.eventCount}</td>
                        <td className="px-6 py-4">
                           <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                             <div className="bg-gradient-to-r from-blue-400 to-primary h-full rounded-full" style={{ width: `${(session.eventCount / metrics.topSessions[0].eventCount) * 100}%` }} />
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
          <div className="bg-white dark:bg-[#15172b] border border-gray-100 dark:border-gray-800/60 rounded-3xl shadow-sm overflow-hidden flex flex-col">
            <div className="px-6 py-5 border-b border-gray-50 dark:border-gray-800/40 flex items-center justify-between bg-transparent">
               <h3 className="text-base font-bold text-gray-900 dark:text-white tracking-tight">Logs Recentes</h3>
               <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                 <Activity className="w-4 h-4 text-emerald-500" />
               </div>
            </div>
            <div>
              {!metrics?.recent_activity || metrics.recent_activity.length === 0 ? (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400 text-sm">Nenhum dado disponível.</div>
              ) : (
                <ul className="divide-y divide-gray-50 dark:divide-gray-800/40">
                  {metrics.recent_activity.map((activity) => {
                    const isIncoming = activity.event_type.includes('Entrada');
                    return (
                      <li key={activity.id} className="flex items-start gap-4 px-6 py-4 hover:bg-slate-50 dark:hover:bg-gray-800/30 transition-colors">
                         <div className={`mt-1 flex-shrink-0 w-2 h-2 rounded-full ${isIncoming ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]'}`} />
                         <div className="flex-1 min-w-0">
                           <p className="text-sm text-gray-800 dark:text-gray-200">
                             <span className={`font-bold text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full ${isIncoming ? 'bg-green-100 text-green-700 dark:bg-green-900/30' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30'}`}>{isIncoming ? 'IN' : 'OUT'}</span>
                             <span className="ml-3 font-medium">{activity.event_type.split(' - ')[1]}</span>
                           </p>
                           <p className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-1.5 truncate">{activity.session_name}</p>
                         </div>
                         <div className="text-xs font-medium text-gray-400 dark:text-gray-500 whitespace-nowrap bg-gray-50 dark:bg-gray-800/50 px-2 py-1 rounded-md">
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
