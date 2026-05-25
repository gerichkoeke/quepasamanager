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
        <header className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-gray-200">
          <div>
            <h1 className="text-2xl font-normal text-gray-800 tracking-tight">Overview</h1>
            <p className="text-sm text-gray-500 mt-1">WAHA API / Engine Status</p>
          </div>
          {metrics && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded text-sm text-gray-700">
                <Database className="w-4 h-4 text-gray-500" />
                <span className="font-medium text-gray-900">{metrics.messages_processed.toLocaleString('pt-BR')}</span> Messages
              </div>
              <div className={`flex items-center gap-2 px-3 py-1.5 border rounded text-sm ${metrics.rabbitmq_connected ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                <div className={`w-2 h-2 rounded-full ${metrics.rabbitmq_connected ? 'bg-green-500' : 'bg-red-500'}`} />
                RabbitMQ
              </div>
            </div>
          )}
        </header>

        {/* Core Metrics Grid - Material Design / Admin style */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded shadow-sm border border-gray-200 border-t-4 border-t-blue-500 flex flex-col justify-between h-32">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">WhatsApp Instances</h3>
            <div className="flex items-end justify-between mt-auto">
              <p className="text-4xl font-light text-gray-800">{metrics?.instances?.quepasa_active || 0}</p>
              <Smartphone className="w-8 h-8 text-blue-500/20" />
            </div>
          </div>

          <div className="bg-white p-4 rounded shadow-sm border border-gray-200 border-t-4 border-t-indigo-500 flex flex-col justify-between h-32">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Chatwoot Inboxes</h3>
            <div className="flex items-end justify-between mt-auto">
              <p className="text-4xl font-light text-gray-800">{metrics?.instances?.chatwoot_connections || 0}</p>
              <MessageCircle className="w-8 h-8 text-indigo-500/20" />
            </div>
          </div>

          <div className="bg-white p-4 rounded shadow-sm border border-gray-200 border-t-4 border-t-purple-500 flex flex-col justify-between h-32">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Bot Sessions</h3>
            <div className="flex items-end justify-between mt-auto">
              <p className="text-4xl font-light text-gray-800">{metrics?.active_bots || 0}</p>
              <Bot className="w-8 h-8 text-purple-500/20" />
            </div>
          </div>

          <div className="bg-white p-4 rounded shadow-sm border border-gray-200 border-t-4 border-t-emerald-500 flex flex-col justify-between h-32">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Events (24h)</h3>
            <div className="flex items-end justify-between mt-auto">
              <p className="text-4xl font-light text-gray-800">{metrics?.recent_events_count || 0}</p>
              <Activity className="w-8 h-8 text-emerald-500/20" />
            </div>
          </div>
        </div>

        {/* Data Lists - Table style like React Admin */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-8">
          {/* Top Sessions */}
          <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
               <h3 className="text-sm font-medium text-gray-800">Top Sessions / Interactions</h3>
               <TrendingUp className="w-4 h-4 text-gray-400" />
            </div>
            <div>
              {!metrics?.topSessions || metrics.topSessions.length === 0 ? (
                <div className="p-8 text-center text-gray-500 text-sm">No data available.</div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 text-xs text-gray-500">
                       <th className="font-medium px-4 py-2">ID</th>
                       <th className="font-medium px-4 py-2 text-right">Events</th>
                       <th className="font-medium px-4 py-2 w-24">Activity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.topSessions.map((session, index) => (
                      <tr key={session.sessionId} className="border-b border-gray-100 hover:bg-gray-50 last:border-0">
                        <td className="px-4 py-2 text-sm font-mono text-gray-700 truncate max-w-[200px]">{session.sessionId}</td>
                        <td className="px-4 py-2 text-sm text-gray-600 text-right">{session.eventCount}</td>
                        <td className="px-4 py-2">
                           <div className="w-full h-1.5 bg-gray-100 rounded-sm overflow-hidden">
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
          <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
               <h3 className="text-sm font-medium text-gray-800">Recent Logs</h3>
               <Activity className="w-4 h-4 text-gray-400" />
            </div>
            <div>
              {!metrics?.recent_activity || metrics.recent_activity.length === 0 ? (
                <div className="p-8 text-center text-gray-500 text-sm">No data available.</div>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {metrics.recent_activity.map((activity) => {
                    const isIncoming = activity.event_type.includes('Entrada');
                    return (
                      <li key={activity.id} className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50">
                         <div className={`mt-1 flex-shrink-0 w-2 h-2 rounded-full ${isIncoming ? 'bg-green-500' : 'bg-blue-500'}`} />
                         <div className="flex-1 min-w-0">
                           <p className="text-sm text-gray-800">
                             <span className="font-medium">{isIncoming ? 'IN' : 'OUT'}</span>
                             <span className="text-gray-400 mx-2">|</span>
                             {activity.event_type.split(' - ')[1]}
                           </p>
                           <p className="text-xs text-gray-500 font-mono mt-1 truncate">{activity.session_name}</p>
                         </div>
                         <div className="text-xs text-gray-400 whitespace-nowrap">
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
