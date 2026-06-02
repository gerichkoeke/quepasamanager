import React, { useState, useEffect } from 'react';
import { Button } from '../../components/Button';
import { api } from '../../services/api';
import toast from 'react-hot-toast';
import { X, Edit2, Trash2 } from 'lucide-react';

export const ParceirosTab: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  const [name, setName] = useState('');
  const [type, setType] = useState('Plano de Saúde');
  const [paymentTerm, setPaymentTerm] = useState('');
  const [ansCode, setAnsCode] = useState('');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setData(await api.getHealthPlans());
    } catch (e) { toast.error('Erro ao carregar parceiros'); } 
    finally { setLoading(false); }
  };

  const openNew = () => {
    setEditingItem(null);
    setName(''); setType('Plano de Saúde'); setPaymentTerm(''); setAnsCode('');
    setShowModal(true);
  };

  const openEdit = (item: any) => {
    setEditingItem(item);
    setName(item.name || '');
    setType(item.type || 'Plano de Saúde');
    setPaymentTerm(item.paymentTerm || '');
    setAnsCode(item.ansCode || '');
    setShowModal(true);
  };

  const deleteItem = async (id: string) => {
    if (!confirm('Deseja excluir este parceiro?')) return;
    try {
      await api.deleteHealthPlan(id);
      setData(data.filter(d => d.id !== id));
      toast.success('Excluído');
    } catch(e) { toast.error('Erro ao excluir'); }
  };

  const save = async () => {
    if (!name) return toast.error('Nome é obrigatório');
    const payload = { name, type, paymentTerm, ansCode };
    try {
      if (editingItem) await api.updateHealthPlan(editingItem.id, payload);
      else await api.createHealthPlan(payload);
      toast.success('Salvo');
      setShowModal(false);
      loadData();
    } catch(e) { toast.error('Erro ao salvar'); }
  };

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex-1"></div>
        <Button variant="primary" onClick={openNew}>+ Novo Parceiro</Button>
      </div>

      <div className="flex-1 bg-[#1A1A24] border border-[#2A2A35] rounded-xl overflow-hidden flex flex-col">
        <table className="w-full text-left text-sm text-gray-400">
          <thead className="bg-[#111115] border-b border-[#2A2A35] text-xs uppercase text-gray-500">
            <tr>
              <th className="px-6 py-4 font-medium">Nome</th>
              <th className="px-6 py-4 font-medium">Tipo</th>
              <th className="px-6 py-4 font-medium">Prazo Pgto</th>
              <th className="px-6 py-4 font-medium">Cód. ANS</th>
              <th className="px-6 py-4 font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={5} className="text-center py-8">Carregando...</td></tr> :
             data.length === 0 ? <tr><td colSpan={5} className="text-center py-8 text-gray-500">Nenhum parceiro cadastrado.</td></tr> :
             data.map(item => (
                <tr key={item.id} className="border-b border-[#2A2A35] hover:bg-[#20202A] transition-colors">
                  <td className="px-6 py-4 text-white">{item.name}</td>
                  <td className="px-6 py-4">{item.type || '-'}</td>
                  <td className="px-6 py-4">{item.paymentTerm || '-'}</td>
                  <td className="px-6 py-4">{item.ansCode || '-'}</td>
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
              <h3 className="text-lg font-bold text-white">{editingItem ? 'Editar Parceiro' : 'Novo Parceiro'}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Nome *</label>
                <input value={name} onChange={e=>setName(e.target.value)} type="text" className="w-full px-4 py-2 bg-[#111115] border border-[#2A2A35] rounded-xl outline-none focus:border-primary text-white" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Tipo</label>
                  <select value={type} onChange={e=>setType(e.target.value)} className="w-full px-4 py-2 bg-[#111115] border border-[#2A2A35] rounded-xl outline-none focus:border-primary text-white">
                    <option value="Plano de Saúde">Plano de Saúde</option>
                    <option value="Parceria">Parceria</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Prazo Pgto (dias)</label>
                  <input value={paymentTerm} onChange={e=>setPaymentTerm(e.target.value)} type="text" className="w-full px-4 py-2 bg-[#111115] border border-[#2A2A35] rounded-xl outline-none focus:border-primary text-white" />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Cód. ANS</label>
                <input value={ansCode} onChange={e=>setAnsCode(e.target.value)} type="text" className="w-full px-4 py-2 bg-[#111115] border border-[#2A2A35] rounded-xl outline-none focus:border-primary text-white" />
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
