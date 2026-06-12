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

// Helper to decode JWT and check expiration
const isTokenValid = (token: string | null): boolean => {
  if (!token) return false;
  
  try {
    // JWT format: header.payload.signature
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    
    // exp is in seconds, Date.now() is in milliseconds
    const expirationTime = decoded.exp * 1000;
    const currentTime = Date.now();
    
    // Token is valid if expiration time is in the future
    return expirationTime > currentTime;
  } catch {
    return false;
  }
};



const getInitialState = () => {
  if (typeof window === 'undefined') return { user: null, accessToken: null };

  const accessToken = localStorage.getItem('accessToken');
  const refreshToken = localStorage.getItem('refreshToken');

  if (!accessToken || !refreshToken) return { user: null, accessToken: null };

  return { user: null, accessToken };
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

    // If we have accessToken, try to fetch user info.
    // The `api` instance will attempt refresh automatically when needed.
    if (state.accessToken) {
      try {
        const response = await api.get('/api/v1/auth/profile');
        const user = response.data?.data || response.data;
        set({ user });
      } catch (error) {
        // If fetching user failed (including refresh failure), logout
        get().logout();
      }
    }
  },
}));