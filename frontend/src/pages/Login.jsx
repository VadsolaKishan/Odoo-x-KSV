import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ChevronDown, Lock, Mail, Shield, Briefcase, UserCheck, Store, Loader2 } from 'lucide-react';
import { useApp, DEMO_CREDENTIALS } from '../context/AppContext';

const ROLE_TABS = [
  { role: 'admin',   label: 'Admin',    icon: Shield,      color: 'text-brand-600 dark:text-brand-400',   bg: 'bg-brand-50 dark:bg-brand-950/20',   border: 'border-brand-300 dark:border-brand-700',  fill: 'bg-brand-600', email: 'admin@vendorbridge.com',   pass: 'Admin123' },
  { role: 'officer', label: 'Officer',  icon: Briefcase,   color: 'text-sky-600 dark:text-sky-400',        bg: 'bg-sky-50 dark:bg-sky-950/20',         border: 'border-sky-300 dark:border-sky-700',      fill: 'bg-sky-600',   email: 'officer@vendorbridge.com', pass: 'Officer123' },
  { role: 'manager', label: 'Manager',  icon: UserCheck,   color: 'text-emerald-600 dark:text-emerald-400',bg: 'bg-emerald-50 dark:bg-emerald-950/20', border: 'border-emerald-300 dark:border-emerald-700',fill:'bg-emerald-600',email: 'manager@vendorbridge.com', pass: 'Manager123' },
  { role: 'vendor',  label: 'Vendor',   icon: Store,       color: 'text-amber-600 dark:text-amber-400',    bg: 'bg-amber-50 dark:bg-amber-950/20',     border: 'border-amber-300 dark:border-amber-700',  fill: 'bg-amber-600', email: 'vendor1@vendorbridge.com', pass: 'Vendor123' },
];

const VENDOR_ACCOUNTS = DEMO_CREDENTIALS.filter(c => c.role === 'vendor');

export const Login = () => {
  const navigate = useNavigate();
  const { loginWithCredentials, loading } = useApp();

  const [selectedRole, setSelectedRole] = useState('officer');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showCredsPanel, setShowCredsPanel] = useState(false);
  const [errors, setErrors]     = useState({});

  const activeTab = ROLE_TABS.find(t => t.role === selectedRole);

  const handleRoleSelect = (tab) => {
    setSelectedRole(tab.role);
    setEmail('');
    setPassword('');
    setErrors({});
  };

  const fillDemo = (emailVal, passVal) => {
    setEmail(emailVal);
    setPassword(passVal);
  };

  const validate = () => {
    const errs = {};
    if (!email.trim()) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Enter a valid email';
    if (!password) errs.password = 'Password is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const user = await loginWithCredentials(email, password);
    if (user) {
      if (user.role === 'vendor') navigate('/vendor/dashboard');
      else navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-neutral-950">

      {/* ─── Left Brand Panel ─── */}
      <div className="hidden lg:flex lg:w-[45%] flex-col justify-between p-12 bg-gradient-to-br from-brand-700 via-brand-600 to-sky-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-10 right-10 w-64 h-64 rounded-full bg-sky-300 blur-3xl" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <span className="text-white font-black text-base">VB</span>
            </div>
            <span className="text-white font-display font-black text-xl tracking-tight">VendorBridge</span>
          </div>
          <h2 className="text-4xl font-display font-black text-white leading-tight mb-4">
            Enterprise Procurement,<br />Simplified.
          </h2>
          <p className="text-white/70 text-sm font-medium leading-relaxed max-w-sm">
            Manage your entire vendor ecosystem — from RFQ creation to invoice settlement — in one powerful platform.
          </p>
        </div>
        {/* Feature highlights */}
        <div className="relative z-10 space-y-3">
          {['Role-Based Access Control', 'Multi-Vendor RFQ Management', 'Approval Workflow Engine', 'Real-Time Analytics'].map(f => (
            <div key={f} className="flex items-center gap-3 text-white/80 text-xs font-medium">
              <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <div className="w-2 h-2 rounded-full bg-white" />
              </div>
              {f}
            </div>
          ))}
        </div>
      </div>

      {/* ─── Right Login Form ─── */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12">
        {/* Logo (mobile) */}
        <div className="lg:hidden flex items-center gap-2.5 mb-8">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-600 to-brand-500 flex items-center justify-center">
            <span className="text-white font-black text-sm">VB</span>
          </div>
          <span className="font-display font-black text-xl text-slate-900 dark:text-white">VendorBridge</span>
        </div>

        <div className="w-full max-w-md">
          <div className="mb-8">
            <h1 className="text-3xl font-display font-black text-slate-900 dark:text-white tracking-tight mb-1">
              Welcome back
            </h1>
            <p className="text-sm text-slate-500 dark:text-neutral-500 font-medium">
              Sign in to your VendorBridge account
            </p>
          </div>

          {/* Role Selector Tabs */}
          <div className="grid grid-cols-4 gap-1.5 p-1.5 bg-slate-100 dark:bg-neutral-800/60 rounded-2xl mb-6">
            {ROLE_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = selectedRole === tab.role;
              return (
                <button
                  key={tab.role}
                  onClick={() => handleRoleSelect(tab)}
                  className={`flex flex-col items-center gap-1 py-2.5 px-2 rounded-xl text-[10px] font-bold transition-all ${
                    isActive
                      ? 'bg-white dark:bg-neutral-900 shadow-sm ' + tab.color
                      : 'text-slate-500 dark:text-neutral-500 hover:text-slate-700 dark:hover:text-neutral-300'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? tab.color : ''}`} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Login Form */}
          <div className={`p-6 bg-white dark:bg-neutral-900 border ${activeTab.border} rounded-2xl shadow-sm mb-4`}>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-neutral-500 pointer-events-none" />
                  <input
                    id="login_email"
                    type="email"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setErrors(p => ({...p, email:''})); }}
                    placeholder={activeTab.email}
                    className={`w-full pl-10 pr-4 py-2.5 text-sm bg-white dark:bg-neutral-950 border rounded-xl focus:outline-none focus:ring-2 transition-all text-slate-800 dark:text-neutral-200 placeholder:text-slate-300 dark:placeholder:text-neutral-700 ${
                      errors.email
                        ? 'border-rose-400 focus:ring-rose-500/20 focus:border-rose-500'
                        : 'border-slate-200 dark:border-neutral-800 hover:border-slate-300 dark:hover:border-neutral-700 focus:ring-brand-500/20 focus:border-brand-500'
                    }`}
                  />
                </div>
                {errors.email && <p className="text-[10px] font-semibold text-rose-600 dark:text-rose-400">{errors.email}</p>}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-neutral-500 pointer-events-none" />
                  <input
                    id="login_password"
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={e => { setPassword(e.target.value); setErrors(p => ({...p, password:''})); }}
                    placeholder="••••••••"
                    className={`w-full pl-10 pr-11 py-2.5 text-sm bg-white dark:bg-neutral-950 border rounded-xl focus:outline-none focus:ring-2 transition-all text-slate-800 dark:text-neutral-200 ${
                      errors.password
                        ? 'border-rose-400 focus:ring-rose-500/20 focus:border-rose-500'
                        : 'border-slate-200 dark:border-neutral-800 hover:border-slate-300 dark:hover:border-neutral-700 focus:ring-brand-500/20 focus:border-brand-500'
                    }`}
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-neutral-500 dark:hover:text-neutral-300 transition-colors">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-[10px] font-semibold text-rose-600 dark:text-rose-400">{errors.password}</p>}
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-neutral-400 cursor-pointer">
                  <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-slate-300 dark:border-neutral-700 text-brand-600 focus:ring-brand-500/20" />
                  <span className="font-medium">Remember me</span>
                </label>
                <button type="button" className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors">
                  Forgot password?
                </button>
              </div>

              {/* Submit */}
              <button
                id="login_submit"
                type="submit"
                disabled={loading}
                className={`w-full py-2.5 px-4 text-sm font-bold text-white rounded-xl shadow-md transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${activeTab.fill} hover:opacity-90 shadow-brand-500/20`}
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</>
                ) : (
                  `Sign in as ${activeTab.label}`
                )}
              </button>
            </form>
          </div>

          {/* Demo Credentials Panel */}
          <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-2xl shadow-sm overflow-hidden mb-4">
            <button
              onClick={() => setShowCredsPanel(!showCredsPanel)}
              className="w-full flex items-center justify-between px-5 py-3.5 text-xs font-bold text-slate-700 dark:text-neutral-300 hover:bg-slate-50 dark:hover:bg-neutral-800/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-brand-100 dark:bg-brand-950/40 flex items-center justify-center">
                  <span className="text-brand-600 dark:text-brand-400 text-[10px] font-black">?</span>
                </div>
                <span>Demo Credentials</span>
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform ${showCredsPanel ? 'rotate-180' : ''}`} />
            </button>

            {showCredsPanel && (
              <div className="border-t border-slate-100 dark:border-neutral-800 p-4 space-y-2">
                {ROLE_TABS.map(tab => {
                  const Icon = tab.icon;
                  const vendorList = tab.role === 'vendor' ? VENDOR_ACCOUNTS : [];
                  return (
                    <div key={tab.role}>
                      {tab.role !== 'vendor' ? (
                        <button
                          onClick={() => { handleRoleSelect(tab); fillDemo(tab.email, tab.pass); }}
                          className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-neutral-800 transition-colors text-left"
                        >
                          <div className={`w-8 h-8 rounded-xl ${tab.fill} flex items-center justify-center shrink-0`}>
                            <Icon className="w-4 h-4 text-white" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[10px] font-bold text-slate-700 dark:text-neutral-200">{tab.label}</p>
                            <p className="text-[10px] text-slate-400 dark:text-neutral-500 font-mono truncate">{tab.email}</p>
                          </div>
                          <span className="ml-auto text-[10px] font-mono text-slate-500 dark:text-neutral-500 shrink-0">{tab.pass}</span>
                        </button>
                      ) : (
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-wider px-3 mb-1">Vendor Accounts</p>
                          {vendorList.map(v => (
                            <button key={v.email}
                              onClick={() => { handleRoleSelect(tab); fillDemo(v.email, v.password); }}
                              className="w-full flex items-center gap-3 p-2.5 pl-3 rounded-xl hover:bg-slate-50 dark:hover:bg-neutral-800 transition-colors text-left"
                            >
                              <div className={`w-7 h-7 rounded-xl ${tab.fill} flex items-center justify-center shrink-0`}>
                                <Store className="w-3.5 h-3.5 text-white" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-[10px] font-semibold text-slate-700 dark:text-neutral-300 truncate">{v.name}</p>
                                <p className="text-[9px] text-slate-400 dark:text-neutral-500 font-mono truncate">{v.email}</p>
                              </div>
                              <span className="ml-auto text-[10px] font-mono text-slate-500 dark:text-neutral-500 shrink-0">{v.password}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Register link */}
          <p className="text-center text-xs text-slate-500 dark:text-neutral-500 font-medium">
            Are you a vendor?{' '}
            <Link to="/signup" className="font-bold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors">
              Register your company
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
