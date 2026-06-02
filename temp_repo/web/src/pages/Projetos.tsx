import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Plus, LayoutGrid, List, ClipboardList, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../services/api';

interface Project {
  id: string;
  name: string;
  description: string;
  status: string;
  deadline?: string;
  color?: string;
  _count?: {
    tasks: number;
    milestones: number;
    discussions: number;
    files: number;
    members: number;
  };
}

const PREDEFINED_COLORS = [
  '#3B82F6', // blue-500
  '#10B981', // emerald-500
  '#F59E0B', // amber-500
  '#EF4444', // red-500
  '#8B5CF6', // violet-500
  '#EC4899', // pink-500
  '#06B6D4', // cyan-500
  '#F97316', // orange-500
  '#64748B'  // slate-500
];

export const Projetos: React.FC = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeTab, setActiveTab] = useState('todos');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    status: 'ativo',
    deadline: '',
    color: PREDEFINED_COLORS[0]
  });

  const loadProjects = async () => {
    try {
      setIsLoading(true);
      const data = await api.getProjects();
      setProjects(data);
    } catch (error) {
      toast.error('Erro ao carregar projetos');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const filteredProjects = projects.filter(p => {
    if (activeTab === 'todos') return true;
    return p.status.toLowerCase() === activeTab;
  });

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.name) {
      toast.error('O nome do projeto é obrigatório.');
      return;
    }
    
    try {
      const created = await api.createProject(newProject);
      setProjects([created, ...projects]);
      setShowModal(false);
      setNewProject({
        name: '',
        description: '',
        status: 'ativo',
        deadline: '',
        color: PREDEFINED_COLORS[0]
      });
      toast.success('Projeto criado com sucesso!');
      loadProjects();
    } catch (error) {
      toast.error('Erro ao criar projeto');
    }
  };

  const getStats = () => {
    const todos = projects.length;
    const ativos = projects.filter(p => p.status === 'ativo').length;
    const concluidos = projects.filter(p => p.status === 'concluído' || p.status === 'concluido').length;
    const cancelados = projects.filter(p => p.status === 'cancelado').length;
    
    return { todos, ativos, concluidos, cancelados };
  };
  
  const stats = getStats();

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-cw-border-light dark:border-cw-border-dark/60 pb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Projetos</h1>
            <p className="text-sm text-gray-500">{stats.todos} projeto(s) no total</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center bg-white dark:bg-cw-surface-dark rounded-lg border border-cw-border-light dark:border-cw-border-dark p-1">
               <button 
                 onClick={() => setViewMode('grid')}
                 className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
               >
                 <LayoutGrid className="w-4 h-4" />
               </button>
               <button 
                 onClick={() => setViewMode('list')}
                 className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
               >
                 <List className="w-4 h-4" />
               </button>
            </div>
            <Button variant="primary" onClick={() => setShowModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Projeto
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-6 border-b border-cw-border-light dark:border-cw-border-dark/60 pb-0 overflow-x-auto">
          <button 
            onClick={() => setActiveTab('todos')} 
            className={`pb-3 text-sm font-semibold transition-colors border-b-2 whitespace-nowrap ${activeTab === 'todos' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            Todos ({stats.todos})
          </button>
          <button 
            onClick={() => setActiveTab('ativo')} 
            className={`pb-3 text-sm font-semibold transition-colors border-b-2 whitespace-nowrap ${activeTab === 'ativo' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            Ativos ({stats.ativos})
          </button>
          <button 
            onClick={() => setActiveTab('concluído')} 
            className={`pb-3 text-sm font-semibold transition-colors border-b-2 whitespace-nowrap ${activeTab === 'concluído' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            Concluídos ({stats.concluidos})
          </button>
          <button 
            onClick={() => setActiveTab('cancelado')} 
            className={`pb-3 text-sm font-semibold transition-colors border-b-2 whitespace-nowrap ${activeTab === 'cancelado' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            Cancelados ({stats.cancelados})
          </button>
        </div>

        {/* Content */}
        {filteredProjects.length === 0 ? (
          <div className="py-24 flex flex-col items-center justify-center text-center px-4">
            <ClipboardList className="w-16 h-16 text-gray-300 dark:text-gray-700 mb-4" strokeWidth={1} />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">Nenhum projeto encontrado</h3>
            <p className="text-sm text-gray-500">Crie seu primeiro projeto para começar</p>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
            {filteredProjects.map((project) => (
              <Card key={project.id} onClick={() => navigate(`/projetos/${project.id}`)} className="hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: project.color }}
                    />
                    <h3 className="font-semibold text-gray-900 dark:text-white">{project.name}</h3>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    project.status === 'Ativo' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                    project.status === 'Concluído' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                    'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                  }`}>
                    {project.status}
                  </span>
                </div>
                {project.description && (
                  <p className="text-sm text-gray-500 mb-4 line-clamp-2">{project.description}</p>
                )}
                <div className="text-xs text-gray-400 pt-4 border-t border-cw-border-light dark:border-cw-border-dark">
                  Prazo: {project.deadline ? new Date(project.deadline).toLocaleDateString() : 'Não definido'}
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Modal Novo Projeto */}
        {showModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-cw-surface-dark rounded-2xl w-full max-w-2xl shadow-xl border border-cw-border-light dark:border-cw-border-dark flex flex-col max-h-[90vh]">
              {/* Modal Header */}
              <div className="flex justify-between items-center p-6 border-b border-cw-border-light dark:border-cw-border-dark/60">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center border border-cw-border-light dark:border-cw-border-dark">
                    <ClipboardList className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Novo Projeto</h2>
                </div>
                <button 
                  onClick={() => setShowModal(false)}
                  className="p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto">
                <form id="project-form" onSubmit={handleCreateProject} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Nome do Projeto <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newProject.name}
                      onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                      placeholder="Ex: Desenvolvimento de Site"
                      className="w-full px-4 py-3 bg-cw-bg-light dark:bg-cw-surface-dark border border-cw-border-light dark:border-cw-border-dark rounded-xl outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:text-white transition-all text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Descrição
                    </label>
                    <textarea
                      value={newProject.description}
                      onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                      placeholder="Descreva o projeto..."
                      rows={3}
                      className="w-full px-4 py-3 bg-cw-bg-light dark:bg-cw-surface-dark border border-cw-border-light dark:border-cw-border-dark rounded-xl outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:text-white transition-all text-sm resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Status
                      </label>
                      <select
                        value={newProject.status}
                        onChange={(e) => setNewProject({...newProject, status: e.target.value})}
                        className="w-full px-4 py-3 bg-cw-bg-light dark:bg-cw-surface-dark border border-cw-border-light dark:border-cw-border-dark rounded-xl outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:text-white transition-all text-sm"
                      >
                        <option value="Ativo">Ativo</option>
                        <option value="Concluído">Concluído</option>
                        <option value="Cancelado">Cancelado</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Prazo
                      </label>
                      <input
                        type="date"
                        value={newProject.deadline}
                        onChange={(e) => setNewProject({...newProject, deadline: e.target.value})}
                        className="w-full px-4 py-3 bg-cw-bg-light dark:bg-cw-surface-dark border border-cw-border-light dark:border-cw-border-dark rounded-xl outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:text-white transition-all text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                      Cor de Identificação
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {PREDEFINED_COLORS.map(color => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setNewProject({...newProject, color})}
                          style={{ backgroundColor: color }}
                          className={`w-10 h-10 rounded-xl transition-all ${
                            newProject.color === color 
                              ? 'ring-4 ring-offset-2 dark:ring-offset-[#1C1E2C] ring-primary/60 scale-110 shadow-lg' 
                              : 'hover:scale-105 border border-black/10 dark:border-white/10 opacity-80 hover:opacity-100'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </form>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-3 p-6 border-t border-cw-border-light dark:border-cw-border-dark/60 bg-cw-bg-light dark:bg-transparent rounded-b-2xl">
                <Button 
                  variant="secondary" 
                  onClick={() => setShowModal(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  variant="primary" 
                  type="submit"
                  form="project-form"
                  className="px-6"
                >
                  Criar Projeto
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};
