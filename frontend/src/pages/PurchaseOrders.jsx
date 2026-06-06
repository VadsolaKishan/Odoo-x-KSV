import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Table } from '../components/Table';

export const PurchaseOrders = () => {
  const { purchaseOrders, loading, addToast, formatIndianCurrency } = useApp();
  const [selectedPo, setSelectedPo] = useState(null);

  const handleDownload = (poId) => {
    addToast(`Downloading PO contract PDF for ${poId}...`, 'success');
  };

  const handlePrint = (poId) => {
    addToast(`Triggering printing spooler for PO: ${poId}...`, 'info');
  };

  const handleEmail = (poId) => {
    addToast(`Purchase Order ${poId} emailed to supplier contact.`, 'success');
  };

  const headers = [
    {
      label: 'PO Code',
      key: 'id',
      render: (row) => (
        <span className="font-bold text-slate-800 dark:text-dark-100">
          {row.id}
        </span>
      )
    },
    {
      label: 'Vendor Partner',
      key: 'vendorName',
      render: (row) => <span className="font-bold text-slate-700 dark:text-dark-200">{row.vendorName}</span>
    },
    {
      label: 'Linked Project/RFQ',
      key: 'rfqTitle',
      render: (row) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-medium text-slate-755 dark:text-dark-200">{row.rfqTitle}</span>
          <span className="text-[10px] text-slate-400 dark:text-dark-500">RFQ Ref: {row.rfqId}</span>
        </div>
      )
    },
    {
      label: 'Date Created',
      key: 'createdAt',
      render: (row) => <span className="text-slate-500 dark:text-dark-450 font-medium">{row.createdAt}</span>
    },
    {
      label: 'Total Value',
      key: 'totalCost',
      render: (row) => <span className="font-bold text-slate-800 dark:text-dark-150">{formatIndianCurrency(row.totalCost)}</span>
    },
    {
      label: 'Status',
      key: 'status',
      render: (row) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100/30">
          {row.status}
        </span>
      )
    },
    {
      label: 'Action',
      key: 'actions',
      render: (row) => (
        <button
          onClick={() => setSelectedPo(row)}
          className="px-3 py-1 text-xs font-semibold bg-transparent border border-slate-300 dark:border-dark-700 text-slate-700 dark:text-dark-300 rounded-lg hover:bg-slate-50 dark:hover:bg-dark-800 transition-all active:scale-95 cursor-pointer"
        >
          View
        </button>
      )
    }
  ];

  // Render detail view if selectedPo is active
  if (selectedPo) {
    const cgst = selectedPo.subtotal * 0.09;
    const sgst = selectedPo.subtotal * 0.09;
    const computedGrandTotal = selectedPo.subtotal + cgst + sgst;

    return (
      <div className="space-y-6 text-xs text-slate-700 dark:text-dark-300 animate-fade-in">
        
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-dark-800 pb-4">
          <div>
            <h1 className="text-3xl font-display font-extrabold text-slate-800 dark:text-dark-100 tracking-tight">
              Purchase Order & Invoice
            </h1>
            <p className="text-xs text-slate-400 dark:text-dark-500 font-medium">
              {selectedPo.id}-auto-generated after approval
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 select-none">
            <button
              onClick={() => handleDownload(selectedPo.id)}
              className="px-4 py-2 text-xs font-semibold bg-transparent border border-slate-300 dark:border-dark-700 text-slate-700 dark:text-dark-300 rounded-xl hover:bg-slate-50 dark:hover:bg-dark-800 transition-all active:scale-98 cursor-pointer"
            >
              Download PDF
            </button>
            <button
              onClick={() => handlePrint(selectedPo.id)}
              className="px-4 py-2 text-xs font-semibold bg-transparent border border-slate-300 dark:border-dark-700 text-slate-700 dark:text-dark-300 rounded-xl hover:bg-slate-50 dark:hover:bg-dark-800 transition-all active:scale-98 cursor-pointer"
            >
              Print
            </button>
            <button
              onClick={() => handleEmail(selectedPo.id)}
              className="px-4 py-2 text-xs font-semibold bg-transparent border border-slate-300 dark:border-dark-700 text-slate-700 dark:text-dark-300 rounded-xl hover:bg-slate-50 dark:hover:bg-dark-800 transition-all active:scale-98 cursor-pointer"
            >
              Email invoice
            </button>
          </div>
        </div>

        {/* Bill Info Grid Box */}
        <div className="border border-slate-200 dark:border-dark-800 rounded-2xl p-6 bg-white dark:bg-dark-900/50 shadow-sm space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-[10px] font-bold text-slate-400 dark:text-dark-500 uppercase tracking-wider mb-2">Bill to:</p>
              <p className="font-bold text-slate-800 dark:text-dark-100 text-sm">your Organization Name</p>
              <p className="text-slate-500 dark:text-dark-400 font-medium">123 business park, ahmedabad</p>
              <p className="text-slate-500 dark:text-dark-400 font-medium mt-1">GSTIN: <span className="font-bold">253834384FB</span></p>
            </div>
            
            <div>
              <p className="text-[10px] font-bold text-slate-400 dark:text-dark-500 uppercase tracking-wider mb-2">Vendor</p>
              <p className="font-bold text-slate-800 dark:text-dark-100 text-sm">{selectedPo.vendorName}</p>
              <p className="text-slate-500 dark:text-dark-400 font-medium">456, industrial estate, surat</p>
              <p className="text-slate-500 dark:text-dark-400 font-medium mt-1">GSTIN: <span className="font-bold">{selectedPo.vendorGstin || '343434DB4523'}</span></p>
            </div>
          </div>

          <hr className="border-slate-250 dark:border-dark-850" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="space-y-1">
              <p>PO Number: <span className="font-bold text-slate-800 dark:text-dark-200">{selectedPo.id}</span></p>
              <p>PO date: <span className="font-bold text-slate-800 dark:text-dark-200">{selectedPo.createdAt}</span></p>
            </div>
            <div className="space-y-1">
              <p>invoice date: <span className="font-bold text-slate-800 dark:text-dark-200">{selectedPo.createdAt}</span></p>
              <p>Due date: <span className="font-bold text-slate-800 dark:text-dark-200">21 june 2025</span></p>
            </div>
          </div>
        </div>

        {/* Invoice Items table */}
        <div className="border border-slate-200 dark:border-dark-800 rounded-2xl overflow-hidden bg-white dark:bg-dark-900/50 shadow-sm">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-dark-800 text-[10px] font-bold text-slate-400 dark:text-dark-550 uppercase">
                <th className="px-6 py-3">Item</th>
                <th className="px-6 py-3 w-24 text-center">Qty</th>
                <th className="px-6 py-3 w-36 text-center">Unit price</th>
                <th className="px-6 py-3 w-36 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150 dark:divide-dark-855 text-slate-700 dark:text-dark-300">
              {selectedPo.items.map((it, idx) => (
                <tr key={idx}>
                  <td className="px-6 py-3 font-semibold">{it.name || (idx === 0 ? 'Ergonomic chair' : 'Tech Core LTD')}</td>
                  <td className="px-6 py-3 w-24 text-center font-bold">{it.quantity}</td>
                  <td className="px-6 py-3 w-36 text-center font-medium">{it.unitPrice}</td>
                  <td className="px-6 py-3 w-36 text-right font-bold">{(it.quantity * it.unitPrice).toLocaleString('en-IN')}</td>
                </tr>
              ))}
              
              {/* Totals Summary */}
              <tr className="bg-slate-50/10 text-slate-550 dark:text-dark-400">
                <td colSpan="3" className="px-6 py-2 text-right font-semibold">Subtotal</td>
                <td className="px-6 py-2 text-right font-bold">{selectedPo.subtotal.toLocaleString('en-IN')}</td>
              </tr>
              <tr className="bg-slate-50/10 text-slate-550 dark:text-dark-400">
                <td colSpan="3" className="px-6 py-2 text-right font-semibold">CGST(9%)</td>
                <td className="px-6 py-2 text-right font-bold">{cgst.toLocaleString('en-IN')}</td>
              </tr>
              <tr className="bg-slate-50/10 text-slate-550 dark:text-dark-400">
                <td colSpan="3" className="px-6 py-2 text-right font-semibold">SGST(9%)</td>
                <td className="px-6 py-2 text-right font-bold">{sgst.toLocaleString('en-IN')}</td>
              </tr>
              <tr className="bg-slate-50/20 font-bold text-slate-800 dark:text-dark-150 text-sm">
                <td colSpan="3" className="px-6 py-3 text-right">Grand total</td>
                <td className="px-6 py-3 text-right text-base font-extrabold text-slate-900 dark:text-dark-50">{computedGrandTotal.toLocaleString('en-IN')}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Bottom Status */}
        <div className="flex items-center gap-3 select-none">
          <span className="font-semibold text-slate-550 dark:text-dark-400">status:</span>
          <span className="bg-emerald-100 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 font-bold px-2 py-0.5 rounded text-[10px]">
            {selectedPo.status}
          </span>
        </div>

        {/* Return Button */}
        <div>
          <button
            onClick={() => setSelectedPo(null)}
            className="px-5 py-2 text-xs font-semibold bg-transparent border border-slate-300 dark:border-dark-700 text-slate-700 dark:text-dark-300 rounded-xl hover:bg-slate-50 dark:hover:bg-dark-800 transition-all active:scale-98 cursor-pointer mt-4"
          >
            Back to Purchase Orders List
          </button>
        </div>

      </div>
    );
  }

  return (
    <div className="space-y-6 text-xs text-slate-700 dark:text-dark-300">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-extrabold text-slate-800 dark:text-dark-100 tracking-tight">
          Purchase Orders
        </h1>
        <p className="text-xs text-slate-400 dark:text-dark-500 font-medium">
          Contracts and official purchasing orders issued to vendors
        </p>
      </div>

      {/* POs Directory */}
      <Table
        headers={headers}
        data={purchaseOrders}
        loading={loading}
        emptyMessage="No purchase orders created yet. Authorize RFQs in the Approvals Inbox to generate orders."
      />

    </div>
  );
};

export default PurchaseOrders;
