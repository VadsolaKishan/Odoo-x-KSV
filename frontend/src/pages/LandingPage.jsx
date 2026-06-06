import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ChevronRight, Users, FileText, BarChart3, CheckSquare, ShoppingBag,
  TrendingUp, ArrowRight, Star, Shield, Zap, Globe, Menu, X,
  Building2, UserCheck, Briefcase, Store
} from 'lucide-react';

const FEATURES = [
  {
    icon: Users,
    title: 'Vendor Management',
    desc: 'Onboard, approve, and manage your entire supplier network in one place with real-time status tracking.',
    color: 'from-brand-500 to-brand-700',
    bg: 'bg-brand-50 dark:bg-brand-950/20',
    iconColor: 'text-brand-600 dark:text-brand-400',
  },
  {
    icon: FileText,
    title: 'RFQ Automation',
    desc: 'Create and dispatch Requests for Quotations to multiple vendors simultaneously with one click.',
    color: 'from-sky-500 to-sky-700',
    bg: 'bg-sky-50 dark:bg-sky-950/20',
    iconColor: 'text-sky-600 dark:text-sky-400',
  },
  {
    icon: BarChart3,
    title: 'Quotation Comparison',
    desc: 'Compare vendor bids side-by-side. Best price and fastest delivery highlighted automatically.',
    color: 'from-violet-500 to-violet-700',
    bg: 'bg-violet-50 dark:bg-violet-950/20',
    iconColor: 'text-violet-600 dark:text-violet-400',
  },
  {
    icon: CheckSquare,
    title: 'Approval Workflow',
    desc: 'Multi-level manager approval with remarks, decision timeline, and instant notifications.',
    color: 'from-emerald-500 to-emerald-700',
    bg: 'bg-emerald-50 dark:bg-emerald-950/20',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    icon: ShoppingBag,
    title: 'Purchase Orders',
    desc: 'Auto-generate professional purchase orders with tax breakdown, PO numbers, and invoice tracking.',
    color: 'from-amber-500 to-amber-700',
    bg: 'bg-amber-50 dark:bg-amber-950/20',
    iconColor: 'text-amber-600 dark:text-amber-400',
  },
  {
    icon: TrendingUp,
    title: 'Procurement Analytics',
    desc: 'Visualize spending trends, top vendors, approval rates, and procurement performance in real time.',
    color: 'from-rose-500 to-rose-700',
    bg: 'bg-rose-50 dark:bg-rose-950/20',
    iconColor: 'text-rose-600 dark:text-rose-400',
  },
];

const WORKFLOW_STEPS = [
  { label: 'Create RFQ', desc: 'Officer creates request', icon: '📝', color: 'bg-brand-600' },
  { label: 'Vendor Quotes', desc: 'Vendors submit bids', icon: '🏢', color: 'bg-sky-600' },
  { label: 'Compare Bids', desc: 'Officer compares quotes', icon: '⚖️', color: 'bg-violet-600' },
  { label: 'Manager Approval', desc: 'Manager approves/rejects', icon: '✅', color: 'bg-emerald-600' },
  { label: 'Purchase Order', desc: 'PO auto-generated', icon: '📦', color: 'bg-amber-600' },
];

const ROLES = [
  {
    icon: Shield,
    role: 'Admin',
    desc: 'Full system access. Manage vendors, users, view analytics, and monitor all operations.',
    credential: 'admin@vendorbridge.com',
    password: 'Admin123',
    color: 'border-brand-200 dark:border-brand-900/50 bg-brand-50/50 dark:bg-brand-950/20',
    badge: 'bg-brand-100 text-brand-700 dark:bg-brand-950/40 dark:text-brand-400',
    iconBg: 'bg-brand-600',
  },
  {
    icon: Briefcase,
    role: 'Officer',
    desc: 'Create & manage RFQs, compare vendor quotations, and generate purchase orders.',
    credential: 'officer@vendorbridge.com',
    password: 'Officer123',
    color: 'border-sky-200 dark:border-sky-900/50 bg-sky-50/50 dark:bg-sky-950/20',
    badge: 'bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-400',
    iconBg: 'bg-sky-600',
  },
  {
    icon: UserCheck,
    role: 'Manager',
    desc: 'Review procurement requests, approve or reject RFQs, and maintain approval history.',
    credential: 'manager@vendorbridge.com',
    password: 'Manager123',
    color: 'border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/20',
    badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400',
    iconBg: 'bg-emerald-600',
  },
  {
    icon: Store,
    role: 'Vendor',
    desc: 'Receive RFQs from company, submit competitive quotations, and track purchase orders.',
    credential: 'vendor1@vendorbridge.com',
    password: 'Vendor123',
    color: 'border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20',
    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400',
    iconBg: 'bg-amber-600',
  },
];

export const LandingPage = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950 text-slate-800 dark:text-neutral-100 font-sans">

      {/* ─── NAVBAR ─── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md shadow-sm border-b border-slate-200/60 dark:border-neutral-800/60'
          : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-600 to-brand-500 flex items-center justify-center shadow-lg shadow-brand-500/30">
              <span className="text-white font-black text-sm">VB</span>
            </div>
            <span className="font-display font-black text-xl text-slate-900 dark:text-white tracking-tight">
              VendorBridge
            </span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {['Features', 'Workflow', 'About'].map(link => (
              <a
                key={link}
                href={`#${link.toLowerCase()}`}
                className="text-sm font-medium text-slate-600 dark:text-neutral-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
              >
                {link}
              </a>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-2.5">
            <Link
              to="/login"
              className="px-4 py-2 text-sm font-semibold text-slate-700 dark:text-neutral-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-neutral-700 rounded-xl hover:bg-slate-50 dark:hover:bg-neutral-800 transition-all"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="px-4 py-2 text-sm font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-xl shadow-md shadow-brand-500/25 hover:shadow-brand-500/40 transition-all hover:-translate-y-0.5"
            >
              Register as Vendor
            </Link>
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-600 dark:text-neutral-400 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white dark:bg-neutral-900 border-t border-slate-100 dark:border-neutral-800 px-6 py-4 space-y-3">
            {['Features', 'Workflow', 'About'].map(link => (
              <a key={link} href={`#${link.toLowerCase()}`}
                className="block text-sm font-medium text-slate-600 dark:text-neutral-400 py-1"
                onClick={() => setMobileMenuOpen(false)}
              >{link}</a>
            ))}
            <div className="flex flex-col gap-2 pt-2 border-t border-slate-100 dark:border-neutral-800">
              <Link to="/login" className="px-4 py-2 text-center text-sm font-semibold border border-slate-200 dark:border-neutral-700 rounded-xl">Login</Link>
              <Link to="/signup" className="px-4 py-2 text-center text-sm font-bold text-white bg-brand-600 rounded-xl">Register as Vendor</Link>
            </div>
          </div>
        )}
      </nav>

      {/* ─── HERO ─── */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        {/* Background glows */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -top-16 -right-32 w-80 h-80 bg-sky-500/8 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-brand-50/60 dark:bg-brand-950/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-brand-200 dark:border-brand-800/60 bg-brand-50 dark:bg-brand-950/30 text-brand-700 dark:text-brand-400 text-xs font-bold mb-8 shadow-sm">
            <Zap className="w-3.5 h-3.5" />
            Hackathon Demo · VendorBridge ERP v2.0
            <span className="px-1.5 py-0.5 text-[10px] bg-brand-600 text-white rounded-full">LIVE</span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-display font-black leading-[1.05] tracking-tight text-slate-900 dark:text-white mb-6">
            Streamline{' '}
            <span className="relative">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-600 to-sky-500">
                Procurement
              </span>
            </span>
            {' '}&{' '}
            <br className="hidden md:block" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-brand-600">
              Vendor Collaboration
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-600 dark:text-neutral-400 font-medium max-w-2xl mx-auto leading-relaxed mb-10">
            Modern enterprise ERP platform for managing vendors, RFQs, quotations, multi-level approvals, and purchase orders — all in one place.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/login"
              className="flex items-center gap-2 px-7 py-3.5 text-sm font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-2xl shadow-xl shadow-brand-500/25 hover:shadow-brand-500/40 transition-all hover:-translate-y-1 active:translate-y-0"
            >
              Get Started <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/signup"
              className="flex items-center gap-2 px-7 py-3.5 text-sm font-bold text-slate-700 dark:text-neutral-200 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-2xl hover:border-brand-400 dark:hover:border-brand-600 hover:bg-slate-50 dark:hover:bg-neutral-800 transition-all shadow-sm"
            >
              Register as Vendor <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Trust Pills */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-12 text-xs text-slate-500 dark:text-neutral-500 font-medium">
            {['Frontend-Only Demo', '4 Role System', 'localStorage Powered', 'Hackathon Ready'].map(pill => (
              <div key={pill} className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                {pill}
              </div>
            ))}
          </div>
        </div>

        {/* Mock Dashboard Preview */}
        <div className="max-w-5xl mx-auto mt-16 relative">
          <div className="relative bg-white dark:bg-neutral-900 rounded-3xl border border-slate-200/80 dark:border-neutral-800/80 shadow-2xl overflow-hidden">
            {/* Browser chrome */}
            <div className="flex items-center gap-2 px-5 py-3.5 bg-slate-50 dark:bg-neutral-950/50 border-b border-slate-100 dark:border-neutral-800">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-rose-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
              </div>
              <div className="flex-1 mx-4 bg-white dark:bg-neutral-800 rounded-lg px-3 py-1 text-[10px] text-slate-500 dark:text-neutral-400 border border-slate-200 dark:border-neutral-700 font-mono">
                vendorbridge.app/dashboard
              </div>
            </div>
            {/* Dashboard mockup content */}
            <div className="p-6 grid grid-cols-4 gap-4">
              {[
                { label: "Active RFQ's", value: '12', color: 'text-brand-600' },
                { label: 'Pending Approvals', value: '5', color: 'text-amber-600' },
                { label: "PO's This Month", value: '₹2.30L', color: 'text-emerald-600' },
                { label: 'Overdue Invoices', value: '3', color: 'text-rose-600' },
              ].map((card, i) => (
                <div key={i} className="bg-white dark:bg-neutral-800/50 border border-slate-100 dark:border-neutral-700/50 rounded-xl p-4 shadow-sm">
                  <p className="text-[10px] text-slate-500 dark:text-neutral-500 font-medium">{card.label}</p>
                  <p className={`text-2xl font-black mt-1 ${card.color}`}>{card.value}</p>
                </div>
              ))}
              <div className="col-span-3 bg-white dark:bg-neutral-800/50 border border-slate-100 dark:border-neutral-700/50 rounded-xl p-4 shadow-sm">
                <p className="text-[10px] font-bold text-slate-500 dark:text-neutral-500 mb-3 uppercase tracking-wider">Recent Purchase Orders</p>
                {[
                  { id: 'PO-2026-001', vendor: 'Tata Digital Solutions', amount: '₹87,000', status: 'Approved', dot: 'bg-emerald-500' },
                  { id: 'PO-2026-002', vendor: 'Reliance Logistics Ltd', amount: '₹1,40,000', status: 'Pending', dot: 'bg-amber-500' },
                  { id: 'PO-2026-003', vendor: 'Mahindra Metalworks', amount: '₹34,900', status: 'Sent', dot: 'bg-sky-500' },
                ].map((row, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-slate-50 dark:border-neutral-700/30 last:border-0 text-[10px]">
                    <span className="font-mono font-bold text-slate-600 dark:text-neutral-400">{row.id}</span>
                    <span className="text-slate-700 dark:text-neutral-300 font-medium hidden sm:block">{row.vendor}</span>
                    <span className="font-semibold text-slate-800 dark:text-neutral-200">{row.amount}</span>
                    <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold ${
                      row.status === 'Approved' ? 'bg-emerald-50 text-emerald-700' :
                      row.status === 'Pending' ? 'bg-amber-50 text-amber-700' : 'bg-sky-50 text-sky-700'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${row.dot}`} />
                      {row.status}
                    </span>
                  </div>
                ))}
              </div>
              <div className="bg-white dark:bg-neutral-800/50 border border-slate-100 dark:border-neutral-700/50 rounded-xl p-4 shadow-sm flex flex-col justify-between">
                <p className="text-[10px] font-bold text-slate-500 dark:text-neutral-500 uppercase tracking-wider">Active Vendors</p>
                <p className="text-3xl font-black text-brand-600">18</p>
                <p className="text-[9px] text-emerald-600 font-semibold">↑ 3 new this month</p>
              </div>
            </div>
          </div>
          {/* Floating glow */}
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-3/4 h-16 bg-brand-500/15 rounded-full blur-2xl pointer-events-none" />
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section id="features" className="py-24 px-6 bg-slate-50/60 dark:bg-neutral-950/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-50 dark:bg-brand-950/30 border border-brand-200 dark:border-brand-800/40 text-brand-700 dark:text-brand-400 text-xs font-bold mb-4">
              <Star className="w-3.5 h-3.5" /> Core Features
            </div>
            <h2 className="text-4xl font-display font-black text-slate-900 dark:text-white tracking-tight mb-4">
              Everything you need for procurement
            </h2>
            <p className="text-slate-500 dark:text-neutral-400 max-w-xl mx-auto font-medium">
              From vendor onboarding to invoice settlement — the complete procurement lifecycle in one platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className="group p-6 bg-white dark:bg-neutral-900 border border-slate-200/70 dark:border-neutral-800/60 rounded-2xl shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-neutral-700 transition-all hover:-translate-y-0.5">
                  <div className={`w-11 h-11 rounded-xl ${f.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-5 h-5 ${f.iconColor}`} />
                  </div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-neutral-200 mb-2">{f.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-neutral-500 leading-relaxed font-medium">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── WORKFLOW ─── */}
      <section id="workflow" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-400 text-xs font-bold mb-4">
              <Zap className="w-3.5 h-3.5" /> Procurement Flow
            </div>
            <h2 className="text-4xl font-display font-black text-slate-900 dark:text-white tracking-tight mb-4">
              How VendorBridge works
            </h2>
            <p className="text-slate-500 dark:text-neutral-400 max-w-xl mx-auto font-medium">
              A streamlined 5-step workflow that connects your procurement team with vendors seamlessly.
            </p>
          </div>

          {/* Workflow Steps */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {WORKFLOW_STEPS.map((step, i) => (
              <React.Fragment key={i}>
                <div className="flex flex-col items-center gap-3 text-center group">
                  <div className={`w-16 h-16 ${step.color} rounded-2xl flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform`}>
                    {step.icon}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-neutral-200">{step.label}</p>
                    <p className="text-[11px] text-slate-500 dark:text-neutral-500 font-medium mt-0.5">{step.desc}</p>
                  </div>
                  <div className="w-6 h-6 rounded-full border-2 border-slate-200 dark:border-neutral-700 flex items-center justify-center text-[10px] font-black text-slate-500 dark:text-neutral-500">
                    {i + 1}
                  </div>
                </div>
                {i < WORKFLOW_STEPS.length - 1 && (
                  <div className="hidden md:flex items-center">
                    <ArrowRight className="w-5 h-5 text-slate-300 dark:text-neutral-700" />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* ─── ABOUT / ROLE CARDS ─── */}
      <section id="about" className="py-24 px-6 bg-slate-50/60 dark:bg-neutral-950/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800/40 text-violet-700 dark:text-violet-400 text-xs font-bold mb-4">
              <Users className="w-3.5 h-3.5" /> Role-Based System
            </div>
            <h2 className="text-4xl font-display font-black text-slate-900 dark:text-white tracking-tight mb-4">
              Try each role instantly
            </h2>
            <p className="text-slate-500 dark:text-neutral-400 max-w-xl mx-auto font-medium">
              Use the demo credentials below to log in as any role and explore the full platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {ROLES.map((r, i) => {
              const Icon = r.icon;
              return (
                <div key={i} className={`p-6 border ${r.color} rounded-2xl flex flex-col gap-4 hover:shadow-md transition-all hover:-translate-y-0.5`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 ${r.iconBg} rounded-xl flex items-center justify-center`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${r.badge}`}>{r.role}</span>
                      <p className="text-xs text-slate-500 dark:text-neutral-500 font-medium mt-0.5">{r.desc}</p>
                    </div>
                  </div>
                  <div className="bg-white/70 dark:bg-neutral-900/60 rounded-xl p-3.5 border border-slate-200/50 dark:border-neutral-700/40 font-mono text-[11px] space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 dark:text-neutral-600 w-16 shrink-0">Email</span>
                      <span className="text-slate-700 dark:text-neutral-300 font-semibold">{r.credential}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 dark:text-neutral-600 w-16 shrink-0">Password</span>
                      <span className="text-slate-700 dark:text-neutral-300 font-semibold">{r.password}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate('/login')}
                    className="flex items-center justify-center gap-2 w-full py-2.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-neutral-700 text-slate-700 dark:text-neutral-300 hover:bg-white dark:hover:bg-neutral-800 transition-all"
                  >
                    Login as {r.role} <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-start justify-between gap-8">
            {/* Brand */}
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-600 to-brand-500 flex items-center justify-center">
                  <span className="text-white font-black text-sm">VB</span>
                </div>
                <span className="font-display font-black text-lg text-slate-900 dark:text-white">VendorBridge</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-neutral-500 max-w-xs font-medium leading-relaxed">
                Enterprise procurement & vendor management ERP. Built for hackathon demo — fully frontend-only with mock data.
              </p>
            </div>

            {/* Links */}
            <div className="grid grid-cols-2 gap-x-16 gap-y-2 text-xs text-slate-500 dark:text-neutral-500 font-medium">
              {['Features', 'Workflow', 'About', 'Login', 'Register'].map(link => (
                <a key={link} href="#" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors py-1">{link}</a>
              ))}
            </div>

            {/* Globe */}
            <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-neutral-600 font-medium">
              <Globe className="w-4 h-4" />
              VendorBridge · India ERP Platform
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400 dark:text-neutral-600 font-medium">
            <span>© 2026 VendorBridge. All rights reserved. Built for hackathon demo.</span>
            <div className="flex items-center gap-4">
              <Building2 className="w-4 h-4" />
              <span>Frontend-Only · No Backend · localStorage Powered</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
