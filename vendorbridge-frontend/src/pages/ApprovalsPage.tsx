import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  AlertCircle,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Loader2,
  ChevronRight,
  UserCheck
} from 'lucide-react';
import MainLayout from '../components/Layout/MainLayout';
import api from '../lib/axios';
import { useAuthStore } from '../store/auth.store';
import toast from 'react-hot-toast';

interface ApprovalRecord {
  id: string;
  quotation_id: string;
  rfq_id: string;
  vendor_id: string;
  level: number;
  approver_id: string;
  approver_name: string;
  approver_role: string;
  status: 'pending' | 'approved' | 'rejected';
  remarks: string | null;
  actioned_at: string | null;
  assigned_at: string;
  created_at: string;
  actual_user_name?: string;
}

interface QuotationDetail {
  id: string;
  rfq_id: string;
  vendor_id: string;
  status: string;
  subtotal: string;
  gst_percentage: string;
  gst_amount: string;
  grand_total: string;
  delivery_days: number | null;
  payment_terms: string | null;
  notes: string | null;
  vendor: {
    id: string;
    name: string;
    rating: string;
  };
}

interface ListApproval {
  id: string;
  quotation_id: string;
  rfq_id: string;
  vendor_id: string;
  level: number;
  approver_id: string;
  approver_name: string;
  approver_role: string;
  status: 'pending' | 'approved' | 'rejected';
  remarks: string | null;
  actioned_at: string | null;
  assigned_at: string;
  created_at: string;
  rfq_title: string;
  rfq_number: string;
  vendor_name: string;
  quotation_total: number;
}

export default function ApprovalsPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  // Selected Quotation ID state
  const [selectedQuotationId, setSelectedQuotationId] = useState<string | null>(null);

  // List View State
  const [approvalsList, setApprovalsList] = useState<ListApproval[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [listFilter, setListFilter] = useState<'all' | 'pending' | 'actioned'>('pending');

  // Detail View State
  const [chain, setChain] = useState<ApprovalRecord[]>([]);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [quotation, setQuotation] = useState<QuotationDetail | null>(null);
  const [remarks, setRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);

  // Parse quotation_id from query params on mount/location change
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const qId = params.get('quotation_id');
    if (qId) {
      setSelectedQuotationId(qId);
    } else {
      setSelectedQuotationId(null);
    }
  }, [location]);

  // Load approvals list
  useEffect(() => {
    async function loadApprovalsList() {
      if (selectedQuotationId) return; // don't load list if in detail view
      setLoadingList(true);
      try {
        const queryParams = [];
        if (listFilter === 'pending') {
          queryParams.push('status=pending');
        } else if (listFilter === 'actioned') {
          // fetch all, filter locally, or pass no status
        }
        
        const res = await api.get(`/approvals?${queryParams.join('&')}`);
        if (res.data && res.data.success) {
          let data = res.data.data || [];
          if (listFilter === 'actioned') {
            data = data.filter((item: any) => item.status === 'approved' || item.status === 'rejected');
          }
          setApprovalsList(data);
        }
      } catch (err) {
        console.error('Failed to fetch approvals list', err);
        toast.error('Failed to load approvals list.');
      } finally {
        setLoadingList(false);
      }
    }
    loadApprovalsList();
  }, [selectedQuotationId, listFilter]);

  // Load approval chain and quotation detail
  useEffect(() => {
    async function loadChainDetail() {
      if (!selectedQuotationId) return;
      setLoadingDetail(true);
      try {
        // 1. Fetch approval chain records
        const chainRes = await api.get(`/approvals/${selectedQuotationId}`);
        if (chainRes.data && chainRes.data.success) {
          setChain(chainRes.data.data || []);
        }

        // 2. Fetch quotation summary
        const quotationRes = await api.get(`/quotations/${selectedQuotationId}`);
        if (quotationRes.data && quotationRes.data.success) {
          setQuotation(quotationRes.data.data);
        }
      } catch (err) {
        console.error('Failed to load approval chain details', err);
        toast.error('Failed to load approval details.');
        setSelectedQuotationId(null);
        navigate('/approvals');
      } finally {
        setLoadingDetail(false);
      }
    }
    loadChainDetail();
  }, [selectedQuotationId, navigate]);

  // Handle Approve Decision
  const handleApprove = async (approvalId: string) => {
    if (!remarks.trim()) {
      toast.error('Remarks/comments are required to approve');
      return;
    }
    setIsSubmitting(true);
    setActionType('approve');
    try {
      const res = await api.patch(`/approvals/${approvalId}/approve`, { remarks });
      if (res.data && res.data.success) {
        toast.success(`Level approved successfully.`);
        setRemarks('');
        // Refetch details
        const chainRes = await api.get(`/approvals/${selectedQuotationId}`);
        if (chainRes.data && chainRes.data.success) {
          setChain(chainRes.data.data || []);
        }
        // Refetch quotation status
        const quotationRes = await api.get(`/quotations/${selectedQuotationId}`);
        if (quotationRes.data && quotationRes.data.success) {
          setQuotation(quotationRes.data.data);
        }
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to submit approval decision');
    } finally {
      setIsSubmitting(false);
      setActionType(null);
    }
  };

  // Handle Reject Decision
  const handleReject = async (approvalId: string) => {
    if (!remarks.trim()) {
      toast.error('Remarks/comments are required to reject');
      return;
    }
    setIsSubmitting(true);
    setActionType('reject');
    try {
      const res = await api.patch(`/approvals/${approvalId}/reject`, { remarks });
      if (res.data && res.data.success) {
        toast.error(`Quotation proposal rejected and returned.`);
        setRemarks('');
        // Refetch details
        const chainRes = await api.get(`/approvals/${selectedQuotationId}`);
        if (chainRes.data && chainRes.data.success) {
          setChain(chainRes.data.data || []);
        }
        // Refetch quotation status
        const quotationRes = await api.get(`/quotations/${selectedQuotationId}`);
        if (quotationRes.data && quotationRes.data.success) {
          setQuotation(quotationRes.data.data);
        }
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to submit rejection decision');
    } finally {
      setIsSubmitting(false);
      setActionType(null);
    }
  };

  // Find current active approval record (first pending in level order)
  const activeApproval = chain.find(item => item.status === 'pending');

  // Check if current user is the designated approver for the active step
  const isDesignatedApprover = activeApproval && (
    activeApproval.approver_id === user?.id || 
    user?.role === 'admin'
  );

  // Currency helper
  const formatCurrency = (val: number | string) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(Number(val));
  };

  // Date helper
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Render Horizontal Step Indicator
  const renderStepIndicator = () => {
    // Determine active steps
    const l1 = chain.find(c => c.level === 1);
    const l2 = chain.find(c => c.level === 2);

    const step2Completed = l1?.status === 'approved';
    const step2Pending = l1?.status === 'pending';
    const step3Completed = l2?.status === 'approved';
    const step3Pending = l2?.status === 'pending' && l1?.status === 'approved';
    const step4Completed = l2?.status === 'approved'; // PO generated automatically

    return (
      <div className="glass-card rounded-xl border border-white/5 p-6 flex flex-col md:flex-row items-center justify-between gap-6 overflow-x-auto">
        <div className="w-full flex items-center justify-between max-w-3xl mx-auto px-4 py-2">
          
          {/* Step 1: Submitted */}
          <div className="flex flex-col items-center relative z-10">
            <div className="w-8 h-8 rounded-full bg-brand-green border border-brand-green/30 flex items-center justify-center text-white text-xs font-bold shadow-glow">
              ●
            </div>
            <span className="text-xs font-semibold text-white mt-2">Submitted</span>
          </div>

          {/* Line 1 */}
          <div className={`flex-1 h-0.5 mx-2 -mt-6 ${step2Completed ? 'bg-brand-green shadow-glow' : 'bg-white/10'}`}></div>

          {/* Step 2: L1 Review */}
          <div className="flex flex-col items-center relative z-10">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
              step2Completed 
                ? 'bg-brand-green text-white shadow-glow border border-brand-green/30' 
                : step2Pending 
                ? 'bg-brand-green/10 border-2 border-brand-green text-brand-green shadow-glow' 
                : 'bg-white/5 border border-white/10 text-text-secondary'
            }`}>
              {step2Completed ? '✓' : '●'}
            </div>
            <span className={`text-xs font-semibold mt-2 ${step2Completed || step2Pending ? 'text-white' : 'text-text-secondary'}`}>
              L1 Review
            </span>
          </div>

          {/* Line 2 */}
          <div className={`flex-1 h-0.5 mx-2 -mt-6 ${step3Completed ? 'bg-brand-green shadow-glow' : 'bg-white/10'}`}></div>

          {/* Step 3: L2 Approval */}
          <div className="flex flex-col items-center relative z-10">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
              step3Completed 
                ? 'bg-brand-green text-white shadow-glow border border-brand-green/30' 
                : step3Pending 
                ? 'bg-brand-green/10 border-2 border-brand-green text-brand-green shadow-glow' 
                : 'bg-white/5 border border-white/10 text-text-secondary'
            }`}>
              {step3Completed ? '✓' : '●'}
            </div>
            <span className={`text-xs font-semibold mt-2 ${step3Completed || step3Pending ? 'text-white' : 'text-text-secondary'}`}>
              L2 Approval
            </span>
          </div>

          {/* Line 3 */}
          <div className={`flex-1 h-0.5 mx-2 -mt-6 ${step4Completed ? 'bg-brand-green shadow-glow' : 'bg-white/10'}`}></div>

          {/* Step 4: Generate PO */}
          <div className="flex flex-col items-center relative z-10">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
              step4Completed 
                ? 'bg-brand-green text-white shadow-glow border border-brand-green/30' 
                : 'bg-white/5 border border-white/10 text-text-secondary'
            }`}>
              {step4Completed ? '✓' : '●'}
            </div>
            <span className={`text-xs font-semibold mt-2 ${step4Completed ? 'text-white' : 'text-text-secondary'}`}>
              Generate PO
            </span>
          </div>

        </div>
      </div>
    );
  };

  return (
    <MainLayout>
      
      {/* 1. DETAIL WORKFLOW VIEW */}
      {selectedQuotationId ? (
        <div className="space-y-6">
          
          {/* Header row */}
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <button 
                onClick={() => {
                  setSelectedQuotationId(null);
                  navigate('/approvals');
                }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-secondary hover:text-brand-green transition-colors uppercase tracking-wider mb-3"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Approvals List
              </button>
              <h1 className="text-3xl font-extrabold tracking-tight text-text-primary">Approval Workflow</h1>
              {quotation && (
                <p className="text-text-secondary text-sm mt-1">
                  RFQ: <span className="text-text-primary font-semibold">Vendor: {quotation.vendor.name} — {formatCurrency(quotation.grand_total)}</span>
                </p>
              )}
            </div>
          </div>

          {loadingDetail ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-10 h-10 text-brand-green animate-spin mb-4" />
              <p className="text-sm text-text-secondary">Loading workflow status...</p>
            </div>
          ) : (
            <>
              {/* Horizontal Progress Steps */}
              {renderStepIndicator()}

              {/* Main content grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Left Side: Vertical Cards Chain + Form */}
                <div className="lg:col-span-8 space-y-6">
                  
                  {/* Vertical chain list */}
                  <div className="space-y-4 relative before:absolute before:left-8 before:top-2 before:bottom-2 before:w-0.5 before:bg-white/5">
                    {chain.map((record) => {
                      const isApproved = record.status === 'approved';
                      const isRejected = record.status === 'rejected';
                      const isPending = record.status === 'pending';

                      // Determine color styles
                      let borderClass = 'border-white/5';
                      let iconColor = 'text-text-secondary';
                      let StatusIcon = Clock;
                      let bgClass = 'bg-white/[0.01]';

                      if (isApproved) {
                        borderClass = 'border-l-4 border-l-brand-green border-r-white/5 border-t-white/5 border-b-white/5';
                        iconColor = 'text-brand-green';
                        StatusIcon = CheckCircle2;
                        bgClass = 'bg-brand-green/[0.02]';
                      } else if (isRejected) {
                        borderClass = 'border-l-4 border-l-red-500 border-r-white/5 border-t-white/5 border-b-white/5';
                        iconColor = 'text-red-500';
                        StatusIcon = XCircle;
                        bgClass = 'bg-red-500/[0.02]';
                      } else if (isPending) {
                        borderClass = 'border-l-4 border-l-amber-500 border-r-white/5 border-t-white/5 border-b-white/5';
                        iconColor = 'text-amber-500';
                        StatusIcon = Clock;
                        bgClass = 'bg-amber-500/[0.02]';
                      }

                      return (
                        <div 
                          key={record.id}
                          className={`glass-card rounded-xl p-5 border flex gap-4 items-start ${borderClass} ${bgClass} relative`}
                        >
                          <div className={`w-8 h-8 rounded-full bg-white/5 border border-white/5 flex items-center justify-center flex-shrink-0 z-10 ${iconColor}`}>
                            <StatusIcon className="w-5 h-5" />
                          </div>

                          <div className="flex-1 space-y-1">
                            <div className="flex justify-between items-start flex-wrap gap-2">
                              <div>
                                <h4 className="text-sm font-bold text-text-primary flex items-center gap-1.5">
                                  {record.approver_name} 
                                  <span className="text-[10px] text-text-secondary font-mono tracking-tight uppercase px-1.5 py-0.5 rounded bg-white/5">
                                    {record.approver_role}
                                  </span>
                                </h4>
                                <p className="text-xs text-text-secondary mt-0.5">Level {record.level} Reviewer</p>
                              </div>
                              <div className="text-right text-[11px] text-text-secondary font-mono">
                                {isApproved && record.actioned_at && (
                                  <span>Approved {formatDate(record.actioned_at)}</span>
                                )}
                                {isRejected && record.actioned_at && (
                                  <span className="text-red-400">Rejected {formatDate(record.actioned_at)}</span>
                                )}
                                {isPending && (
                                  <span>Assigned {formatDate(record.assigned_at)}</span>
                                )}
                              </div>
                            </div>

                            {/* Remarks box — color-coded by status */}
                            {record.remarks && (() => {
                              const isLight = document.documentElement.classList.contains('light');
                              const remarkStyles = isApproved
                                ? {
                                    bg: 'rgba(16,185,129,0.08)',
                                    borderColor: 'rgba(16,185,129,0.25)',
                                    icon: 'text-emerald-500',
                                    labelColor: isLight ? '#047857' : '#34d399',
                                    textColor: isLight ? '#0f172a' : '#d1fae5',
                                  }
                                : isRejected
                                ? {
                                    bg: 'rgba(239,68,68,0.08)',
                                    borderColor: 'rgba(239,68,68,0.25)',
                                    icon: 'text-red-500',
                                    labelColor: isLight ? '#b91c1c' : '#fca5a5',
                                    textColor: isLight ? '#0f172a' : '#fee2e2',
                                  }
                                : {
                                    bg: 'rgba(245,158,11,0.08)',
                                    borderColor: 'rgba(245,158,11,0.25)',
                                    icon: 'text-amber-500',
                                    labelColor: isLight ? '#b45309' : '#fcd34d',
                                    textColor: isLight ? '#0f172a' : '#fef3c7',
                                  };
                              return (
                                <div
                                  className="mt-3 p-3 rounded-lg border text-xs flex gap-2 items-start"
                                  style={{ backgroundColor: remarkStyles.bg, borderColor: remarkStyles.borderColor }}
                                >
                                  <MessageSquare className={`w-4 h-4 flex-shrink-0 mt-0.5 ${remarkStyles.icon}`} />
                                  <div>
                                    <span
                                      className="font-bold block mb-1 uppercase tracking-widest text-[10px]"
                                      style={{ color: remarkStyles.labelColor }}
                                    >
                                      Remarks:
                                    </span>
                                    <p
                                      className="italic leading-relaxed font-medium"
                                      style={{ color: remarkStyles.textColor }}
                                    >
                                      "{record.remarks}"
                                    </p>
                                  </div>
                                </div>
                              );
                            })()}

                            {isPending && (
                              <div className="mt-2 text-xs text-amber-500 font-semibold flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                                <span>Awaiting Review Decision</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Decision Form Card */}
                  {activeApproval && (
                    <div className="glass-card rounded-xl border border-white/5 p-6 space-y-4">
                      <div className="flex items-center gap-2 pb-2 border-b border-subtle">
                        <UserCheck className="w-5 h-5 text-brand-green" />
                        <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">Submit Decision</h3>
                      </div>

                      {isDesignatedApprover ? (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider block">
                              Remarks / Comments*
                            </label>
                            <textarea
                              rows={3}
                              required
                              placeholder="Provide remarks detailing the reasons for approval or rejection..."
                              value={remarks}
                              onChange={(e) => setRemarks(e.target.value)}
                              className="input-field w-full text-sm resize-none pt-2.5"
                              disabled={isSubmitting}
                            />
                          </div>

                          <div className="flex flex-col sm:flex-row gap-3">
                            <button
                              type="button"
                              onClick={() => handleApprove(activeApproval.id)}
                              disabled={isSubmitting || !remarks.trim()}
                              className="flex-1 h-11 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold text-sm rounded-lg flex items-center justify-center gap-2 shadow-glow hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all duration-300 transform active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
                            >
                              {isSubmitting && actionType === 'approve' ? (
                                <>
                                  <Loader2 className="w-4 h-4 animate-spin" /> Processing...
                                </>
                              ) : (
                                <>
                                  <ThumbsUp className="w-4 h-4" /> Approve Level {activeApproval.level}
                                </>
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleReject(activeApproval.id)}
                              disabled={isSubmitting || !remarks.trim()}
                              className="flex-1 h-11 border border-red-500 bg-red-500/5 hover:bg-red-500/10 text-red-500 font-bold text-sm rounded-lg flex items-center justify-center gap-2 transition-all duration-200 transform active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
                            >
                              {isSubmitting && actionType === 'reject' ? (
                                <>
                                  <Loader2 className="w-4 h-4 animate-spin" /> Processing...
                                </>
                              ) : (
                                <>
                                  <ThumbsDown className="w-4 h-4" /> Reject & Return
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 rounded-lg bg-white/[0.02] border border-white/5 text-xs text-text-secondary flex gap-2.5 items-start">
                          <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                          <div className="space-y-1">
                            <span className="font-semibold text-text-primary block">Awaiting Approver Context</span>
                            <span>
                              You are logged in as <span className="text-text-primary font-medium">{user?.first_name} {user?.last_name}</span>. 
                              Only the designated approver <span className="text-text-primary font-semibold">{activeApproval.approver_name}</span> ({activeApproval.approver_role}) or an Administrator can action this approval level.
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                </div>

                {/* Right Side: Quotation Summary Card */}
                <div className="lg:col-span-4 space-y-4">
                  <div className="glass-card rounded-xl border border-white/5 p-6 space-y-4">
                    <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider pb-2 border-b border-subtle">
                      Quotation Summary
                    </h3>

                    {quotation ? (
                      <div className="space-y-4 text-sm">
                        <div>
                          <span className="text-xs text-text-secondary uppercase font-semibold block">Vendor Profile</span>
                          <span className="text-sm font-bold text-text-primary block mt-0.5">{quotation.vendor.name}</span>
                          <span className="text-xs text-text-secondary font-mono">Rating: {parseFloat(quotation.vendor.rating).toFixed(1)} / 5 ★</span>
                        </div>

                        <div>
                          <span className="text-xs text-text-secondary uppercase font-semibold block">Proposed Delivery</span>
                          <span className="text-sm font-bold text-text-primary block mt-0.5">
                            {quotation.delivery_days ? `${quotation.delivery_days} days` : 'Not specified'}
                          </span>
                        </div>

                        <div>
                          <span className="text-xs text-text-secondary uppercase font-semibold block">Proposed Pricing</span>
                          <div className="mt-1 space-y-1.5 font-mono text-xs">
                            <div className="flex justify-between">
                              <span className="text-text-secondary">Subtotal</span>
                              <span className="text-text-primary">{formatCurrency(quotation.subtotal)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-text-secondary">GST ({parseFloat(quotation.gst_percentage).toFixed(0)}%)</span>
                              <span className="text-text-primary">{formatCurrency(quotation.gst_amount)}</span>
                            </div>
                            <div className="flex justify-between border-t border-subtle/50 pt-2 text-sm font-bold">
                              <span className="text-text-primary font-semibold">Grand Total</span>
                              <span className="text-brand-green font-black">{formatCurrency(quotation.grand_total)}</span>
                            </div>
                          </div>
                        </div>

                        {quotation.payment_terms && (
                          <div>
                            <span className="text-xs text-text-secondary uppercase font-semibold block">Payment Terms</span>
                            <span className="text-xs text-text-primary block mt-1 leading-relaxed italic">
                              "{quotation.payment_terms}"
                            </span>
                          </div>
                        )}

                        {quotation.notes && (
                          <div>
                            <span className="text-xs text-text-secondary uppercase font-semibold block">Proposal Notes</span>
                            <span className="text-xs text-text-primary block mt-1 leading-relaxed italic">
                              "{quotation.notes}"
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="animate-pulse space-y-4">
                        <div className="h-4 bg-white/5 rounded w-1/3"></div>
                        <div className="h-10 bg-white/5 rounded w-full"></div>
                        <div className="h-4 bg-white/5 rounded w-1/2"></div>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </>
          )}

        </div>
      ) : (
        
        /* 2. SUMMARY LIST VIEW */
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-text-primary">Approvals Workflow</h1>
              <p className="text-text-secondary text-sm mt-1">Review and manage RFQ selection approval records</p>
            </div>
          </div>

          {/* Filter tabs */}
          <div className="flex border-b border-subtle gap-4">
            <button
              onClick={() => setListFilter('pending')}
              className={`py-3 px-1 text-sm font-semibold border-b-2 transition-all relative ${
                listFilter === 'pending'
                  ? 'border-brand-green text-brand-green'
                  : 'border-transparent text-text-secondary hover:text-white'
              }`}
            >
              Pending Reviews
              {approvalsList.length > 0 && listFilter === 'pending' && (
                <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-green/20 text-brand-green border border-brand-green/30">
                  {approvalsList.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setListFilter('all')}
              className={`py-3 px-1 text-sm font-semibold border-b-2 transition-all ${
                listFilter === 'all'
                  ? 'border-brand-green text-brand-green'
                  : 'border-transparent text-text-secondary hover:text-white'
              }`}
            >
              All Approvals
            </button>
            <button
              onClick={() => setListFilter('actioned')}
              className={`py-3 px-1 text-sm font-semibold border-b-2 transition-all ${
                listFilter === 'actioned'
                  ? 'border-brand-green text-brand-green'
                  : 'border-transparent text-text-secondary hover:text-white'
              }`}
            >
              Actioned / Decided
            </button>
          </div>

          {loadingList ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse bg-white/5 rounded-xl border border-white/5 h-36"></div>
              ))}
            </div>
          ) : approvalsList.length === 0 ? (
            <div className="glass-card rounded-xl border border-white/5 p-12 text-center max-w-xl mx-auto">
              <Clock className="w-12 h-12 text-text-secondary mx-auto mb-4" />
              <h2 className="text-base font-bold text-text-primary mb-1">No approvals found</h2>
              <p className="text-xs text-text-secondary">
                {listFilter === 'pending' 
                  ? 'There are no active approvals waiting for review decision.'
                  : 'No matching approvals records found.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {approvalsList.map(item => {
                const isApproved = item.status === 'approved';
                const isRejected = item.status === 'rejected';
                
                let borderClass = 'border-l-4 border-l-amber-500';
                let badgeStyle = 'bg-amber-500/10 text-amber-500 border-amber-500/20';
                
                if (isApproved) {
                  borderClass = 'border-l-4 border-l-brand-green';
                  badgeStyle = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
                } else if (isRejected) {
                  borderClass = 'border-l-4 border-l-red-500';
                  badgeStyle = 'bg-red-500/10 text-red-400 border-red-500/20';
                }

                return (
                  <div
                    key={item.id}
                    onClick={() => navigate(`/approvals?quotation_id=${item.quotation_id}`)}
                    className={`glass-card rounded-xl p-5 border border-white/5 hover:border-brand-green/30 hover:shadow-card cursor-pointer transition-all duration-200 flex flex-col justify-between ${borderClass} relative group`}
                  >
                    <div className="space-y-2.5">
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] text-text-secondary font-mono uppercase tracking-tight bg-white/5 px-2 py-0.5 rounded">
                          Level {item.level} Reviewer: {item.approver_name}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border capitalize ${badgeStyle}`}>
                          {item.status}
                        </span>
                      </div>

                      <div>
                        <h4 className="text-sm font-bold text-text-primary group-hover:text-brand-green transition-colors leading-snug">
                          {item.rfq_number}: {item.rfq_title}
                        </h4>
                        <p className="text-xs text-text-secondary mt-1">Vendor Bidder: {item.vendor_name}</p>
                      </div>
                    </div>

                    <div className="border-t border-subtle/50 mt-4 pt-3 flex justify-between items-center">
                      <div>
                        <span className="text-[10px] text-text-secondary uppercase font-semibold">Total Price Bid</span>
                        <span className="block font-mono font-bold text-text-primary text-sm mt-0.5">{formatCurrency(item.quotation_total)}</span>
                      </div>
                      
                      <span className="text-xs font-semibold text-brand-green group-hover:translate-x-1 transition-transform inline-flex items-center gap-0.5">
                        Review chain <ChevronRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

    </MainLayout>
  );
}
