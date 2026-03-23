import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@repo/shared';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  setAuth: (accessToken: string, refreshToken: string, user: User) => void;
  setTokens: (accessToken: string, refreshToken?: string) => void;
  updateUser: (user: Partial<User>) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,

      setAuth: (accessToken, refreshToken, user) => {
        console.log('Store: setAuth called', { accessToken: !!accessToken, user: !!user });
        set({ accessToken, refreshToken, user });
      },
        
      setTokens: (accessToken, refreshToken) => {
        console.log('Store: setTokens called', { accessToken: !!accessToken, refreshToken: !!refreshToken });
        set((state) => ({ 
          accessToken, 
          refreshToken: refreshToken || state.refreshToken 
        }));
      },

      updateUser: (updatedData) => {
        console.log('Store: updateUser called', updatedData);
        set((state) => ({ 
          user: state.user ? { ...state.user, ...updatedData } : null 
        }));
      },

      logout: () => {
        console.log('Store: logout called');
        set({ accessToken: null, refreshToken: null, user: null });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
      }),
    }
  )
);
