import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export const FormInput = ({
  label,
  id,
  type = 'text',
  error,
  icon: Icon,
  options = [],
  className = '',
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  const baseInput = `w-full px-4 py-2.5 text-sm bg-white dark:bg-neutral-950 border rounded-xl
    focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500
    transition-all duration-200 text-slate-800 dark:text-neutral-200
    placeholder:text-slate-400 dark:placeholder:text-neutral-600
    ${error
      ? 'border-danger-300 dark:border-danger-700 focus:ring-danger-500/20 focus:border-danger-500'
      : 'border-slate-200 dark:border-neutral-800 hover:border-slate-300 dark:hover:border-neutral-700'
    }
    ${Icon ? 'pl-10' : ''}
    ${isPassword ? 'pr-10' : ''}`;

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label htmlFor={id} className="block text-xs font-semibold text-slate-500 dark:text-neutral-400 uppercase tracking-wider">
          {label}
        </label>
      )}

      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-neutral-500 pointer-events-none" />
        )}

        {type === 'textarea' ? (
          <textarea
            id={id}
            className={`${baseInput} min-h-[100px] resize-none`}
            {...props}
          />
        ) : type === 'select' ? (
          <select id={id} className={baseInput} {...props}>
            <option value="">Select an option</option>
            {options.map((opt) => (
              <option key={opt.value || opt} value={opt.value || opt}>
                {opt.label || opt}
              </option>
            ))}
          </select>
        ) : (
          <input
            id={id}
            type={inputType}
            className={baseInput}
            {...props}
          />
        )}

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-neutral-500 dark:hover:text-neutral-300 transition-colors"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>

      {error && (
        <p className="text-xs font-semibold text-danger-600 dark:text-danger-400 flex items-center gap-1 animate-fade-in">
          <span className="w-1 h-1 rounded-full bg-danger-500 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
};

export default FormInput;
