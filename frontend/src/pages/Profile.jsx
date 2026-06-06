import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { FormInput } from '../components/FormInput';
import { User, Shield, MapPin, Phone, Mail } from 'lucide-react';

export const Profile = () => {
  const { currentUser, setCurrentUser, addToast } = useApp();
  
  const [name, setName] = useState(currentUser?.name || 'Sarah Jenkins');
  const [email, setEmail] = useState(currentUser?.email || 'sarah.j@vendorbridge.com');
  const [role, setRole] = useState(currentUser?.role || 'VP of Procurement');
  const [phone, setPhone] = useState(currentUser?.phone || '+91 79 5550 9182');
  const [office, setOffice] = useState(currentUser?.office || 'Ahmedabad Corporate HQ');
  const [loading, setLoading] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      const updatedUser = {
        ...currentUser,
        name,
        email,
        role,
        phone,
        office
      };
      
      setCurrentUser(updatedUser);
      localStorage.setItem('vb_user', JSON.stringify(updatedUser));
      setLoading(false);
      addToast('Profile updated successfully!', 'success');
    }, 600);
  };

  const getInitials = (userName) => {
    return userName
      ? userName.split(' ').map(n => n[0]).join('').toUpperCase()
      : 'U';
  };

  return (
    <div className="space-y-6 text-xs text-slate-700 dark:text-neutral-300 animate-fade-in">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-extrabold text-slate-800 dark:text-neutral-100 tracking-tight">
          My Profile
        </h1>
        <p className="text-xs text-slate-400 dark:text-neutral-500 font-medium">
          Manage your corporate buyer credentials, role designations, and notification settings
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Side: Summary Card */}
        <div className="border border-slate-200 dark:border-neutral-800 rounded-2xl p-6 bg-white dark:bg-neutral-900/50 shadow-sm flex flex-col items-center text-center space-y-4">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-brand-600 to-brand-400 text-white font-extrabold text-3xl flex items-center justify-center border-4 border-white dark:border-neutral-900 shadow-md">
            {getInitials(name)}
          </div>
          
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-slate-850 dark:text-neutral-100">{name}</h2>
            <p className="text-brand-600 dark:text-brand-400 font-semibold">{role}</p>
            <p className="text-slate-400 dark:text-neutral-500 font-medium text-[10px]">VendorBridge Enterprise Buyer</p>
          </div>

          <hr className="w-full border-slate-200 dark:border-neutral-800" />

          <div className="w-full space-y-3 text-left font-semibold text-slate-600 dark:text-neutral-300">
            <div className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="truncate">{email}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-slate-400 shrink-0" />
              <span>{phone}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="truncate">{office}</span>
            </div>
          </div>
        </div>

        {/* Right Side: Edit Form Card */}
        <div className="lg:col-span-2 border border-slate-200 dark:border-neutral-800 rounded-2xl p-6 bg-white dark:bg-neutral-900/50 shadow-sm space-y-6">
          <div className="border-b border-slate-100 dark:border-neutral-800 pb-2 flex items-center gap-1.5 font-bold text-slate-750 dark:text-neutral-250">
            <Shield className="w-4 h-4 text-brand-500" />
            <span>Profile Details & Authorizations</span>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput
                label="Full Name"
                id="prof_name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Sarah Jenkins"
                required
              />
              
              <FormInput
                label="Corporate Email Address"
                id="prof_email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="sarah.jenkins@vendorbridge.com"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-1">
                <FormInput
                  label="System Role"
                  id="prof_role"
                  type="select"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  options={['VP of Procurement', 'Buyer Manager', 'Senior Buyer', 'Financial Approver']}
                />
              </div>
              <div className="sm:col-span-1">
                <FormInput
                  label="Contact Phone"
                  id="prof_phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 79 5550 9182"
                />
              </div>
              <div className="sm:col-span-1">
                <FormInput
                  label="Office Location"
                  id="prof_office"
                  type="select"
                  value={office}
                  onChange={(e) => setOffice(e.target.value)}
                  options={['Ahmedabad Corporate HQ', 'Mumbai Annex Annex', 'Bangalore Technical Annex']}
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 text-xs font-semibold bg-transparent border border-slate-300 dark:border-neutral-700 text-slate-700 dark:text-neutral-300 rounded-xl hover:bg-slate-50 dark:hover:bg-neutral-800 hover:border-slate-400 dark:hover:border-neutral-600 hover-glow-button transition-all cursor-pointer"
              >
                {loading ? 'Saving Changes...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        </div>

      </div>

    </div>
  );
};

export default Profile;
