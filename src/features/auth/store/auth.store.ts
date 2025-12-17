import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AuthUser = {
  name: string;
  email: string;
};

type AuthState = {
  user: AuthUser | null;
  setUser: (user: AuthUser) => void;
  clear: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      clear: () => set({ user: null }),
    }),
    { name: 'nortus.user' },
  ),
);
