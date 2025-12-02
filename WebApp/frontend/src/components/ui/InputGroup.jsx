import React from "react";

const InputGroup = ({ label, name, type, value, onChange, placeholder, Icon, error,disabled, }) => {
  return (
    <div className="space-y-1">
      <label className="text-sm font-bold flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4 text-emerald-600" />}
        {label}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled} 
        placeholder={placeholder}
        className={`w-full h-12 px-4 border-2 rounded-xl focus:outline-none ${
          error ? "border-red-500 focus:border-red-500" : "border-emerald-400 focus:border-emerald-600"
        }`
        
      }
      />

      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
};

export default InputGroup;