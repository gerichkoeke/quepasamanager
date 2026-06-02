import React, { useState, useEffect } from 'react';
import { Button } from '../../components/Button';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

export const RelatoriosTab: React.FC = () => {
  const [totals, setTotals] = useState<any>({
    total: 0, confirmados: 0, pendentes: 0, faltas: 0, em_andamento: 0, realizados: 0, taxa_comparecimento: 0
  });

  useEffect(() => {
    api.getAppointmentsOverview()
      .then(setTotals)
      .catch(() => toast.error('Erro ao carregar relatórios'));
  }, []);

  return (
    <div className="p-6 h-full flex flex-col space-y-8 overflow-y-auto">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-white">terça-feira, 2 de junho</h2>
            <p className="text-sm text-gray-500">Visão geral do dia</p>
          </div>
          <Button variant="primary">+ Novo</Button>
        </div>

        <div className="grid grid-cols-5 gap-4">
          <div className="bg-[#1A1A24] border border-[#2A2A35] rounded-xl p-4">
            <div className="text-2xl font-bold text-white">{totals.total}</div>
            <div className="text-xs text-gray-500 mt-1">Total</div>
          </div>
          <div className="bg-[#1A1A24] border border-[#2A2A35] rounded-xl p-4">
            <div className="text-2xl font-bold text-emerald-500">{totals.confirmados}</div>
            <div className="text-xs text-gray-500 mt-1">Confirmados</div>
          </div>
          <div className="bg-[#1A1A24] border border-[#2A2A35] rounded-xl p-4">
            <div className="text-2xl font-bold text-yellow-500">{totals.pendentes}</div>
            <div className="text-xs text-gray-500 mt-1">Pendentes</div>
          </div>
          <div className="bg-[#1A1A24] border border-[#2A2A35] rounded-xl p-4">
            <div className="text-2xl font-bold text-red-500">{totals.faltas}</div>
            <div className="text-xs text-gray-500 mt-1">Faltas</div>
          </div>
          <div className="bg-[#1A1A24] border border-[#2A2A35] rounded-xl p-4">
            <div className="text-2xl font-bold text-purple-500">{totals.em_andamento}</div>
            <div className="text-xs text-gray-500 mt-1">Em Andamento</div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-white mb-4">Próximos atendimentos hoje</h3>
        <div className="bg-[#1A1A24] border border-[#2A2A35] rounded-xl p-8 text-center">
          <p className="text-sm text-gray-500">Nenhum atendimento pendente para hoje.</p>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-white mb-4">Histórico</h3>
        <select className="bg-[#1A1A24] text-white border border-[#2A2A35] rounded-lg px-3 py-1.5 text-sm outline-none mb-4 w-48">
          <option>Últimos 7 dias</option>
          <option>Últimos 30 dias</option>
        </select>

        <div className="grid grid-cols-4 gap-4">
          <div className="bg-[#1A1A24] border border-[#2A2A35] rounded-xl p-4">
            <div className="text-sm text-gray-500 mb-2">Total</div>
            <div className="text-2xl font-bold text-blue-500">{totals.total}</div>
          </div>
          <div className="bg-[#1A1A24] border border-[#2A2A35] rounded-xl p-4">
            <div className="text-sm text-gray-500 mb-2">Realizados</div>
            <div className="text-2xl font-bold text-emerald-500">{totals.realizados}</div>
          </div>
          <div className="bg-[#1A1A24] border border-[#2A2A35] rounded-xl p-4">
            <div className="text-sm text-gray-500 mb-2">Faltas</div>
            <div className="text-2xl font-bold text-red-500">{totals.faltas}</div>
          </div>
          <div className="bg-[#1A1A24] border border-[#2A2A35] rounded-xl p-4">
            <div className="text-sm text-gray-500 mb-2">Taxa de Comparecimento</div>
            <div className="text-2xl font-bold text-purple-500">{totals.taxa_comparecimento}%</div>
          </div>
        </div>
      </div>
    </div>
  );
};
