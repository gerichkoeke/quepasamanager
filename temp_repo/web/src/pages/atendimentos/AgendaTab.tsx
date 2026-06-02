import React from 'react';
import { Button } from '../../components/Button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const AgendaTab: React.FC = () => {
  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-[#1A1A24] rounded-lg border border-[#2A2A35]">
            <button className="p-2 text-gray-400 hover:text-white transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-400 hover:text-white transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <span className="text-white font-medium">1 De Jun. - 7 De Jun. De 2026</span>
          
          <div className="flex items-center gap-2 bg-[#1A1A24] rounded-lg border border-[#2A2A35] p-1">
            <button className="px-3 py-1 text-sm font-medium rounded bg-primary text-white">Semana</button>
            <button className="px-3 py-1 text-sm font-medium rounded text-gray-400 hover:text-white">Mês</button>
            <button className="px-3 py-1 text-sm font-medium rounded text-gray-400 hover:text-white">Dia</button>
          </div>

          <div className="flex items-center gap-2 bg-[#1A1A24] rounded-lg border border-[#2A2A35] px-3 py-1.5">
            <span className="text-gray-400 text-sm">07h as 20h</span>
          </div>

          <select className="bg-[#1A1A24] text-white border border-[#2A2A35] rounded-lg px-3 py-1.5 text-sm outline-none">
            <option>Todos os profissionais</option>
          </select>
          <select className="bg-[#1A1A24] text-white border border-[#2A2A35] rounded-lg px-3 py-1.5 text-sm outline-none">
            <option>Todos os serviços</option>
          </select>
        </div>
        
        <Button variant="primary">+ Novo</Button>
      </div>

      <div className="flex-1 bg-[#1A1A24] border border-[#2A2A35] rounded-xl overflow-hidden flex flex-col">
        {/* Placeholder for calendar grid */}
        <div className="grid grid-cols-8 border-b border-[#2A2A35]">
          <div className="p-4 border-r border-[#2A2A35]"></div>
          {['Seg.', 'Ter.', 'Qua.', 'Qui.', 'Sex.', 'Sáb.', 'Dom.'].map((day, i) => (
            <div key={day} className={`p-4 text-center border-r border-[#2A2A35] ${i === 1 ? 'bg-primary/10 border-b-2 border-b-primary' : ''}`}>
              <div className={`font-medium ${i === 1 ? 'text-primary' : 'text-gray-400'}`}>{day}</div>
              <div className={`text-sm ${i === 1 ? 'text-primary' : 'text-gray-500'}`}>0{i+1} de jun.</div>
            </div>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto relative">
          <div className="grid grid-cols-8 h-[800px]">
            {/* Time column */}
            <div className="border-r border-[#2A2A35] flex flex-col">
              {[7,8,9,10,11,12,13,14,15,16,17].map(hour => (
                <div key={hour} className="flex-1 border-b border-[#2A2A35] p-2 text-xs text-gray-500 text-right">
                  {hour.toString().padStart(2, '0')}h
                </div>
              ))}
            </div>
            {/* Day columns */}
            {[1,2,3,4,5,6,7].map(day => (
              <div key={day} className="border-r border-[#2A2A35] flex flex-col relative">
                {[7,8,9,10,11,12,13,14,15,16,17].map(hour => (
                  <div key={hour} className="flex-1 border-b border-[#2A2A35]"></div>
                ))}
                {/* Current time indicator placeholder */}
                {day === 2 && (
                  <div className="absolute top-[30%] left-0 right-0 h-[2px] bg-red-500 z-10 flex items-center">
                    <div className="w-2 h-2 rounded-full bg-red-500 -ml-1"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
