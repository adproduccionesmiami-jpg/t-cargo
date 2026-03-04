import { create } from 'zustand'
import { AuthState, AppUser } from '../types'

interface AuthStore extends AuthState {
    setUser: (user: AppUser | null) => void;
    setSession: (session: any | null) => void;
    setLoading: (isLoading: boolean) => void;
    setError: (error: string | null) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
    user: null,
    session: null,
    isLoading: true,
    error: null,
    setUser: (user) => set({ user }),
    setSession: (session) => set({ session }),
    setLoading: (isLoading) => set({ isLoading }),
    setError: (error) => set({ error }),
}))
