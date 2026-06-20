import React, { useRef } from "react";
import { ShieldCheck, Printer, X, Landmark } from "lucide-react";

export default function ReceiptModal({ payout, worker, project, chain, onClose }) {
  const printAreaRef = useRef(null);

  // Find the ledger block for this payout to show the exact hash
  const payoutBlock = chain?.find(
    (b) => b.type === "PAYOUT" && b.data.txnId === payout.txnId
  );

  const handlePrint = () => {
    // Basic browser printing triggers print of window
    window.print();
  };

  const blockHash = payoutBlock?.hash || "0000000000000000000000000000000000000000000000000000000000000000";
  const prevHash = payoutBlock?.prevHash || "0000000000000000000000000000000000000000000000000000000000000000";
  const blockIndex = payoutBlock?.index !== undefined ? payoutBlock.index : "—";
  const timestamp = payoutBlock?.timestamp 
    ? new Date(payoutBlock.timestamp).toLocaleString("en-IN") 
    : new Date().toLocaleString("en-IN");

  return (
    <div className="fixed inset-0 bg-bitumen/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm no-print">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-bitumen/10 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-bitumen/10 pb-3 mb-4">
          <div className="flex items-center gap-1.5 text-tarp font-display text-sm">
            <Landmark size={18} />
            <span>Wage Receipt</span>
          </div>
          <button onClick={onClose} className="text-steel hover:text-bitumen">
            <X size={18} />
          </button>
        </div>

        {/* Printable Receipt Area */}
        <div 
          ref={printAreaRef} 
          className="flex-1 overflow-y-auto pr-1 bg-cement/20 border-2 border-dashed border-bitumen/20 p-5 rounded-xl font-mono text-xs text-bitumen receipt-card"
        >
          {/* Logo / Header */}
          <div className="text-center pb-4 border-b border-bitumen/10 mb-4">
            <h2 className="font-display text-base tracking-wider text-bitumen uppercase font-black">BUILDSAFE LEDGER</h2>
            <p className="text-[10px] text-steel">WAGE PROTECTION ON-CHAIN</p>
            <p className="text-[9px] text-steel mt-0.5">Verification Ref: BS-UPI-{payout.txnId.slice(-6)}</p>
          </div>

          {/* ArmorPay Stamp */}
          <div className="flex justify-center my-3">
            <div className="border-4 border-double border-tarp/80 text-tarp/80 rounded-lg px-4 py-1.5 rotate-[-2deg] font-display text-xs font-black flex items-center gap-1">
              <ShieldCheck size={14} />
              <span>ARMORPAY VERIFIED</span>
            </div>
          </div>

          {/* Details Table */}
          <div className="space-y-2.5 my-4">
            <div className="flex justify-between">
              <span className="text-steel">WORKER NAME:</span>
              <span className="font-bold">{worker.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-steel">WORKER ID:</span>
              <span className="font-semibold">{worker.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-steel">ROLE:</span>
              <span>{worker.role}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-steel">PROJECT / SITE:</span>
              <span className="max-w-[200px] text-right truncate">{project?.name || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-steel">DAILY WAGE:</span>
              <span>₹{worker.dailyWage} / day</span>
            </div>

            <hr className="border-bitumen/10 my-3" />

            <div className="flex justify-between text-sm font-bold bg-tarp/5 p-1.5 rounded">
              <span className="text-tarp">AMOUNT DISBURSED:</span>
              <span className="text-tarp">₹{payout.amount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-steel">PAYMENT METHOD:</span>
              <span>UPI (Instant Release)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-steel">TRANSACTION ID:</span>
              <span className="font-semibold">{payout.txnId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-steel">TIMESTAMP:</span>
              <span>{timestamp}</span>
            </div>

            <hr className="border-bitumen/10 my-3" />

            {/* Cryptographic Ledger Details */}
            <div className="space-y-1.5 bg-bitumen/5 p-3 rounded-lg text-[9px] leading-tight break-all text-steel">
              <p className="font-bold text-[10px] text-bitumen mb-1 font-display">LEDGER PROOF OF PAYMENT</p>
              <p>
                <span className="font-bold text-bitumen">BLOCK INDEX:</span> #{blockIndex}
              </p>
              <p>
                <span className="font-bold text-bitumen">BLOCK HASH:</span><br />
                {blockHash}
              </p>
              <p>
                <span className="font-bold text-bitumen">PREVIOUS HASH:</span><br />
                {prevHash}
              </p>
            </div>
          </div>

          {/* Barcode representation */}
          <div className="flex flex-col items-center pt-3 border-t border-bitumen/10 mt-4">
            {/* Styled barcode columns */}
            <div className="flex h-8 gap-[1px] items-center mb-1">
              {[3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 1, 2, 4, 2, 1, 3, 2, 1, 4, 3, 1, 2, 1].map((w, idx) => (
                <div key={idx} className="bg-bitumen h-full" style={{ width: `${w}px` }} />
              ))}
            </div>
            <span className="text-[8px] text-steel font-mono select-none tracking-widest">{blockHash.slice(0, 24).toUpperCase()}</span>
          </div>
        </div>

        {/* Footer actions */}
        <div className="mt-4 flex gap-3 border-t border-bitumen/10 pt-4 no-print">
          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-1.5 bg-tarp hover:bg-tarpLight text-white font-display text-xs py-2.5 rounded-xl hover:scale-[1.01] active:scale-[0.99] transition-all"
          >
            <Printer size={14} />
            <span>Print Receipt</span>
          </button>
          <button
            onClick={onClose}
            className="flex-1 flex items-center justify-center gap-1.5 bg-cement hover:bg-cement2 border border-bitumen/15 text-bitumen font-display text-xs py-2.5 rounded-xl hover:scale-[1.01] active:scale-[0.99] transition-all"
          >
            <span>Close</span>
          </button>
        </div>
      </div>
    </div>
  );
}
