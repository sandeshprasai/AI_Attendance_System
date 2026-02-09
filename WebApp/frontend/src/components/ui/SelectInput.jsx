import React from "react";

const SelectInput = ({
  label,
  name,
  value,
  onChange,
  options,
  placeholder,
  Icon,
  error,
  disabled,
  loading,
  required,
}) => {
  return (
    <div className="space-y-1">
      <label className="text-sm font-bold flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4 text-cyan-600" />}
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>

      <select
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled || loading}
        className={`w-full h-12 px-4 border-2 rounded-xl focus:outline-none ${
          error
            ? "border-red-500 focus:border-red-500"
            : "border-cyan-400 focus:border-cyan-600"
        } ${disabled || loading ? "bg-gray-100 cursor-not-allowed" : ""}`}
      >
        <option value="">
          {loading ? "Loading..." : placeholder || `Select ${label}`}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
};

export default SelectInput;
