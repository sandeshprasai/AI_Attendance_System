import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronDown } from 'lucide-react';

// Reusable Multi-Select Component
const MultiSelect = ({ 
  label, 
  name, 
  value = [], 
  onChange, 
  options = [], 
  error, 
  disabled, 
  Icon,
  placeholder = "Select options"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = (optionValue) => {
    const newValue = value.includes(optionValue)
      ? value.filter(v => v !== optionValue)
      : [...value, optionValue];
    
    onChange({ target: { name, value: newValue } });
  };

  const handleRemove = (optionValue, e) => {
    e.stopPropagation();
    const newValue = value.filter(v => v !== optionValue);
    onChange({ target: { name, value: newValue } });
  };

  const getDisplayText = () => {
    if (value.length === 0) return placeholder;
    if (value.length === 1) return value[0];
    return `${value.length} selected`;
  };

  return (
    <div className="space-y-1" ref={dropdownRef}>
      <label className="text-sm font-bold flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4 text-emerald-600" />}
        {label}
      </label>
      
      <div className="relative">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`w-full h-12 px-4 border-2 rounded-xl focus:outline-none flex items-center justify-between ${
            error
              ? "border-red-500 focus:border-red-500"
              : "border-emerald-400 focus:border-emerald-600"
          } ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white cursor-pointer'}`}
        >
          <span className={value.length === 0 ? 'text-gray-400' : 'text-gray-900'}>
            {getDisplayText()}
          </span>
          <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border-2 border-emerald-400 rounded-xl shadow-lg max-h-60 overflow-y-auto">
            {options.length === 0 ? (
              <div className="px-4 py-3 text-gray-500 text-center">No options available</div>
            ) : (
              options.map((option) => (
                <div
                  key={option}
                  onClick={() => handleToggle(option)}
                  className={`px-4 py-3 cursor-pointer hover:bg-emerald-50 flex items-center gap-2 ${
                    value.includes(option) ? 'bg-emerald-100' : ''
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={value.includes(option)}
                    onChange={() => {}}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <span className="flex-1">{option}</span>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Selected Items Display */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {value.map((item) => (
            <span
              key={item}
              className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm"
            >
              {item}
              <button
                type="button"
                onClick={(e) => handleRemove(item, e)}
                className="hover:bg-emerald-200 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
};

export default MultiSelect;