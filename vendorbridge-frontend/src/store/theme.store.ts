import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark';

interface ThemeState {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'dark', // default to dark
      toggleTheme: () =>
        set((state) => {
          const nextTheme = state.theme === 'dark' ? 'light' : 'dark';
          if (nextTheme === 'light') {
            document.documentElement.classList.add('light');
          } else {
            document.documentElement.classList.remove('light');
          }
          return { theme: nextTheme };
        }),
      setTheme: (theme) => {
        if (theme === 'light') {
          document.documentElement.classList.add('light');
        } else {
          document.documentElement.classList.remove('light');
        }
        set({ theme });
      },
    }),
    {
      name: 'vb-theme',
      onRehydrateStorage: () => (state) => {
        if (state) {
          if (state.theme === 'light') {
            document.documentElement.classList.add('light');
          } else {
            document.documentElement.classList.remove('light');
          }
        }
      },
    }
  )
);
