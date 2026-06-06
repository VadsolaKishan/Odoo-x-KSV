import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Building, Calendar, CheckSquare, ListPlus, Plus, Send, Sparkles, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { FormInput } from '../components/FormInput';
import { StepForm } from '../components/StepForm';

const blankForm = () => ({
  title: '',
  description: '',
  deadline: '',
  items: [{ name: '', quantity: 1, hsnCode: '84713010' }],
  assignedVendors: [],
});

export const RfqCreate = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { vendors, rfqs, createRfq, addToast } = useApp();

  const steps = ['Basic Details', 'Item Catalog', 'Select Vendors', 'Review & Send'];
  const [currentStep, setCurrentStep] = useState(1);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [items, setItems] = useState(blankForm().items);
  const [assignedVendors, setAssignedVendors] = useState([]);
  const [errors, setErrors] = useState({});

  const resetForm = () => {
    const form = blankForm();
    setCurrentStep(1);
    setTitle(form.title);
    setDescription(form.description);
    setDeadline(form.deadline);
    setItems(form.items);
    setAssignedVendors(form.assignedVendors);
    setErrors({});
  };

  const applyReorderPrefill = (sourceRfq) => {
    setCurrentStep(1);
    setTitle(`Copy of ${sourceRfq.title}`);
    setDescription(sourceRfq.description || '');
    if (sourceRfq.deadline && sourceRfq.deadline.includes('/')) {
      setDeadline(sourceRfq.deadline.split('/').reverse().join('-'));
    } else {
      setDeadline(new Date(Date.now() + 86400000 * 14).toISOString().split('T')[0]);
    }
    setItems((sourceRfq.items || []).map((item) => ({ name: item.name, quantity: item.quantity, hsnCode: item.hsnCode || '84713010' })));
    setAssignedVendors(sourceRfq.assignedVendors || []);
    setErrors({});
    addToast(`Prefilled details from previous RFQ: ${sourceRfq.id}`, 'success');
  };

  useEffect(() => {
    const reorderId = searchParams.get('reorderId');
    if (!reorderId) {
      resetForm();
      return;
    }

    const sourceRfq = rfqs.find((rfq) => rfq.id === reorderId);
    if (sourceRfq) {
      applyReorderPrefill(sourceRfq);
    }
  }, [location.key]);

  useEffect(() => {
    const reorderId = searchParams.get('reorderId');
    if (!reorderId) return;

    const sourceRfq = rfqs.find((rfq) => rfq.id === reorderId);
    if (sourceRfq) {
      applyReorderPrefill(sourceRfq);
    }
  }, [rfqs, searchParams]);

  const validateStep = () => {
    const nextErrors = {};

    if (currentStep === 1) {
      if (!title.trim()) nextErrors.title = 'RFQ Title is required.';
      if (!description.trim()) nextErrors.description = 'Description is required.';
      if (!deadline) {
        nextErrors.deadline = 'Submission deadline date is required.';
      } else if (new Date(deadline) < new Date().setHours(0, 0, 0, 0)) {
        nextErrors.deadline = 'Deadline must be a future date.';
      }
    }

    if (currentStep === 2) {
      const invalid = items.some((item) => !item.name.trim() || item.quantity <= 0);
      if (invalid) {
        addToast('All items must have a description and positive quantity.', 'danger');
        return false;
      }
    }

    if (currentStep === 3 && assignedVendors.length === 0) {
      addToast('Please assign at least one vendor to participate.', 'danger');
      return false;
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handleAddItem = () => {
    setItems((prev) => [...prev, { name: '', quantity: 1, hsnCode: '84713010' }]);
  };

  const handleRemoveItem = (index) => {
    if (items.length === 1) {
      addToast('RFQs must catalog at least one product item.', 'warning');
      return;
    }
    setItems((prev) => prev.filter((_, itemIndex) => itemIndex !== index));
  };

  const handleItemChange = (index, field, value) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleToggleVendor = (vendorId) => {
    setAssignedVendors((prev) => (prev.includes(vendorId) ? prev.filter((id) => id !== vendorId) : [...prev, vendorId]));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep()) return;

    const payload = {
      title,
      description,
      deadline: deadline.split('-').reverse().join('/'),
      items: items.map((item) => ({ name: item.name, quantity: item.quantity, hsnCode: item.hsnCode || '84713010' })),
      assignedVendors,
    };

    try {
      const newRfq = await createRfq(payload);
      if (newRfq?.id) {
        navigate(`/rfq/${newRfq.id}`);
      }
    } catch {
      addToast('Failed to create RFQ. Please try again.', 'danger');
    }
  };

  const handleSaveDraft = () => {
    addToast('RFQ saved as draft successfully!', 'success');
    navigate('/dashboard');
  };

  const unassignedVendors = vendors.filter((vendor) => !assignedVendors.includes(vendor.id));

  return (
    <div className="max-w-3xl mx-auto space-y-6 text-xs">
      <div>
        <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-800 dark:text-dark-100 tracking-tight">
          Request for Quotation (RFQ)
        </h1>
        <p className="text-xs text-slate-400 dark:text-dark-500 font-medium">
          Create and dispatch quotation bidding forms to suppliers.
        </p>
      </div>

      <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-2xl shadow-premium dark:shadow-dark-premium overflow-hidden">
        <StepForm currentStep={currentStep} steps={steps} />

        <div className="p-6">
          {currentStep === 1 && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-sm font-bold text-slate-800 dark:text-dark-200 flex items-center gap-2">
                <Sparkles className="w-4.5 h-4.5 text-brand-500" />
                <span>Basic RFQ Information</span>
              </h3>

              <FormInput
                label="RFQ Title"
                id="title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                error={errors.title}
                placeholder="High-Performance GPU Servers Upgrade"
                required
              />

              <FormInput
                label="Detailed Description"
                id="description"
                type="textarea"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                error={errors.description}
                placeholder="Please state GST applicability, Place of Supply, delivery lead times, and warranties..."
                required
              />

              <FormInput
                label="Quotation Submission Deadline"
                id="deadline"
                type="date"
                value={deadline}
                onChange={(event) => setDeadline(event.target.value)}
                error={errors.deadline}
                icon={Calendar}
                required
              />
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-800 dark:text-dark-200 flex items-center gap-2">
                  <ListPlus className="w-4.5 h-4.5 text-brand-500" />
                  <span>Item Specification Catalog</span>
                </h3>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-brand-50 dark:bg-brand-950/20 hover:bg-brand-100 dark:hover:bg-brand-900 text-brand-650 dark:text-brand-400 rounded-lg transition-colors border border-brand-100/50"
                >
                  <Plus className="w-4 h-4" /> Add Row
                </button>
              </div>

              <div className="space-y-3">
                {items.map((item, index) => (
                  <div key={index} className="flex gap-3 items-end">
                    <FormInput
                      label={index === 0 ? 'Product/Service Description' : ''}
                      id={`name-${index}`}
                      value={item.name}
                      onChange={(event) => handleItemChange(index, 'name', event.target.value)}
                      placeholder="e.g. Nvidia H100 Compute Server Node"
                      className="flex-1"
                      required
                    />

                    <div className="w-28">
                      <FormInput
                        label={index === 0 ? 'HSN Code' : ''}
                        id={`hsn-${index}`}
                        value={item.hsnCode}
                        onChange={(event) => handleItemChange(index, 'hsnCode', event.target.value)}
                        placeholder="84713010"
                        maxLength="8"
                      />
                    </div>

                    <div className="w-20">
                      <FormInput
                        label={index === 0 ? 'Quantity' : ''}
                        id={`qty-${index}`}
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(event) => handleItemChange(index, 'quantity', Number.parseInt(event.target.value, 10) || 1)}
                        required
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className={`p-2.5 rounded-xl border border-slate-200 dark:border-dark-800 text-slate-400 hover:text-danger-650 hover:bg-danger-50 dark:hover:bg-danger-950/20 transition-all ${index === 0 ? 'mb-0.5' : ''}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-sm font-bold text-slate-800 dark:text-dark-200 flex items-center gap-2">
                <Building className="w-4.5 h-4.5 text-brand-500" />
                <span>Invite Vendors to Bid</span>
              </h3>
              <p className="text-xs text-slate-400 dark:text-dark-500 leading-normal">
                Select one or more Indian vendor partners to receive notification of this request.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-1">
                {vendors.map((vendor) => {
                  const isChecked = assignedVendors.includes(vendor.id);
                  return (
                    <div
                      key={vendor.id}
                      onClick={() => handleToggleVendor(vendor.id)}
                      className={`p-4 border rounded-xl flex items-start justify-between cursor-pointer select-none transition-all ${
                        isChecked
                          ? 'border-brand-500 bg-brand-50/20 dark:bg-brand-950/10'
                          : 'border-slate-200 dark:border-dark-800 hover:border-slate-300 dark:hover:border-dark-700 bg-slate-50/50 dark:bg-dark-950/30'
                      }`}
                    >
                      <div className="min-w-0 pr-2 space-y-0.5">
                        <p className="text-xs font-bold text-slate-800 dark:text-dark-150 truncate">{vendor.name}</p>
                        <p className="text-[10px] text-slate-400 dark:text-dark-500 truncate">{vendor.email}</p>
                        {vendor.gstin && <p className="text-[9px] text-slate-500 font-semibold truncate">GSTIN: {vendor.gstin}</p>}
                        <div className="flex items-center gap-2 mt-1.5 text-[9px] font-semibold text-slate-500">
                          <span className="bg-slate-100 dark:bg-dark-800 px-1.5 py-0.5 rounded text-slate-600 dark:text-dark-400 truncate">{vendor.category}</span>
                          <span className="flex items-center gap-0.5">★ {vendor.rating.toFixed(1)}</span>
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                        isChecked ? 'bg-brand-500 border-brand-500 text-white' : 'border-slate-300 dark:border-dark-750 bg-white dark:bg-dark-900'
                      }`}>
                        {isChecked && <CheckSquare className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-4 animate-fade-in text-xs leading-normal">
              <h3 className="text-sm font-bold text-slate-800 dark:text-dark-200">Review RFQ Specifications</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-150 dark:border-dark-800 bg-slate-50/50 dark:bg-dark-950/20 space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 dark:text-dark-500 uppercase">RFQ details</p>
                  <p className="font-bold text-slate-800 dark:text-dark-100 text-sm">{title}</p>
                  <p className="text-slate-600 dark:text-dark-400 font-medium truncate">{description}</p>
                  <p className="text-[10px] text-slate-500 dark:text-dark-450 pt-1">
                    Closing Date: <span className="font-bold text-slate-700 dark:text-dark-300">{deadline}</span>
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-150 dark:border-dark-800 bg-slate-50/50 dark:bg-dark-950/20 space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 dark:text-dark-500 uppercase">Assigned Bidders</p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {assignedVendors.map((vendorId) => {
                      const vendorObject = vendors.find((vendor) => vendor.id === vendorId);
                      return (
                        <span key={vendorId} className="px-2 py-0.5 rounded bg-brand-50 dark:bg-brand-950/30 text-brand-650 dark:text-brand-400 font-semibold border border-brand-100/30">
                          {vendorObject ? vendorObject.name : vendorId}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-150 dark:border-dark-800 overflow-hidden">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-dark-950/40 text-[10px] font-bold text-slate-400 dark:text-dark-550 border-b border-slate-150 dark:border-dark-800 uppercase">
                      <th className="px-4 py-2.5">Item Description</th>
                      <th className="px-4 py-2.5 w-28 text-center">HSN Code</th>
                      <th className="px-4 py-2.5 w-24 text-right">Qty</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150 dark:divide-dark-800 text-slate-700 dark:text-dark-300">
                    {items.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2.5 font-semibold">{item.name}</td>
                        <td className="px-4 py-2.5 text-center font-medium text-slate-500">{item.hsnCode}</td>
                        <td className="px-4 py-2.5 text-right font-bold">{item.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mt-6 pt-5 border-t border-slate-100 dark:border-dark-800 select-none">
            <button
              type="button"
              disabled={currentStep === 1}
              onClick={handlePrev}
              className="flex items-center gap-1 px-4 py-2 text-xs font-bold bg-slate-50 hover:bg-slate-100 dark:bg-dark-850 dark:hover:bg-dark-800 text-slate-600 dark:text-dark-400 rounded-xl transition-colors border border-slate-150 dark:border-dark-750 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-1 px-4 py-2 text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white rounded-xl shadow-md transition-all active:scale-98"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-tr from-brand-600 to-brand-500 hover:from-brand-550 hover:to-brand-450 text-white font-bold text-xs rounded-xl shadow-lg shadow-brand-500/20 active:scale-98 transition-all"
              >
                <span>Dispatch RFQ Bids</span>
                <Send className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between text-[10px] text-slate-400 dark:text-dark-500">
            <button type="button" onClick={handleSaveDraft} className="font-semibold hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
              Save as Draft
            </button>
            <span>{assignedVendors.length} vendor(s) selected</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RfqCreate;
