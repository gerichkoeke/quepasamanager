import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Send, Users, MessageSquare } from 'lucide-react';
import { api } from '../services/api';
import toast from 'react-hot-toast';

export const Campaigns: React.FC = () => {
  const [sessions, setSessions] = useState<any[]>([]);
  const [selectedSession, setSelectedSession] = useState<string>('');
  const [message, setMessage] = useState('');
  const [numbersInput, setNumbersInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setIsLoading(true);
      const data = await api.getSessions();
      // Filter only active sessions if needed, but for now just map them
      setSessions(data || []);
      if (data && data.length > 0) {
        setSelectedSession(data[0].name);
      }
    } catch (error: any) {
      toast.error('Erro ao carregar instâncias');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSession) {
      toast.error('Selecione uma instância para enviar');
      return;
    }
    if (!message.trim()) {
      toast.error('A mensagem não pode estar vazia');
      return;
    }
    if (!numbersInput.trim()) {
      toast.error('Informe pelo menos um número');
      return;
    }

    const unformattedNumbers = numbersInput.split(/[\n,;]+/).map(n => n.replace(/\D/g, '')).filter(n => n.length > 5);
    
    if (unformattedNumbers.length === 0) {
       toast.error('Nenhum número válido encontrado');
       return;
    }

    try {
      setIsSending(true);
      // Aqui faria a chamada para a API do backend de disparos
      // Como não criamos o endpoint ainda, vamos simular:
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success(`Iniciando envio para ${unformattedNumbers.length} números usando a instância ${selectedSession}`);
      
      // Limpar formulário
      setMessage('');
      setNumbersInput('');
    } catch (error) {
      toast.error('Erro ao iniciar campanha');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Disparador de Mensagens</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Crie campanhas e envie mensagens em massa usando suas instâncias no WhatsApp</p>
        </div>

        <form onSubmit={handleSend} className="space-y-6">
          <Card title="Nova Campanha">
            <div className="space-y-6">
              
              {/* Seleção de Instância */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Selecione a Instância (Remetente)
                </label>
                <select
                  value={selectedSession}
                  onChange={(e) => setSelectedSession(e.target.value)}
                  disabled={isLoading || sessions.length === 0}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors dark:bg-gray-700 dark:text-white"
                >
                  {isLoading ? (
                    <option>Carregando...</option>
                  ) : sessions.length === 0 ? (
                    <option>Nenhuma instância conectada</option>
                  ) : (
                    sessions.map((session) => (
                      <option key={session.name} value={session.name}>
                        {session.name} (Status: {session.status})
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* Números Destinatários */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Destinatários (Um por linha ou separados por vírgula)
                  </div>
                </label>
                <textarea
                  value={numbersInput}
                  onChange={(e) => setNumbersInput(e.target.value)}
                  placeholder="Exemplo:&#10;5511999999999&#10;5511888888888"
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors dark:bg-gray-700 dark:text-white font-mono text-sm"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                   Aceita formatos com DDD. Você pode colar listas do Excel.
                </p>
              </div>

              {/* Mensagem */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Mensagem
                  </div>
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Olá! Temos uma novidade para você..."
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors dark:bg-gray-700 dark:text-white"
                />
              </div>

            </div>
          </Card>

          <div className="flex justify-end gap-4">
             <Button type="button" variant="secondary" onClick={() => { setNumbersInput(''); setMessage(''); }} disabled={isSending}>
                Limpar Campos
             </Button>
             <Button type="submit" variant="primary" isLoading={isSending} size="lg">
                <Send className="w-5 h-5 mr-2" />
                Iniciar Disparo
             </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
};
