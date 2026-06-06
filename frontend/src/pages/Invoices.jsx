import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Table } from '../components/Table';

export const Invoices = () => {
  const { invoices, payInvoice, emailInvoice, loading, addToast, formatIndianCurrency } = useApp();
  const [selectedFilter, setSelectedFilter] = useState(''); // All, Paid, Sent, Overdue
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const handlePay = async (invoiceId) => {
    await payInvoice(invoiceId);
    // Refresh selected invoice view if open
    const updated = invoices.find(inv => inv.id === invoiceId);
    if (updated) {
      setSelectedInvoice(updated);
    }
  };

  const handleDownload = (invoiceNum) => {
    addToast(`Downloading Invoice ${invoiceNum} PDF...`, 'success');
  };

  const handlePrint = (invoiceNum) => {
    addToast(`Sending invoice ${invoiceNum} to print spooler...`, 'info');
  };

  const handleEmail = (invoiceNum) => {
    addToast(`Invoice ${invoiceNum} emailed to supplier contact.`, 'success');
  };

  // Filter invoices list
  const filteredInvoices = selectedFilter 
    ? invoices.filter(inv => inv.status.toLowerCase() === selectedFilter.toLowerCase())
    : invoices;

  const headers = [
    {
      label: 'Invoice Num',
      key: 'invoiceNumber',
      render: (row) => (
        <span className="font-bold text-slate-800 dark:text-neutral-100">
          {row.invoiceNumber}
        </span>
      )
    },
    {
      label: 'Vendor Supplier',
      key: 'vendorName',
      render: (row) => <span className="font-bold text-slate-700 dark:text-neutral-200">{row.vendorName}</span>
    },
    {
      label: 'Linked PO Code',
      key: 'poId',
      render: (row) => (
        <span className="font-medium text-slate-500 dark:text-neutral-400">
          {row.poId}
        </span>
      )
    },
    {
      label: 'Date Issued',
      key: 'createdAt',
      render: (row) => <span className="text-slate-500 dark:text-neutral-450 font-medium">{row.createdAt}</span>
    },
    {
      label: 'Billed Value',
      key: 'totalCost',
      render: (row) => <span className="font-bold text-slate-850 dark:text-neutral-150">{formatIndianCurrency(row.totalCost)}</span>
    },
    {
      label: 'Status',
      key: 'status',
      render: (row) => {
        const displayStatus = row.status === 'Sent' ? 'Pending Payment' : row.status;
        return (
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${
            displayStatus === 'Paid'
              ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400'
              : 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400'
          }`}>
            {displayStatus}
          </span>
        );
      }
    },
    {
      label: 'Action',
      key: 'actions',
      render: (row) => (
        <button
          onClick={() => setSelectedInvoice(row)}
          className="px-3 py-1 text-xs font-semibold bg-transparent border border-slate-300 dark:border-neutral-700 text-slate-700 dark:text-neutral-300 rounded-lg hover:bg-slate-50 dark:hover:bg-neutral-800 hover-glow-button transition-all cursor-pointer"
        >
          View
        </button>
      )
    }
  ];

  // Render detail view if selectedInvoice is active
  if (selectedInvoice) {
    const cgst = selectedInvoice.subtotal * 0.09;
    const sgst = selectedInvoice.subtotal * 0.09;
    const computedGrandTotal = selectedInvoice.subtotal + cgst + sgst;
    const isPending = selectedInvoice.status === 'Sent' || selectedInvoice.status === 'Pending Payment';

    return (
      <div className="space-y-6 text-xs text-slate-700 dark:text-neutral-300 animate-fade-in">
        
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-neutral-800 pb-4">
          <div>
            <h1 className="text-3xl font-display font-extrabold text-slate-800 dark:text-neutral-100 tracking-tight">
              Purchase Order & Invoice
            </h1>
            <p className="text-xs text-slate-400 dark:text-neutral-500 font-medium">
              {selectedInvoice.poId}-auto-generated after approval
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 select-none">
            <button
              onClick={() => handleDownload(selectedInvoice.invoiceNumber)}
              className="px-4 py-2 text-xs font-semibold bg-transparent border border-slate-300 dark:border-neutral-700 text-slate-700 dark:text-neutral-300 rounded-xl hover:bg-slate-50 dark:hover:bg-neutral-800 hover-glow-button transition-all cursor-pointer"
            >
              Download PDF
            </button>
            <button
              onClick={() => handlePrint(selectedInvoice.invoiceNumber)}
              className="px-4 py-2 text-xs font-semibold bg-transparent border border-slate-300 dark:border-neutral-700 text-slate-700 dark:text-neutral-300 rounded-xl hover:bg-slate-50 dark:hover:bg-neutral-800 hover-glow-button transition-all cursor-pointer"
            >
              Print
            </button>
            <button
              onClick={() => handleEmail(selectedInvoice.invoiceNumber)}
              className="px-4 py-2 text-xs font-semibold bg-transparent border border-slate-300 dark:border-neutral-700 text-slate-700 dark:text-neutral-300 rounded-xl hover:bg-slate-50 dark:hover:bg-neutral-800 hover-glow-button transition-all cursor-pointer"
            >
              Email invoice
            </button>
          </div>
        </div>

        {/* Bill Info Grid Box */}
        <div className="border border-slate-200 dark:border-neutral-800 rounded-2xl p-6 bg-white dark:bg-neutral-900/50 shadow-sm space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-[10px] font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-wider mb-2">Bill to:</p>
              <p className="font-bold text-slate-800 dark:text-neutral-100 text-sm">your Organization Name</p>
              <p className="text-slate-500 dark:text-neutral-400 font-medium">123 business park, ahmedabad</p>
              <p className="text-slate-500 dark:text-neutral-400 font-medium mt-1">GSTIN: <span className="font-bold">253834384FB</span></p>
            </div>
            
            <div>
              <p className="text-[10px] font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-wider mb-2">Vendor</p>
              <p className="font-bold text-slate-800 dark:text-neutral-100 text-sm">{selectedInvoice.vendorName}</p>
              <p className="text-slate-500 dark:text-neutral-400 font-medium">456, industrial estate, surat</p>
              <p className="text-slate-500 dark:text-neutral-400 font-medium mt-1">GSTIN: <span className="font-bold">{selectedInvoice.vendorGstin || '343434DB4523'}</span></p>
            </div>
          </div>

          <hr className="border-slate-250 dark:border-neutral-850" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="space-y-1">
              <p>PO Number: <span className="font-bold text-slate-800 dark:text-neutral-200">{selectedInvoice.poId}</span></p>
              <p>PO date: <span className="font-bold text-slate-800 dark:text-neutral-200">{selectedInvoice.createdAt}</span></p>
            </div>
            <div className="space-y-1">
              <p>invoice date: <span className="font-bold text-slate-800 dark:text-neutral-200">{selectedInvoice.createdAt}</span></p>
              <p>Due date: <span className="font-bold text-slate-800 dark:text-neutral-200">21 june 2025</span></p>
            </div>
          </div>
        </div>

        {/* Invoice Items table */}
        <div className="border border-slate-200 dark:border-neutral-800 rounded-2xl overflow-hidden bg-white dark:bg-neutral-900/50 shadow-sm">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-neutral-800 text-[10px] font-bold text-slate-400 dark:text-neutral-550 uppercase">
                <th className="px-6 py-3">Item</th>
                <th className="px-6 py-3 w-24 text-center">Qty</th>
                <th className="px-6 py-3 w-36 text-center">Unit price</th>
                <th className="px-6 py-3 w-36 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150 dark:divide-neutral-850 text-slate-700 dark:text-neutral-300">
              {selectedInvoice.items.map((it, idx) => (
                <tr key={idx}>
                  <td className="px-6 py-3 font-semibold">{it.name || (idx === 0 ? 'Ergonomic chair' : 'Tech Core LTD')}</td>
                  <td className="px-6 py-3 w-24 text-center font-bold">{it.quantity}</td>
                  <td className="px-6 py-3 w-36 text-center font-medium">{it.unitPrice}</td>
                  <td className="px-6 py-3 w-36 text-right font-bold">{(it.quantity * it.unitPrice).toLocaleString('en-IN')}</td>
                </tr>
              ))}
              
              {/* Totals Summary */}
              <tr className="bg-slate-50/10 text-slate-550 dark:text-neutral-400">
                <td colSpan="3" className="px-6 py-2 text-right font-semibold">Subtotal</td>
                <td className="px-6 py-2 text-right font-bold">{selectedInvoice.subtotal.toLocaleString('en-IN')}</td>
              </tr>
              <tr className="bg-slate-50/10 text-slate-550 dark:text-neutral-400">
                <td colSpan="3" className="px-6 py-2 text-right font-semibold">CGST(9%)</td>
                <td className="px-6 py-2 text-right font-bold">{cgst.toLocaleString('en-IN')}</td>
              </tr>
              <tr className="bg-slate-50/10 text-slate-550 dark:text-neutral-400">
                <td colSpan="3" className="px-6 py-2 text-right font-semibold">SGST(9%)</td>
                <td className="px-6 py-2 text-right font-bold">{sgst.toLocaleString('en-IN')}</td>
              </tr>
              <tr className="bg-slate-50/20 font-bold text-slate-800 dark:text-neutral-150 text-sm">
                <td colSpan="3" className="px-6 py-3 text-right">Grand total</td>
                <td className="px-6 py-3 text-right text-base font-extrabold text-slate-900 dark:text-neutral-50">{computedGrandTotal.toLocaleString('en-IN')}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Bottom Status & Settlement Actions */}
        <div className="flex items-center gap-3 select-none">
          <span className="font-semibold text-slate-550 dark:text-neutral-400">status:</span>
          {isPending ? (
            <>
              <span className="bg-amber-100 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 font-bold px-2 py-0.5 rounded text-[10px]">
                Pending Payment
              </span>
              <button
                type="button"
                onClick={() => handlePay(selectedInvoice.id)}
                className="text-brand-600 dark:text-brand-400 font-semibold hover:underline cursor-pointer"
              >
                Mark as Paid
              </button>
            </>
          ) : (
            <span className="bg-emerald-100 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 font-bold px-2 py-0.5 rounded text-[10px]">
              Paid
            </span>
          )}
        </div>

        {/* Return Button */}
        <div>
          <button
            onClick={() => setSelectedInvoice(null)}
            className="px-5 py-2 text-xs font-semibold bg-transparent border border-slate-300 dark:border-neutral-700 text-slate-700 dark:text-neutral-300 rounded-xl hover:bg-slate-50 dark:hover:bg-neutral-800 hover-glow-button transition-all cursor-pointer mt-4"
          >
            Back to Invoices List
          </button>
        </div>

      </div>
    );
  }

  return (
    <div className="space-y-6 text-xs text-slate-700 dark:text-neutral-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-extrabold text-slate-800 dark:text-neutral-100 tracking-tight">
            Accounts Payable Invoices
          </h1>
          <p className="text-xs text-slate-400 dark:text-neutral-500 font-medium">
            List and clear outstanding supplier bills and invoices
          </p>
        </div>

        {/* Status filters */}
        <div className="flex flex-wrap items-center gap-2 select-none">
          {['', 'sent', 'paid', 'overdue'].map((filterVal) => {
            const isActive = selectedFilter === filterVal;
            const label = filterVal === '' ? 'All Invoices' : filterVal;
            return (
              <button
                key={filterVal}
                onClick={() => setSelectedFilter(filterVal)}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer capitalize ${
                  isActive
                    ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                    : 'bg-transparent text-slate-650 dark:text-neutral-300 border-slate-250 dark:border-neutral-800 hover:border-slate-400 dark:hover:border-neutral-500'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Invoices grid table */}
      <Table
        headers={headers}
        data={filteredInvoices}
        loading={loading}
        emptyMessage="No invoices found matching selection."
      />

    </div>
  );
};

export default Invoices;
