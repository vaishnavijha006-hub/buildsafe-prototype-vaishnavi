import React, { useEffect } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export default function Toast({ message, type = "success", onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3500);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: <CheckCircle2 className="text-tarp" size={16} />,
    error: <AlertCircle className="text-rust" size={16} />,
    info: <Info className="text-steel" size={16} />,
  };

  const colors = {
    success: "border-tarp/30 bg-tarp/5 text-tarp",
    error: "border-rust/30 bg-rust/5 text-rust",
    info: "border-steel/30 bg-cement text-bitumen",
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl border shadow-lg animate-bounce-short font-mono text-xs max-w-sm bg-white border-bitumen/10">
      <div className={`flex items-center gap-2 ${colors[type] || colors.success} px-2 py-1 rounded-lg`}>
        {icons[type] || icons.success}
      </div>
      <span className="text-bitumen font-medium">{message}</span>
      <button onClick={onClose} className="text-steel hover:text-bitumen ml-2">
        <X size={14} />
      </button>
    </div>
  );
}
