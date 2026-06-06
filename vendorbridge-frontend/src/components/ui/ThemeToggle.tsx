import { Sun, Moon } from 'lucide-react';
import { useThemeStore } from '../../store/theme.store';

interface ThemeToggleProps {
  className?: string;
}

export default function ThemeToggle({ className = '' }: ThemeToggleProps) {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-lg border border-subtle bg-white/5 text-text-secondary hover:text-text-primary hover:bg-white/10 hover:shadow-glow transition-all duration-300 transform active:scale-95 flex items-center justify-center relative overflow-hidden group ${className}`}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      id="theme-toggle-btn"
      type="button"
    >
      <div className="relative w-4 h-4 flex items-center justify-center">
        {/* Sun Icon */}
        <Sun 
          className={`w-4 h-4 transition-all duration-500 transform ${
            theme === 'dark' 
              ? 'rotate-0 scale-100 opacity-100' 
              : 'rotate-90 scale-0 opacity-0 absolute'
          } text-amber-400 group-hover:animate-spin-slow`} 
        />
        
        {/* Moon Icon */}
        <Moon 
          className={`w-4 h-4 transition-all duration-500 transform ${
            theme === 'light' 
              ? 'rotate-0 scale-100 opacity-100' 
              : '-rotate-90 scale-0 opacity-0 absolute'
          } text-blue-400`} 
        />
      </div>
    </button>
  );
}
