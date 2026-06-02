import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { Calendar, Users, UserCog, ClipboardList, Briefcase, BarChart2 } from 'lucide-react';
import { AgendaTab } from './atendimentos/AgendaTab';
import { ClientesTab } from './atendimentos/ClientesTab';
import { ProfissionaisTab } from './atendimentos/ProfissionaisTab';
import { ServicosTab } from './atendimentos/ServicosTab';
import { ParceirosTab } from './atendimentos/ParceirosTab';
import { RelatoriosTab } from './atendimentos/RelatoriosTab';

const TABS = [
  { id: 'agenda', label: 'Agenda', icon: Calendar },
  { id: 'clientes', label: 'Clientes', icon: Users },
  { id: 'profissionais', label: 'Profissionais', icon: UserCog },
  { id: 'servicos', label: 'Serviços', icon: ClipboardList },
  { id: 'parceiros', label: 'Parceiros', icon: Briefcase },
  { id: 'relatorios', label: 'Relatórios', icon: BarChart2 },
];

export const Atendimentos: React.FC = () => {
  const [activeTab, setActiveTab] = useState('agenda');

  return (
    <Layout>
      <div className="flex flex-col h-full bg-[#111115] text-gray-300">
        <div className="px-6 py-4 flex items-center justify-between border-b border-[#2A2A35]">
          <div className="flex items-center gap-3 text-white">
            <div className="p-2 bg-primary/20 rounded-lg text-primary">
              <Calendar className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold">Atendimentos</h1>
          </div>
        </div>

        <div className="flex px-6 space-x-2 border-b border-[#2A2A35] bg-[#1A1A24]">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all duration-200 border-b-2
                ${activeTab === tab.id 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-gray-500 hover:text-gray-300'
                }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-auto bg-[#111115]">
          {activeTab === 'agenda' && <AgendaTab />}
          {activeTab === 'clientes' && <ClientesTab />}
          {activeTab === 'profissionais' && <ProfissionaisTab />}
          {activeTab === 'servicos' && <ServicosTab />}
          {activeTab === 'parceiros' && <ParceirosTab />}
          {activeTab === 'relatorios' && <RelatoriosTab />}
        </div>
      </div>
    </Layout>
  );
};
