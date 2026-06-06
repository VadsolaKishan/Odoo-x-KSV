import React, { useState } from 'react';
import { CreditCard, Download, Mail, DollarSign, FileSpreadsheet, Send, FileText, Eye } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Table } from '../components/Table';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';

export const Invoices = () => {
  const { invoices, payInvoice, emailInvoice, loading, addToast, formatIndianCurrency, convertNumberToWords } = useApp();
  const [selectedFilter, setSelectedFilter] = useState(''); // All, Paid, Sent, Overdue

  // Selected Invoice for emailing/preview
  const [activeInvoice, setActiveInvoice] = useState(null);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState('');

  // Selected Invoice for details modal
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const handleOpenDetails = (inv) => {
    setSelectedInvoice(inv);
    setDetailModalOpen(true);
  };

  const handlePay = async (invoiceId) => {
    await payInvoice(invoiceId);
  };

  const handleDownload = (invoiceNum) => {
    addToast(`Downloading Invoice ${invoiceNum} PDF...`, 'success');
  };

  const handleOpenEmailModal = (inv) => {
    setActiveInvoice(inv);
    setRecipientEmail('finance@' + inv.vendorName.toLowerCase().replace(/\s+/g, '') + '.com');
    setEmailModalOpen(true);
  };

  const handleSendEmail = async (e) => {
    e.preventDefault();
    if (activeInvoice) {
      await emailInvoice(activeInvoice.id, recipientEmail);
      setEmailModalOpen(false);
    }
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
        <span className="font-bold text-slate-800 dark:text-dark-100 flex items-center gap-1.5">
          <CreditCard className="w-4 h-4 text-brand-500" />
          <span>{row.invoiceNumber}</span>
        </span>
      )
    },
    {
      label: 'Vendor Supplier',
      key: 'vendorName',
      render: (row) => <span className="font-bold text-slate-700 dark:text-dark-200">{row.vendorName}</span>
    },
    {
      label: 'Linked PO Code',
      key: 'poId',
      render: (row) => (
        <span className="font-medium text-slate-500 dark:text-dark-400">
          {row.poId}
        </span>
      )
    },
    {
      label: 'Date Issued',
      key: 'createdAt',
      render: (row) => <span className="text-slate-500 dark:text-dark-450 font-medium">{row.createdAt}</span>
    },
    {
      label: 'Billed Value',
      key: 'totalCost',
      render: (row) => <span className="font-bold text-slate-850 dark:text-dark-150">{formatIndianCurrency(row.totalCost)}</span>
    },
    {
      label: 'Status',
      key: 'status',
      render: (row) => <StatusBadge status={row.status} />
    },
    {
      label: 'Actions',
      key: 'actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          {row.status.toLowerCase() === 'sent' && (
            <button
              onClick={() => handlePay(row.id)}
              disabled={loading}
              className="px-2.5 py-1 text-[10px] font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow-sm transition-all active:scale-95 whitespace-nowrap"
            >
              Pay Invoice
            </button>
          )}
          <button
            onClick={() => handleOpenDetails(row)}
            title="View Details"
            className="p-1.5 rounded-lg border border-slate-200 dark:border-dark-800 text-slate-500 hover:text-brand-600 hover:bg-slate-50 dark:hover:bg-dark-850 transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleDownload(row.invoiceNumber)}
            title="Download PDF"
            className="p-1.5 rounded-lg border border-slate-200 dark:border-dark-800 text-slate-500 hover:text-slate-800 hover:bg-slate-50 dark:hover:bg-dark-850 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleOpenEmailModal(row)}
            title="Email Invoice copy"
            className="p-1.5 rounded-lg border border-slate-200 dark:border-dark-800 text-slate-500 hover:text-brand-650 hover:bg-brand-50 dark:hover:bg-dark-850 transition-colors"
          >
            <Mail className="w-3.5 h-3.5" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-800 dark:text-dark-100 tracking-tight">
            Accounts Payable Invoices
          </h1>
          <p className="text-xs text-slate-400 dark:text-dark-500 font-medium">
            List and clear outstanding supplier bills and invoices.
          </p>
        </div>

        {/* Status filters */}
        <div className="flex items-center gap-1.5 select-none bg-slate-100 dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-xl p-1">
          {['', 'sent', 'paid', 'overdue'].map((filterVal) => (
            <button
              key={filterVal}
              onClick={() => setSelectedFilter(filterVal)}
              className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all capitalize ${
                selectedFilter === filterVal
                  ? 'bg-white dark:bg-dark-800 text-slate-800 dark:text-dark-100 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:text-dark-400 dark:hover:text-dark-200'
              }`}
            >
              {filterVal || 'All Invoices'}
            </button>
          ))}
        </div>
      </div>

      {/* Invoices grid table */}
      <Table
        headers={headers}
        data={filteredInvoices}
        loading={loading}
        emptyMessage="No invoices found matching selection."
      />

      {/* Invoice Details Modal */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title={`Tax Invoice: ${selectedInvoice?.invoiceNumber}`}
      >
        {selectedInvoice && (
          <div className="space-y-6 text-xs leading-normal">
            
            {/* Header: Tax Invoice */}
            <div className="text-center pb-4 border-b border-slate-200 dark:border-dark-800">
              <h2 className="text-lg font-bold text-slate-800 dark:text-dark-100 uppercase tracking-wider">Tax Invoice</h2>
              <p className="text-[10px] text-slate-400 dark:text-dark-500">Issued under Section 31 of CGST Act, 2017</p>
            </div>

            {/* Buyer vs Seller details block */}
            <div className="grid grid-cols-2 gap-6 pb-4 border-b border-slate-150 dark:border-dark-800">
              {/* Seller */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 dark:text-dark-550 uppercase">Supplier (Seller)</span>
                <p className="font-bold text-slate-800 dark:text-dark-100 text-sm">{selectedInvoice.vendorName}</p>
                <p className="text-slate-500 dark:text-dark-400 font-medium">GSTIN: <span className="font-bold text-slate-700 dark:text-dark-300">{selectedInvoice.vendorGstin}</span></p>
                <p className="text-slate-500 dark:text-dark-400 font-medium">State: <span className="font-bold text-slate-700 dark:text-dark-300">{selectedInvoice.placeOfSupply}</span></p>
              </div>
              {/* Buyer */}
              <div className="space-y-1 text-right">
                <span className="text-[10px] font-bold text-slate-400 dark:text-dark-550 uppercase">Recipient (Buyer)</span>
                <p className="font-bold text-slate-800 dark:text-dark-100 text-sm">VendorBridge India Pvt Ltd</p>
                <p className="text-slate-500 dark:text-dark-400 font-medium">GSTIN: <span className="font-bold text-slate-700 dark:text-dark-300">27AABCV1020K1Z9</span></p>
                <p className="text-slate-500 dark:text-dark-400 font-medium">Place of Supply: <span className="font-bold text-slate-800 dark:text-dark-200">Maharashtra (27)</span></p>
              </div>
            </div>

            {/* Invoice Meta */}
            <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-850 rounded-xl">
              <div>
                <span className="text-[9px] font-bold text-slate-400 uppercase">Invoice Date</span>
                <p className="font-bold text-slate-700 dark:text-dark-300">{selectedInvoice.createdAt}</p>
              </div>
              <div>
                <span className="text-[9px] font-bold text-slate-400 uppercase">PO Reference</span>
                <p className="font-bold text-slate-700 dark:text-dark-300">{selectedInvoice.poId}</p>
              </div>
              <div className="text-right">
                <span className="text-[9px] font-bold text-slate-400 uppercase">Status</span>
                <div className="pt-0.5">
                  <StatusBadge status={selectedInvoice.status} />
                </div>
              </div>
            </div>

            {/* Items table */}
            <div className="space-y-2">
              <p className="font-bold text-slate-800 dark:text-dark-200">Product / Service Breakdown</p>
              <div className="rounded-xl border border-slate-150 dark:border-dark-800 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-dark-950/40 text-[9px] font-bold text-slate-400 dark:text-dark-500 border-b border-slate-150 dark:border-dark-800 uppercase">
                      <th className="px-4 py-2">Description</th>
                      <th className="px-4 py-2 w-24">HSN/SAC</th>
                      <th className="px-4 py-2 w-16 text-right">Qty</th>
                      <th className="px-4 py-2 w-24 text-right">Unit Rate</th>
                      <th className="px-4 py-2 w-24 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150 dark:divide-dark-800 text-slate-700 dark:text-dark-300">
                    {selectedInvoice.items.map((it, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/20">
                        <td className="px-4 py-2 font-semibold">{it.name}</td>
                        <td className="px-4 py-2 font-semibold text-slate-550">{it.hsnCode || '84713010'}</td>
                        <td className="px-4 py-2 text-right font-bold">{it.quantity}</td>
                        <td className="px-4 py-2 text-right font-medium">{formatIndianCurrency(it.unitPrice)}</td>
                        <td className="px-4 py-2 text-right font-bold">{formatIndianCurrency(it.quantity * it.unitPrice)}</td>
                      </tr>
                    ))}
                    {/* Sum cost rows (Subtotal -> GST -> Grand Total) */}
                    <tr className="bg-slate-50/10 text-slate-600 dark:text-dark-300">
                      <td colSpan="4" className="px-4 py-1.5 text-right font-semibold">Subtotal</td>
                      <td className="px-4 py-1.5 text-right font-bold">{formatIndianCurrency(selectedInvoice.subtotal)}</td>
                    </tr>
                    
                    {selectedInvoice.cgst > 0 && (
                      <>
                        <tr className="bg-slate-50/10 text-slate-600 dark:text-dark-300">
                          <td colSpan="4" className="px-4 py-1.5 text-right font-semibold">CGST (9%)</td>
                          <td className="px-4 py-1.5 text-right font-bold">{formatIndianCurrency(selectedInvoice.cgst)}</td>
                        </tr>
                        <tr className="bg-slate-50/10 text-slate-600 dark:text-dark-300">
                          <td colSpan="4" className="px-4 py-1.5 text-right font-semibold">SGST (9%)</td>
                          <td className="px-4 py-1.5 text-right font-bold">{formatIndianCurrency(selectedInvoice.sgst)}</td>
                        </tr>
                      </>
                    )}

                    {selectedInvoice.igst > 0 && (
                      <tr className="bg-slate-50/10 text-slate-600 dark:text-dark-300">
                        <td colSpan="4" className="px-4 py-1.5 text-right font-semibold">IGST (18%)</td>
                        <td className="px-4 py-1.5 text-right font-bold">{formatIndianCurrency(selectedInvoice.igst)}</td>
                      </tr>
                    )}

                    <tr className="bg-slate-50/30 font-bold text-slate-800 dark:text-dark-150 text-sm">
                      <td colSpan="4" className="px-4 py-2.5">Grand Total</td>
                      <td className="px-4 py-2.5 text-right text-base font-extrabold text-brand-600 dark:text-brand-400">
                        {formatIndianCurrency(selectedInvoice.totalCost)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Amount in words */}
            <div className="p-3 bg-slate-50/50 dark:bg-dark-950/20 border border-slate-150 dark:border-dark-850 rounded-xl">
              <span className="text-[9px] font-bold text-slate-400 uppercase">Amount in Words</span>
              <p className="font-bold text-slate-700 dark:text-dark-300 capitalize">{convertNumberToWords(selectedInvoice.totalCost)}</p>
            </div>

            {/* Payment Details Section */}
            <div className="p-4 bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 rounded-xl space-y-2">
              <p className="font-bold text-slate-800 dark:text-dark-200">Settlement Instructions</p>
              <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-600 dark:text-dark-400">
                <div className="space-y-1">
                  <p>Account Number: <span className="font-bold text-slate-850 dark:text-dark-150">{selectedInvoice.accountNo || '999988887777'}</span></p>
                  <p>IFSC Code: <span className="font-bold text-slate-855 dark:text-dark-150">{selectedInvoice.ifscCode || 'UTIB0000194'}</span></p>
                </div>
                <div className="space-y-1 border-l border-slate-200 dark:border-dark-800 pl-4">
                  <p>UPI ID: <span className="font-bold text-brand-655 dark:text-brand-400">{selectedInvoice.upiId || 'vendor@okaxis'}</span></p>
                  <p className="text-[10px] text-slate-400 dark:text-dark-500">Scan QR or make UPI payment to initiate immediate bank settlement.</p>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-dark-800 select-none">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownload(selectedInvoice.invoiceNumber)}
                  title="Download PDF Copy"
                  className="p-2 rounded-lg border border-slate-200 dark:border-dark-800 text-slate-500 hover:text-slate-800 dark:hover:text-dark-300 hover:bg-slate-50 dark:hover:bg-dark-850"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleOpenEmailModal(selectedInvoice)}
                  title="Send via Email"
                  className="p-2 rounded-lg border border-slate-200 dark:border-dark-800 text-slate-500 hover:text-brand-650 dark:hover:text-brand-400 hover:bg-slate-50 dark:hover:bg-dark-850"
                >
                  <Mail className="w-4 h-4" />
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setDetailModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold bg-slate-50 hover:bg-slate-100 dark:bg-dark-800 dark:hover:bg-dark-850 text-slate-770 dark:text-dark-300 border border-slate-200 dark:border-dark-750 rounded-lg"
                >
                  Close
                </button>
                {selectedInvoice.status.toLowerCase() === 'sent' && (
                  <button
                    onClick={() => {
                      handlePay(selectedInvoice.id);
                      setDetailModalOpen(false);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow-md transition-all active:scale-98"
                  >
                    <span>Clear Invoice</span>
                  </button>
                )}
              </div>
            </div>

          </div>
        )}
      </Modal>

      {/* Email Invoice Modal */}
      <Modal
        isOpen={emailModalOpen}
        onClose={() => setEmailModalOpen(false)}
        title="Email Invoice"
      >
        <form onSubmit={handleSendEmail} className="space-y-4">
          <p className="text-xs text-slate-600 dark:text-dark-300 leading-normal">
            Transmit copy of Invoice <span className="font-bold text-slate-800 dark:text-dark-100">"{activeInvoice?.invoiceNumber}"</span> to supplier accounting.
          </p>
          
          <div className="space-y-1.5">
            <label htmlFor="rec_email" className="block text-xs font-semibold text-slate-555 dark:text-dark-400 uppercase tracking-wider">
              Recipient Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                id="rec_email"
                type="email"
                required
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="accounts@zenithtech.com"
                className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-slate-700 dark:text-dark-250 font-semibold"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-dark-800 select-none">
            <button
              type="button"
              onClick={() => setEmailModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold bg-slate-50 hover:bg-slate-100 dark:bg-dark-800 dark:hover:bg-dark-850 text-slate-700 dark:text-dark-300 rounded-lg transition-colors border border-slate-150 dark:border-dark-750"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1 px-4 py-2 text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white rounded-lg shadow-md transition-all active:scale-98"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Invoice Email</span>
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};

export default Invoices;
