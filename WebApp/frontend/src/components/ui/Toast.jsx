import { useEffect } from "react";

const Toast = ({ message, type = "success", onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-24 right-6 z-50 animate-slide-in">
      <div
        className={`px-6 py-4 rounded-xl shadow-lg flex items-center justify-between text-white ${
          type === "success"
            ? "bg-emerald-600"
            : type === "error"
            ? "bg-red-600"
            : "bg-amber-500"
        }`}
      >
        <span>{message}</span>
        <button
          onClick={onClose}
          className="ml-4 font-bold text-xl leading-none hover:opacity-80"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default Toast;