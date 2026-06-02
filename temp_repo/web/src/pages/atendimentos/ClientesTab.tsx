import React, { useState, useEffect } from 'react';
import { Button } from '../../components/Button';
import { api } from '../../services/api';
import toast from 'react-hot-toast';
import { X, Edit2, Trash2 } from 'lucide-react';

export const ClientesTab: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [partners, setPartners] = useState<any[]>([]);

  // form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [partnerId, setPartnerId] = useState('');
  const [observations, setObservations] = useState('');

  useEffect(() => {
    loadData();
    api.getHealthPlans().then(setPartners).catch(console.error);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.getPatients();
      setData(res);
    } catch (e) {
      toast.error('Erro ao carregar clientes');
    } finally {
      setLoading(false);
    }
  };

  const openNew = () => {
    setEditingItem(null);
    setName(''); setPhone(''); setEmail(''); setCpf(''); setPartnerId(''); setObservations('');
    setShowModal(true);
  };

  const openEdit = (item: any) => {
    setEditingItem(item);
    setName(item.name || '');
    setPhone(item.phone || '');
    setEmail(item.email || '');
    setCpf(item.cpf || '');
    setPartnerId(item.partnerId || '');
    setObservations(item.observations || '');
    setShowModal(true);
  };

  const deleteItem = async (id: string) => {
    if (!confirm('Deseja excluir este cliente?')) return;
    try {
      await api.deletePatient(id);
      setData(data.filter(d => d.id !== id));
      toast.success('Cliente excluído');
    } catch(e) { toast.error('Erro ao excluir'); }
  }

  const save = async () => {
    if (!name || !phone) return toast.error('Nome e telefone são obrigatórios');
    const payload = { name, phone, email, cpf, partnerId: partnerId || null, observations };
    try {
      if (editingItem) {
        await api.updatePatient(editingItem.id, payload);
        toast.success('Atualizado com sucesso');
      } else {
        await api.createPatient(payload);
        toast.success('Criado com sucesso');
      }
      setShowModal(false);
      loadData();
    } catch(e) {
      toast.error('Erro ao salvar');
    }
  };

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <input 
          type="text"
          placeholder="Buscar por nome, telefone ou CPF..."
          className="flex-1 max-w-2xl px-4 py-2 bg-[#1A1A24] border border-[#2A2A35] rounded-xl outline-none focus:border-primary text-white"
        />
        <Button variant="primary" onClick={openNew}>+ Novo Cliente</Button>
      </div>

      <div className="flex-1 bg-[#1A1A24] border border-[#2A2A35] rounded-xl overflow-hidden flex flex-col">
        <table className="w-full text-left text-sm text-gray-400">
          <thead className="bg-[#111115] border-b border-[#2A2A35] text-xs uppercase text-gray-500">
            <tr>
              <th className="px-6 py-4 font-medium">Nome</th>
              <th className="px-6 py-4 font-medium">Telefone</th>
              <th className="px-6 py-4 font-medium">CPF</th>
              <th className="px-6 py-4 font-medium">Parceiro</th>
              <th className="px-6 py-4 font-medium">Consultas</th>
              <th className="px-6 py-4 font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center py-8">Carregando...</td></tr>
            ) : data.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-8 text-gray-500">Nenhum cliente encontrado.</td></tr>
            ) : (
              data.map(item => (
                <tr key={item.id} className="border-b border-[#2A2A35] hover:bg-[#20202A] transition-colors">
                  <td className="px-6 py-4 text-white">{item.name}</td>
                  <td className="px-6 py-4">{item.phone}</td>
                  <td className="px-6 py-4">{item.cpf || '-'}</td>
                  <td className="px-6 py-4">{item.partner?.name || '-'}</td>
                  <td className="px-6 py-4">0</td>
                  <td className="px-6 py-4 flex items-center gap-2">
                    <button onClick={() => openEdit(item)} className="p-1 text-gray-400 hover:text-blue-500 transition-colors"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => deleteItem(item.id)} className="p-1 text-gray-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1A1A24] rounded-2xl w-full max-w-lg shadow-xl border border-[#2A2A35] p-6 animate-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white">{editingItem ? 'Editar Cliente' : 'Novo Cliente'}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Nome *</label>
                <input value={name} onChange={e=>setName(e.target.value)} type="text" className="w-full px-4 py-2 bg-[#111115] border border-[#2A2A35] rounded-xl outline-none focus:border-primary text-white" />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Telefone *</label>
                <input value={phone} onChange={e=>setPhone(e.target.value)} type="text" className="w-full px-4 py-2 bg-[#111115] border border-[#2A2A35] rounded-xl outline-none focus:border-primary text-white" />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">E-mail</label>
                <input value={email} onChange={e=>setEmail(e.target.value)} type="email" className="w-full px-4 py-2 bg-[#111115] border border-[#2A2A35] rounded-xl outline-none focus:border-primary text-white" />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">CPF</label>
                <input value={cpf} onChange={e=>setCpf(e.target.value)} type="text" className="w-full px-4 py-2 bg-[#111115] border border-[#2A2A35] rounded-xl outline-none focus:border-primary text-white" />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Parceiro (opcional)</label>
                <select value={partnerId} onChange={e=>setPartnerId(e.target.value)} className="w-full px-4 py-2 bg-[#111115] border border-[#2A2A35] rounded-xl outline-none focus:border-primary text-white">
                  <option value="">Nenhum / Particular</option>
                  {partners.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Observações</label>
                <textarea rows={3} value={observations} onChange={e=>setObservations(e.target.value)} className="w-full px-4 py-2 bg-[#111115] border border-[#2A2A35] rounded-xl outline-none focus:border-primary text-white resize-none"></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-4">
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
