import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { 
  Send, MessageSquare, Play, Plus, Ban, CheckCircle2, 
  ChevronRight, ArrowLeft, UploadCloud, LayoutTemplate, 
  Settings2, Pause, RotateCw, FileSpreadsheet, Tag, Trello
} from 'lucide-react';
import { api } from '../services/api';
import toast from 'react-hot-toast';

type CampaignPhase = 'list' | 'wizard' | 'running';

export const Campaigns: React.FC = () => {
  const [phase, setPhase] = useState<CampaignPhase>('list');
  const [activeTab, setActiveTab] = useState<'disparos' | 'sanitizar'>('disparos');
  
  // Lista Options
  const [searchTerm, setSearchTerm] = useState('');

  // Wizard State
  const [wizardStep, setWizardStep] = useState(1);
  const [instances, setInstances] = useState<any[]>([]);
  const [, setIsLoadingInstances] = useState(false);

  // Form Data
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    source: 'csv', // csv, sanitizacao, tags, kanban
    contacts: [] as any[],
    selectedInstances: [] as string[],
    rotationMode: 'round_robin',
    minDelay: 5,
    maxDelay: 20,
    pauseEvery: 0,
    pauseDuration: 0,
    timeStart: '',
    timeEnd: '',
    daysAllowed: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
    spintax: false,
    followUp: false,
    startMode: 'imediato', // imediato, agendar, recorrente
    messageType: 'text',
    messageContent: '',
  });

  useEffect(() => {
    loadInstances();
  }, []);

  const loadInstances = async () => {
    try {
      setIsLoadingInstances(true);
      const quepasa = await api.getQuepasaMappings().catch(() => []);
      
      const merged: any[] = [];
      quepasa.forEach((q: any) => merged.push({ 
        id: `qp_${q.id}`, 
        name: `${q.provider === 'official' ? 'API Oficial' : 'Quepasa'} - ${q.name || q.phoneNumber || q.id}`, 
        type: q.provider === 'official' ? 'official' : 'quepasa', 
        status: q.active ? 'Ativo' : 'Inativo' 
      }));
      
      setInstances(merged);
    } catch (error: any) {
      toast.error('Erro ao carregar caixas de envio');
    } finally {
      setIsLoadingInstances(false);
    }
  };

  const handleCreateDisparo = () => {
    setWizardStep(1);
    setPhase('wizard');
  };

  const parseCsvContacts = (text: string) => {
    const lines = text.split(/[\n,;]+/).map(l => l.trim()).filter(l => l.length > 5);
    const mockContacts = lines.map((l, i) => ({
      id: `c_${i}`,
      phone: l.replace(/\D/g, ''),
      name: `Contato ${i+1}`
    }));
    setFormData($ => ({ ...$, contacts: mockContacts }));
    toast.success(`${mockContacts.length} contatos carregados`);
  };

  const handleLaunchCampaign = async () => {
    if (!formData.name) {
      toast.error('Informe um nome para a campanha');
      return;
    }
    if (formData.selectedInstances.length === 0) {
      toast.error('Selecione pelo menos uma caixa de envio');
      return;
    }
    if (formData.contacts.length === 0) {
      toast.error('Nenhum contato adicionado');
      return;
    }

    try {
      toast.success('Iniciando disparo...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      setPhase('running');
    } catch (err) {
      toast.error('Erro ao iniciar campanha');
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
        
        {/* HEADER & TABS */}
        {phase === 'list' && (
          <>
            <div className="flex flex-col md:flex-row md:items-center justify-between pb-4">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                   <Send className="w-5 h-5 text-blue-500" />
                 </div>
                 <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Disparador em Massa</h1>
              </div>
              <div className="flex items-center gap-3 mt-4 md:mt-0">
                 <Button variant="secondary" onClick={() => {}} className="bg-transparent border-gray-200 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800">
                   <Ban className="w-4 h-4 mr-2" />
                   Blacklist
                 </Button>
                 <Button variant="primary" onClick={handleCreateDisparo}>
                   <Plus className="w-4 h-4 mr-2" />
                   Novo Disparo
                 </Button>
              </div>
            </div>

            <div className="flex items-center gap-6 border-b border-gray-200 dark:border-gray-800/60 pb-2">
              <button 
                onClick={() => setActiveTab('disparos')}
                className={`pb-2 text-sm font-semibold transition-colors border-b-2 ${activeTab === 'disparos' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              >
                Disparos
              </button>
              <button 
                onClick={() => setActiveTab('sanitizar')}
                className={`pb-2 text-sm font-semibold transition-colors border-b-2 ${activeTab === 'sanitizar' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              >
                Sanitizar Lista
              </button>
            </div>

            {/* LISTAGEM DISPAROS */}
            {activeTab === 'disparos' && (
              <div className="space-y-6 mt-6">
                 <div className="flex justify-between items-center bg-[#15172b] p-2 rounded-xl border border-gray-800/60">
                    <input 
                      type="text" 
                      placeholder="Buscar por nome..." 
                      className="bg-transparent text-sm w-64 px-4 py-2 outline-none text-white placeholder-gray-500"
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                    />
                    <select className="bg-transparent text-sm text-gray-300 outline-none px-4 cursor-pointer">
                      <option>Todos os status</option>
                      <option>Em execução</option>
                      <option>Concluído</option>
                    </select>
                 </div>

                 <div className="flex flex-col items-center justify-center py-24 text-gray-500 dark:text-gray-400">
                    <Send className="w-12 h-12 mb-4 opacity-20" />
                    <p className="text-sm font-medium">Nenhum disparo encontrado</p>
                    <p className="text-xs mt-1">Clique em "Novo Disparo" para começar</p>
                 </div>
              </div>
            )}
            
            {/* SANITIZAR LISTA */}
            {activeTab === 'sanitizar' && (
              <div className="space-y-6 mt-6">
                <Card title="Nova verificação">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 mb-1">Provedor</label>
                      <select className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary outline-none bg-transparent dark:text-white text-sm">
                        <option value="">Selecionar...</option>
                        <option value="quepasa">Quepasa</option>
                        <option value="official">API Oficial</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 mb-1">Conexão (instância)</label>
                      <select className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary outline-none bg-transparent dark:text-white text-sm">
                        <option>Selecionar...</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 mb-1">Arquivo CSV</label>
                      <div className="flex items-center gap-2">
                        <input type="file" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 dark:file:bg-gray-800 dark:file:text-gray-300" />
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 p-3 rounded-lg border border-blue-500/20 bg-blue-500/5 text-xs text-blue-400">
                    O CSV deve ter a coluna de telefone na primeira coluna. Nome é opcional. Máximo de 5.000 números por verificação. Os números serão validados diretamente no WhatsApp pela conexão selecionada.
                  </div>
                  <div className="mt-4">
                    <Button variant="primary" disabled className="opacity-50">
                      <CheckCircle2 className="w-4 h-4 mr-2" /> Verificar Números
                    </Button>
                  </div>
                </Card>

                <Card title="Histórico de verificações">
                  <div className="py-12 text-center text-sm text-gray-500">
                    Nenhuma verificação realizada ainda
                  </div>
                </Card>
              </div>
            )}
          </>
        )}

        {/* WIZARD NOVO DISPARO */}
        {phase === 'wizard' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-white dark:bg-[#15172b] p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800/60">
               <div className="flex items-center gap-4 text-sm font-semibold">
                 <button onClick={() => setPhase('list')} className="text-gray-400 hover:text-white flex items-center pr-4 border-r border-gray-700">
                   <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
                 </button>
                 <span className="font-bold text-gray-900 dark:text-white">Novo Disparo</span>
               </div>
               
               <div className="flex items-center gap-2">
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${wizardStep >= 1 ? 'bg-primary/20 text-primary' : 'text-gray-500'}`}>
                    <CheckCircle2 className={`w-3.5 h-3.5 ${wizardStep > 1 ? 'text-primary' : 'opacity-50'}`} /> 1. Contatos
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-600" />
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${wizardStep >= 2 ? 'bg-primary/20 text-primary' : 'text-gray-500'}`}>
                    <Settings2 className="w-3.5 h-3.5" /> 2. Configurações
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-600" />
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${wizardStep >= 3 ? 'bg-primary/20 text-primary' : 'text-gray-500'}`}>
                    <MessageSquare className="w-3.5 h-3.5" /> 3. Mensagens
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-600" />
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${wizardStep >= 4 ? 'bg-primary/20 text-primary' : 'text-gray-500'}`}>
                    <LayoutTemplate className="w-3.5 h-3.5" /> 4. Revisão
                  </div>
               </div>
            </div>

            <div className="max-w-4xl mx-auto mt-8">
              {wizardStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nome do disparo <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-3 bg-white dark:bg-[#111322] border border-gray-200 dark:border-gray-800 rounded-xl outline-none focus:border-primary transition-colors text-black dark:text-white"
                      placeholder="Ex: Promoção de Março"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Descrição</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-3 bg-white dark:bg-[#111322] border border-gray-200 dark:border-gray-800 rounded-xl outline-none focus:border-primary transition-colors text-black dark:text-white"
                      placeholder="Opcional"
                      value={formData.description}
                      onChange={e => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">De onde vêm os contatos? <span className="text-red-500">*</span></label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                       <button className={`p-4 rounded-xl border text-left flex flex-col gap-2 transition-all ${formData.source === 'csv' ? 'border-primary bg-primary/5' : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-[#15172b] hover:border-gray-400'}`} onClick={() => setFormData({ ...formData, source: 'csv' })}>
                          <FileSpreadsheet className={`w-5 h-5 ${formData.source === 'csv' ? 'text-primary' : 'text-gray-400'}`} />
                          <div>
                            <p className="font-bold text-sm text-gray-900 dark:text-white">Arquivo CSV</p>
                            <p className="text-xs text-gray-500 mt-1">Suba uma lista de contatos</p>
                          </div>
                       </button>
                       <button className={`p-4 rounded-xl border text-left flex flex-col gap-2 transition-all ${formData.source === 'sanitizacao' ? 'border-primary bg-primary/5' : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-[#15172b] hover:border-gray-400'}`} onClick={() => setFormData({ ...formData, source: 'sanitizacao' })}>
                          <CheckCircle2 className={`w-5 h-5 ${formData.source === 'sanitizacao' ? 'text-primary' : 'text-gray-400'}`} />
                          <div>
                            <p className="font-bold text-sm text-gray-900 dark:text-white">Sanitização</p>
                            <p className="text-xs text-gray-500 mt-1">Usar lista já verificada</p>
                          </div>
                       </button>
                       <button className={`p-4 rounded-xl border text-left flex flex-col gap-2 transition-all ${formData.source === 'tags' ? 'border-primary bg-primary/5' : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-[#15172b] hover:border-gray-400'}`} onClick={() => setFormData({ ...formData, source: 'tags' })}>
                          <Tag className={`w-5 h-5 ${formData.source === 'tags' ? 'text-primary' : 'text-gray-400'}`} />
                          <div>
                            <p className="font-bold text-sm text-gray-900 dark:text-white">Tags de Tickets</p>
                            <p className="text-xs text-gray-500 mt-1">Contatos por etiqueta</p>
                          </div>
                       </button>
                       <button className={`p-4 rounded-xl border text-left flex flex-col gap-2 transition-all ${formData.source === 'kanban' ? 'border-primary bg-primary/5' : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-[#15172b] hover:border-gray-400'}`} onClick={() => setFormData({ ...formData, source: 'kanban' })}>
                          <Trello className={`w-5 h-5 ${formData.source === 'kanban' ? 'text-primary' : 'text-gray-400'}`} />
                          <div>
                            <p className="font-bold text-sm text-gray-900 dark:text-white">Kanban</p>
                            <p className="text-xs text-gray-500 mt-1">Leads em etapas do funil</p>
                          </div>
                       </button>
                    </div>
                  </div>

                  {formData.source === 'csv' && (
                    <div className="p-6 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                       <UploadCloud className="w-8 h-8 text-gray-400 mb-3" />
                       <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Arraste o CSV ou clique para selecionar</p>
                       <p className="text-xs text-gray-500 mt-2">Você também pode colar números diretamente</p>
                       <textarea 
                          placeholder="Ou cole os números aqui..."
                          className="mt-4 w-full max-w-sm px-4 py-2 border border-gray-200 dark:border-gray-800 rounded-lg outline-none bg-transparent text-xs"
                          rows={3}
                          onBlur={(e) => {
                             if(e.target.value.trim()) parseCsvContacts(e.target.value);
                          }}
                       />
                    </div>
                  )}

                  {formData.contacts.length > 0 && (
                    <div className="bg-primary/5 border border-primary/20 p-4 rounded-xl text-center">
                       <p className="text-primary font-bold">{formData.contacts.length} contatos carregados</p>
                       <button className="text-xs text-primary/70 mt-1 hover:underline" onClick={() => setFormData({ ...formData, contacts: [] })}>Clique para substituir</button>
                    </div>
                  )}

                  {formData.contacts.length > 0 && (
                    <div className="bg-white dark:bg-[#15172b] border border-gray-200 dark:border-gray-800 rounded-xl p-4 overflow-hidden">
                       <p className="text-xs text-gray-500 font-semibold mb-3">Prévia (5 primeiros):</p>
                       <ul className="text-xs text-gray-400 font-mono space-y-1">
                          {formData.contacts.slice(0, 5).map(c => (
                            <li key={c.id}>{c.phone} — {c.name}</li>
                          ))}
                       </ul>
                    </div>
                  )}

                  <div className="flex justify-end pt-4">
                     <Button variant="primary" onClick={() => {
                        if (!formData.name) { toast.error('Preencha o nome do disparo'); return; }
                        if (formData.contacts.length === 0) { toast.error('Adicione contatos'); return; }
                        setWizardStep(2);
                     }}>Próximo <ChevronRight className="w-4 h-4 ml-1" /></Button>
                  </div>
                </div>
              )}

              {wizardStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Caixas de envio <span className="text-red-500">*</span></label>
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                       {instances.map(instance => (
                         <label key={instance.id} className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${formData.selectedInstances.includes(instance.id) ? 'border-primary bg-primary/5' : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-[#15172b] hover:border-gray-400'}`}>
                           <input type="checkbox" className="w-4 h-4 text-primary bg-black border-gray-600 rounded focus:ring-primary focus:ring-2" 
                              checked={formData.selectedInstances.includes(instance.id)}
                              onChange={(e) => {
                                 if (e.target.checked) setFormData({ ...formData, selectedInstances: [...formData.selectedInstances, instance.id] });
                                 else setFormData({ ...formData, selectedInstances: formData.selectedInstances.filter(id => id !== instance.id) });
                              }}
                           />
                           <div>
                             <p className="text-sm font-bold text-gray-900 dark:text-white">{instance.name}</p>
                             <p className="text-xs text-gray-500">{instance.type} • {instance.status}</p>
                           </div>
                         </label>
                       ))}
                       {instances.length === 0 && <p className="text-sm text-gray-500 py-4">Nenhuma caixa de envio disponível.</p>}
                    </div>
                  </div>

                  <div>
                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Modo de rotação</label>
                     <div className="flex bg-gray-100 dark:bg-[#111322] p-1 rounded-xl w-fit">
                        <button className={`px-6 py-2 text-sm font-semibold rounded-lg transition-colors ${formData.rotationMode === 'round_robin' ? 'bg-white dark:bg-[#1a1d36] text-primary shadow-sm' : 'text-gray-500'}`} onClick={() => setFormData({ ...formData, rotationMode: 'round_robin' })}>Round Robin</button>
                        <button className={`px-6 py-2 text-sm font-semibold rounded-lg transition-colors ${formData.rotationMode === 'aleatorio' ? 'bg-white dark:bg-[#1a1d36] text-primary shadow-sm' : 'text-gray-500'}`} onClick={() => setFormData({ ...formData, rotationMode: 'aleatorio' })}>Aleatório</button>
                        <button className={`px-6 py-2 text-sm font-semibold rounded-lg transition-colors ${formData.rotationMode === 'peso' ? 'bg-white dark:bg-[#1a1d36] text-primary shadow-sm' : 'text-gray-500'}`} onClick={() => setFormData({ ...formData, rotationMode: 'peso' })}>Por peso</button>
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div>
                       <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Delay mínimo (seg)</label>
                       <input type="number" className="w-full px-4 py-2 bg-white dark:bg-[#111322] border border-gray-200 dark:border-gray-800 rounded-lg outline-none text-black dark:text-white" value={formData.minDelay} onChange={e => setFormData({ ...formData, minDelay: Number(e.target.value) })} />
                     </div>
                     <div>
                       <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Delay máximo (seg)</label>
                       <input type="number" className="w-full px-4 py-2 bg-white dark:bg-[#111322] border border-gray-200 dark:border-gray-800 rounded-lg outline-none text-black dark:text-white" value={formData.maxDelay} onChange={e => setFormData({ ...formData, maxDelay: Number(e.target.value) })} />
                     </div>
                  </div>

                  <p className="text-sm font-bold text-gray-900 dark:text-white mt-8 mb-4">ANTI-BLOQUEIO</p>
                  <div className="space-y-3">
                     <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" className="w-4 h-4 text-primary bg-black border-gray-600 rounded focus:ring-primary focus:ring-2" checked={formData.spintax} onChange={(e) => setFormData({ ...formData, spintax: e.target.checked })} />
                        <div>
                          <p className="text-sm font-bold text-gray-900 dark:text-white">Ativar Spintax</p>
                          <p className="text-xs text-gray-500">Varia os textos: {'{Olá|Oi}'}</p>
                        </div>
                     </label>
                     <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" className="w-4 h-4 text-primary bg-black border-gray-600 rounded focus:ring-primary focus:ring-2" checked={formData.followUp} onChange={(e) => setFormData({ ...formData, followUp: e.target.checked })} />
                        <div>
                          <p className="text-sm font-bold text-gray-900 dark:text-white">Follow-up automático</p>
                          <p className="text-xs text-gray-500">Envia mensagem para quem não respondeu</p>
                        </div>
                     </label>
                  </div>

                  <div className="pt-6 border-t border-gray-200 dark:border-gray-800">
                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Início do disparo</label>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button className={`p-4 rounded-xl border text-center flex flex-col items-center gap-2 transition-all ${formData.startMode === 'imediato' ? 'border-emerald-500 bg-emerald-500/5' : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-[#15172b] hover:border-gray-400'}`} onClick={() => setFormData({ ...formData, startMode: 'imediato' })}>
                           <Play className={`w-5 h-5 ${formData.startMode === 'imediato' ? 'text-emerald-500' : 'text-gray-400'}`} />
                           <div>
                             <p className={`font-bold text-sm ${formData.startMode === 'imediato' ? 'text-emerald-500' : 'text-gray-900 dark:text-white'}`}>Início imediato</p>
                             <p className="text-xs text-gray-500 mt-1">Inicia ao criar</p>
                           </div>
                        </button>
                     </div>
                  </div>

                  <div className="flex justify-between pt-4 mt-6">
                     <Button variant="ghost" onClick={() => setWizardStep(1)}>Voltar</Button>
                     <Button variant="primary" onClick={() => {
                        if (formData.selectedInstances.length === 0) { toast.error('Selecione uma caixa de envio'); return; }
                        setWizardStep(3);
                     }}>Próximo <ChevronRight className="w-4 h-4 ml-1" /></Button>
                  </div>
                </div>
              )}

              {wizardStep === 3 && (
                <div className="space-y-6">
                  <div className="bg-white dark:bg-[#15172b] p-6 rounded-2xl border border-gray-200 dark:border-gray-800">
                     <div className="flex justify-between items-center mb-4">
                        <p className="text-sm font-bold text-gray-900 dark:text-white">Mensagens do disparo</p>
                        <button className="text-xs font-semibold text-primary hover:underline">+ Adicionar mensagem</button>
                     </div>
                     
                     <div className="p-4 bg-gray-50 dark:bg-[#111322] rounded-xl border border-gray-200 dark:border-gray-800">
                        <div className="mb-4">
                           <label className="block text-xs font-semibold text-gray-500 mb-1">Tipo</label>
                           <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#15172b] text-sm text-black dark:text-white rounded-lg outline-none focus:border-primary"
                             value={formData.messageType}
                             onChange={e => setFormData({ ...formData, messageType: e.target.value })}
                           >
                             <option value="text">Texto</option>
                             <option value="image">Imagem</option>
                             <option value="document">Documento</option>
                             <option value="audio">Áudio</option>
                             <option value="video">Vídeo</option>
                           </select>
                        </div>
                        <textarea 
                           className="w-full p-3 bg-white dark:bg-[#15172b] border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-black dark:text-white outline-none focus:border-primary min-h-[120px]"
                           placeholder="Sua mensagem aqui..."
                           value={formData.messageContent}
                           onChange={e => setFormData({ ...formData, messageContent: e.target.value })}
                        />
                     </div>

                     <div className="mt-4 p-3 rounded-lg border border-orange-500/20 bg-orange-500/5 text-xs text-orange-400 font-mono">
                       Variáveis disponíveis: {'{{nome}}'} {'{{telefone}}'} + colunas extras do CSV
                     </div>
                  </div>

                  <div className="flex justify-between pt-4">
                     <Button variant="ghost" onClick={() => setWizardStep(2)}>Voltar</Button>
                     <Button variant="primary" onClick={() => {
                        if (!formData.messageContent.trim()) { toast.error('A mensagem não pode estar vazia'); return; }
                        setWizardStep(4);
                     }}>Próximo <ChevronRight className="w-4 h-4 ml-1" /></Button>
                  </div>
                </div>
              )}

              {wizardStep === 4 && (
                <div className="space-y-6">
                  <div className="bg-white dark:bg-[#15172b] p-6 rounded-2xl border border-gray-200 dark:border-gray-800">
                     <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{formData.name}</h3>
                     <p className="text-sm text-gray-500 mb-6">{formData.description}</p>
                     
                     <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
                        <div>
                           <p className="text-gray-500">Fonte: <strong className="text-white uppercase">{formData.source}</strong> ({formData.contacts.length} contatos)</p>
                        </div>
                        <div>
                           <p className="text-gray-500">Mensagens: <strong className="text-white">1 mensagem(ns)</strong></p>
                        </div>
                        <div>
                           <p className="text-gray-500">Caixas: <strong className="text-white pr-2 block truncate">{formData.selectedInstances.length > 0 ? formData.selectedInstances[0] : 'Nenhuma'} {formData.selectedInstances.length > 1 ? `(+${formData.selectedInstances.length - 1})` : ''}</strong></p>
                        </div>
                        <div>
                           <p className="text-gray-500">Delay: <strong className="text-white">{formData.minDelay}-{formData.maxDelay}s</strong></p>
                        </div>
                     </div>
                     <div className="mt-4 inline-block px-3 py-1 bg-emerald-500/10 text-emerald-500 font-bold text-xs rounded-full uppercase tracking-widest">
                       Início {formData.startMode}
                     </div>
                  </div>

                  <div className="p-4 border border-green-500/30 bg-green-500/5 text-green-400 text-sm rounded-xl">
                     O disparo será <strong>iniciado imediatamente</strong> após a criação.
                  </div>

                  <div className="flex justify-between pt-4 mt-8 lg:mt-16">
                     <Button variant="ghost" onClick={() => setWizardStep(3)}>Voltar</Button>
                     <Button variant="primary" onClick={handleLaunchCampaign} size="lg">Criar Disparo</Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* MODO EM EXECUÇÃO */}
        {phase === 'running' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-4">
                 <button onClick={() => setPhase('list')} className="w-8 h-8 rounded-full border border-gray-700 flex items-center justify-center text-gray-400 hover:text-white">
                   <ArrowLeft className="w-4 h-4" />
                 </button>
                 <div>
                   <div className="flex items-center gap-3">
                     <h2 className="text-xl font-bold text-white">{formData.name}</h2>
                     <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-500 text-[10px] font-bold uppercase tracking-wider rounded-sm">Em execução</span>
                   </div>
                   <p className="text-xs text-gray-500 mt-0.5">{formData.description || 'Sem descrição'}</p>
                 </div>
               </div>
               <div className="flex items-center gap-3">
                 <Button variant="secondary" className="bg-transparent border-gray-700 text-gray-300">
                   <Pause className="w-4 h-4 mr-2" /> Pausar
                 </Button>
                 <Button variant="ghost" className="text-gray-400 w-10 h-10 p-0 flex items-center justify-center">
                   <RotateCw className="w-4 h-4" />
                 </Button>
                 <Button variant="secondary" className="bg-transparent border-gray-700 text-gray-300">
                   <FileSpreadsheet className="w-4 h-4 mr-2" /> Exportar CSV
                 </Button>
               </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
               <div className="bg-[#15172b] p-4 rounded-xl border border-gray-800">
                 <p className="text-xs text-gray-500 font-semibold mb-1">Total</p>
                 <p className="text-2xl font-bold text-white">{formData.contacts.length}</p>
               </div>
               <div className="bg-[#15172b] p-4 rounded-xl border border-gray-800">
                 <p className="text-xs text-gray-500 font-semibold mb-1">Enviados</p>
                 <p className="text-2xl font-bold text-emerald-500">0</p>
               </div>
               <div className="bg-[#15172b] p-4 rounded-xl border border-gray-800">
                 <p className="text-xs text-gray-500 font-semibold mb-1">Falhos</p>
                 <p className="text-2xl font-bold text-red-500">0</p>
               </div>
               <div className="bg-[#15172b] p-4 rounded-xl border border-gray-800">
                 <p className="text-xs text-gray-500 font-semibold mb-1">Tx. Entrega</p>
                 <p className="text-2xl font-bold text-amber-500">0%</p>
               </div>
               <div className="bg-[#15172b] p-4 rounded-xl border border-gray-800">
                 <p className="text-xs text-gray-500 font-semibold mb-1">Entregues</p>
                 <p className="text-2xl font-bold text-blue-500">0</p>
               </div>
               <div className="bg-[#15172b] p-4 rounded-xl border border-gray-800">
                 <p className="text-xs text-gray-500 font-semibold mb-1">Respostas</p>
                 <p className="text-2xl font-bold text-white">0</p>
               </div>
            </div>

            <Card title="Configuração do disparo">
               <div className="grid grid-cols-2 gap-y-3 gap-x-8 text-sm">
                 <div className="flex justify-between py-2 border-b border-gray-800/30">
                   <span className="text-gray-500">Origem dos contatos</span>
                   <span className="text-white font-medium truncate ml-4 max-w-[200px]">Arquivo CSV</span>
                 </div>
                 <div className="flex justify-between py-2 border-b border-gray-800/30">
                   <span className="text-gray-500">Caixas de entrada</span>
                   <span className="text-white font-medium truncate ml-4 max-w-[200px]">{formData.selectedInstances.length > 0 ? formData.selectedInstances[0] : 'Nenhuma'}</span>
                 </div>
                 <div className="flex justify-between py-2 border-b border-gray-800/30">
                   <span className="text-gray-500">Modo de rotação</span>
                   <span className="text-white font-medium truncate">Round Robin</span>
                 </div>
                 <div className="flex justify-between py-2 border-b border-gray-800/30">
                   <span className="text-gray-500">Início</span>
                   <span className="text-white font-medium truncate">Imediato</span>
                 </div>
               </div>
            </Card>

            <div className="bg-[#15172b] rounded-2xl border border-gray-800 p-6">
               <div className="mb-4">
                  <h3 className="text-sm font-bold text-white mb-2">Progresso do disparo</h3>
                  <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                     <div className="h-full bg-emerald-500 w-[0%]"></div>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-[10px] uppercase font-bold tracking-wider text-gray-500">
                     <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> 0 enviados</span>
                     <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-red-500"></div> 0 falhos</span>
                     <span className="flex items-center gap-1.5 text-gray-400">{formData.contacts.length} pendentes</span>
                  </div>
               </div>
               
               <div className="mt-8 overflow-hidden rounded-xl border border-gray-800">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="bg-[#1a1d36] text-gray-400 text-xs border-b border-gray-800">
                        <th className="px-4 py-3 font-semibold">Telefone</th>
                        <th className="px-4 py-3 font-semibold">Nome</th>
                        <th className="px-4 py-3 font-semibold">Status</th>
                        <th className="px-4 py-3 font-semibold">Enviado em</th>
                        <th className="px-4 py-3 font-semibold">Erro</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800 text-gray-300">
                      {formData.contacts.slice(0, 10).map((c, i) => (
                        <tr key={i} className="hover:bg-white/5 transition-colors">
                          <td className="px-4 py-3 font-mono text-xs">{c.phone}</td>
                          <td className="px-4 py-3">{c.name}</td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-0.5 rounded-full border border-gray-600 bg-gray-800/50 text-gray-400 text-[10px] font-bold uppercase tracking-wider">Aguardando</span>
                          </td>
                          <td className="px-4 py-3 text-gray-500">—</td>
                          <td className="px-4 py-3 text-gray-500">—</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
               </div>
            </div>
          </div>
        )}

      </div>
    </Layout>
  );
};
