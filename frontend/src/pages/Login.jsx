import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, LogIn, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { FormInput } from '../components/FormInput';

export const Login = () => {
  const { loginUser, loading } = useApp();
  const navigate = useNavigate();

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});

  const validate = () => {
    const tempErrors = {};
    if (!email) {
      tempErrors.email = 'Email address is required.';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      tempErrors.email = 'Please provide a valid email address.';
    }
    
    if (!password) {
      tempErrors.password = 'Password is required.';
    } else if (password.length < 6) {
      tempErrors.password = 'Password must be at least 6 characters.';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const success = await loginUser(email, password);
    if (success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-dark-950 px-4 py-12 grid-lines">
      <div className="w-full max-w-md bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-2xl shadow-xl p-8 space-y-6">
        
        {/* Logo and Greeting */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-400 text-white font-bold text-2xl shadow-lg shadow-brand-500/25 mb-2">
            VB
          </div>
          <h2 className="text-2xl font-display font-extrabold text-slate-800 dark:text-dark-100 tracking-tight">
            Welcome back
          </h2>
          <p className="text-xs text-slate-400 dark:text-dark-500 font-medium">
            Sign in to manage your procurement network
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormInput
            label="Corporate Email"
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            icon={Mail}
            placeholder="sarah.jenkins@vendorbridge.com"
          />

          <FormInput
            label="Password"
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            icon={Lock}
            placeholder="••••••••"
          />

          {/* Remember Me / Forgot Pass (Mocked) */}
          <div className="flex items-center justify-between text-xs select-none">
            <label className="flex items-center gap-2 text-slate-500 dark:text-dark-400 cursor-pointer">
              <input type="checkbox" className="rounded text-brand-500 border-slate-350 dark:border-dark-800 focus:ring-brand-500/20" />
              <span>Remember this session</span>
            </label>
            <a href="#forgot" className="font-semibold text-brand-600 dark:text-brand-400 hover:underline">
              Forgot password?
            </a>
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-brand-600 hover:bg-brand-500 disabled:bg-brand-400 text-white font-semibold text-sm rounded-xl shadow-lg shadow-brand-500/20 hover:shadow-brand-500/30 active:scale-98 transition-all"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <LogIn className="w-4.5 h-4.5" />
              </>
            )}
          </button>
        </form>

        {/* Redirect Section */}
        <div className="text-center">
          <p className="text-xs text-slate-500 dark:text-dark-500">
            Don't have an enterprise account?{' '}
            <Link to="/signup" className="font-bold text-brand-600 dark:text-brand-400 hover:underline inline-flex items-center gap-0.5">
              Create an account <ArrowRight className="w-3 h-3" />
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};

export default Login;
