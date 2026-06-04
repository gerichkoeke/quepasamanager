import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { Button } from '../components/Button';
import { Plus, Send, Paperclip, Circle, Video, Search, MessageSquare, Phone, MoreVertical, X, Users, User, Briefcase } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../services/api';
import { useEffect } from 'react';

interface ChatMessage {
  id: string;
  sender: string;
  content: string;
  time: string;
  isMe: boolean;
}

export const ChatsInternos: React.FC = () => {
  const [chats, setChats] = useState<{id: string, name: string, members: string[], type: string}[]>([]);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [newChatName, setNewChatName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [inputText, setInputText] = useState('');
  
  const [myStatus, setMyStatus] = useState<'online' | 'busy' | 'offline'>('online');
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [jitsiRoom, setJitsiRoom] = useState<string | null>(null);
  const [settings, setSettings] = useState<any>(null);
  
  const [chatType, setChatType] = useState<'agent' | 'group' | 'project'>('group');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await api.getSettings();
      setSettings(data);
    } catch {}
  };
  
  // Fake messages
  const [chatMessages, setChatMessages] = useState<Record<string, ChatMessage[]>>({
    'mock': [
      { id: '1', sender: 'ACloud', content: 'Olá, pessoal. Vamos iniciar o projeto', time: '14:30', isMe: false },
      { id: '2', sender: 'Você', content: 'Podemos fazer uma call para alinhar?', time: '14:35', isMe: true }
    ]
  });

  const handleCreateChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChatName && chatType !== 'agent') return;
    const finalName = chatType === 'agent' && selectedMembers.length > 0 ? selectedMembers[0] : newChatName;
    const newChat = { id: Math.random().toString(), name: finalName, members: selectedMembers, type: chatType };
    setChats([...chats, newChat]);
    setNewChatName('');
    setSelectedMembers([]);
    setShowNewChatModal(false);
    setActiveChat(newChat.id);
    toast.success('Chat criado com sucesso!');
  };

  const startVideoCall = () => {
    if (!activeChat) return;
    const baseUrl = settings?.jitsi_server ? settings.jitsi_server.replace(/\/$/, '') : 'https://meet.jit.si';
    setJitsiRoom(`${baseUrl}/armazem-cloud-interno-${activeChat}`);
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !activeChat) return;
    
    const newMsg: ChatMessage = {
      id: Math.random().toString(),
      sender: 'Você',
      content: inputText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true
    };
    
    setChatMessages(prev => ({
      ...prev,
      [activeChat]: [...(prev[activeChat] || []), newMsg]
    }));
    
    setInputText('');
  };

  const isEmbedded = new URLSearchParams(window.location.search).get('embedded') === '1';

  return (
    <Layout>
      <div className={`flex h-full bg-white dark:bg-cw-surface-dark overflow-hidden animate-in fade-in duration-300 ${!isEmbedded ? 'rounded-2xl border border-cw-border-light dark:border-cw-border-dark' : ''}`}>
        
        {/* Sidebar */}
        <div className="w-72 border-r border-cw-border-light dark:border-cw-border-dark flex flex-col bg-cw-bg-light/50 dark:bg-transparent">
          <div className="p-4 border-b border-cw-border-light dark:border-cw-border-dark flex justify-between items-center">
            <div>
              <h2 className="font-bold text-gray-900 dark:text-white">Chats Internos</h2>
              <p className="text-xs text-gray-500">{chats.length} chat{chats.length !== 1 && 's'}</p>
            </div>
            <div className="flex gap-1 relative">
              <button 
                onClick={() => setShowStatusMenu(!showStatusMenu)}
                className="p-2 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors flex items-center"
                title="Meu Status"
              >
                <Circle className={`w-4 h-4 ${myStatus === 'online' ? 'text-emerald-500 fill-emerald-500' : myStatus === 'busy' ? 'text-red-500 fill-red-500' : 'text-gray-500 fill-gray-500'}`} />
              </button>
              {showStatusMenu && (
                <div className="absolute top-10 right-10 w-32 bg-white dark:bg-cw-surface-dark border border-cw-border-light dark:border-cw-border-dark rounded-xl shadow-lg overflow-hidden py-1 z-50">
                   <button onClick={() => {setMyStatus('online'); setShowStatusMenu(false)}} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2">
                     <Circle className="w-3 h-3 text-emerald-500 fill-emerald-500" /> Online
                   </button>
                   <button onClick={() => {setMyStatus('busy'); setShowStatusMenu(false)}} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2">
                     <Circle className="w-3 h-3 text-red-500 fill-red-500" /> Ocupado
                   </button>
                   <button onClick={() => {setMyStatus('offline'); setShowStatusMenu(false)}} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2">
                     <Circle className="w-3 h-3 text-gray-500 fill-gray-500" /> Invisível
                   </button>
                </div>
              )}
              <button 
                onClick={() => setShowNewChatModal(true)}
                className="p-2 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors"
                title="Novo Chat"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <div className="p-3">
             <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Pesquisar..." 
                  className="w-full pl-9 pr-4 py-2 bg-white dark:bg-cw-surface-dark border border-cw-border-light dark:border-cw-border-dark rounded-lg text-sm text-gray-900 dark:text-white outline-none focus:border-primary transition-colors"
                />
             </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {chats.length === 0 ? (
              <div className="text-center text-xs text-gray-500 p-4">
                Nenhum chat criado. Clique em + para criar.
              </div>
            ) : (
              chats.map(chat => (
                <button
                  key={chat.id}
                  onClick={() => setActiveChat(chat.id)}
                  className={`w-full text-left p-3 rounded-xl flex items-center gap-3 transition-colors ${
                    activeChat === chat.id 
                      ? 'bg-primary/10 text-primary dark:bg-primary/20' 
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm ${
                    activeChat === chat.id ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                  }`}>
                    {chat.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-semibold text-sm line-clamp-1">{chat.name}</div>
                    <div className="text-xs opacity-70 leading-tight line-clamp-1">
                      {chat.type === 'agent' ? 'Chat direto' : chat.type === 'project' ? 'Discussão de Projeto' : chat.members && chat.members.length > 0 ? chat.members.join(', ') : 'Canal de equipe'}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col bg-white dark:bg-cw-surface-dark">
          {!activeChat ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
              <MessageSquare className="w-16 h-16 text-gray-200 dark:text-gray-800 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Chats Internos</h3>
              <p className="text-sm mt-1">Selecione um chat para começar</p>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="h-16 border-b border-cw-border-light dark:border-cw-border-dark flex items-center justify-between px-6 bg-white/50 dark:bg-cw-surface-dark/50 backdrop-blur-sm z-10 relative">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary text-white flex items-center justify-center font-bold text-sm">
                      {chats.find(c => c.id === activeChat)?.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white leading-tight">
                        {chats.find(c => c.id === activeChat)?.name}
                      </h3>
                      <span className="text-xs text-emerald-500 font-medium">Online</span>
                    </div>
                 </div>
                 
                 <div className="flex items-center gap-2">
                    <button onClick={startVideoCall} className="p-2 text-gray-500 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors group relative" title="Iniciar Videochamada (Estilo Discord)">
                      <Video className="w-5 h-5" />
                      <span className="absolute -bottom-8 right-0 text-[10px] bg-gray-900 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity pointer-events-none">Video (Jitsi)</span>
                    </button>
                    <button className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                      <Phone className="w-5 h-5" />
                    </button>
                    <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1"></div>
                    <button className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                      <Search className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                 </div>
              </div>

              {/* Messages Area */}
              {jitsiRoom ? (
                <div className="flex-1 w-full bg-black relative">
                  <button 
                    onClick={() => setJitsiRoom(null)}
                    className="absolute top-4 right-4 z-50 bg-red-600 text-white px-4 py-2 rounded-lg font-bold shadow-lg hover:bg-red-700"
                  >
                    Sair da Chamada
                  </button>
                  <iframe 
                     src={jitsiRoom}
                     className="w-full h-full border-none"
                     allow="camera; microphone; fullscreen; display-capture"
                  />
                </div>
              ) : (
                <>
                  <div className="flex-1 overflow-y-auto p-6 space-y-6">
                     {(chatMessages[activeChat] || []).map(msg => (
                       <div key={msg.id} className={`flex flex-col ${msg.isMe ? 'items-end' : 'items-start'}`}>
                         <div className="flex items-baseline gap-2 mb-1 px-1">
                            {!msg.isMe && <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{msg.sender}</span>}
                            <span className="text-[10px] text-gray-400">{msg.time}</span>
                         </div>
                         <div className={`px-4 py-2.5 rounded-2xl max-w-[75%] text-sm ${
                            msg.isMe 
                              ? 'bg-primary text-white rounded-tr-sm' 
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-tl-sm'
                         }`}>
                            {msg.content}
                         </div>
                       </div>
                     ))}
                  </div>

                  {/* Message Input */}
                  <div className="p-4 bg-white dark:bg-cw-surface-dark border-t border-cw-border-light dark:border-cw-border-dark">
                     <form onSubmit={handleSendMessage} className="flex items-center gap-2 bg-cw-bg-light dark:bg-cw-surface-dark border border-cw-border-light dark:border-cw-border-dark rounded-xl p-2 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                        <label className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors cursor-pointer" title="Anexar Arquivo">
                           <Paperclip className="w-5 h-5" />
                           <input type="file" className="hidden" />
                        </label>
                        <input 
                          type="text"
                          value={inputText}
                          onChange={(e) => setInputText(e.target.value)}
                          placeholder="Enviar mensagem..." 
                          className="flex-1 bg-transparent border-none outline-none text-sm text-gray-900 dark:text-white placeholder:text-gray-400"
                        />
                        <Button type="submit" variant="primary" className="!p-2 rounded-lg aspect-square flex items-center justify-center h-auto">
                           <Send className="w-4 h-4 ml-0.5" />
                        </Button>
                     </form>
                  </div>
                </>
              )}
            </>
          )}
        </div>

        {/* Modal Novo Chat */}
        {showNewChatModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-cw-surface-dark rounded-2xl w-full max-w-sm shadow-xl border border-cw-border-light dark:border-cw-border-dark overflow-hidden">
              <div className="flex justify-between items-center p-5 border-b border-cw-border-light dark:border-cw-border-dark/60">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Criar Novo Chat</h3>
                <button onClick={() => setShowNewChatModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleCreateChat} className="p-5 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Tipo de Chat</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button type="button" onClick={() => setChatType('agent')} className={`p-3 border rounded-xl flex flex-col items-center justify-center gap-1 transition-colors ${chatType === 'agent' ? 'border-primary bg-primary/5 text-primary' : 'border-cw-border-light dark:border-cw-border-dark hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500'}`}>
                       <User className="w-5 h-5 mb-1" />
                       <span className="text-[10px] font-bold uppercase tracking-wider">Agente</span>
                    </button>
                    <button type="button" onClick={() => setChatType('group')} className={`p-3 border rounded-xl flex flex-col items-center justify-center gap-1 transition-colors ${chatType === 'group' ? 'border-primary bg-primary/5 text-primary' : 'border-cw-border-light dark:border-cw-border-dark hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500'}`}>
                       <Users className="w-5 h-5 mb-1" />
                       <span className="text-[10px] font-bold uppercase tracking-wider">Grupo</span>
                    </button>
                    <button type="button" onClick={() => setChatType('project')} className={`p-3 border rounded-xl flex flex-col items-center justify-center gap-1 transition-colors ${chatType === 'project' ? 'border-primary bg-primary/5 text-primary' : 'border-cw-border-light dark:border-cw-border-dark hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500'}`}>
                       <Briefcase className="w-5 h-5 mb-1" />
                       <span className="text-[10px] font-bold uppercase tracking-wider">Projeto</span>
                    </button>
                  </div>
                </div>

                {chatType !== 'agent' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">{chatType === 'project' ? 'Nome do Projeto' : 'Nome do Chat'}</label>
                    <input
                      type="text"
                      value={newChatName}
                      onChange={e => setNewChatName(e.target.value)}
                      placeholder={chatType === 'project' ? "Ex: Website Redesign" : "Ex: Equipe de Vendas"}
                      className="w-full px-4 py-2.5 bg-cw-bg-light dark:bg-cw-surface-dark border border-cw-border-light dark:border-cw-border-dark rounded-xl outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:text-white text-sm"
                      autoFocus
                    />
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Membros</label>
                  <div className="border border-cw-border-light dark:border-cw-border-dark rounded-xl overflow-hidden bg-cw-bg-light dark:bg-cw-surface-dark">
                    {['ACloud', 'Alan Silva', 'Gabriel Erich Koeke', 'Leonardo Rosa'].map(member => (
                       <label key={member} className="flex items-center gap-3 p-3 border-b border-cw-border-light dark:border-cw-border-dark last:border-0 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors">
                          <input 
                            type="checkbox" 
                            className="w-4 h-4 rounded text-primary border-cw-border-light dark:border-gray-600 bg-transparent focus:ring-0" 
                            checked={selectedMembers.includes(member)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedMembers([...selectedMembers, member]);
                              } else {
                                setSelectedMembers(selectedMembers.filter(m => m !== member));
                              }
                            }}
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">{member}</span>
                       </label>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <Button type="button" variant="secondary" onClick={() => setShowNewChatModal(false)}>Cancelar</Button>
                  <Button type="submit" variant="primary">Criar Chat</Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};
