import React from 'react';
import { useApp, DEMO_CREDENTIALS } from '../context/AppContext';
import { Shield, Briefcase, UserCheck, Store, Mail, Hash } from 'lucide-react';

const ROLE_META = {
  admin:   { label: 'Admin',    icon: Shield,    color: 'bg-brand-600',   badge: 'bg-brand-50 text-brand-700 dark:bg-brand-950/30 dark:text-brand-400 border-brand-200 dark:border-brand-900/40' },
  officer: { label: 'Officer',  icon: Briefcase, color: 'bg-sky-600',     badge: 'bg-sky-50 text-sky-700 dark:bg-sky-950/30 dark:text-sky-400 border-sky-200 dark:border-sky-900/40' },
  manager: { label: 'Manager',  icon: UserCheck, color: 'bg-emerald-600', badge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/40' },
  vendor:  { label: 'Vendor',   icon: Store,     color: 'bg-amber-600',   badge: 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border-amber-200 dark:border-amber-900/40' },
};

export const UserManagement = () => {
  const { vendors } = useApp();

  const systemUsers = DEMO_CREDENTIALS;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-extrabold text-slate-800 dark:text-neutral-100 tracking-tight">User Management</h1>
        <p className="text-sm text-slate-500 dark:text-neutral-500 font-medium mt-1">
          System users and demo credentials for all roles.
        </p>
      </div>

      {/* System Users */}
      <div className="bg-white dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-800/60 rounded-2xl shadow-premium-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-neutral-800 bg-slate-50/30 dark:bg-neutral-950/10">
          <h3 className="text-sm font-bold text-slate-800 dark:text-neutral-200">System Users</h3>
          <p className="text-[10px] text-slate-400 dark:text-neutral-500 font-medium mt-0.5">All demo accounts across roles</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-neutral-800 text-[10px] uppercase tracking-wider text-slate-400 dark:text-neutral-500 font-bold">
                <th className="px-6 py-3.5 text-left">User</th>
                <th className="px-6 py-3.5 text-left">Email</th>
                <th className="px-6 py-3.5 text-left">Role</th>
                <th className="px-6 py-3.5 text-left">Office</th>
                <th className="px-6 py-3.5 text-left">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-neutral-800/40">
              {systemUsers.map((user, i) => {
                const meta = ROLE_META[user.role];
                const Icon = meta.icon;
                return (
                  <tr key={i} className="hover:bg-slate-50/60 dark:hover:bg-neutral-850/20 transition-colors">
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-full ${meta.color} flex items-center justify-center shrink-0`}>
                          <span className="text-white text-[10px] font-bold">
                            {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </span>
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 dark:text-neutral-200">{user.name}</p>
                          <p className="text-[10px] text-slate-400 dark:text-neutral-500 font-medium">{user.title}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-1.5 text-slate-600 dark:text-neutral-400 font-medium">
                        <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                        {user.email}
                      </div>
                    </td>
                    <td className="px-6 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border capitalize ${meta.badge}`}>
                        <Icon className="w-3 h-3" />
                        {meta.label}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-slate-600 dark:text-neutral-400 font-medium">{user.office}</td>
                    <td className="px-6 py-3.5">
                      <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Active
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Vendor Accounts */}
      <div className="bg-white dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-800/60 rounded-2xl shadow-premium-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-neutral-800 bg-slate-50/30 dark:bg-neutral-950/10">
          <h3 className="text-sm font-bold text-slate-800 dark:text-neutral-200">Active Vendor Accounts</h3>
          <p className="text-[10px] text-slate-400 dark:text-neutral-500 font-medium mt-0.5">Approved vendor partners</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-neutral-800 text-[10px] uppercase tracking-wider text-slate-400 dark:text-neutral-500 font-bold">
                <th className="px-6 py-3.5 text-left">Vendor</th>
                <th className="px-6 py-3.5 text-left">Category</th>
                <th className="px-6 py-3.5 text-left">GSTIN</th>
                <th className="px-6 py-3.5 text-left">Rating</th>
                <th className="px-6 py-3.5 text-left">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-neutral-800/40">
              {vendors.map(v => (
                <tr key={v.id} className="hover:bg-slate-50/60 dark:hover:bg-neutral-850/20 transition-colors">
                  <td className="px-6 py-3.5">
                    <div>
                      <p className="font-bold text-slate-800 dark:text-neutral-200">{v.name}</p>
                      <p className="text-[10px] text-slate-400 dark:text-neutral-500 font-medium">{v.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-3.5 text-slate-600 dark:text-neutral-400 font-medium">{v.category}</td>
                  <td className="px-6 py-3.5">
                    <span className="font-mono text-[10px] text-slate-600 dark:text-neutral-400">{v.gstin || '—'}</span>
                  </td>
                  <td className="px-6 py-3.5">
                    <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-bold">
                      ★ {v.rating}
                    </span>
                  </td>
                  <td className="px-6 py-3.5">
                    <span className={`flex items-center gap-1.5 text-[10px] font-bold ${v.status === 'Active' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${v.status === 'Active' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                      {v.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
