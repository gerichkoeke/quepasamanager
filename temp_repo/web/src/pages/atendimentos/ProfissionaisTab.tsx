import React, { useState, useEffect } from 'react';
import { Button } from '../../components/Button';
import { api } from '../../services/api';
import toast from 'react-hot-toast';
import { X, Edit2, Trash2 } from 'lucide-react';

export const ProfissionaisTab: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  const [name, setName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [registrations, setRegistrations] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [color, setColor] = useState('#8B5CF6');
  const [bufferMinutes, setBufferMinutes] = useState(0);
  const [lunchBreak, setLunchBreak] = useState(false);
  const [availableDays, setAvailableDays] = useState<string[]>([]);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setData(await api.getPractitioners());
    } catch (e) { toast.error('Erro ao carregar profissionais'); } 
    finally { setLoading(false); }
  };

  const openNew = () => {
    setEditingItem(null);
    setName(''); setSpecialty(''); setRegistrations(''); setEmail(''); setPhone(''); 
    setColor('#8B5CF6'); setBufferMinutes(0); setLunchBreak(false); setAvailableDays([]);
    setShowModal(true);
  };

  const openEdit = (item: any) => {
    setEditingItem(item);
    setName(item.name || '');
    setSpecialty(item.specialty || '');
    setRegistrations(item.registrations || '');
    setEmail(item.email || '');
    setPhone(item.phone || '');
    setColor(item.color || '#8B5CF6');
    setBufferMinutes(item.bufferMinutes || 0);
    setLunchBreak(item.lunchBreak || false);
    try { setAvailableDays(JSON.parse(item.availableDays || '[]')); } catch{ setAvailableDays([]); }
    setShowModal(true);
  };

  const deleteItem = async (id: string) => {
    if (!confirm('Deseja excluir este profissional?')) return;
    try {
      await api.deletePractitioner(id);
      setData(data.filter(d => d.id !== id));
      toast.success('Excluído');
    } catch(e) { toast.error('Erro ao excluir'); }
  };

  const save = async () => {
    if (!name) return toast.error('Nome é obrigatório');
    const payload = {
      name, specialty, registrations, email, phone, color, bufferMinutes, lunchBreak,
      availableDays: JSON.stringify(availableDays)
    };
    try {
      if (editingItem) await api.updatePractitioner(editingItem.id, payload);
      else await api.createPractitioner(payload);
      toast.success('Salvo');
      setShowModal(false);
      loadData();
    } catch(e) { toast.error('Erro ao salvar'); }
  };

  const toggleDay = (day: string) => {
    if (availableDays.includes(day)) setAvailableDays(availableDays.filter(d => d !== day));
    else setAvailableDays([...availableDays, day]);
  };

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <input 
          type="text" placeholder="Buscar por nome..."
          className="flex-1 max-w-2xl px-4 py-2 bg-[#1A1A24] border border-[#2A2A35] rounded-xl outline-none focus:border-primary text-white"
        />
        <Button variant="primary" onClick={openNew}>+ Novo Profissional</Button>
      </div>

      <div className="flex-1 bg-[#1A1A24] border border-[#2A2A35] rounded-xl overflow-hidden flex flex-col">
        <table className="w-full text-left text-sm text-gray-400">
          <thead className="bg-[#111115] border-b border-[#2A2A35] text-xs uppercase text-gray-500">
            <tr>
              <th className="px-6 py-4 font-medium">Nome</th>
              <th className="px-6 py-4 font-medium">Especialidade</th>
              <th className="px-6 py-4 font-medium">Telefone</th>
              <th className="px-6 py-4 font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={4} className="text-center py-8">Carregando...</td></tr> :
             data.length === 0 ? <tr><td colSpan={4} className="text-center py-8 text-gray-500">Nenhum profissional encontrado.</td></tr> :
             data.map(item => (
                <tr key={item.id} className="border-b border-[#2A2A35] hover:bg-[#20202A] transition-colors">
                  <td className="px-6 py-4 text-white flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color || '#8B5CF6'}}></span>
                    {item.name}
                  </td>
                  <td className="px-6 py-4">{item.specialty || '-'}</td>
                  <td className="px-6 py-4">{item.phone || '-'}</td>
                  <td className="px-6 py-4 flex items-center gap-2">
                    <button onClick={() => openEdit(item)} className="p-1 text-gray-400 hover:text-blue-500"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => deleteItem(item.id)} className="p-1 text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-[#1A1A24] rounded-2xl w-full max-w-lg shadow-xl border border-[#2A2A35] p-6 m-auto animate-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white">{editingItem ? 'Editar Profissional' : 'Novo Profissional'}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Nome *</label>
                <input value={name} onChange={e=>setName(e.target.value)} type="text" className="w-full px-4 py-2 bg-[#111115] border border-[#2A2A35] rounded-xl outline-none focus:border-primary text-white" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Especialidade</label>
                  <input value={specialty} onChange={e=>setSpecialty(e.target.value)} type="text" className="w-full px-4 py-2 bg-[#111115] border border-[#2A2A35] rounded-xl outline-none focus:border-primary text-white" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Registros</label>
                  <input value={registrations} onChange={e=>setRegistrations(e.target.value)} type="text" className="w-full px-4 py-2 bg-[#111115] border border-[#2A2A35] rounded-xl outline-none focus:border-primary text-white" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">E-mail</label>
                  <input value={email} onChange={e=>setEmail(e.target.value)} type="email" className="w-full px-4 py-2 bg-[#111115] border border-[#2A2A35] rounded-xl outline-none focus:border-primary text-white" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Telefone</label>
                  <input value={phone} onChange={e=>setPhone(e.target.value)} type="text" className="w-full px-4 py-2 bg-[#111115] border border-[#2A2A35] rounded-xl outline-none focus:border-primary text-white" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Cor</label>
                  <input value={color} onChange={e=>setColor(e.target.value)} type="color" className="w-full h-10 bg-[#111115] border border-[#2A2A35] rounded-xl outline-none cursor-pointer p-1" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Buffer entre consultas (min)</label>
                  <input value={bufferMinutes} onChange={e=>setBufferMinutes(parseInt(e.target.value)||0)} type="number" className="w-full px-4 py-2 bg-[#111115] border border-[#2A2A35] rounded-xl outline-none focus:border-primary text-white" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="lunchBreak" checked={lunchBreak} onChange={e=>setLunchBreak(e.target.checked)} className="w-4 h-4 bg-[#111115] border-[#2A2A35] rounded" />
                <label htmlFor="lunchBreak" className="text-sm text-gray-400">Horário de almoço</label>
              </div>
              
              <div>
                <label className="text-xs text-gray-400 mb-2 block">Dias disponíveis</label>
                <div className="flex flex-col gap-2">
                  {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map(day => (
                    <button key={day} onClick={() => toggleDay(day)} className={`px-4 py-2 text-sm rounded-lg text-left transition-colors border w-24 text-center ${availableDays.includes(day) ? 'bg-primary/20 text-primary border-primary' : 'bg-[#111115] border-[#2A2A35] text-gray-400 hover:text-white hover:border-gray-500'}`}>{day}</button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#2A2A35]">
                <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
                <Button variant="primary" onClick={save}>Salvar</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
