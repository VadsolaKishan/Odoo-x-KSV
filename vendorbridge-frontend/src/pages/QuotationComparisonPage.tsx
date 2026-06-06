import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Check, 
  Star, 
  AlertCircle, 
  Info,
  Building2,
  Loader2,
  ThumbsUp
} from 'lucide-react';
import MainLayout from '../components/Layout/MainLayout';
import api from '../lib/axios';
import toast from 'react-hot-toast';

interface CompareVendor {
  id: string;
  name: string;
  rating: string | number;
}

interface CompareQuotation {
  id: string;
  vendor: CompareVendor;
  grand_total: number;
  gst_percentage: number;
  delivery_days: number | null;
  payment_terms: string | null;
  notes: string | null;
  is_lowest: boolean;
}

interface RFQInfo {
  id: string;
  rfq_number: string;
  title: string;
  category: string;
  deadline: string;
  status: string;
}

interface ComparisonData {
  rfq: RFQInfo;
  quotations: CompareQuotation[];
}

export default function QuotationComparisonPage() {
  const { rfq_id: rfqId } = useParams<{ rfq_id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ComparisonData | null>(null);
  const [selectingId, setSelectingId] = useState<string | null>(null);

  // Load comparison data
  useEffect(() => {
    async function fetchComparison() {
      if (!rfqId) return;
      setLoading(true);
      try {
        const res = await api.get(`/quotations/compare/${rfqId}`);
        if (res.data && res.data.success) {
          setData(res.data.data);
        }
      } catch (err: any) {
        console.error('Failed to fetch quotation comparison details', err);
        toast.error('Failed to load comparison data. Check if there are submitted quotations.');
      } finally {
        setLoading(false);
      }
    }
    fetchComparison();
  }, [rfqId]);

  // Handle selection action
  const handleSelectQuotation = async (quotationId: string) => {
    setSelectingId(quotationId);
    try {
      const res = await api.patch(`/quotations/${quotationId}/select`);
      if (res.data && res.data.success) {
        toast.success('Vendor selected! Approval workflow initiated.');
        navigate('/approvals');
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to select vendor quotation');
    } finally {
      setSelectingId(null);
    }
  };

  // Star rating rendering helper
  const renderStars = (rating: string | number) => {
    const numericRating = parseFloat(rating as string) || 0;
    const fullStars = Math.floor(numericRating);
    const halfStar = numericRating % 1 >= 0.5;
    
    return (
      <div className="flex items-center gap-0.5 justify-center">
        {[...Array(5)].map((_, i) => {
          if (i < fullStars) {
            return <Star key={i} className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />;
          } else if (i === fullStars && halfStar) {
            return (
              <span key={i} className="relative inline-block text-amber-500">
                <Star className="w-3.5 h-3.5 text-gray-600" />
                <span className="absolute top-0 left-0 w-1/2 overflow-hidden">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                </span>
              </span>
            );
          } else {
            return <Star key={i} className="w-3.5 h-3.5 text-gray-600" />;
          }
        })}
        <span className="text-xs text-text-secondary ml-1 font-mono">{numericRating.toFixed(1)}</span>
      </div>
    );
  };

  // Currency helper
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <MainLayout>
      {/* Page Header */}
      <div className="mb-8">
        <Link 
          to="/rfqs" 
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-secondary hover:text-brand-green transition-colors uppercase tracking-wider mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Back to RFQ's List
        </Link>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Quotation Comparison</h1>
        
        {data && (
          <p className="text-text-secondary text-sm mt-1">
            RFQ: <span className="text-white font-semibold">{data.rfq.rfq_number} — {data.rfq.title}</span> &bull; {data.quotations.length} {data.quotations.length === 1 ? 'quotation' : 'quotations'} received
          </p>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-brand-green animate-spin mb-4" />
          <p className="text-sm text-text-secondary">Comparing quotation proposals...</p>
        </div>
      ) : !data || data.quotations.length === 0 ? (
        <div className="glass-card rounded-xl border border-white/5 p-8 text-center max-w-2xl">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-white mb-2">No Submitted Quotations</h2>
          <p className="text-sm text-text-secondary mb-6">
            There are no submitted quotations yet for this RFQ, so comparison is not possible. Bidders must submit their proposals first.
          </p>
          <Link to="/rfqs" className="bg-white/5 border border-white/10 hover:bg-white/10 px-5 py-2.5 rounded-lg text-sm font-semibold inline-block transition-colors">
            Back to RFQ's List
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Main Transposed Comparison Grid Card */}
          <div className="glass-card rounded-xl border border-white/5 p-6 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-center border-collapse min-w-[700px] rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-surface-elevated/40 border-b border-subtle">
                    {/* Corner criteria header */}
                    <th className="py-4 px-6 text-left text-xs font-bold text-text-secondary uppercase tracking-wider w-56 border-r border-subtle">
                      Criteria
                    </th>
                    
                    {/* Quotation Columns Headers */}
                    {data.quotations.map(q => (
                      <th 
                        key={q.id} 
                        className={`py-4 px-6 text-center text-sm font-bold transition-colors relative ${
                          q.is_lowest 
                            ? 'bg-brand-green/10 text-white border-l-2 border-r-2 border-t-2 border-brand-green/60' 
                            : 'text-text-primary border-r border-subtle'
                        }`}
                      >
                        {q.is_lowest && (
                          <div className="absolute top-0 left-0 right-0 h-1.5 bg-brand-green shadow-glow"></div>
                        )}
                        <div className="flex flex-col items-center justify-center gap-1">
                          <Building2 className={`w-5 h-5 ${q.is_lowest ? 'text-brand-green drop-shadow-[0_0_6px_rgba(16,185,129,0.6)]' : 'text-text-secondary'}`} />
                          <span className="truncate max-w-[180px]">{q.vendor.name}</span>
                          {q.is_lowest && (
                            <span className="text-[10px] bg-brand-green/30 text-brand-green px-2 py-0.5 rounded-full font-semibold border border-brand-green/60 tracking-wide uppercase inline-flex items-center gap-1">
                              <ThumbsUp className="w-2.5 h-2.5" /> Lowest
                            </span>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-subtle/40">
                  {/* Row 1: Grand Total */}
                  <tr className="hover:bg-white/[0.005] transition-colors">
                    <td className="py-4 px-6 text-left font-bold text-xs uppercase tracking-wider text-text-secondary border-r border-subtle">
                      Grand Total
                    </td>
                    {data.quotations.map(q => (
                      <td 
                        key={q.id} 
                        className={`py-4 px-6 font-mono font-bold text-base ${
                          q.is_lowest 
                            ? 'bg-brand-green/10 text-brand-green border-l-2 border-r-2 border-brand-green/60' 
                            : 'text-text-primary border-r border-subtle'
                        }`}
                      >
                        <span className={q.is_lowest ? 'text-brand-green font-black drop-shadow-[0_0_12px_rgba(16,185,129,0.5)]' : ''}>
                          {formatCurrency(q.grand_total)}
                        </span>
                      </td>
                    ))}
                  </tr>

                  {/* Row 2: GST % */}
                  <tr className="hover:bg-white/[0.005] transition-colors">
                    <td className="py-4 px-6 text-left font-bold text-xs uppercase tracking-wider text-text-secondary border-r border-subtle">
                      Tax / GST %
                    </td>
                    {data.quotations.map(q => (
                      <td 
                        key={q.id} 
                        className={`py-4 px-6 text-sm font-mono ${
                          q.is_lowest 
                            ? 'bg-brand-green/10 text-text-primary border-l-2 border-r-2 border-brand-green/60' 
                            : 'text-text-primary border-r border-subtle'
                        }`}
                      >
                        {parseFloat(q.gst_percentage as any).toFixed(0)}%
                      </td>
                    ))}
                  </tr>

                  {/* Row 3: Delivery Days */}
                  <tr className="hover:bg-white/[0.005] transition-colors">
                    <td className="py-4 px-6 text-left font-bold text-xs uppercase tracking-wider text-text-secondary border-r border-subtle">
                      Delivery Days
                    </td>
                    {data.quotations.map(q => (
                      <td 
                        key={q.id} 
                        className={`py-4 px-6 text-sm font-medium ${
                          q.is_lowest 
                            ? 'bg-brand-green/10 text-text-primary border-l-2 border-r-2 border-brand-green/60' 
                            : 'text-text-primary border-r border-subtle'
                        }`}
                      >
                        {q.delivery_days ? `${q.delivery_days} days` : <span className="text-text-secondary italic">Not specified</span>}
                      </td>
                    ))}
                  </tr>

                  {/* Row 4: Vendor Rating */}
                  <tr className="hover:bg-white/[0.005] transition-colors">
                    <td className="py-4 px-6 text-left font-bold text-xs uppercase tracking-wider text-text-secondary border-r border-subtle">
                      Vendor Rating
                    </td>
                    {data.quotations.map(q => (
                      <td 
                        key={q.id} 
                        className={`py-4 px-6 ${
                          q.is_lowest 
                            ? 'bg-brand-green/10 border-l-2 border-r-2 border-brand-green/60' 
                            : 'border-r border-subtle'
                        }`}
                      >
                        {renderStars(q.vendor.rating)}
                      </td>
                    ))}
                  </tr>

                  {/* Row 5: Payment Terms */}
                  <tr className="hover:bg-white/[0.005] transition-colors">
                    <td className="py-4 px-6 text-left font-bold text-xs uppercase tracking-wider text-text-secondary border-r border-subtle">
                      Payment Terms
                    </td>
                    {data.quotations.map(q => (
                      <td 
                        key={q.id} 
                        className={`py-4 px-6 text-xs text-text-secondary max-w-[200px] truncate ${
                          q.is_lowest 
                            ? 'bg-brand-green/10 border-l-2 border-r-2 border-brand-green/60' 
                            : 'border-r border-subtle'
                        }`}
                        title={q.payment_terms || ''}
                      >
                        {q.payment_terms || <span className="italic">Standard terms</span>}
                      </td>
                    ))}
                  </tr>

                  {/* Row 6: Selection Actions */}
                  <tr>
                    <td className="py-6 px-6 text-left font-bold text-xs uppercase tracking-wider text-text-secondary border-r border-subtle">
                      Actions
                    </td>
                    {data.quotations.map(q => (
                      <td 
                        key={q.id} 
                        className={`py-6 px-6 ${
                          q.is_lowest 
                            ? 'bg-brand-green/10 border-l-2 border-r-2 border-b-2 border-brand-green/60' 
                            : 'border-r border-subtle'
                        }`}
                      >
                        <button
                          type="button"
                          disabled={selectingId !== null}
                          onClick={() => handleSelectQuotation(q.id)}
                          className={`w-full py-2.5 px-4 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none ${
                            q.is_lowest
                              ? 'bg-brand-green hover:bg-brand-green-dark text-white shadow-glow hover:shadow-[0_0_20px_rgba(16,185,129,0.5)]'
                              : 'bg-white/5 hover:bg-white/10 text-white border border-white/15'
                          }`}
                        >
                          {selectingId === q.id ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Selecting...
                            </>
                          ) : q.is_lowest ? (
                            <>
                              <Check className="w-3.5 h-3.5" /> Select & Approve
                            </>
                          ) : (
                            'Select'
                          )}
                        </button>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Info Banner at Bottom */}
          <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs flex items-center gap-2 max-w-3xl">
            <Info className="w-4 h-4 flex-shrink-0" />
            <span>Green = lowest price. Selecting a vendor quotation sets its status to selected, rejects others, and initiates the approval chain workflow automatically.</span>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
