import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export const RfqCreate = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { vendors, rfqs, createRfq, addToast } = useApp();

  // Form States prefilled with Mockup Data
  const [title, setTitle] = useState('Office Furniture procurement Q2');
  const [category, setCategory] = useState('Furniture');
  const [deadline, setDeadline] = useState('2025-06-15');
  const [description, setDescription] = useState('Ergonomic chairs and standing desks for 3rd floor');
  
  const [items, setItems] = useState([
    { name: 'Ergonomic chair', quantity: 25, unit: 'NOS' },
    { name: 'Standing desks', quantity: 10, unit: 'NOS' }
  ]);
  
  const [assignedVendors, setAssignedVendors] = useState(['V-001', 'V-004']); // Default assigned vendors
  const [showVendorSelect, setShowVendorSelect] = useState(false);
  const [errors, setErrors] = useState({});

  // Autofill if reordering
  useEffect(() => {
    const reorderId = searchParams.get('reorderId');
    if (reorderId) {
      const sourceRfq = rfqs.find(r => r.id === reorderId);
      if (sourceRfq) {
        setTitle(`Copy of ${sourceRfq.title}`);
        setDescription(sourceRfq.description);
        if (sourceRfq.deadline && sourceRfq.deadline.includes('/')) {
          setDeadline(sourceRfq.deadline.split('/').reverse().join('-'));
        }
        setItems(sourceRfq.items.map(i => ({ name: i.name, quantity: i.quantity, unit: 'NOS' })));
        setAssignedVendors(sourceRfq.assignedVendors || []);
        addToast(`Prefilled details from previous RFQ: ${reorderId}`, 'success');
      }
    }
  }, [searchParams, rfqs]);

  // Line item handlers
  const handleAddItem = () => {
    setItems((prev) => [...prev, { name: '', quantity: 1, unit: 'NOS' }]);
  };

  const handleRemoveItem = (index) => {
    if (items.length === 1) {
      addToast('RFQs must contain at least one item.', 'warning');
      return;
    }
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (index, field, value) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  };

  // Vendor handlers
  const handleRemoveVendor = (vendorId) => {
    setAssignedVendors((prev) => prev.filter((id) => id !== vendorId));
  };

  const handleAddVendor = (vendorId) => {
    if (!assignedVendors.includes(vendorId)) {
      setAssignedVendors((prev) => [...prev, vendorId]);
    }
    setShowVendorSelect(false);
  };

  // Submit / Send
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !deadline) {
      addToast('Please fill out all required fields.', 'danger');
      return;
    }

    const formattedDeadline = deadline.split('-').reverse().join('/');
    const payload = {
      title,
      description,
      deadline: formattedDeadline,
      items: items.map(i => ({ name: i.name, quantity: i.quantity, hsnCode: '84713010' })),
      assignedVendors
    };

    const newRfq = await createRfq(payload);
    if (newRfq) {
      navigate(`/rfq/${newRfq.id}`);
    }
  };

  const handleSaveDraft = () => {
    addToast('RFQ saved as Draft successfully!', 'success');
    navigate('/dashboard');
  };

  const unassignedVendors = vendors.filter((v) => !assignedVendors.includes(v.id));

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-xs text-slate-700 dark:text-dark-300">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-extrabold text-slate-800 dark:text-dark-100 tracking-tight">
          Create RFQ's
        </h1>
        <p className="text-xs text-slate-400 dark:text-dark-500 font-medium">
          new request for quotation
        </p>
      </div>

      {/* Steps Indicator Layout */}
      <div className="flex items-center justify-center py-4 select-none">
        <div className="flex items-center w-full max-w-md">
          <div className="flex items-center justify-center w-8 h-8 rounded-full border border-brand-500 bg-brand-50/70 dark:bg-brand-950/20 text-brand-600 dark:text-brand-400 font-semibold text-sm">
            1
          </div>
          <div className="flex-1 h-px bg-slate-200 dark:bg-dark-800 mx-2" />
          <div className="flex items-center justify-center w-8 h-8 rounded-full border border-slate-300 dark:border-dark-750 text-slate-400 dark:text-dark-500 font-semibold text-sm">
            2
          </div>
          <div className="flex-1 h-px bg-slate-200 dark:bg-dark-800 mx-2" />
          <div className="flex items-center justify-center w-8 h-8 rounded-full border border-slate-300 dark:border-dark-750 text-slate-400 dark:text-dark-500 font-semibold text-sm">
            3
          </div>
        </div>
      </div>

      {/* Two Column Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Left Column: Basic Details */}
        <div className="space-y-4">
          
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-dark-400 mb-1.5">
              RFQ's title*
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-slate-800 dark:text-dark-100"
              placeholder="e.g. Office Furniture procurement Q2"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-dark-400 mb-1.5">
              Category
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-slate-800 dark:text-dark-100"
              placeholder="e.g. Furniture"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-dark-400 mb-1.5">
              Deadline*
            </label>
            <input
              type="date"
              required
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-slate-800 dark:text-dark-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-dark-400 mb-1.5">
              Description
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-slate-800 dark:text-dark-100 resize-none"
              placeholder="Ergonomic chairs and standing desks for 3rd floor..."
            />
          </div>

        </div>

        {/* Right Column: Line items & Assign Vendors */}
        <div className="space-y-6">
          
          {/* Line items Section */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-500 dark:text-dark-400">
              Line items
            </label>
            
            <div className="border border-slate-200 dark:border-dark-800 rounded-xl overflow-hidden bg-white dark:bg-dark-900/40">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-dark-800 text-slate-400 dark:text-dark-500 text-[10px] font-bold">
                    <th className="px-4 py-2">item</th>
                    <th className="px-4 py-2 w-20 text-center">qty</th>
                    <th className="px-4 py-2 w-20 text-center">Unit</th>
                    <th className="px-4 py-2 w-10 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-dark-800 text-slate-700 dark:text-dark-300">
                  {items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="p-1">
                        <input
                          type="text"
                          required
                          value={item.name}
                          onChange={(e) => handleItemChange(idx, 'name', e.target.value)}
                          className="w-full px-2 py-1 text-xs bg-transparent border-0 focus:outline-none focus:bg-slate-50 dark:focus:bg-dark-800 font-semibold"
                          placeholder="item description"
                        />
                      </td>
                      <td className="p-1 w-20">
                        <input
                          type="number"
                          min="1"
                          required
                          value={item.quantity}
                          onChange={(e) => handleItemChange(idx, 'quantity', parseInt(e.target.value) || 0)}
                          className="w-full px-2 py-1 text-xs bg-transparent border-0 focus:outline-none focus:bg-slate-50 dark:focus:bg-dark-800 text-center"
                        />
                      </td>
                      <td className="p-1 w-20">
                        <input
                          type="text"
                          required
                          value={item.unit}
                          onChange={(e) => handleItemChange(idx, 'unit', e.target.value)}
                          className="w-full px-2 py-1 text-xs bg-transparent border-0 focus:outline-none focus:bg-slate-50 dark:focus:bg-dark-800 text-center"
                          placeholder="NOS"
                        />
                      </td>
                      <td className="p-1 w-10 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="text-slate-400 hover:text-rose-600 font-bold p-1 text-sm focus:outline-none cursor-pointer"
                        >
                          &times;
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button
              type="button"
              onClick={handleAddItem}
              className="px-4 py-1.5 text-xs font-semibold bg-transparent border border-slate-300 dark:border-dark-700 text-slate-700 dark:text-dark-300 rounded-xl hover:bg-slate-50 dark:hover:bg-dark-800 transition-all cursor-pointer"
            >
              + add line item
            </button>
          </div>

          {/* Assign Vendors Section */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-500 dark:text-dark-400 uppercase tracking-wider">
              ASSIGN VENDORS
            </label>

            <div className="border border-slate-200 dark:border-dark-800 rounded-xl bg-white dark:bg-dark-900/40 p-1 divide-y divide-slate-100 dark:divide-dark-800 relative">
              {assignedVendors.length === 0 ? (
                <p className="p-4 text-xs text-slate-400 dark:text-dark-500 text-center">No vendors assigned yet.</p>
              ) : (
                assignedVendors.map((vendorId) => {
                  const vendorObj = vendors.find(v => v.id === vendorId);
                  return (
                    <div key={vendorId} className="flex items-center justify-between px-3 py-2 text-xs">
                      <span className="font-semibold text-slate-800 dark:text-dark-200">
                        {vendorObj ? vendorObj.name : vendorId}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveVendor(vendorId)}
                        className="text-slate-400 hover:text-rose-600 font-bold focus:outline-none p-1 text-sm cursor-pointer"
                      >
                        &times;
                      </button>
                    </div>
                  );
                })
              )}
              
              {/* Add vendor trigger action */}
              <div className="p-2 bg-slate-50/50 dark:bg-dark-950/20">
                <button
                  type="button"
                  onClick={() => setShowVendorSelect(!showVendorSelect)}
                  className="w-full text-left px-2 py-1.5 text-xs text-brand-600 dark:text-brand-400 font-semibold hover:underline cursor-pointer"
                >
                  + add vendor
                </button>
                
                {/* Vendors Selection Popover dropdown */}
                {showVendorSelect && (
                  <div className="absolute left-2 right-2 bottom-12 mt-1 max-h-48 overflow-y-auto bg-white dark:bg-dark-900 border border-slate-250 dark:border-dark-750 rounded-xl shadow-lg z-10 divide-y divide-slate-100 dark:divide-dark-800 animate-fade-scale">
                    {unassignedVendors.length === 0 ? (
                      <div className="p-3 text-center text-slate-400 dark:text-dark-500">All vendors assigned.</div>
                    ) : (
                      unassignedVendors.map((v) => (
                        <div
                          key={v.id}
                          onClick={() => handleAddVendor(v.id)}
                          className="px-3 py-2 hover:bg-slate-50 dark:hover:bg-dark-800 cursor-pointer text-xs flex justify-between items-center"
                        >
                          <span className="font-semibold">{v.name}</span>
                          <span className="text-[10px] text-slate-400 dark:text-dark-500">{v.category}</span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Bottom Area (horizontal rule divider + actions + attachments) */}
      <div>
        <hr className="border-slate-200 dark:border-dark-800 my-6" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Stacked Save Buttons */}
          <div className="flex flex-col gap-3 justify-center max-w-xs">
            <button
              type="button"
              onClick={handleSubmit}
              className="w-full py-2.5 text-xs font-semibold bg-transparent border border-slate-300 dark:border-dark-700 text-slate-800 dark:text-dark-200 rounded-xl hover:bg-slate-50 dark:hover:bg-dark-800 hover:border-slate-400 dark:hover:border-dark-600 transition-all cursor-pointer"
            >
              Save & Send to Vendors
            </button>
            <button
              type="button"
              onClick={handleSaveDraft}
              className="w-full py-2.5 text-xs font-semibold bg-transparent border border-slate-300 dark:border-dark-700 text-slate-800 dark:text-dark-200 rounded-xl hover:bg-slate-50 dark:hover:bg-dark-800 hover:border-slate-400 dark:hover:border-dark-600 transition-all cursor-pointer"
            >
              Save as Draft
            </button>
          </div>

          {/* Attachments Section */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-500 dark:text-dark-400">
              Attchements
            </label>
            <div 
              onClick={() => addToast('Attachment selector opened!', 'info')}
              className="border border-dashed border-slate-300 dark:border-dark-750 rounded-xl p-8 bg-white dark:bg-dark-900/20 text-center cursor-pointer hover:border-brand-500/50 hover:bg-slate-50/50 dark:hover:bg-dark-800/20 transition-all flex items-center justify-center"
            >
              <span className="text-xs text-slate-450 dark:text-dark-500">
                Drag & drop files or click to upload
              </span>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};

export default RfqCreate;
