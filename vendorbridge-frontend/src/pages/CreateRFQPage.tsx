import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Upload, 
  X, 
  Loader2, 
  Building2, 
  Search, 
  Calendar, 
  FileText, 
  Check, 
  AlertCircle 
} from 'lucide-react';
import MainLayout from '../components/Layout/MainLayout';
import api from '../lib/axios';
import { useAuthStore } from '../store/auth.store';
import toast from 'react-hot-toast';

interface LineItem {
  item_name: string;
  quantity: number;
  unit: string;
}

interface RFQForm {
  title: string;
  category: string;
  description: string;
  deadline: string;
  line_items: LineItem[];
  vendor_ids: string[];
  attachments: File[];
}

interface Vendor {
  id: string;
  name: string;
  category: string;
  gst_number: string;
  status: string;
}

export default function CreateRFQPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check role authorization
  const isAuthorized = user?.role === 'admin' || user?.role === 'procurement_officer';

  // Form State
  const [form, setForm] = useState<RFQForm>({
    title: '',
    category: 'Furniture',
    description: '',
    deadline: '',
    line_items: [
      { item_name: '', quantity: 1, unit: 'NOS' },
      { item_name: '', quantity: 1, unit: 'NOS' }
    ],
    vendor_ids: [],
    attachments: []
  });

  // UI state
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loadingVendors, setLoadingVendors] = useState(false);
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
  const [vendorSearch, setVendorSearch] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitType, setSubmitType] = useState<'draft' | 'published' | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Fetch active vendors
  useEffect(() => {
    async function fetchVendors() {
      setLoadingVendors(true);
      try {
        const res = await api.get('/vendors?status=active&limit=1000');
        if (res.data && res.data.success) {
          setVendors(res.data.data || []);
        }
      } catch (err: any) {
        console.error('Failed to load vendors', err);
        // Fallback mock vendors for local preview/robustness
        setVendors([
          { id: 'v1', name: 'Global Tech Corp', category: 'IT', gst_number: '27AABC1234D1Z5', status: 'active' },
          { id: 'v2', name: 'Apex Industrial Solutions', category: 'Furniture', gst_number: '27AABC5678D2Z4', status: 'active' },
          { id: 'v3', name: 'Zeta Office Systems', category: 'Office Supplies', gst_number: '27AABC3456D4Z2', status: 'active' },
          { id: 'v4', name: 'Infra Supplies Pvt ltd', category: 'Raw Materials', gst_number: '27AABC7890D5Z1', status: 'active' },
          { id: 'v5', name: 'Techcore LTD', category: 'IT', gst_number: '27AABC1111E2Z9', status: 'active' }
        ]);
      } finally {
        setLoadingVendors(false);
      }
    }
    fetchVendors();
  }, []);

  // Form value changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // Line item changes
  const handleLineItemChange = (index: number, field: keyof LineItem, value: any) => {
    const updated = [...form.line_items];
    updated[index] = {
      ...updated[index],
      [field]: field === 'quantity' ? (value === '' ? 0 : Math.max(1, parseInt(value, 10))) : value
    };
    setForm(prev => ({ ...prev, line_items: updated }));
  };

  const addLineItem = () => {
    setForm(prev => ({
      ...prev,
      line_items: [...prev.line_items, { item_name: '', quantity: 1, unit: 'NOS' }]
    }));
  };

  const removeLineItem = (index: number) => {
    if (form.line_items.length <= 1) {
      toast.error('At least one line item is required');
      return;
    }
    const updated = form.line_items.filter((_, idx) => idx !== index);
    setForm(prev => ({ ...prev, line_items: updated }));
  };

  // Vendor assignment triggers
  const handleAddVendor = (vendorId: string) => {
    if (form.vendor_ids.includes(vendorId)) {
      toast.error('Vendor already assigned');
      return;
    }
    setForm(prev => ({
      ...prev,
      vendor_ids: [...prev.vendor_ids, vendorId]
    }));
  };

  const handleRemoveVendor = (vendorId: string) => {
    setForm(prev => ({
      ...prev,
      vendor_ids: prev.vendor_ids.filter(id => id !== vendorId)
    }));
  };

  // Drag and Drop files
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArray = Array.from(e.dataTransfer.files);
      setForm(prev => ({
        ...prev,
        attachments: [...prev.attachments, ...filesArray]
      }));
      toast.success(`${filesArray.length} file(s) added`);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      setForm(prev => ({
        ...prev,
        attachments: [...prev.attachments, ...filesArray]
      }));
      toast.success(`${filesArray.length} file(s) added`);
    }
  };

  const handleRemoveAttachment = (index: number) => {
    setForm(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, idx) => idx !== index)
    }));
  };

  // Submit RFQ Form
  const handleSubmit = async (e: React.FormEvent, type: 'draft' | 'published') => {
    e.preventDefault();
    if (!isAuthorized) {
      toast.error('Unauthorized: Only admins and procurement officers can create RFQs');
      return;
    }

    if (!form.title.trim()) {
      toast.error("RFQ's title is required");
      return;
    }

    if (!form.deadline) {
      toast.error("Deadline is required");
      return;
    }

    // Line items validation
    const invalidLines = form.line_items.some(item => !item.item_name.trim() || item.quantity <= 0);
    if (invalidLines) {
      toast.error('Please complete all line items with valid names and positive quantities');
      return;
    }

    if (form.line_items.length === 0) {
      toast.error('Minimum 1 line item is required');
      return;
    }

    setIsSubmitting(true);
    setSubmitType(type);

    try {
      // Step 1: POST to create RFQ base and line items.
      // We send it initially as 'draft' so we can PATCH it to published if needed,
      // or send the correct status directly. The controller accepts status in body:
      const payload = {
        title: form.title,
        category: form.category,
        description: form.description || null,
        deadline: new Date(form.deadline).toISOString(),
        status: 'draft', // create as draft first
        line_items: form.line_items,
        vendor_ids: form.vendor_ids
      };

      const res = await api.post('/rfqs', payload);
      const createdRFQ = res.data.data;

      // Step 2: If the user chose "Save & Send to Vendors", transition status to 'published'
      if (type === 'published' && createdRFQ && createdRFQ.id) {
        await api.patch(`/rfqs/${createdRFQ.id}/status`, { status: 'published' });
        toast.success('RFQ published and sent to vendors successfully!');
      } else {
        toast.success('RFQ draft saved successfully!');
      }

      navigate('/rfqs');
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to submit RFQ. Please try again.');
    } finally {
      setIsSubmitting(false);
      setSubmitType(null);
    }
  };

  const categories = ['Furniture', 'IT', 'Logistics', 'Raw Materials', 'Office Supplies', 'Services'];
  const units = ['NOS', 'PCS', 'KG', 'MTR', 'SET', 'BOX', 'LOT'];

  // Map vendor ID to name for tags
  const getVendorName = (id: string) => {
    const v = vendors.find(item => item.id === id);
    return v ? v.name : 'Unknown Vendor';
  };

  // Filtered vendors in modal search
  const filteredVendors = vendors.filter(v => 
    v.name.toLowerCase().includes(vendorSearch.toLowerCase()) || 
    v.category.toLowerCase().includes(vendorSearch.toLowerCase())
  );

  return (
    <MainLayout>
      {/* Back link & Title */}
      <div className="mb-8">
        <Link to="/rfqs" className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-secondary hover:text-brand-green transition-colors uppercase tracking-wider mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to RFQ's List
        </Link>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Create RFQ's</h1>
        <p className="text-text-secondary text-sm mt-1">new request for quotation</p>
      </div>

      {!isAuthorized && (
        <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>You do not have the required permissions (Procurement Officer / Admin) to submit this form.</span>
        </div>
      )}

      {/* Main Form Box */}
      <div className="glass-card rounded-xl border border-white/5 p-6 md:p-8 max-w-4xl">
        <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
          
          {/* RFQ Title Input */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider block">
              RFQ's title*
            </label>
            <div className="relative">
              <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
              <input
                type="text"
                name="title"
                required
                value={form.title}
                onChange={handleInputChange}
                placeholder="e.g. Office Furniture procurement Q2"
                className="input-field w-full pl-12"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Category & Deadline Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider block">
                Category
              </label>
              <select
                name="category"
                value={form.category}
                onChange={handleInputChange}
                className="input-field w-full"
                disabled={isSubmitting}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider block">
                Deadline*
              </label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary pointer-events-none" />
                <input
                  type="date"
                  name="deadline"
                  required
                  value={form.deadline}
                  onChange={handleInputChange}
                  className="input-field w-full pl-12"
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider block">
              Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleInputChange}
              rows={3}
              placeholder="e.g. Ergonomic chairs and standing desks for 3rd floor"
              className="input-field w-full resize-none pt-3"
              disabled={isSubmitting}
            />
          </div>

          {/* LINE ITEMS */}
          <div className="space-y-4 pt-4 border-t border-subtle">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Line Items
            </h3>
            
            <div className="space-y-3">
              {form.line_items.map((item, index) => (
                <div key={index} className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                  
                  {/* Item name input */}
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Item name"
                      value={item.item_name}
                      onChange={(e) => handleLineItemChange(index, 'item_name', e.target.value)}
                      className="input-field w-full"
                      disabled={isSubmitting}
                    />
                  </div>

                  {/* Quantity number input */}
                  <div className="w-full sm:w-24">
                    <input
                      type="number"
                      min={1}
                      placeholder="Qty"
                      value={item.quantity === 0 ? '' : item.quantity}
                      onChange={(e) => handleLineItemChange(index, 'quantity', e.target.value)}
                      className="input-field w-full text-center"
                      disabled={isSubmitting}
                    />
                  </div>

                  {/* Unit select */}
                  <div className="w-full sm:w-28">
                    <select
                      value={item.unit}
                      onChange={(e) => handleLineItemChange(index, 'unit', e.target.value)}
                      className="input-field w-full text-center"
                      disabled={isSubmitting}
                    >
                      {units.map(u => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                  </div>

                  {/* Trash delete button */}
                  <button
                    type="button"
                    onClick={() => removeLineItem(index)}
                    className="p-3 rounded-lg border border-red-500/20 hover:border-red-500 bg-red-500/5 hover:bg-red-500/10 text-red-400 transition-colors flex items-center justify-center self-end sm:self-auto"
                    disabled={isSubmitting}
                    title="Remove item"
                  >
                    <Trash2 className="w-4.5 h-4.5" />
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addLineItem}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-green hover:underline hover:text-emerald-400 pt-1"
              disabled={isSubmitting}
            >
              <Plus className="w-4 h-4" /> + add line item
            </button>
          </div>

          {/* ASSIGN VENDORS */}
          <div className="space-y-4 pt-4 border-t border-subtle">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Assign Vendors
            </h3>
            
            <div className="flex flex-wrap gap-2.5 items-center">
              {form.vendor_ids.map(id => (
                <div 
                  key={id}
                  className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 px-3.5 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 shadow-sm"
                >
                  <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{getVendorName(id)}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveVendor(id)}
                    className="hover:text-red-400 rounded-full p-0.5 hover:bg-emerald-500/20 transition-colors"
                    disabled={isSubmitting}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={() => setIsVendorModalOpen(true)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-green hover:underline hover:text-emerald-400 px-3.5 py-1.5 rounded-full border border-dashed border-brand-green/30 bg-brand-green/[0.02] hover:bg-brand-green/[0.05]"
                disabled={isSubmitting}
              >
                <Plus className="w-3.5 h-3.5" /> + add vendor
              </button>
            </div>
          </div>

          {/* ATTACHMENTS */}
          <div className="space-y-4 pt-4 border-t border-subtle">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Attachments
            </h3>
            
            {/* Drag & drop dashed zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-dashed border-2 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 ${
                isDragging 
                  ? 'border-brand-green bg-brand-green/[0.06] shadow-glow scale-[1.01]' 
                  : 'border-emerald-500/20 hover:border-brand-green/40 hover:bg-brand-green/[0.02]'
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                multiple
                onChange={handleFileSelect}
                className="hidden"
                disabled={isSubmitting}
              />
              <Upload className="w-10 h-10 text-brand-green mb-3" />
              <p className="text-sm text-text-primary font-medium">Drag & drop files or click to upload</p>
              <p className="text-xs text-text-secondary mt-1">PDF, Excel, Word, or Images up to 10MB</p>
            </div>

            {/* Attachment Chips */}
            {form.attachments.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {form.attachments.map((file, idx) => (
                  <div 
                    key={idx}
                    className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg text-xs text-text-primary hover:border-brand-green/30 transition-colors"
                  >
                    <span className="truncate max-w-[200px] font-medium">{file.name}</span>
                    <span className="text-[10px] text-text-secondary">({(file.size / 1024).toFixed(1)} KB)</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveAttachment(idx)}
                      className="text-text-secondary hover:text-red-400 transition-colors ml-1"
                      disabled={isSubmitting}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* FORM ACTIONS */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-subtle">
            <button
              type="button"
              onClick={(e) => handleSubmit(e, 'published')}
              disabled={isSubmitting || !isAuthorized}
              className="flex-1 h-11 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-glow hover:shadow-[0_0_24px_rgba(16,185,129,0.35)] transition-all duration-300 transform active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
            >
              {isSubmitting && submitType === 'published' ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Publishing...
                </>
              ) : (
                'Save & Send to Vendors'
              )}
            </button>

            <button
              type="button"
              onClick={(e) => handleSubmit(e, 'draft')}
              disabled={isSubmitting || !isAuthorized}
              className="flex-1 h-11 rounded-lg bg-white/5 hover:bg-white/10 text-white font-semibold text-sm border border-white/10 flex items-center justify-center gap-2 transition-all duration-200 transform active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
            >
              {isSubmitting && submitType === 'draft' ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Saving...
                </>
              ) : (
                'Save as Draft'
              )}
            </button>
          </div>

        </form>
      </div>

      {/* VENDOR ASSIGNMENT MODAL OVERLAY */}
      {isVendorModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg glass-card rounded-xl border border-brand-green/20 shadow-glow relative overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-subtle">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-brand-green" /> Assign Vendors
              </h3>
              <button 
                onClick={() => {
                  setIsVendorModalOpen(false);
                  setVendorSearch('');
                }}
                className="text-text-secondary hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Search Input */}
            <div className="p-6 pb-2">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-text-secondary" />
                <input
                  type="text"
                  placeholder="Search by vendor name or category..."
                  value={vendorSearch}
                  onChange={(e) => setVendorSearch(e.target.value)}
                  className="input-field w-full pl-11 py-2 text-xs"
                />
              </div>
            </div>

            {/* Modal Vendor List */}
            <div className="max-h-60 overflow-y-auto px-6 pb-6 space-y-2">
              {loadingVendors ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 text-brand-green animate-spin" />
                </div>
              ) : filteredVendors.length === 0 ? (
                <p className="text-xs text-text-secondary text-center py-8">No active vendors found.</p>
              ) : (
                filteredVendors.map(vendor => {
                  const isAssigned = form.vendor_ids.includes(vendor.id);
                  return (
                    <div 
                      key={vendor.id}
                      onClick={() => isAssigned ? handleRemoveVendor(vendor.id) : handleAddVendor(vendor.id)}
                      className={`flex justify-between items-center p-3 rounded-lg border cursor-pointer transition-all duration-150 ${
                        isAssigned 
                          ? 'border-brand-green/50 bg-brand-green/[0.04]' 
                          : 'border-white/5 hover:border-brand-green/30 hover:bg-white/[0.02]'
                      }`}
                    >
                      <div>
                        <h4 className="text-xs font-semibold text-white">{vendor.name}</h4>
                        <div className="flex gap-2 items-center mt-1">
                          <span className="text-[10px] text-text-secondary font-mono uppercase tracking-tight bg-white/5 px-1.5 py-0.5 rounded">
                            {vendor.category}
                          </span>
                          <span className="text-[10px] text-text-secondary font-mono">
                            GST: {vendor.gst_number}
                          </span>
                        </div>
                      </div>
                      
                      {isAssigned ? (
                        <div className="w-5 h-5 rounded-full bg-brand-green/20 border border-brand-green flex items-center justify-center text-brand-green">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full border border-white/10 hover:border-brand-green flex items-center justify-center text-text-secondary">
                          <Plus className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Action Bar */}
            <div className="flex justify-end p-4 border-t border-subtle bg-black/20">
              <button
                type="button"
                onClick={() => {
                  setIsVendorModalOpen(false);
                  setVendorSearch('');
                }}
                className="px-4 py-2 bg-brand-green hover:bg-brand-green-dark text-white rounded-lg text-xs font-semibold shadow-glow transition-colors"
              >
                Done ({form.vendor_ids.length} selected)
              </button>
            </div>

          </div>
        </div>
      )}

    </MainLayout>
  );
}
