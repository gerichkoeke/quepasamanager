import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { ChevronLeft, BarChart2, FileEdit, Users, Activity } from 'lucide-react';

export const ProjetoDetalhes: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('visao_geral');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [showDiscussionModal, setShowDiscussionModal] = useState(false);

  // Mocks
  const project = {
    id: id,
    name: 'Teste',
    status: 'Ativo'
  };

  const TABS = [
    { id: 'visao_geral', label: 'Visão Geral' },
    { id: 'tarefas', label: 'Tarefas' },
    { id: 'marcos', label: 'Marcos' },
    { id: 'conversas', label: 'Conversas' },
    { id: 'arquivos', label: 'Arquivos' },
    { id: 'discussoes', label: 'Discussões' },
    { id: 'equipe', label: 'Equipe' },
    { id: 'atividades', label: 'Atividades' },
  ];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
        
        {/* Header */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center text-sm text-gray-500">
            <span className="cursor-pointer hover:text-primary transition-colors" onClick={() => navigate('/projetos')}>Projetos</span>
            <span className="mx-2">/</span>
            <span className="text-gray-900 dark:text-white font-medium">{project.name}</span>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{project.name}</h1>
              <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 font-medium">
                {project.status}
              </span>
            </div>
            <Button variant="secondary" onClick={() => navigate('/projetos')}>
              <ChevronLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </div>

          <div className="mt-2 mb-2">
            <div className="flex justify-between items-center text-sm mb-1 text-gray-600 dark:text-gray-400 font-medium">
              <span>Progresso das Tarefas</span>
              <span>0%</span>
            </div>
            <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full" style={{ width: '0%' }}></div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-6 border-b border-cw-border-light dark:border-cw-border-dark/60 overflow-x-auto">
          {TABS.map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)} 
              className={`pb-3 text-sm font-semibold transition-colors border-b-2 whitespace-nowrap ${activeTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="py-2">
          
          {/* Visão Geral */}
          {activeTab === 'visao_geral' && (
            <div className="space-y-6">
              <div>
                <Button variant="primary">
                  <BarChart2 className="w-4 h-4 mr-2" />
                  Ver Relatórios Completos
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="flex flex-col">
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-6">Tarefas</h3>
                  <div className="space-y-4 flex-1">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 text-sm">Total:</span>
                      <span className="font-bold text-xl text-gray-900 dark:text-white">0</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 text-sm">Concluídas:</span>
                      <span className="font-medium text-emerald-500">0</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 text-sm">Em Andamento:</span>
                      <span className="font-medium text-blue-500">0</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 text-sm">Pendentes:</span>
                      <span className="font-medium text-amber-500">0</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-cw-border-light dark:border-cw-border-dark">
                    <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mb-1">
                      <div className="h-full bg-gray-300 dark:bg-gray-700" style={{ width: '0%' }}></div>
                    </div>
                    <div className="text-right text-xs text-gray-400">0%</div>
                  </div>
                </Card>

                <Card className="flex flex-col">
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-6">Marcos</h3>
                  <div className="space-y-4 flex-1">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 text-sm">Total:</span>
                      <span className="font-bold text-xl text-gray-900 dark:text-white">0</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 text-sm">Concluídos:</span>
                      <span className="font-medium text-emerald-500">0</span>
                    </div>
                  </div>
                </Card>

                <Card className="flex flex-col">
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-6">Conversas</h3>
                  <div className="space-y-4 flex-1">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 text-sm">Total:</span>
                      <span className="font-bold text-xl text-gray-900 dark:text-white">0</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 text-sm">Valor Total:</span>
                      <span className="font-medium text-emerald-500">R$ 0,00</span>
                    </div>
                  </div>
                </Card>

                <Card className="flex flex-col">
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-6">Equipe</h3>
                  <div className="flex justify-between items-center flex-1">
                    <span className="text-gray-500 text-sm">Total:</span>
                    <span className="font-bold text-2xl text-gray-900 dark:text-white">0</span>
                  </div>
                </Card>

                <Card className="flex flex-col">
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-6">Arquivos</h3>
                  <div className="flex justify-between items-center flex-1">
                    <span className="text-gray-500 text-sm">Total:</span>
                    <span className="font-bold text-2xl text-gray-900 dark:text-white">0</span>
                  </div>
                </Card>

                <Card className="flex flex-col">
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-6">Discussões</h3>
                  <div className="flex justify-between items-center flex-1">
                    <span className="text-gray-500 text-sm">Total:</span>
                    <span className="font-bold text-2xl text-gray-900 dark:text-white">0</span>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* Tarefas */}
          {activeTab === 'tarefas' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Tarefas</h2>
                <Button variant="primary" onClick={() => setShowTaskModal(true)}>
                  Nova Tarefa
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="bg-cw-bg-light dark:bg-cw-surface-dark p-4 rounded-xl border border-cw-border-light dark:border-cw-border-dark">
                  <div className="flex items-center gap-2 mb-3 text-sm font-medium text-gray-500">
                    <FileEdit className="w-4 h-4" />
                    Sem Marco
                  </div>
                  <div className="bg-white dark:bg-cw-surface-dark border border-cw-border-light dark:border-cw-border-dark rounded-lg flex items-center p-4 hover:border-primary/50 transition-colors cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 rounded text-primary bg-gray-100 border-cw-border-light dark:bg-gray-800 dark:border-cw-border-dark outline-none" />
                    <span className="ml-3 text-sm text-gray-900 dark:text-gray-200">Teste</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Marcos */}
          {activeTab === 'marcos' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Marcos</h2>
                <Button variant="primary" onClick={() => setShowMilestoneModal(true)}>
                  Novo Marco
                </Button>
              </div>
            </div>
          )}

          {/* Conversas */}
          {activeTab === 'conversas' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Conversas Vinculadas</h2>
              <div className="bg-cw-bg-light dark:bg-cw-surface-dark border border-cw-border-light dark:border-cw-border-dark rounded-xl p-8 text-center text-sm text-gray-500">
                Nenhuma conversa vinculada a este projeto.
              </div>
            </div>
          )}

          {/* Arquivos */}
          {activeTab === 'arquivos' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Arquivos</h2>
                <Button variant="primary">
                  Upload
                </Button>
              </div>
              <div className="py-12 text-center text-sm text-gray-500">
                Nenhum arquivo enviado ainda.
              </div>
            </div>
          )}

          {/* Discussões */}
          {activeTab === 'discussoes' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Discussões</h2>
                <Button variant="primary" onClick={() => setShowDiscussionModal(true)}>
                  Nova
                </Button>
              </div>
              <div className="py-12 text-center text-sm text-gray-500">
                Selecione uma discussão
              </div>
            </div>
          )}

          {/* Equipe */}
          {activeTab === 'equipe' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Membros da Equipe</h2>
                <Button variant="primary">
                  <Users className="w-4 h-4 mr-2" />
                  Adicionar Membro
                </Button>
              </div>
              <div className="py-12 text-center text-sm text-gray-500">
                Nenhum membro adicionado ainda.
              </div>
            </div>
          )}

          {/* Atividades */}
          {activeTab === 'atividades' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Timeline de Atividades</h2>
              <div className="bg-cw-bg-light dark:bg-cw-surface-dark border border-cw-border-light dark:border-cw-border-dark rounded-xl p-4 flex gap-4 items-center">
                <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                  <Activity className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-900 dark:text-white">Criou a tarefa "Teste"</p>
                  <p className="text-xs text-gray-500 mt-1">01/06/2026, 13:07:31</p>
                </div>
              </div>
            </div>
          )}
        </div>


        {/* Modals Mock (Simplified) */}
        {showTaskModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-cw-surface-dark rounded-2xl w-full max-w-md shadow-xl border border-cw-border-light dark:border-cw-border-dark p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Nova Tarefa</h3>
              <div className="space-y-4">
                <input type="text" placeholder="Título *" className="w-full px-4 py-3 bg-cw-bg-light dark:bg-cw-surface-dark border border-cw-border-light dark:border-cw-border-dark rounded-xl outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:text-white text-sm" />
                <textarea placeholder="Descrição" rows={3} className="w-full px-4 py-3 bg-cw-bg-light dark:bg-cw-surface-dark border border-cw-border-light dark:border-cw-border-dark rounded-xl outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:text-white text-sm resize-none"></textarea>
                <select className="w-full px-4 py-3 bg-cw-bg-light dark:bg-cw-surface-dark border border-cw-border-light dark:border-cw-border-dark rounded-xl outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:text-white text-sm"><option>Pendente</option></select>
                <select className="w-full px-4 py-3 bg-cw-bg-light dark:bg-cw-surface-dark border border-cw-border-light dark:border-cw-border-dark rounded-xl outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:text-white text-sm"><option>Sem Prioridade</option></select>
                <select className="w-full px-4 py-3 bg-cw-bg-light dark:bg-cw-surface-dark border border-cw-border-light dark:border-cw-border-dark rounded-xl outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:text-white text-sm"><option>Sem Marco</option></select>
                
                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="primary" onClick={() => setShowTaskModal(false)}>Criar</Button>
                  <Button variant="secondary" onClick={() => setShowTaskModal(false)}>Cancelar</Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showMilestoneModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-cw-surface-dark rounded-2xl w-full max-w-md shadow-xl border border-cw-border-light dark:border-cw-border-dark p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Novo Marco</h3>
              <div className="space-y-4">
                <input type="text" placeholder="Nome *" className="w-full px-4 py-3 bg-cw-bg-light dark:bg-cw-surface-dark border border-cw-border-light dark:border-cw-border-dark rounded-xl outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:text-white text-sm" />
                <textarea placeholder="Descrição" rows={3} className="w-full px-4 py-3 bg-cw-bg-light dark:bg-cw-surface-dark border border-cw-border-light dark:border-cw-border-dark rounded-xl outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:text-white text-sm resize-none"></textarea>
                <input type="date" className="w-full px-4 py-3 bg-cw-bg-light dark:bg-cw-surface-dark border border-cw-border-light dark:border-cw-border-dark rounded-xl outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:text-white text-sm" />
                
                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="primary" onClick={() => setShowMilestoneModal(false)}>Criar</Button>
                  <Button variant="secondary" onClick={() => setShowMilestoneModal(false)}>Cancelar</Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showDiscussionModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-cw-surface-dark rounded-2xl w-full max-w-md shadow-xl border border-cw-border-light dark:border-cw-border-dark p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Nova Discussão</h3>
              <div className="space-y-4">
                <input type="text" placeholder="Assunto *" className="w-full px-4 py-3 bg-cw-bg-light dark:bg-cw-surface-dark border border-cw-border-light dark:border-cw-border-dark rounded-xl outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:text-white text-sm" />
                <textarea placeholder="Descrição" rows={3} className="w-full px-4 py-3 bg-cw-bg-light dark:bg-cw-surface-dark border border-cw-border-light dark:border-cw-border-dark rounded-xl outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:text-white text-sm resize-none"></textarea>
                
                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="primary" onClick={() => setShowDiscussionModal(false)}>Criar</Button>
                  <Button variant="secondary" onClick={() => setShowDiscussionModal(false)}>Cancelar</Button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </Layout>
  );
};
