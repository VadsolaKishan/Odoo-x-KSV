import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { Lock, Mail, ArrowRight, Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react';
import api from '../lib/axios';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!email || !password) {
      toast.error('Both fields are required');
      return;
    }

    // Email regex validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data.data;
      
      setAuth(user, token);
      toast.success(`Welcome back, ${user.first_name}!`);
      navigate('/');
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Invalid credentials';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-base relative flex items-center justify-center p-6 md:p-12 overflow-hidden">
      {/* Background Ambient Spotlights */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-brand-green/5 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-brand-green/5 blur-[120px] pointer-events-none"></div>

      {/* Main Grid Layout Container */}
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
        
        {/* LEFT PANEL: Branding & Bullet features */}
        <div className="lg:col-span-6 space-y-8 text-left hidden lg:block pr-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-brand-green rounded flex items-center justify-center shadow-glow">
              <div className="w-3.5 h-3.5 bg-[#0a0f0d] rounded-sm"></div>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-white">
              VendorBridge
            </h1>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-bold text-text-primary">
              Procurement & Vendor ERP
            </h2>
            <p className="text-text-secondary text-base leading-relaxed max-w-md">
              Streamline your procurement workflow with our unified ERP platform.
            </p>
          </div>

          <ul className="space-y-4 pt-4">
            {[
              'Manage vendors efficiently',
              'Track RFQs in real-time',
              'Automated approval workflows'
            ].map((text) => (
              <li key={text} className="flex items-center gap-3 text-text-primary text-sm font-medium">
                <CheckCircle2 className="w-5 h-5 text-brand-green shrink-0 shadow-glow rounded-full" />
                <span>{text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* RIGHT PANEL: Login Form Card */}
        <div className="lg:col-span-6 flex justify-center w-full">
          <div className="w-full max-w-md glass-card rounded-2xl p-8 border border-brand-green/20">
            {/* Header info for mobile screens */}
            <div className="lg:hidden flex flex-col items-center mb-6">
              <div className="w-10 h-10 rounded bg-brand-green flex items-center justify-center shadow-glow mb-3">
                <div className="w-3.5 h-3.5 bg-[#0a0f0d] rounded-sm"></div>
              </div>
              <h2 className="text-xl font-bold text-white">VendorBridge</h2>
              <p className="text-text-secondary text-xs mt-1">Procurement & Vendor ERP</p>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-bold text-white">Sign in to your account</h3>
              <p className="text-text-secondary text-xs mt-1">Enter email and password to access the platform</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Input */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider block" htmlFor="login-email">
                  Username / Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary animate-pulse" />
                  <input
                    id="login-email"
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field w-full pl-12"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider block" htmlFor="login-password">
                    Password
                  </label>
                  <a href="#forgot" className="text-xs font-semibold text-emerald-400 hover:text-brand-green-dark transition-colors">
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field w-full pl-12 pr-12"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                id="login-submit"
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-glow hover:shadow-[0_0_24px_rgba(16,185,129,0.35)] transition-all duration-300 transform active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none mt-2"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Sign In <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Separator / Redirect */}
            <div className="mt-6 pt-5 border-t border-subtle text-center">
              <span className="text-xs text-text-secondary block mb-3">or</span>
              <p className="text-xs text-text-secondary">
                Don't have an account?{' '}
                <Link to="/register" className="text-emerald-400 hover:text-brand-green-dark font-semibold transition-colors">
                  Register
                </Link>
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
