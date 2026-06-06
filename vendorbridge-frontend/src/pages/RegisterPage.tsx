import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Lock, Mail, User as UserIcon, ArrowRight, Loader2,
  Phone, FileText, Building2, Hash, MapPin, Briefcase
} from 'lucide-react';
import { useAuthStore } from '../store/auth.store';
import ThemeToggle from '../components/ui/ThemeToggle';
import Logo from '../components/ui/Logo';
import api from '../lib/axios';
import toast from 'react-hot-toast';

const CATEGORIES = [
  'IT & Technology',
  'Furniture & Fixtures',
  'Logistics & Transport',
  'Raw Materials',
  'Office Supplies',
  'Electrical & Electronics',
  'Construction',
  'Healthcare & Pharma',
  'Catering & Food Services',
  'Security Services',
  'Printing & Stationery',
  'Other Services',
];

interface FieldProps {
  label: string;
  name: string;
  type?: string;
  placeholder: string;
  required?: boolean;
  icon: React.ElementType;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  showPassword?: boolean;
  setShowPassword?: (show: boolean) => void;
}

const Field = ({
  label,
  name,
  type = 'text',
  placeholder,
  required = false,
  icon: Icon,
  value,
  onChange,
  disabled,
  showPassword,
  setShowPassword,
}: FieldProps) => (
  <div className="space-y-1.5">
    <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider block">
      {label} {required && <span className="text-brand-green">*</span>}
    </label>
    <div className="relative">
      <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
      <input
        name={name}
        type={type === 'password' && showPassword ? 'text' : type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="input-field w-full pl-11 text-sm"
        required={required}
        disabled={disabled}
      />
      {type === 'password' && setShowPassword && (
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
          tabIndex={-1}
        >
          {showPassword ? '👁' : '👁‍🗨'}
        </button>
      )}
    </div>
  </div>
);

export default function RegisterPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [form, setForm] = useState({
    // Personal / Account
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
    confirm_password: '',
    // Company / Vendor
    company_name: '',
    gst_number: '',
    category: CATEGORIES[0],
    contact_phone: '',
    address: '',
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validations
    if (!form.first_name || !form.last_name || !form.email || !form.password || !form.company_name || !form.gst_number || !form.contact_phone) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (form.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    if (form.password !== form.confirm_password) {
      toast.error('Passwords do not match');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        phone: form.phone || null,
        password: form.password,
        country: 'India',
        company_name: form.company_name,
        gst_number: form.gst_number,
        category: form.category,
        contact_phone: form.contact_phone,
        address: form.address || null,
      };

      const response = await api.post('/auth/register-vendor', payload);
      const { token, user } = response.data.data;
      setAuth(user, token);
      toast.success('Vendor registered! Your profile is pending admin approval.');
      navigate('/dashboard');
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-surface-base relative flex items-start justify-center p-6 py-12 overflow-y-auto">
      {/* Theme Toggle in top-right */}
      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      {/* Background glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/5 blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-2xl relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <Logo size="lg" linkTo="/" className="justify-center mb-6" />
          <h1 className="text-3xl font-extrabold text-text-primary tracking-tight">Vendor Registration</h1>
          <p className="text-[#94a3b8] text-sm mt-2">
            Register your company on VendorBridge. Your profile will be reviewed by our team before activation.
          </p>

          {/* Pending note */}
          <div className="mt-4 inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold px-4 py-2 rounded-full">
            <span>⏳</span> After registration, admin approval is required to receive RFQs
          </div>
        </div>

        {/* Form Card */}
        <div className="glass-card rounded-2xl p-8 border border-emerald-500/15">
          <form onSubmit={handleSubmit} className="space-y-7">

            {/* ── Section 1: Personal Information ── */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <UserIcon className="w-4 h-4 text-emerald-400" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">Personal Information</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field 
                  label="First Name" 
                  name="first_name" 
                  placeholder="First name" 
                  required 
                  icon={UserIcon} 
                  value={form.first_name}
                  onChange={handleChange}
                  disabled={loading}
                />
                <Field 
                  label="Last Name" 
                  name="last_name" 
                  placeholder="Last name" 
                  required 
                  icon={UserIcon} 
                  value={form.last_name}
                  onChange={handleChange}
                  disabled={loading}
                />
                <Field 
                  label="Email Address" 
                  name="email" 
                  type="email" 
                  placeholder="your@email.com" 
                  required 
                  icon={Mail} 
                  value={form.email}
                  onChange={handleChange}
                  disabled={loading}
                />
                <Field 
                  label="Mobile Phone" 
                  name="phone" 
                  type="tel" 
                  placeholder="+91 XXXXX XXXXX" 
                  icon={Phone} 
                  value={form.phone}
                  onChange={handleChange}
                  disabled={loading}
                />
                <Field 
                  label="Password" 
                  name="password" 
                  type="password" 
                  placeholder="Min. 8 characters" 
                  required 
                  icon={Lock} 
                  value={form.password}
                  onChange={handleChange}
                  disabled={loading}
                  showPassword={showPassword}
                  setShowPassword={setShowPassword}
                />
                <Field 
                  label="Confirm Password" 
                  name="confirm_password" 
                  type="password" 
                  placeholder="Re-enter password" 
                  required 
                  icon={Lock} 
                  value={form.confirm_password}
                  onChange={handleChange}
                  disabled={loading}
                  showPassword={showPassword}
                  setShowPassword={setShowPassword}
                />
              </div>
            </div>

            <hr className="border-white/5" />

            {/* ── Section 2: Company / Vendor Details ── */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="w-4 h-4 text-blue-400" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">Company Details</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Company Name — full width */}
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider block">
                    Company / Vendor Name <span className="text-emerald-400">*</span>
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
                    <input
                      name="company_name"
                      type="text"
                      placeholder="e.g. Global Tech Solutions Pvt. Ltd."
                      value={form.company_name}
                      onChange={handleChange}
                      className="input-field w-full pl-11 text-sm"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* GST Number */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider block">
                    GSTIN Number <span className="text-emerald-400">*</span>
                  </label>
                  <div className="relative">
                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
                    <input
                      name="gst_number"
                      type="text"
                      placeholder="e.g. 22AAAAA0000A1Z5"
                      value={form.gst_number}
                      onChange={handleChange}
                      className="input-field w-full pl-11 text-sm font-mono"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Category */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider block">
                    Business Category <span className="text-emerald-400">*</span>
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8] pointer-events-none z-10" />
                    <select
                      name="category"
                      value={form.category}
                      onChange={handleChange}
                      className="input-field w-full pl-11 text-sm"
                      required
                      disabled={loading}
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Contact Phone */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider block">
                    Business Phone <span className="text-emerald-400">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
                    <input
                      name="contact_phone"
                      type="tel"
                      placeholder="+91 XXXXX XXXXX"
                      value={form.contact_phone}
                      onChange={handleChange}
                      className="input-field w-full pl-11 text-sm"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Address — full width */}
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider block">
                    Registered Address
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-4 w-4 h-4 text-[#94a3b8] pointer-events-none" />
                    <textarea
                      name="address"
                      placeholder="Full registered business address..."
                      value={form.address}
                      onChange={handleChange}
                      rows={2}
                      className="input-field w-full pl-11 pt-3.5 resize-none text-sm"
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* ── Terms notice ── */}
            <div className="flex items-start gap-3 bg-white/[0.03] border border-white/5 rounded-xl p-4 text-xs text-[#94a3b8]">
              <FileText className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
              <p>
                By registering, you agree that your vendor profile will be reviewed by the procurement team.
                Your account will be activated only after admin verification. You'll be able to receive RFQs once approved.
              </p>
            </div>

            {/* Submit */}
            <button
              id="vendor-register-submit"
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-[0_0_24px_rgba(16,185,129,0.3)] hover:shadow-[0_0_32px_rgba(16,185,129,0.4)] transition-all duration-300 transform active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Register Vendor Account <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-[#94a3b8]">
            Already have an account?{' '}
            <Link to="/login" className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
