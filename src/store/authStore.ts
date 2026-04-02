import { create } from 'zustand';
import type { User, AuthTokens } from '@/types/auth';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  login: (tokens: AuthTokens, user: User) => void;
  logout: () => void;
  updateUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
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
}));