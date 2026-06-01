import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Settings as SettingsIcon, Key, FileCode2, Sliders, Plus } from 'lucide-react';
import { api } from '../services/api';
import toast from 'react-hot-toast';

export const ConfigExtra: React.FC = () => {
  const [activeTab, setActiveTab] = useState('permissoes');
  const [users, setUsers] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({});
  
  // Setup tabs
  const [setupSubTab, setSetupSubTab] = useState('quepasa');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [usersData, settingsData] = await Promise.all([
        api.getUsers().catch(() => []),
        api.getSettings().catch(() => ({}))
      ]);
      setUsers(usersData);
      setSettings(settingsData);
    } catch (err) {
      toast.error('Erro ao carregar dados');
    }
  };

  const handleToggleModule = async (userId: string, moduleName: string, enabled: boolean) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    let updatedModules = [...(user.modules || [])];
    if (enabled) {
      if (!updatedModules.includes(moduleName)) updatedModules.push(moduleName);
    } else {
      updatedModules = updatedModules.filter(m => m !== moduleName);
    }
    
    // Optimistic update
    setUsers(users.map(u => u.id === userId ? { ...u, modules: updatedModules } : u));
    
    try {
       await api.updateUser(userId, { modules: updatedModules });
       toast.success('Permissão atualizada');
    } catch (err) {
       toast.error('Erro ao salvar permissão');
       loadData(); // revert
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.updateSettings(settings);
      toast.success('Configurações salvas!');
    } catch (err) {
      toast.error('Erro ao salvar configurações');
    }
  };

  const currentHost = typeof window !== 'undefined' ? window.location.origin : 'https://hub.quepasa.example.com';
  
  const CHATWOOT_SCRIPT = `<script>
// ============================================================
// QUEPASA HUB INTEGRATION MENU - SCRIPT CHATWOOT
// Cole este script na configuração de Código Customizado (Custom Code) do seu Chatwoot.
// ============================================================

(function() {
  const HUB_URL = '${currentHost}';
  
  function getSidebarWidth() {
    const aside = document.querySelector('aside.bg-n-solid-2, aside[class*="bg-n-solid"], aside.border-r, aside');
    if (aside) {
      return aside.getBoundingClientRect().right;
    }
    const primaryMenu = document.querySelector('.primary-menu');
    if (primaryMenu) {
      return primaryMenu.getBoundingClientRect().right;
    }
    return 64; // Default chatwoot left nav width
  }

  function openHubModal(path) {
    let panel = document.getElementById('quepasa-hub-panel');
    let iframe;
    
    if (!panel) {
      panel = document.createElement('div');
      panel.id = 'quepasa-hub-panel';
      
      iframe = document.createElement('iframe');
      iframe.id = 'quepasa-hub-iframe';
      iframe.style.cssText = 'width:100%;height:100%;border:none;display:block;background:#fff;';
      
      // Close/Back button similar to native feeling or just overlay
      // But actually, chatwoot routes change could close the panel
      // Let's add a subtle close button or depend on menu click
      
      panel.appendChild(iframe);
      document.body.appendChild(panel);
    } else {
      iframe = document.getElementById('quepasa-hub-iframe');
    }

    const sidebarWidth = getSidebarWidth();
    const theme = document.body.classList.contains('dark') ? 'dark' : 'light';
    const bg = theme === 'dark' ? '#0f172a' : '#fefefe';
    
    panel.style.cssText = \`position:fixed;top:0;right:0;bottom:0;left:\${sidebarWidth}px;background:\${bg};z-index:998;display:block;box-shadow: -4px 0 15px rgba(0,0,0,0.05);\`;
    
    if (iframe) iframe.style.background = bg;
    
    const finalPath = path + (path.includes('?') ? '&' : '?') + 'embedded=1&theme=' + theme;
    iframe.src = HUB_URL + finalPath;
  }

  function closeHubModal() {
    const panel = document.getElementById('quepasa-hub-panel');
    if (panel) panel.style.display = 'none';
    
    // Remove active styles from our menus
    const mainNav = document.querySelector('aside nav ul.list-none, aside nav > ul, nav.grid ul');
    if (mainNav) {
      const allItems = mainNav.querySelectorAll('div[id^="hub-menu-"]');
      allItems.forEach(i => i.classList.remove('bg-n-alpha-2', 'text-n-slate-12'));
    }
  }

  // Theme Sync Observer
  const themeObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
        const theme = document.body.classList.contains('dark') ? 'dark' : 'light';
        const panel = document.getElementById('quepasa-hub-panel');
        const iframe = document.getElementById('quepasa-hub-iframe');
        
        if (panel) {
          const bg = theme === 'dark' ? '#0f172a' : '#fefefe';
          panel.style.background = bg;
          if (iframe) iframe.style.background = bg;
        }
        
        if (iframe && iframe.contentWindow) {
          iframe.contentWindow.postMessage({ action: 'setTheme', theme }, '*');
        }
      }
    });
  });
  
  themeObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] });

  let lastUrl = location.href;
  function closeOnNavigation() {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      closeHubModal();
    }
  }
  setInterval(closeOnNavigation, 500);

  function injectMenu() {
    if (document.getElementById('hub-menu-kanban')) return;

    const mainNav = document.querySelector('aside nav ul.list-none, aside nav > ul, nav.grid ul');
    if (!mainNav) return;

    const allLi = mainNav.querySelectorAll(':scope > li');
    if (allLi.length === 0) return;

    let refLi = null;
    let refLink = null;
    for (let i = 0; i < allLi.length; i++) {
      const text = allLi[i].textContent.toLowerCase();
      const titleEl = allLi[i].querySelector('[title]');
      const titleText = titleEl ? titleEl.getAttribute('title').toLowerCase() : '';
      const combined = text + ' ' + titleText;
      if (combined.includes('relatório') || combined.includes('report') || combined.includes('campanha') || combined.includes('campaign') || combined.includes('configura')) {
        refLi = allLi[i];
        refLink = refLi.querySelector('a, div[role="button"], button');
        break;
      }
    }

    if (!refLi) {
      refLi = allLi[allLi.length - 1];
      refLink = refLi.querySelector('a, div[role="button"], button');
    }

    if (!refLi || !refLink) return;

    function addMenuItem(id, label, iconHtml, path) {
      if (document.getElementById(id)) return;
      const li = document.createElement('li');
      li.className = refLi.className;
      
      const item = document.createElement('div');
      item.id = id;
      item.className = refLink.className;
      item.setAttribute('role', 'button');
      item.style.cursor = 'pointer';
      item.title = label;
      
      item.innerHTML = \`<div class="relative flex items-center gap-2 cw-menu-inner">
        <div class="flex items-center gap-1.5 flex-grow min-w-0">
          <span class="menu-icon" style="width:16px;height:16px;display:flex;align-items:center;justify-content:center;font-size:14px;">\${iconHtml}</span>
          <span class="text-sm font-medium leading-5 truncate cw-menu-label">\${label}</span>
        </div>
      </div>\`;
      
      item.onclick = (e) => {
        e.preventDefault();
        
        // Remove active from all items in this group
        const allItems = mainNav.querySelectorAll('div[id^="hub-menu-"]');
        allItems.forEach(i => i.classList.remove('bg-n-alpha-2', 'text-n-slate-12'));
        item.classList.add('bg-n-alpha-2', 'text-n-slate-12');
        
        openHubModal(path);
      };
      
      li.appendChild(item);
      mainNav.insertBefore(li, refLi);
    }

    addMenuItem('hub-menu-kanban', 'Kanban', '📊', '/kanban');
    addMenuItem('hub-menu-projetos', 'Projetos', '📁', '/projetos');
    addMenuItem('hub-menu-chats', 'Chats Int.', '💬', '/chats');
    addMenuItem('hub-menu-conexoes', 'Conexões', '🔗', '/conexoes');
    addMenuItem('hub-menu-disparador', 'Disparador', '🚀', '/campaigns');
  }

  setInterval(injectMenu, 3000);
})();
</script>`;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
        
        <div className="pb-4">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-gray-200 dark:border-gray-700">
               <SettingsIcon className="w-5 h-5 text-gray-500" />
             </div>
             <div>
                 <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Configurações Extras</h1>
                 <p className="text-sm text-gray-500">Permissões e configurações avançadas</p>
             </div>
          </div>
        </div>

        <div className="flex items-center gap-6 border-b border-gray-200 dark:border-gray-800/60 pb-0 overflow-x-auto">
          <button onClick={() => setActiveTab('permissoes')} className={`pb-3 text-sm font-semibold transition-colors border-b-2 whitespace-nowrap ${activeTab === 'permissoes' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Permissões por Empresa</button>
          <button onClick={() => setActiveTab('tokens')} className={`pb-3 text-sm font-semibold transition-colors border-b-2 whitespace-nowrap ${activeTab === 'tokens' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>API Tokens</button>
          <button onClick={() => setActiveTab('docs')} className={`pb-3 text-sm font-semibold transition-colors border-b-2 whitespace-nowrap ${activeTab === 'docs' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Documentação API</button>
          <button onClick={() => setActiveTab('setup')} className={`pb-3 text-sm font-semibold transition-colors border-b-2 whitespace-nowrap ${activeTab === 'setup' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Setup</button>
          <button onClick={() => setActiveTab('pwa')} className={`pb-3 text-sm font-semibold transition-colors border-b-2 whitespace-nowrap ${activeTab === 'pwa' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>PWA</button>
          <button onClick={() => setActiveTab('script')} className={`pb-3 text-sm font-semibold transition-colors border-b-2 whitespace-nowrap ${activeTab === 'script' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Script Chatwoot</button>
        </div>

        {activeTab === 'permissoes' && (
          <div className="space-y-4 pt-4">
             <div className="bg-white dark:bg-[#15172b] rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
                    <h2 className="text-base font-bold text-gray-900 dark:text-white">Permissões por Usuário</h2>
                    <p className="text-sm text-gray-500">Controle quais funcionalidades cada usuário / empresa pode acessar.</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-[#1a1d36] text-gray-300 border-b border-gray-800">
                           <tr>
                              <th className="px-6 py-4 font-semibold w-12"><input type="checkbox" className="rounded bg-transparent border-gray-600" /></th>
                              <th className="px-6 py-4 font-semibold">Empresa / Acesso</th>
                              <th className="px-6 py-4 font-semibold text-center whitespace-nowrap">Dashboard</th>
                              <th className="px-4 py-4 font-semibold text-center whitespace-nowrap">Kanban</th>
                              <th className="px-4 py-4 font-semibold text-center whitespace-nowrap">Projetos</th>
                              <th className="px-4 py-4 font-semibold text-center whitespace-nowrap">Chats Int.</th>
                              <th className="px-4 py-4 font-semibold text-center whitespace-nowrap">Conexões</th>
                              <th className="px-4 py-4 font-semibold text-center whitespace-nowrap">Disparador</th>
                              <th className="px-4 py-4 font-semibold text-center whitespace-nowrap">Sessões Bot</th>
                              <th className="px-4 py-4 font-semibold text-center whitespace-nowrap">Integrações</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800 text-gray-400">
                           {users.map(u => (
                              <tr key={u.id} className="hover:bg-white/5 transition-colors">
                                 <td className="px-6 py-4"><input type="checkbox" className="rounded bg-transparent border-gray-600" /></td>
                                 <td className="px-6 py-4">
                                     <div className="text-white font-medium">{u.username}</div>
                                     <div className="text-xs text-gray-500 font-normal">ID: {u.id.substring(0,6)}</div>
                                 </td>
                                 
                                 <td className="px-4 py-4">
                                    <div className="flex justify-center"><ToggleSwitch checked={u.modules?.includes('painel')} onChange={(v) => handleToggleModule(u.id, 'painel', v)} /></div>
                                 </td>
                                 <td className="px-4 py-4">
                                    <div className="flex justify-center"><ToggleSwitch checked={u.modules?.includes('kanban')} onChange={(v) => handleToggleModule(u.id, 'kanban', v)} /></div>
                                 </td>
                                 <td className="px-4 py-4">
                                    <div className="flex justify-center"><ToggleSwitch checked={u.modules?.includes('projetos')} onChange={(v) => handleToggleModule(u.id, 'projetos', v)} /></div>
                                 </td>
                                 <td className="px-4 py-4">
                                    <div className="flex justify-center"><ToggleSwitch checked={u.modules?.includes('chats_internos')} onChange={(v) => handleToggleModule(u.id, 'chats_internos', v)} /></div>
                                 </td>
                                 <td className="px-4 py-4">
                                    <div className="flex justify-center"><ToggleSwitch checked={u.modules?.includes('instancias')} onChange={(v) => handleToggleModule(u.id, 'instancias', v)} /></div>
                                 </td>
                                 <td className="px-4 py-4">
                                    <div className="flex justify-center"><ToggleSwitch checked={u.modules?.includes('disparador')} onChange={(v) => handleToggleModule(u.id, 'disparador', v)} /></div>
                                 </td>
                                 <td className="px-4 py-4">
                                    <div className="flex justify-center"><ToggleSwitch checked={u.modules?.includes('sessoes_bot')} onChange={(v) => handleToggleModule(u.id, 'sessoes_bot', v)} /></div>
                                 </td>
                                 <td className="px-4 py-4">
                                    <div className="flex justify-center"><ToggleSwitch checked={u.modules?.includes('integracoes')} onChange={(v) => handleToggleModule(u.id, 'integracoes', v)} /></div>
                                 </td>
                              </tr>
                           ))}
                        </tbody>
                    </table>
                </div>
             </div>
          </div>
        )}

        {/* API Tokens Tab */}
        {activeTab === 'tokens' && (
          <div className="space-y-4 pt-4">
             <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">Tokens de API</h2>
                  <p className="text-sm text-gray-500">Gerencie tokens para acesso programático à API REST</p>
                </div>
                <Button variant="primary" onClick={() => toast.success('Aguardando conexão com banco de dados de tokens')}><Plus className="w-4 h-4 mr-2" /> Novo Token</Button>
             </div>
             
             <div className="py-24 text-center border border-dashed border-gray-300 dark:border-gray-800 rounded-xl bg-white dark:bg-[#15172b]">
                <Key className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Nenhum token criado</h3>
                <p className="text-gray-500 text-sm">Crie seu primeiro token de API para começar a integrar seus sistemas.</p>
             </div>
          </div>
        )}

        {/* Documentação API Tab */}
        {activeTab === 'docs' && (
          <div className="space-y-4 pt-4">
             <Card title="Documentação Básica">
                <p className="text-sm text-gray-500 mb-6">Utilize os tokens gerados na aba anterior para autenticar as requisições com o header Authorization.</p>
                
                <div className="bg-slate-100 dark:bg-[#0b0f19] p-4 rounded-xl border border-slate-200 dark:border-gray-800 text-sm font-mono text-gray-700 dark:text-gray-300 overflow-x-auto">
                   <p className="text-emerald-500 mb-2">Exemplo de autenticação via CURL:</p>
                   curl -X GET \<br/>
                   &nbsp;&nbsp;https://hub.exemplo.com/api/v1/sessions \<br/>
                   &nbsp;&nbsp;-H 'Authorization: Bearer <span className="text-primary">SEU_TOKEN_DE_API</span>'
                </div>

                <div className="mt-6">
                   <h4 className="font-bold text-gray-900 dark:text-white mb-4">Endpoints REST Disponíveis:</h4>
                   <ul className="space-y-3">
                     <li className="flex gap-3 text-sm">
                        <span className="w-16 font-mono font-bold text-emerald-500">GET</span>
                        <code className="text-gray-500 dark:text-gray-400">/api/v1/sessions</code>
                        <span className="text-gray-600 dark:text-gray-400 ml-4">Listagem das conexões WhatsApp / API Oficial configuradas.</span>
                     </li>
                     <li className="flex gap-3 text-sm">
                        <span className="w-16 font-mono font-bold text-blue-500">POST</span>
                        <code className="text-gray-500 dark:text-gray-400">/api/v1/sessions</code>
                        <span className="text-gray-600 dark:text-gray-400 ml-4">Criação de nova conexão.</span>
                     </li>
                     <li className="flex gap-3 text-sm">
                        <span className="w-16 font-mono font-bold text-emerald-500">GET</span>
                        <code className="text-gray-500 dark:text-gray-400">/api/v1/campaigns</code>
                        <span className="text-gray-600 dark:text-gray-400 ml-4">Listar campanhas e status de envios no Disparador.</span>
                     </li>
                   </ul>
                </div>
             </Card>
          </div>
        )}

        {/* Setup Tab */}
        {activeTab === 'setup' && (
          <div className="space-y-6 pt-4">
            <div className="flex gap-6 text-sm font-semibold border-b border-gray-200 dark:border-gray-800 pb-0">
               <button onClick={() => setSetupSubTab('quepasa')} className={`pb-3 border-b-2 transition-colors ${setupSubTab === 'quepasa' ? 'border-primary text-primary' : 'border-transparent text-gray-500'}`}>Quepasa</button>
               <button onClick={() => setSetupSubTab('oficial')} className={`pb-3 border-b-2 transition-colors ${setupSubTab === 'oficial' ? 'border-primary text-primary' : 'border-transparent text-gray-500'}`}>API Oficial (Cloud API)</button>
            </div>

            {setupSubTab === 'quepasa' && (
              <form onSubmit={handleSaveSettings} className="space-y-4 max-w-xl">
                <Card title="Integração Master Quepasa">
                  <div className="space-y-4 pt-2">
                     <p className="text-sm text-gray-500">O Quepasa permite orquestrar e gerenciar instâncias de forma transparente.</p>
                     
                     <div>
                       <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">URL Base</label>
                       <input type="text" className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 bg-transparent rounded-lg outline-none dark:text-white focus:border-primary" 
                         value={settings?.quepasa_url || ''} onChange={e => setSettings({...settings, quepasa_url: e.target.value})} placeholder="http://localhost:3000" />
                     </div>
                     <div>
                       <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">Usuário</label>
                       <input type="text" className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 bg-transparent rounded-lg outline-none dark:text-white focus:border-primary" 
                         value={settings?.quepasa_user || ''} onChange={e => setSettings({...settings, quepasa_user: e.target.value})} placeholder="admin" />
                     </div>
                     <div>
                       <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">Senha</label>
                       <input type="password" className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 bg-transparent rounded-lg outline-none dark:text-white focus:border-primary" 
                         value={settings?.quepasa_password || ''} onChange={e => setSettings({...settings, quepasa_password: e.target.value})} placeholder="••••••••" />
                     </div>
                     
                     <div className="pt-2">
                       <Button variant="primary" type="submit">Salvar Configurações</Button>
                     </div>
                  </div>
                </Card>
              </form>
            )}

            {setupSubTab === 'oficial' && (
              <form onSubmit={handleSaveSettings} className="space-y-4 max-w-xl">
                 <Card title="Configuração da API Oficial">
                  <div className="space-y-4 pt-2">
                     <p className="text-sm text-gray-500">Configure as credenciais Master da Meta WhatsApp Cloud API para permitir gerenciar instâncias Oficiais.</p>
                     
                     <div>
                       <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">Graph API URL</label>
                       <input type="text" className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 bg-transparent rounded-lg outline-none dark:text-white focus:border-primary" 
                         value={settings?.official_url || ''} onChange={e => setSettings({...settings, official_url: e.target.value})} placeholder="https://graph.facebook.com/v19.0" />
                     </div>
                     <div>
                       <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">System User Access Token</label>
                       <input type="password" className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 bg-transparent rounded-lg outline-none dark:text-white focus:border-primary" 
                         value={settings?.official_token || ''} onChange={e => setSettings({...settings, official_token: e.target.value})} placeholder="EAA..." />
                     </div>
                     
                     <div className="pt-2">
                       <Button variant="primary" type="submit">Atualizar Credenciais Oficiais</Button>
                     </div>
                  </div>
                 </Card>
              </form>
            )}
          </div>
        )}

        {/* PWA Tab */}
        {activeTab === 'pwa' && (
          <div className="space-y-4 pt-4 max-w-xl">
             <Card title="Identidade Visual">
                <div className="space-y-6">
                  <p className="text-sm text-gray-500">Esta configuração altera a aparência da plataforma para os seus clientes.</p>
                  
                  <div>
                     <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Nome do App</label>
                     <input type="text" className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#111322] rounded-xl outline-none dark:text-white focus:border-primary text-sm shadow-sm" 
                       placeholder="Ex: Minha Empresa" />
                  </div>
                  <div>
                     <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Logo (URL)</label>
                     <input type="text" className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#111322] rounded-xl outline-none dark:text-white focus:border-primary text-sm shadow-sm" 
                       placeholder="https://..." />
                  </div>
                  <div>
                     <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Cor do Tema</label>
                     <div className="flex gap-2">
                        <div className="w-12 h-12 rounded-lg bg-[#4F46E5] border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-center text-white"><Sliders className="w-4 h-4"/></div>
                        <input type="text" className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#111322] rounded-xl outline-none dark:text-white focus:border-primary text-sm font-mono shadow-sm" 
                          value="#4F46E5" readOnly />
                     </div>
                  </div>
                  <Button variant="primary" className="w-full py-3" onClick={() => toast.success('Identidade visual atualizada')}>Salvar configuração</Button>
                </div>
             </Card>
          </div>
        )}

        {/* Script Chatwoot Tab */}
        {activeTab === 'script' && (
          <div className="space-y-4 pt-4 max-w-4xl">
             <Card title="Integração de Menu no Chatwoot (Widge Hub)">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                   Cole este código dentro das configurações de script customizado do seu Chatwoot.
                   Ele fará com que o menu do Chatwoot carregue os atalhos "Conexões" e "Disparador", 
                   abrindo o Hub magicamente como um modal sobreposto, sem o usuário precisar sair do sistema.
                </p>
                <div className="relative group">
                   <textarea className="w-full p-5 bg-slate-50 dark:bg-[#0B0F19] border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-mono text-indigo-700 dark:text-emerald-400 outline-none resize-none shadow-inner" rows={16} value={CHATWOOT_SCRIPT} readOnly spellCheck="false" />
                   <button className="absolute top-4 right-4 p-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 shadow-sm transition-all opacity-0 group-hover:opacity-100 flex items-center gap-2" 
                     onClick={() => { navigator.clipboard.writeText(CHATWOOT_SCRIPT); toast.success('Script copiado com sucesso!'); }}>
                     <FileCode2 className="w-4 h-4" />
                     <span>Copiar Script</span>
                   </button>
                </div>
             </Card>
          </div>
        )}

      </div>
    </Layout>
  );
};

const ToggleSwitch = ({ checked, onChange }: { checked: boolean, onChange: (c: boolean) => void }) => {
  return (
    <div 
      className={`w-10 h-5 flex items-center rounded-full p-1 cursor-pointer transition-colors ${checked ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-700'}`}
      onClick={() => onChange(!checked)}
    >
      <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${checked ? 'translate-x-4' : ''}`}></div>
    </div>
  );
};
