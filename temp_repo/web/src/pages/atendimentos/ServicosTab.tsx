import React, { useState, useEffect } from 'react';
import { Button } from '../../components/Button';
import { api } from '../../services/api';
import toast from 'react-hot-toast';
import { X, Edit2, Trash2 } from 'lucide-react';

export const ServicosTab: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState(60);
  const [price, setPrice] = useState(0);
  const [color, setColor] = useState('#10B981');
  const [online, setOnline] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setData(await api.getServices());
    } catch (e) { toast.error('Erro ao carregar serviços'); } 
    finally { setLoading(false); }
  };

  const openNew = () => {
    setEditingItem(null);
    setName(''); setDescription(''); setDuration(60); setPrice(0); 
    setColor('#10B981'); setOnline(false);
    setShowModal(true);
  };

  const openEdit = (item: any) => {
    setEditingItem(item);
    setName(item.name || '');
    setDescription(item.description || '');
    setDuration(item.duration || 60);
    setPrice(item.price || 0);
    setColor(item.color || '#10B981');
    setOnline(item.online || false);
    setShowModal(true);
  };

  const deleteItem = async (id: string) => {
    if (!confirm('Deseja excluir este serviço?')) return;
    try {
      await api.deleteService(id);
      setData(data.filter(d => d.id !== id));
      toast.success('Excluído');
    } catch(e) { toast.error('Erro ao excluir'); }
  };

  const save = async () => {
    if (!name) return toast.error('Nome é obrigatório');
    const payload = { name, description, duration, price, color, online };
    try {
      if (editingItem) await api.updateService(editingItem.id, payload);
      else await api.createService(payload);
      toast.success('Salvo');
      setShowModal(false);
      loadData();
    } catch(e) { toast.error('Erro ao salvar'); }
  };

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex-1"></div>
        <Button variant="primary" onClick={openNew}>+ Novo Serviço</Button>
      </div>

      <div className="flex-1 bg-[#1A1A24] border border-[#2A2A35] rounded-xl overflow-hidden flex flex-col">
        <table className="w-full text-left text-sm text-gray-400">
          <thead className="bg-[#111115] border-b border-[#2A2A35] text-xs uppercase text-gray-500">
            <tr>
              <th className="px-6 py-4 font-medium">Serviço</th>
              <th className="px-6 py-4 font-medium">Duração</th>
              <th className="px-6 py-4 font-medium">Valor Padrão</th>
              <th className="px-6 py-4 font-medium">Online</th>
              <th className="px-6 py-4 font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={5} className="text-center py-8">Carregando...</td></tr> :
             data.length === 0 ? <tr><td colSpan={5} className="text-center py-8 text-gray-500">Nenhum serviço encontrado.</td></tr> :
             data.map(item => (
                <tr key={item.id} className="border-b border-[#2A2A35] hover:bg-[#20202A] transition-colors">
                  <td className="px-6 py-4 text-white flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color || '#10B981'}}></span>
                    {item.name}
                  </td>
                  <td className="px-6 py-4">{item.duration} min</td>
                  <td className="px-6 py-4">R$ {item.price.toFixed(2).replace('.', ',')}</td>
                  <td className="px-6 py-4">{item.online ? 'Sim' : 'Não'}</td>
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1A1A24] rounded-2xl w-full max-w-lg shadow-xl border border-[#2A2A35] p-6 animate-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white">{editingItem ? 'Editar Serviço' : 'Novo Serviço'}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Nome *</label>
                <input value={name} onChange={e=>setName(e.target.value)} type="text" className="w-full px-4 py-2 bg-[#111115] border border-[#2A2A35] rounded-xl outline-none focus:border-primary text-white" />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Descrição</label>
                <textarea rows={2} value={description} onChange={e=>setDescription(e.target.value)} className="w-full px-4 py-2 bg-[#111115] border border-[#2A2A35] rounded-xl outline-none focus:border-primary text-white resize-none"></textarea>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Duração (min)</label>
                  <input value={duration} onChange={e=>setDuration(parseInt(e.target.value)||0)} type="number" className="w-full px-4 py-2 bg-[#111115] border border-[#2A2A35] rounded-xl outline-none focus:border-primary text-white" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Valor Padrão (R$)</label>
                  <input value={price} onChange={e=>setPrice(parseFloat(e.target.value)||0)} type="number" step="0.01" className="w-full px-4 py-2 bg-[#111115] border border-[#2A2A35] rounded-xl outline-none focus:border-primary text-white" />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="text-xs text-gray-400 mb-1 block">Cor</label>
                  <input value={color} onChange={e=>setColor(e.target.value)} type="color" className="w-full h-10 bg-[#111115] border border-[#2A2A35] rounded-xl outline-none cursor-pointer p-1" />
                </div>
                <div className="flex items-center gap-2 mt-6">
                  <input type="checkbox" id="online" checked={online} onChange={e=>setOnline(e.target.checked)} className="w-4 h-4 bg-[#111115] border-[#2A2A35] rounded" />
                  <label htmlFor="online" className="text-sm text-gray-400">Disponível online</label>
                </div>
              </div>

              <div className="border border-dashed border-[#2A2A35] rounded-xl p-4 text-center mt-4">
                <p className="text-sm text-gray-500">Lembretes automáticos</p>
                <p className="text-xs text-gray-600 mb-2">Variáveis: {'{{paciente}}, {{profissional}}, {{servico}}, {{data}}, {{hora}}'}</p>
                <Button variant="secondary" className="text-xs">+ Adicionar lembrete</Button>
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
