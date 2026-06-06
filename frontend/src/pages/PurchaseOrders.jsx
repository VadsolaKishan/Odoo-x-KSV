import React, { useState } from 'react';
import { FileText, Eye, Download, Printer, Send, Briefcase, Mail } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Table } from '../components/Table';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';

export const PurchaseOrders = () => {
  const { purchaseOrders, loading, addToast, formatIndianCurrency } = useApp();
  const [selectedPo, setSelectedPo] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const handleOpenDetails = (po) => {
    setSelectedPo(po);
    setDetailModalOpen(true);
  };

  const handleDownload = (poId) => {
    addToast(`Downloading PO contract PDF for ${poId}...`, 'success');
  };

  const handlePrint = (poId) => {
    addToast(`Triggering printing spooler for PO: ${poId}...`, 'info');
  };

  const handleMail = (poId) => {
    addToast(`Purchase Order ${poId} emailed to supplier contact.`, 'success');
  };

  const headers = [
    {
      label: 'PO Code',
      key: 'id',
      render: (row) => (
        <span className="font-bold text-slate-800 dark:text-dark-100 flex items-center gap-1.5">
          <FileText className="w-4 h-4 text-brand-500" />
          <span>{row.id}</span>
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
          <span className="font-medium text-slate-700 dark:text-dark-200">{row.rfqTitle}</span>
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
      render: (row) => <StatusBadge status={row.status} />
    },
    {
      label: 'Actions',
      key: 'actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenDetails(row)}
            title="View Details"
            className="p-1.5 rounded-lg border border-slate-200 dark:border-dark-800 text-slate-500 hover:text-brand-600 hover:bg-slate-50 dark:hover:bg-dark-850 transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleDownload(row.id)}
            title="Download PDF"
            className="p-1.5 rounded-lg border border-slate-200 dark:border-dark-800 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-dark-850 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-800 dark:text-dark-100 tracking-tight">
          Purchase Orders
        </h1>
        <p className="text-xs text-slate-400 dark:text-dark-500 font-medium">
          Contracts and official purchasing orders issued to vendors.
        </p>
      </div>

      {/* POs Directory */}
      <Table
        headers={headers}
        data={purchaseOrders}
        loading={loading}
        emptyMessage="No purchase orders created yet. Authorize RFQs in the Approvals Inbox to generate orders."
      />

      {/* PO Details Modal */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title={`Purchase Order: ${selectedPo?.id}`}
      >
        {selectedPo && (
          <div className="space-y-6 text-xs leading-normal">
            
            {/* Upper Details block */}
            <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-100 dark:border-dark-800">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 dark:text-dark-550 uppercase">Vendor Supplier</span>
                <p className="font-bold text-slate-800 dark:text-dark-100 text-sm">{selectedPo.vendorName}</p>
                <p className="text-slate-500 dark:text-dark-400">ID: {selectedPo.vendorId}</p>
                <p className="text-slate-500 dark:text-dark-400 font-semibold mt-1">
                  GSTIN: <span className="font-bold text-slate-700 dark:text-dark-300">{selectedPo.vendorGstin}</span>
                </p>
              </div>
              <div className="space-y-1 text-right">
                <span className="text-[10px] font-bold text-slate-400 dark:text-dark-550 uppercase">PO details</span>
                <p className="text-slate-500 dark:text-dark-400">Issued: <span className="font-bold text-slate-800 dark:text-dark-200">{selectedPo.createdAt}</span></p>
                <p className="text-slate-500 dark:text-dark-400">
                  Place of Supply: <span className="font-bold text-slate-800 dark:text-dark-200">{selectedPo.placeOfSupply}</span>
                </p>
                <div className="pt-0.5">
                  <StatusBadge status={selectedPo.status} />
                </div>
              </div>
            </div>

            {/* Linked RFQ */}
            <div className="p-3 bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-850 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[9px] font-bold text-slate-400 uppercase">Linked Requirement Title</span>
                <p className="font-bold text-slate-700 dark:text-dark-300">{selectedPo.rfqTitle}</p>
              </div>
              <span className="text-[10px] font-semibold text-slate-450 dark:text-dark-500 uppercase">RFQ: {selectedPo.rfqId}</span>
            </div>

            {/* Items table */}
            <div className="space-y-2">
              <p className="font-bold text-slate-800 dark:text-dark-200">Bidded Line Items</p>
              <div className="rounded-xl border border-slate-150 dark:border-dark-800 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-dark-950/40 text-[9px] font-bold text-slate-400 dark:text-dark-500 border-b border-slate-150 dark:border-dark-800 uppercase">
                      <th className="px-4 py-2.5">Item Name</th>
                      <th className="px-4 py-2.5 w-24">HSN/SAC</th>
                      <th className="px-4 py-2.5 w-20 text-right">Qty</th>
                      <th className="px-4 py-2.5 w-24 text-right">Unit Rate</th>
                      <th className="px-4 py-2.5 w-24 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150 dark:divide-dark-800 text-slate-700 dark:text-dark-300">
                    {selectedPo.items.map((it, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/20">
                        <td className="px-4 py-2.5 font-semibold">{it.name}</td>
                        <td className="px-4 py-2.5 font-semibold text-slate-500">{it.hsnCode || '84713010'}</td>
                        <td className="px-4 py-2.5 text-right font-bold">{it.quantity}</td>
                        <td className="px-4 py-2.5 text-right font-medium">{formatIndianCurrency(it.unitPrice)}</td>
                        <td className="px-4 py-2.5 text-right font-bold">{formatIndianCurrency(it.quantity * it.unitPrice)}</td>
                      </tr>
                    ))}
                    {/* Sum cost rows (Subtotal -> GST -> Grand Total) */}
                    <tr className="bg-slate-50/10 text-slate-600 dark:text-dark-300">
                      <td colSpan="4" className="px-4 py-2 text-right font-semibold">Subtotal</td>
                      <td className="px-4 py-2 text-right font-bold">{formatIndianCurrency(selectedPo.subtotal)}</td>
                    </tr>
                    
                    {selectedPo.cgst > 0 && (
                      <>
                        <tr className="bg-slate-50/10 text-slate-600 dark:text-dark-300">
                          <td colSpan="4" className="px-4 py-1.5 text-right font-semibold">CGST (9%)</td>
                          <td className="px-4 py-1.5 text-right font-bold">{formatIndianCurrency(selectedPo.cgst)}</td>
                        </tr>
                        <tr className="bg-slate-50/10 text-slate-600 dark:text-dark-300">
                          <td colSpan="4" className="px-4 py-1.5 text-right font-semibold">SGST (9%)</td>
                          <td className="px-4 py-1.5 text-right font-bold">{formatIndianCurrency(selectedPo.sgst)}</td>
                        </tr>
                      </>
                    )}

                    {selectedPo.igst > 0 && (
                      <tr className="bg-slate-50/10 text-slate-600 dark:text-dark-300">
                        <td colSpan="4" className="px-4 py-1.5 text-right font-semibold">IGST (18%)</td>
                        <td className="px-4 py-1.5 text-right font-bold">{formatIndianCurrency(selectedPo.igst)}</td>
                      </tr>
                    )}

                    <tr className="bg-slate-50/30 font-bold text-slate-800 dark:text-dark-150 text-sm">
                      <td colSpan="4" className="px-4 py-3">Grand Total</td>
                      <td className="px-4 py-3 text-right text-base font-extrabold text-brand-600 dark:text-brand-400">
                        {formatIndianCurrency(selectedPo.totalCost)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Print/Download actions bar */}
            <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-dark-800 select-none">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePrint(selectedPo.id)}
                  title="Print Purchase Contract"
                  className="p-2 rounded-lg border border-slate-200 dark:border-dark-800 text-slate-500 hover:text-slate-800 dark:hover:text-dark-300 hover:bg-slate-50 dark:hover:bg-dark-850"
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleMail(selectedPo.id)}
                  title="Email to Vendor Contact"
                  className="p-2 rounded-lg border border-slate-200 dark:border-dark-800 text-slate-500 hover:text-brand-655 dark:hover:text-brand-400 hover:bg-slate-50 dark:hover:bg-dark-850"
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
                <button
                  onClick={() => handleDownload(selectedPo.id)}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white rounded-lg shadow-md transition-all active:scale-98"
                >
                  <Download className="w-4 h-4" />
                  <span>Download PDF</span>
                </button>
              </div>
            </div>

          </div>
        )}
      </Modal>

    </div>
  );
};

export default PurchaseOrders;
