import { create } from 'zustand';
import { api } from '../services/api';
import toast from 'react-hot-toast';
import { jwtDecode } from 'jwt-decode';

interface UserPayload {
  id: string;
  username: string;
  role: string;
  modules: string[];
}

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  user: UserPayload | null;
  login: (token: string) => Promise<boolean>;
  logout: () => void;
  verifyAuth: () => Promise<boolean>;
}

const parseUserFromToken = (token: string | null): UserPayload | null => {
  if (!token) return null;
  try {
    return jwtDecode<UserPayload>(token);
  } catch (e) {
    // Legacy generic token -> full admin
    return { id: 'admin', username: 'admin', role: 'admin', modules: ['all'] };
  }
};

export const useAuth = create<AuthState>((set, get) => ({
  isAuthenticated: !!api.getToken(),
  isLoading: false,
  token: api.getToken(),
  user: parseUserFromToken(api.getToken()),

  login: async (token: string) => {
    set({ isLoading: true });
    try {
      const response = await api.login({ token });
      if (response.success) {
        api.setToken(token);
        const user = parseUserFromToken(token);
        set({ isAuthenticated: true, token, user, isLoading: false });
        toast.success('Login realizado com sucesso!');
        return true;
      } else {
        set({ isLoading: false });
        toast.error(response.message || 'Token inválido');
        return false;
      }
    } catch (error: any) {
      set({ isLoading: false });
      toast.error(error.response?.data?.message || 'Falha no login');
      return false;
    }
  },

  logout: () => {
    api.clearToken();
    set({ isAuthenticated: false, token: null, user: null });
    toast.success('Logout realizado com sucesso');
  },

  verifyAuth: async () => {
    const token = get().token;
    if (!token) {
      set({ isAuthenticated: false });
      return false;
    }

    try {
      const response = await api.verifyToken();
      if (response.valid) {
        set({ isAuthenticated: true, user: parseUserFromToken(token) });
        return true;
      } else {
        set({ isAuthenticated: false, token: null, user: null });
        api.clearToken();
        return false;
      }
    } catch (error) {
      set({ isAuthenticated: false, token: null, user: null });
      api.clearToken();
      return false;
    }
  },
}));
