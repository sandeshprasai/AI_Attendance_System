import { useEffect } from "react";
import { CheckCircle, AlertTriangle, X } from "lucide-react";

export default function Toast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, []);

  const Icon = type === "success" ? CheckCircle : AlertTriangle;
  const bg = type === "success" ? "bg-emerald-600" : "bg-red-500";

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-slideIn">
      <div className={`${bg} text-white px-6 py-4 rounded-xl flex items-center gap-3`}>
        <Icon className="w-5 h-5" />
        <p>{message}</p>
        <button onClick={onClose}>
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}