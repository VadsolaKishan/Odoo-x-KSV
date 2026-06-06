import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, Mail, Lock, Phone, Hash, Tag, Eye, EyeOff, CheckCircle2, Loader2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

const CATEGORIES = [
  'Software & IT', 'Hardware & Electronics', 'Office Supplies', 'Logistics & Transport',
  'Manufacturing', 'Consulting', 'Legal & Compliance', 'HR & Staffing', 'Marketing & Media', 'Other'
];

export const Signup = () => {
  const navigate = useNavigate();
  const { vendorRegister, loading } = useApp();

  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    email: '',
    password: '',
    confirmPassword: '',
    gstin: '',
    category: 'Software & IT',
    phone: '',
  });
  const [showPw, setShowPw]           = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [errors, setErrors]           = useState({});
  const [submitted, setSubmitted]     = useState(false);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!formData.companyName.trim()) errs.companyName = 'Company name is required';
    if (!formData.contactName.trim()) errs.contactName = 'Contact name is required';
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) errs.email = 'Valid email required';
    if (!formData.password || formData.password.length < 6) errs.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    if (!formData.phone.trim()) errs.phone = 'Phone number is required';
    if (!formData.gstin.trim()) errs.gstin = 'GST number is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const success = await vendorRegister({
      companyName: formData.companyName,
      contactName: formData.contactName,
      email: formData.email,
      phone: formData.phone,
      gstin: formData.gstin,
      category: formData.category,
    });
    if (success) setSubmitted(true);
  };

  const FieldError = ({ field }) => errors[field]
    ? <p className="text-[10px] font-semibold text-rose-600 dark:text-rose-400 mt-1">{errors[field]}</p>
    : null;

  const InputClass = (field) => `w-full py-2.5 text-sm bg-white dark:bg-neutral-950 border rounded-xl focus:outline-none focus:ring-2 transition-all text-slate-800 dark:text-neutral-200 placeholder:text-slate-300 dark:placeholder:text-neutral-700 ${
    errors[field]
      ? 'border-rose-400 focus:ring-rose-500/20 focus:border-rose-500'
      : 'border-slate-200 dark:border-neutral-800 hover:border-slate-300 dark:hover:border-neutral-700 focus:ring-brand-500/20 focus:border-brand-500'
  }`;

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-neutral-950 p-6">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-950/30 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h2 className="text-2xl font-display font-black text-slate-900 dark:text-white mb-2">Registration Submitted!</h2>
            <p className="text-sm text-slate-600 dark:text-neutral-400 font-medium leading-relaxed">
              Your vendor registration for <strong className="text-slate-800 dark:text-neutral-200">{formData.companyName}</strong> has been submitted successfully. An admin will review and approve your account.
            </p>
          </div>
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-2xl p-4 text-xs text-amber-800 dark:text-amber-300 font-medium">
            For the hackathon demo, log in to the <strong>Admin</strong> account and visit <strong>Pending Vendors</strong> to approve your registration.
          </div>
          <Link
            to="/login"
            className="inline-flex items-center justify-center gap-2 w-full py-3 text-sm font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-2xl shadow-md shadow-brand-500/20 transition-all hover:-translate-y-0.5"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-neutral-950">

      {/* Left Brand Panel */}
      <div className="hidden lg:flex lg:w-[40%] flex-col justify-between p-12 bg-gradient-to-br from-amber-600 via-amber-500 to-orange-500 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-10 right-10 w-64 h-64 rounded-full bg-orange-300 blur-3xl" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <span className="text-white font-black text-base">VB</span>
            </div>
            <span className="text-white font-display font-black text-xl tracking-tight">VendorBridge</span>
          </div>
          <h2 className="text-4xl font-display font-black text-white leading-tight mb-4">
            Join as a<br />Vendor Partner
          </h2>
          <p className="text-white/75 text-sm font-medium leading-relaxed max-w-sm">
            Register your company to receive RFQs, submit competitive quotations, and win procurement contracts.
          </p>
        </div>
        <div className="relative z-10 space-y-3">
          {['Receive RFQs directly', 'Submit competitive quotes', 'Track purchase orders', 'Manage your invoices'].map(f => (
            <div key={f} className="flex items-center gap-3 text-white/80 text-xs font-medium">
              <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <div className="w-2 h-2 rounded-full bg-white" />
              </div>
              {f}
            </div>
          ))}
        </div>
      </div>

      {/* Right Registration Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-lg">
          <div className="mb-7">
            <div className="flex items-center gap-2.5 mb-4 lg:hidden">
              <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-brand-600 to-brand-500 flex items-center justify-center">
                <span className="text-white font-black text-xs">VB</span>
              </div>
              <span className="font-display font-black text-lg text-slate-900 dark:text-white">VendorBridge</span>
            </div>
            <h1 className="text-3xl font-display font-black text-slate-900 dark:text-white tracking-tight mb-1">
              Register as Vendor
            </h1>
            <p className="text-sm text-slate-500 dark:text-neutral-500 font-medium">
              Fill in your company details. Admin approval required after registration.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Company & Contact */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wider">Company Name *</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input type="text" value={formData.companyName} onChange={e => handleChange('companyName', e.target.value)}
                    placeholder="Acme Solutions Ltd"
                    className={`${InputClass('companyName')} pl-10 pr-3`} />
                </div>
                <FieldError field="companyName" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wider">Contact Person *</label>
                <input type="text" value={formData.contactName} onChange={e => handleChange('contactName', e.target.value)}
                  placeholder="John Smith"
                  className={`${InputClass('contactName')} px-3`} />
                <FieldError field="contactName" />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wider">Business Email *</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input type="email" value={formData.email} onChange={e => handleChange('email', e.target.value)}
                  placeholder="vendor@company.com"
                  className={`${InputClass('email')} pl-10 pr-3`} />
              </div>
              <FieldError field="email" />
            </div>

            {/* Phone + Category */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wider">Phone *</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input type="tel" value={formData.phone} onChange={e => handleChange('phone', e.target.value)}
                    placeholder="+91 98765 43210"
                    className={`${InputClass('phone')} pl-10 pr-3`} />
                </div>
                <FieldError field="phone" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wider">Category *</label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <select value={formData.category} onChange={e => handleChange('category', e.target.value)}
                    className={`${InputClass('category')} pl-10 pr-3`}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* GST */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wider">GST Number *</label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input type="text" value={formData.gstin} onChange={e => handleChange('gstin', e.target.value.toUpperCase())}
                  placeholder="22AAAAA0000A1Z5"
                  className={`${InputClass('gstin')} pl-10 pr-3 font-mono`} />
              </div>
              <FieldError field="gstin" />
            </div>

            {/* Password */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wider">Password *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input type={showPw ? 'text' : 'password'} value={formData.password} onChange={e => handleChange('password', e.target.value)}
                    placeholder="••••••••"
                    className={`${InputClass('password')} pl-10 pr-10`} />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <FieldError field="password" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wider">Confirm Password *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input type={showConfirmPw ? 'text' : 'password'} value={formData.confirmPassword} onChange={e => handleChange('confirmPassword', e.target.value)}
                    placeholder="••••••••"
                    className={`${InputClass('confirmPassword')} pl-10 pr-10`} />
                  <button type="button" onClick={() => setShowConfirmPw(!showConfirmPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                    {showConfirmPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <FieldError field="confirmPassword" />
              </div>
            </div>

            {/* Notice */}
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-xl px-4 py-3 text-[11px] text-amber-800 dark:text-amber-400 font-medium">
              ⚠️ After registration, your account will be <strong>pending admin approval</strong>. You'll be notified once approved.
            </div>

            {/* Submit */}
            <button
              id="signup_submit"
              type="submit"
              disabled={loading}
              className="w-full py-3 text-sm font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-xl shadow-md shadow-brand-500/20 transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
                : 'Submit Vendor Registration'}
            </button>
          </form>

          <p className="text-center text-xs text-slate-500 dark:text-neutral-500 font-medium mt-4">
            Already registered?{' '}
            <Link to="/login" className="font-bold text-brand-600 dark:text-brand-400 hover:text-brand-700 transition-colors">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
