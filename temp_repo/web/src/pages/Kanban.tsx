import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { Button } from '../components/Button';
import { 
  Kanban as KanbanIcon, 
  Calendar as CalendarIcon, 
  Settings,
  Plus,
  MoreVertical,
  RefreshCw,
  Filter,
  CheckSquare,
  Users,
  ChevronDown,
  X,
  Copy,
  Trash2,
  Edit2,
  Plug
} from 'lucide-react';
import toast from 'react-hot-toast';

// Interfaces
interface Funnel {
  id: string;
  name: string;
  color: string;
  isPublic: boolean;
  steps: number;
}

export const Kanban: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'kanban' | 'agenda'>('kanban');
  const [viewState, setViewState] = useState<'board' | 'settings_funnels' | 'settings_webhooks'>('board');
  const [showRightMenu, setShowRightMenu] = useState(false);
  
  const [showNewCardMenu, setShowNewCardMenu] = useState(false);
  const [showAvulsoModal, setShowAvulsoModal] = useState(false);
  const [showContatoModal, setShowContatoModal] = useState(false);
  
  // Funnels State
  const [funnels, setFunnels] = useState<Funnel[]>([
    { id: '1', name: 'Status Tickets', color: 'bg-indigo-500', isPublic: true, steps: 3 },
    { id: '2', name: 'Novo', color: 'bg-blue-500', isPublic: true, steps: 0 },
    { id: '3', name: 'Novo Teste', color: 'bg-amber-500', isPublic: true, steps: 1 },
  ]);

  const toggleSettings = () => {
    setViewState(prev => prev.startsWith('settings') ? 'board' : 'settings_funnels');
    setShowRightMenu(false);
  };

  const openWebhooks = () => {
    setViewState('settings_webhooks');
    setShowRightMenu(false);
  };

  const handleCreateAvulso = (e: React.FormEvent) => {
    e.preventDefault();
    setShowAvulsoModal(false);
    toast.success('Card criado (Mock)');
  };

  return (
    <Layout>
      <div className="flex flex-col h-full bg-gray-50 dark:bg-[#15172b] rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden animate-in fade-in duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1C1E2C]">
          <div className="flex items-center gap-3">
            {/* Tabs */}
            <div className="flex items-center bg-gray-100 dark:bg-[#15172b] p-1 rounded-lg">
              <button 
                onClick={() => setActiveTab('kanban')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === 'kanban' ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
              >
                <KanbanIcon className="w-4 h-4" /> Kanban
              </button>
              <button 
                onClick={() => setActiveTab('agenda')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === 'agenda' ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
              >
                <CalendarIcon className="w-4 h-4" /> Agenda
              </button>
            </div>

            {/* View specific selects */}
            {viewState === 'board' && (
              <>
                <select className="bg-gray-100 dark:bg-[#15172b] border border-transparent focus:border-primary px-3 py-2 rounded-lg text-sm font-medium outline-none text-gray-700 dark:text-gray-300">
                  {funnels.map(f => (
                    <option key={f.id}>{f.name}</option>
                  ))}
                </select>

                <select className="bg-gray-100 dark:bg-[#15172b] border border-transparent focus:border-primary px-3 py-2 rounded-lg text-sm font-medium outline-none text-gray-700 dark:text-gray-300">
                  <option>Todas as Caixas</option>
                </select>
                
                <button className="p-2 bg-gray-100 dark:bg-[#15172b] rounded-lg text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                  <CalendarIcon className="w-4 h-4" />
                </button>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 relative">
            <span className="text-xs text-gray-400 mr-2">Atualizado: 13:24:16</span>
            
            {viewState === 'board' && (
              <div className="relative">
                <button 
                  onClick={() => setShowNewCardMenu(!showNewCardMenu)}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
                
                {/* New Card Dropdown Menu */}
                {showNewCardMenu && (
                  <div className="absolute top-10 right-0 w-64 bg-white dark:bg-[#1C1E2C] border border-gray-200 dark:border-gray-800 rounded-xl shadow-xl z-50 p-2">
                    <button onClick={() => { setShowAvulsoModal(true); setShowNewCardMenu(false); }} className="w-full flex items-start gap-3 p-3 hover:bg-gray-50 dark:hover:bg-[#15172b] rounded-lg text-left transition-colors">
                      <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg"><CheckSquare className="w-4 h-4 text-gray-600 dark:text-gray-300" /></div>
                      <div>
                        <div className="font-semibold text-sm text-gray-900 dark:text-white">Card Avulso</div>
                        <div className="text-xs text-gray-500">Sem vínculo com contato</div>
                      </div>
                    </button>
                    <button onClick={() => { setShowContatoModal(true); setShowNewCardMenu(false); }} className="w-full flex items-start gap-3 p-3 hover:bg-gray-50 dark:hover:bg-[#15172b] rounded-lg text-left transition-colors mt-1">
                      <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg"><Users className="w-4 h-4 text-blue-600 dark:text-blue-400" /></div>
                      <div>
                        <div className="font-semibold text-sm text-gray-900 dark:text-white">Card com Contato</div>
                        <div className="text-xs text-gray-500">Buscar ou criar contato</div>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            )}

            <button onClick={toggleSettings} className={`p-2 rounded-lg transition-colors ${viewState.startsWith('settings') ? 'bg-primary/10 text-primary' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
              <Settings className="w-5 h-5" />
            </button>
            
            <div className="relative">
              <button 
                onClick={() => setShowRightMenu(!showRightMenu)}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <MoreVertical className="w-5 h-5" />
              </button>
              
              {/* Right config menu */}
              {showRightMenu && (
                <div className="absolute top-10 right-0 w-56 bg-white dark:bg-[#1C1E2C] border border-gray-200 dark:border-gray-800 rounded-xl shadow-xl z-50 p-2 py-2">
                  <div className="text-xs font-semibold text-gray-400 px-3 pb-2 pt-1 uppercase tracking-wider">Ações</div>
                  <button onClick={() => setShowRightMenu(false)} className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg text-left text-sm text-gray-700 dark:text-gray-200 transition-colors">
                    <RefreshCw className="w-4 h-4" /> Atualizar dados
                  </button>
                  <button onClick={() => setShowRightMenu(false)} className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg text-left text-sm text-gray-700 dark:text-gray-200 transition-colors">
                    <CheckSquare className="w-4 h-4" /> Ações em Massa
                  </button>
                  <button onClick={() => setShowRightMenu(false)} className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg text-left text-sm text-gray-700 dark:text-gray-200 transition-colors">
                    <Filter className="w-4 h-4" /> Filtros
                  </button>
                  
                  <div className="h-px bg-gray-200 dark:bg-gray-800 my-2"></div>
                  
                  <button onClick={() => { toggleSettings(); setShowRightMenu(false); }} className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg text-left text-sm text-gray-700 dark:text-gray-200 transition-colors">
                    <Settings className="w-4 h-4" /> Gerenciar Funis
                  </button>
                  <button onClick={() => setShowRightMenu(false)} className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg text-left text-sm text-gray-700 dark:text-gray-200 transition-colors">
                    <Settings className="w-4 h-4" /> Config Globais
                  </button>
                  <button onClick={openWebhooks} className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg text-left text-sm text-gray-700 dark:text-gray-200 transition-colors">
                    <Plug className="w-4 h-4" /> Webhooks / Chamados
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Dynamic Content */}
        <div className="flex-1 overflow-hidden relative">
          
          {viewState === 'board' ? (
            activeTab === 'kanban' ? (
              <div className="h-full w-full overflow-x-auto p-6 flex gap-6">
                <KanbanBoard />
              </div>
            ) : (
              <AgendaView />
            )
          ) : viewState === 'settings_funnels' ? (
            <div className="h-full overflow-y-auto p-6">
              <SettingsView funnels={funnels} onClose={() => setViewState('board')} setFunnels={setFunnels} />
            </div>
          ) : (
            <div className="h-full overflow-y-auto p-6">
              <WebhooksView onClose={() => setViewState('board')} />
            </div>
          )}

        </div>

        {/* Modals New Card */}
        {showAvulsoModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <form onSubmit={handleCreateAvulso} className="bg-white dark:bg-[#1C1E2C] rounded-2xl w-full max-w-sm shadow-xl border border-gray-200 dark:border-gray-800 p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Criar Card Avulso</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Título *</label>
                  <input type="text" placeholder="teste" className="w-full px-4 py-2 bg-gray-50 dark:bg-[#15172b] border border-gray-200 dark:border-gray-800 rounded-lg outline-none focus:border-primary text-sm dark:text-white" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Coluna *</label>
                  <select className="w-full px-4 py-2 bg-gray-50 dark:bg-[#15172b] border border-gray-200 dark:border-gray-800 rounded-lg outline-none focus:border-primary text-sm dark:text-white" required>
                    <option value="">Selecione uma etapa</option>
                    <option value="1">Aberto</option>
                  </select>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <Button type="button" variant="secondary" onClick={() => setShowAvulsoModal(false)}>Cancelar</Button>
                  <Button type="submit" variant="primary">Criar Card</Button>
                </div>
              </div>
            </form>
          </div>
        )}

        {showContatoModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <form onSubmit={handleCreateAvulso} className="bg-white dark:bg-[#1C1E2C] rounded-2xl w-full max-w-sm shadow-xl border border-gray-200 dark:border-gray-800 p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Card com Contato</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-[#15172b] rounded-lg border border-gray-200 dark:border-gray-800">
                  <div>
                    <div className="font-semibold text-sm text-gray-900 dark:text-white">Criar novo contato</div>
                    <div className="text-xs text-gray-500">Cadastra o contato no sistema</div>
                  </div>
                  <input type="checkbox" className="toggle" defaultChecked />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Nome *</label>
                  <input type="text" placeholder="Nome completo" className="w-full px-4 py-2 bg-gray-50 dark:bg-[#15172b] border border-gray-200 dark:border-gray-800 rounded-lg outline-none focus:border-primary text-sm dark:text-white" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Telefone</label>
                  <input type="text" placeholder="+55 11 99999-9999" className="w-full px-4 py-2 bg-gray-50 dark:bg-[#15172b] border border-gray-200 dark:border-gray-800 rounded-lg outline-none focus:border-primary text-sm dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">E-mail</label>
                  <input type="email" placeholder="email@exemplo.com" className="w-full px-4 py-2 bg-gray-50 dark:bg-[#15172b] border border-gray-200 dark:border-gray-800 rounded-lg outline-none focus:border-primary text-sm dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Título do card <span className="font-normal text-gray-500 text-xs">(opcional)</span></label>
                  <input type="text" placeholder="Nome do card (opcional)" className="w-full px-4 py-2 bg-gray-50 dark:bg-[#15172b] border border-gray-200 dark:border-gray-800 rounded-lg outline-none focus:border-primary text-sm dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Etapa *</label>
                  <select className="w-full px-4 py-2 bg-gray-50 dark:bg-[#15172b] border border-gray-200 dark:border-gray-800 rounded-lg outline-none focus:border-primary text-sm dark:text-white" required>
                    <option value="">Selecione uma etapa</option>
                    <option value="1">Aberto</option>
                  </select>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <Button type="button" variant="secondary" onClick={() => setShowContatoModal(false)}>Cancelar</Button>
                  <Button type="submit" variant="primary">Criar Card</Button>
                </div>
              </div>
            </form>
          </div>
        )}

      </div>
    </Layout>
  );
};

// --- Sub-components (could live in separate files but kept here for simplicity) ---

const KanbanBoard = () => {
  // Simple mock columns for structural view
  const columns = ['Abertas', 'Pendentes', 'Resolvidas'];
  return (
    <>
      {columns.map(col => (
        <div key={col} className="min-w-[300px] w-[300px] max-w-[300px] flex flex-col h-full bg-gray-100/50 dark:bg-[#1C1E2C]/50 rounded-xl p-3 border border-gray-200 dark:border-gray-800">
          <div className="flex justify-between items-center mb-3 px-1">
            <h3 className="font-semibold text-gray-700 dark:text-gray-200">{col}</h3>
            <span className="text-xs bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full font-medium">0</span>
          </div>
          <div className="flex-1 overflow-y-auto">
            {/* List empty for now, waiting for implementation */}
            <div className="text-center p-4 mt-8 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl text-gray-400 text-sm">
              Arrastar cards aqui
            </div>
          </div>
        </div>
      ))}
      <div className="min-w-[300px] w-[300px] max-w-[300px] flex gap-2 p-3 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-[#1C1E2C]/50 rounded-xl transition-colors shrink-0">
        <Plus className="w-5 h-5" />
        <span className="font-medium text-sm">Adicionar Etapa</span>
      </div>
    </>
  );
};

const AgendaView = () => {
  return (
    <div className="h-full p-6 flex flex-col bg-white dark:bg-[#15172b]">
      <div className="flex items-center gap-4 mb-6">
        <h2 className="text-xl font-bold dark:text-white">Junho 2026</h2>
        <span className="text-sm px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full font-medium dark:text-gray-300">Hoje</span>
      </div>
      <div className="flex-1 min-h-0 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden flex flex-col">
         {/* Calendar Headers */}
         <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-800 text-center py-3 bg-gray-50 dark:bg-[#1C1E2C] text-sm font-semibold text-gray-500">
            <div>Dom</div><div>Seg</div><div>Ter</div><div>Qua</div><div>Qui</div><div>Sex</div><div>Sáb</div>
         </div>
         {/* Calendar Grid (Mock) */}
         <div className="flex-1 grid grid-cols-7 grid-rows-5 gap-0">
            {/* Generating 35 mock cells */}
            {Array.from({length: 35}).map((_, i) => {
              const num = i - 0; // Starts from arbitrary offset
              const isToday = i === 1; 
              return (
                <div key={i} className={`border-r border-b border-gray-200 dark:border-gray-800 p-2 ${isToday ? 'bg-primary/10' : 'bg-white dark:bg-[#15172b]'}`}>
                  <span className={`text-xs font-semibold rounded-full w-6 h-6 flex items-center justify-center ${isToday ? 'bg-primary text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                    {num > 0 && num <= 30 ? num : ''}
                  </span>
                </div>
              )
            })}
         </div>
      </div>
    </div>
  );
};

const SettingsView = ({ funnels, onClose, setFunnels }: { funnels: Funnel[], onClose: () => void, setFunnels: React.Dispatch<React.SetStateAction<Funnel[]>> }) => {
  const [expandedFunnels, setExpandedFunnels] = useState<string[]>([]);
  
  const handleToggleExpand = (id: string, e: React.MouseEvent) => {
    // Evita expandir se clicar nos botões de ação
    if ((e.target as HTMLElement).closest('.actions-container')) return;
    setExpandedFunnels(prev => prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]);
  };

  const handleCreate = () => {
    const newFunnel = {
      id: Date.now().toString(),
      name: 'Novo Funil',
      color: 'bg-blue-500',
      isPublic: false,
      steps: 0
    };
    setFunnels(prev => [...prev, newFunnel]);
    toast.success('Funil criado');
  };

  const handleDelete = (id: string) => {
    setFunnels(prev => prev.filter(f => f.id !== id));
    toast.success('Funil excluído');
  };

  const handleDuplicate = (funnel: Funnel) => {
    const duplicated = {
        ...funnel,
        id: Date.now().toString(),
        name: funnel.name + ' (Cópia)'
    };
    setFunnels(prev => [...prev, duplicated]);
    toast.success('Funil duplicado');
  };

  const handleEdit = (funnel: Funnel) => {
    const newName = window.prompt('Editar nome do funil:', funnel.name);
    if (newName && newName.trim() !== '') {
      setFunnels(prev => prev.map(f => f.id === funnel.id ? { ...f, name: newName } : f));
      toast.success('Funil atualizado');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="p-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-gray-500 transition-colors">
            <span className="text-sm font-semibold">{'<'} Voltar</span>
          </button>
          <h2 className="text-2xl font-bold dark:text-white">Gerenciar Funis</h2>
        </div>
        <Button variant="primary" onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-2" /> Criar Novo Funil
        </Button>
      </div>

      <div className="space-y-4">
        {funnels.map(funnel => (
          <div key={funnel.id} className="bg-white dark:bg-[#1C1E2C] border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden transition-all">
            <div 
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
              onClick={(e) => handleToggleExpand(funnel.id, e)}
            >
              <div className="flex items-center gap-4">
                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${expandedFunnels.includes(funnel.id) ? 'rotate-180' : ''}`} />
                <div className={`w-3 h-3 rounded-full ${funnel.color}`}></div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{funnel.name}</h3>
                <span className="text-xs text-gray-500">({funnel.steps} etapas)</span>
                {funnel.isPublic && (
                  <span className="text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-2 py-0.5 rounded font-medium">Público</span>
                )}
              </div>
              <div className="flex items-center gap-3 actions-container">
                <input type="checkbox" className="toggle toggle-primary" defaultChecked />
                <button onClick={() => handleEdit(funnel)} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"><Edit2 className="w-4 h-4" /></button>
                <button onClick={() => handleDuplicate(funnel)} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"><Copy className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(funnel.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
            
            {expandedFunnels.includes(funnel.id) && (
              <div className="border-t border-gray-100 dark:border-gray-800 p-6 bg-gray-50/50 dark:bg-black/10 space-y-4">
                
                {funnel.steps === 0 ? (
                  <div className="text-center p-6 text-sm text-gray-500">Nenhuma etapa encontrada.</div>
                ) : (
                  <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden bg-white dark:bg-[#1C1E2C]">
                    <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-800">
                      <div className="flex items-center gap-2">
                        <MoreVertical className="w-4 h-4 text-gray-400" />
                        <span className="font-semibold dark:text-white text-sm">Etapa Inicial</span>
                      </div>
                      <div className="flex gap-2">
                         <button className="p-1 text-gray-400 hover:text-gray-200"><Edit2 className="w-3.5 h-3.5" /></button>
                         <button className="p-1 text-red-500/70 hover:text-red-500"><X className="w-4 h-4" /></button>
                      </div>
                    </div>
                    <div className="p-4 space-y-4">
                      <label className="flex items-start gap-3">
                        <input type="checkbox" className="mt-1" />
                        <div className="text-sm dark:text-gray-300">Novos tickets caem aqui</div>
                      </label>
                      
                      <label className="flex items-center gap-3">
                        <input type="checkbox" />
                        <div className="text-sm dark:text-gray-300">Enviar mensagem automática</div>
                      </label>
                    </div>
                  </div>
                )}

                <div 
                  className="text-primary font-medium text-sm flex items-center gap-1 cursor-pointer hover:underline"
                  onClick={() => {
                    const newFunnels = funnels.map(f => f.id === funnel.id ? { ...f, steps: f.steps + 1 } : f);
                    setFunnels(newFunnels);
                    toast.success('Etapa adicionada');
                  }}
                >
                  <Plus className="w-4 h-4" /> Adicionar etapa
                </div>

                <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden bg-white dark:bg-[#1C1E2C]">
                  <div className="flex items-center justify-between p-4 cursor-pointer">
                    <div className="flex items-center gap-3 font-semibold dark:text-white text-sm">
                      <KanbanIcon className="w-4 h-4 text-purple-500" /> Templates de Itens (0)
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const WebhooksView = ({ onClose }: { onClose: () => void }) => {
  const handleSyncChamados = () => {
    toast.success('Sincronizando chamados em andamento...');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onClose} className="p-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-gray-500 transition-colors">
          <span className="text-sm font-semibold">{'<'} Voltar</span>
        </button>
        <h2 className="text-2xl font-bold dark:text-white">Webhooks e Integrações</h2>
      </div>

      <div className="bg-white dark:bg-[#1C1E2C] border border-gray-200 dark:border-gray-800 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-2">
          <RefreshCw className="w-6 h-6 text-primary" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Sincronização de Chamados</h3>
        </div>
        <p className="text-sm text-gray-500 mb-6">
          Integração com sistema de chamados. A sincronização trará os chamados abertos e criará cards no Kanban vinculados ao seu usuário.
        </p>

        <div className="flex gap-4">
          <Button onClick={handleSyncChamados} variant="primary">
             <RefreshCw className="w-4 h-4 mr-2" /> Sincronizar Chamados Agora
          </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-[#1C1E2C] border border-gray-200 dark:border-gray-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Plug className="w-6 h-6 text-emerald-500" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Webhooks Ativos</h3>
            </div>
            <p className="text-sm text-gray-500">
              Configure URLs externas para receber eventos do seu Kanban.
            </p>
          </div>
          <Button variant="primary">
            <Plus className="w-4 h-4 mr-2" /> Novo Webhook
          </Button>
        </div>
        
        <div className="text-center p-8 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl text-gray-400 text-sm">
          Nenhum webhook configurado.
        </div>
      </div>
    </div>
  );
};
