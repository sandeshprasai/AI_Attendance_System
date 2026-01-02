import { Briefcase } from "lucide-react";

export default function FacultySelect({
  value,
  onChange,
  options,
  error,
  disabled,
  loading,
}) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-bold flex items-center gap-2">
        <Briefcase className="w-4 h-4 text-emerald-600" />
        Faculty
      </label>

      <select
        name="Faculty"
        value={value}
        onChange={onChange}
        disabled={disabled || loading}
        className={`w-full h-12 px-4 border-2 rounded-xl focus:outline-none ${
          error
            ? "border-red-500"
            : "border-emerald-400 focus:border-emerald-600"
        }`}
      >
        <option value="">
          {loading ? "Loading faculties..." : "Select Faculty"}
        </option>

        {options.map((fac, index) => (
          <option key={index} value={fac}>
            {fac}
          </option>
        ))}
      </select>

      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
}
