import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Vendor {
  id: string;
  name: string;
  category: string;
  gst_number: string;
  contact_name?: string | null;
  contact_phone: string;
  contact_email?: string | null;
  address?: string | null;
  status: 'active' | 'pending' | 'blocked';
  rating: string | number;
  created_by?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface User { 
  id: string; 
  first_name: string; 
  last_name: string; 
  email: string; 
  role: 'admin' | 'procurement_officer' | 'manager' | 'vendor'; 
  country?: string | null;
  phone?: string | null;
  additional_info?: string | null;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  vendor?: Vendor | null;
}

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setAuth: (user, token) => {
        localStorage.setItem('vb_token', token);
        set({ user, token, isAuthenticated: true });
      },
      logout: () => {
        localStorage.removeItem('vb_token');
        set({ user: null, token: null, isAuthenticated: false });
      },
    }),
    { 
      name: 'vb-auth',
      // Ensure localstorage has synchronization if needed, but simple name is standard
    }
  )
);
