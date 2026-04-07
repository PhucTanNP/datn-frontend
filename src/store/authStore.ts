import { create } from 'zustand';
import type { User, AuthTokens } from '@/types/auth';
import api from '@/lib/api';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  login: (tokens: AuthTokens, user: User) => void;
  logout: () => void;
  updateUser: (user: User) => void;
  initialize: () => Promise<void>;
}

// Helper function to get initial state from localStorage
const getInitialState = () => {
  if (typeof window === 'undefined') return { user: null, accessToken: null };

  const accessToken = localStorage.getItem('accessToken');
  const refreshToken = localStorage.getItem('refreshToken');

  // If no tokens, return null
  if (!accessToken || !refreshToken) return { user: null, accessToken: null };

  // TODO: Validate token expiration here if needed
  // For now, assume tokens are valid if present

  return { user: null, accessToken }; // User will be fetched separately if needed
};

export const useAuthStore = create<AuthState>((set, get) => ({
  ...getInitialState(),
  login: (tokens, user) => {
    localStorage.setItem('accessToken', tokens.accessToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);
    set({ user, accessToken: tokens.accessToken });
  },
  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    set({ user: null, accessToken: null });
  },
  updateUser: (user) => set({ user }),
  initialize: async () => {
    const state = getInitialState();
    set(state);

    // If we have accessToken, try to fetch user info
    if (state.accessToken) {
      try {
        const response = await api.get('/api/v1/auth/refresh');
        const user = response.data.data;
        set({ user });
      } catch (error) {
        // If token invalid, logout
        console.error('Failed to fetch user:', error);
        get().logout();
      }
    }
  },
}));