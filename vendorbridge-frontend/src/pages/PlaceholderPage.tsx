import MainLayout from '../components/Layout/MainLayout';
import { Construction } from 'lucide-react';

interface PlaceholderPageProps {
  title: string;
}

export default function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <MainLayout>
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
        <div className="w-16 h-16 rounded-full bg-brand-green/10 flex items-center justify-center border border-brand-green/30 shadow-glow mb-6 animate-pulse">
          <Construction className="w-8 h-8 text-brand-green" />
        </div>
        <h1 className="text-2xl font-bold text-text-primary mb-2">{title}</h1>
        <p className="text-text-secondary max-w-md">
          This ERP module is scheduled for implementation in the next chunk by Frontend Dev 2.
        </p>
        <div className="mt-8 glass-card p-6 rounded-xl border border-white/5 max-w-sm text-left">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-brand-green mb-2">Scope Details</h4>
          <ul className="text-xs text-text-secondary space-y-2 list-disc pl-4">
            <li>Workflow details & document lines</li>
            <li>Dynamic state transitions</li>
            <li>Database transactions logs</li>
            <li>Approval chains configuration</li>
          </ul>
        </div>
      </div>
    </MainLayout>
  );
}
