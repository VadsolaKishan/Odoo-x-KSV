import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export const FormInput = ({
  label,
  id,
  type = 'text',
  error,
  icon: Icon,
  options = [], // For select input
  className = '',
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  
  // Toggle input type for password
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  const inputStyles = `w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-dark-950 border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-slate-700 dark:text-dark-250 ${
    error 
      ? 'border-danger-300 focus:ring-danger-500/20 focus:border-danger-500' 
      : 'border-slate-200 dark:border-dark-800'
  } ${Icon ? 'pl-10' : ''} ${isPassword ? 'pr-10' : ''}`;

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label htmlFor={id} className="block text-xs font-semibold text-slate-500 dark:text-dark-400 uppercase tracking-wider">
          {label}
        </label>
      )}
      
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-dark-500 pointer-events-none" />
        )}

        {type === 'textarea' ? (
          <textarea
            id={id}
            className={`${inputStyles} min-h-[100px] resize-none`}
            {...props}
          />
        ) : type === 'select' ? (
          <select id={id} className={inputStyles} {...props}>
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
            className={inputStyles}
            {...props}
          />
        )}

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-dark-500 dark:hover:text-dark-300 transition-colors"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>

      {error && (
        <p className="text-xs font-semibold text-danger-600 dark:text-danger-400 flex items-center gap-1 animate-fade-in">
          <span>●</span> {error}
        </p>
      )}
    </div>
  );
};

export default FormInput;
