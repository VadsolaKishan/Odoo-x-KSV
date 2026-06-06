import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, User as UserIcon, ArrowRight, Loader2, Globe, Phone, FileText, Camera } from 'lucide-react';
import api from '../lib/axios';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
    confirm_password: '',
    role: 'procurement_officer',
    country: 'India',
    additional_info: ''
  });
  
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    const key = id.replace('register-', '').replace(/-/g, '_');
    setFormData((prev) => ({
      ...prev,
      [key]: value
    }));
  };

  const handlePhotoClick = () => {
    // Hackathon UI interaction trigger
    toast.success('Photo upload dialog triggered (mock UI)');
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Required fields check
    if (!formData.first_name || !formData.last_name || !formData.email || !formData.password || !formData.confirm_password) {
      toast.error('All asterisked fields are required');
      return;
    }

    // Password validation
    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    if (formData.password !== formData.confirm_password) {
      toast.error('Passwords do not match');
      return;
    }

    // Email regex validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        country: formData.country,
        phone: formData.phone || null,
        additional_info: formData.additional_info || null
      };

      await api.post('/auth/register', payload);
      toast.success('Registration successful! Please sign in.');
      navigate('/login');
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Registration failed. Please check the fields and try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const countries = [
    'India',
    'United States',
    'United Kingdom',
    'Germany',
    'Canada',
    'Australia',
    'Singapore'
  ];

  return (
    <div className="min-h-screen bg-surface-base relative flex items-center justify-center p-6 md:p-12 overflow-y-auto py-12">
      {/* Background Ambient Spotlights */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-brand-green/5 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-brand-green/5 blur-[120px] pointer-events-none"></div>

      {/* Main Glass Container */}
      <div className="w-full max-w-2xl glass-card rounded-2xl p-8 relative z-10 border border-brand-green/20">
        
        {/* Header Logo */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-10 h-10 rounded bg-brand-green flex items-center justify-center shadow-glow mb-3">
            <div className="w-3.5 h-3.5 bg-[#0a0f0d] rounded-sm"></div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Join VendorBridge</h1>
          <p className="text-text-secondary text-sm mt-1">Create an account to access the procurement network</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Profile Photo Uploader Section */}
          <div className="flex flex-col items-center mb-6">
            <div 
              onClick={handlePhotoClick}
              className="relative w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center cursor-pointer group hover:border-brand-green/50 hover:shadow-glow transition-all duration-300"
              title="Click to Upload Photo"
            >
              <UserIcon className="w-10 h-10 text-text-secondary group-hover:text-brand-green transition-colors duration-200" />
              <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-brand-green flex items-center justify-center border border-[#0a0f0d] shadow-md group-hover:scale-105 transition-transform duration-200">
                <Camera className="w-3.5 h-3.5 text-white" />
              </div>
            </div>
            <span className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider mt-2 group-hover:text-brand-green">
              Profile Photo
            </span>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={() => toast.success('Profile photo selected successfully (Mock)')}
            />
          </div>

          <div className="space-y-5">
            {/* First Name & Last Name (Side by side) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider block" htmlFor="register-first-name">
                  First Name *
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                  <input
                    id="register-first-name"
                    type="text"
                    placeholder="First Name"
                    value={formData.first_name}
                    onChange={handleChange}
                    className="input-field w-full pl-12"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider block" htmlFor="register-last-name">
                  Last Name *
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                  <input
                    id="register-last-name"
                    type="text"
                    placeholder="Last Name"
                    value={formData.last_name}
                    onChange={handleChange}
                    className="input-field w-full pl-12"
                    required
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {/* Email Address & Phone Number (Side by side) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider block" htmlFor="register-email">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                  <input
                    id="register-email"
                    type="email"
                    placeholder="Email address"
                    value={formData.email}
                    onChange={handleChange}
                    className="input-field w-full pl-12"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider block" htmlFor="register-phone">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                  <input
                    id="register-phone"
                    type="tel"
                    placeholder="Phone number"
                    value={formData.phone}
                    onChange={handleChange}
                    className="input-field w-full pl-12"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {/* Password & Confirm Password (Side by side) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider block" htmlFor="register-password">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                  <input
                    id="register-password"
                    type="password"
                    placeholder="••••••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    className="input-field w-full pl-12"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider block" htmlFor="register-confirm-password">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                  <input
                    id="register-confirm-password"
                    type="password"
                    placeholder="••••••••••••"
                    value={formData.confirm_password}
                    onChange={handleChange}
                    className="input-field w-full pl-12"
                    required
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {/* Role & Country Dropdowns (Side by side) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider block" htmlFor="register-role">
                  Role Type *
                </label>
                <select
                  id="register-role"
                  value={formData.role}
                  onChange={handleChange}
                  className="input-field w-full"
                  required
                  disabled={loading}
                >
                  <option value="procurement_officer">Procurement Officer</option>
                  <option value="manager">Manager / Approver</option>
                  <option value="vendor">Vendor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider block" htmlFor="register-country">
                  Country *
                </label>
                <div className="relative">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary pointer-events-none" />
                  <select
                    id="register-country"
                    value={formData.country}
                    onChange={handleChange}
                    className="input-field w-full pl-12"
                    required
                    disabled={loading}
                  >
                    {countries.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Additional Information Textarea */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider block" htmlFor="register-additional-info">
                Additional Information
              </label>
              <div className="relative">
                <FileText className="absolute left-4 top-4 w-5 h-5 text-text-secondary pointer-events-none" />
                <textarea
                  id="register-additional-info"
                  placeholder="Any additional details..."
                  value={formData.additional_info}
                  onChange={handleChange}
                  rows={3}
                  className="input-field w-full pl-12 pt-3.5 resize-none"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            id="register-submit"
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-glow hover:shadow-[0_0_24px_rgba(16,185,129,0.35)] transition-all duration-300 transform active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none mt-2"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Register Account <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Redirect */}
        <div className="mt-8 text-center border-t border-subtle pt-6">
          <p className="text-xs text-text-secondary">
            Already have an account?{' '}
            <Link to="/login" className="text-emerald-400 hover:text-brand-green-dark font-semibold transition-colors">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
