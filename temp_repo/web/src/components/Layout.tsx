import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Settings,
  MessageSquare,
  FileText,
  Plug,
  Bot,
  LogOut,
  Menu,
  X,
  Moon,
  Sun,
  Send,
  Shield,
  Users,
  FolderOpen,
  MessageCircle
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../contexts/ThemeContext';

interface LayoutProps {
  children: React.ReactNode;
}

const allNavigation = [
  { name: 'Painel', href: '/', icon: LayoutDashboard, module: 'painel' },
  { name: 'Projetos', href: '/projetos', icon: FolderOpen, module: 'projetos' },
  { name: 'Chats Internos', href: '/chats', icon: MessageCircle, module: 'chats_internos' },
  { name: 'Conexões', href: '/conexoes', icon: MessageSquare, module: 'instancias' },
  { name: 'Disparador', href: '/campaigns', icon: Send, module: 'disparador' },
  { name: 'Sessões Bot', href: '/bot-sessions', icon: Bot, module: 'sessoes_bot' },
  { name: 'Logs', href: '/logs', icon: FileText, module: 'logs' },
  { name: 'Integrações', href: '/integrations', icon: Plug, module: 'integracoes' },
  { name: 'SSO / Keycloak', href: '/sso', icon: Shield, module: 'sso' },
  { name: 'Config Extra', href: '/config-extra', icon: Settings, module: 'configuracoes' },
  { name: 'Usuários', href: '/users', icon: Users, module: 'usuarios', adminOnly: true },
];

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { isDarkMode, toggleDarkMode, companyName, logoUrl } = useTheme();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userModules = user?.modules || [];
  const isAdmin = user?.role === 'admin' || user?.id === 'admin' || userModules.includes('all');

  const navigation = allNavigation.filter(item => {
    if (item.adminOnly && !isAdmin) return false;
    return isAdmin || userModules.includes(item.module) || item.module === 'painel'; // base panel is always allowed?
  });


  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] transition-colors font-sans">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-[#15172b] border-r border-gray-100 dark:border-gray-800/60 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } shadow-lg lg:shadow-none`}
      >
        <div className="flex flex-col h-full bg-slate-50/30 dark:bg-transparent">
          {/* Logo */}
          <div className="flex items-center justify-between px-6 py-6 border-b border-gray-100 dark:border-gray-800/60">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="bg-gradient-to-br from-primary to-indigo-600 w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-primary/30">
                <Shield className="w-5 h-5 text-white" />
              </div>
              {logoUrl ? (
                <img src={logoUrl} alt={companyName} className="h-8 max-w-[140px] object-contain" />
              ) : (
                <span className="font-bold text-gray-900 dark:text-white truncate text-xl tracking-tight">{companyName}</span>
              )}
            </div>
            <button
              className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
            <h3 className="px-4 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 mt-4 first:mt-0">Módulos de Sistema</h3>
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;

              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-4 py-3 text-sm font-medium transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-r from-primary to-indigo-600 text-white rounded-2xl shadow-md transform scale-[1.02]'
                      : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 rounded-xl hover:text-gray-900 dark:hover:text-white'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Logout & Theme Toggle */}
          <div className="px-4 py-4 border-t border-gray-100 dark:border-gray-800/60 flex flex-col gap-4">
            {user && (
              <div className="bg-white dark:bg-[#111322] border border-gray-100 dark:border-gray-800/60 rounded-2xl p-3 shadow-sm flex items-center justify-between">
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] shrink-0"></div>
                    <p className="text-xs font-bold text-gray-900 dark:text-white truncate uppercase tracking-wider">{user.username}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-1.5 ml-4">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                      {isAdmin ? 'ADMIN' : 'USER'}
                    </span>
                    <span className="text-[10px] text-gray-500 truncate">{companyName}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-1">
              <button
                onClick={toggleDarkMode}
                className="flex items-center justify-between w-full px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-all duration-200"
              >
                <div className="flex items-center">
                  {isDarkMode ? <Sun className="w-4 h-4 mr-3 text-amber-500" /> : <Moon className="w-4 h-4 mr-3 text-indigo-500" />}
                  Tema {isDarkMode ? 'Claro' : 'Escuro'}
                </div>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-red-500 rounded-xl border border-red-500/20 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair do Sistema
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col h-screen">
        {/* Top bar (Mobile) */}
        <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 lg:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2">
              {logoUrl ? (
                <img src={logoUrl} alt={companyName} className="h-8 max-w-[180px] object-contain" />
              ) : (
                <span className="font-semibold text-gray-800 dark:text-white truncate text-lg">{companyName}</span>
              )}
            </div>
            <button
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Page content */}
        <main className="p-6 flex-1 overflow-y-auto dark:text-white">{children}</main>
      </div>
    </div>
  );
};
