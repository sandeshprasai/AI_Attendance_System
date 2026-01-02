import InputGroup from "../ui/InputGroup";
import { Building2, Calendar, GraduationCap, Hash } from "lucide-react";

export default function AcademicInfoSection({
  formData,
  handleInputChange,
  facultyOptions,
  errors,
  loading,
  facultyLoading = false,
}) {
  return (
    <div className="bg-white p-6 rounded-xl shadow space-y-6">
      <h3 className="text-xl font-bold text-cyan-600 flex items-center gap-2">
        <Building2 className="w-6 h-6" />
        Academic Information
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Faculty */}
        <div className="space-y-1">
          <label className="text-sm font-bold">Faculty</label>
          <select
            name="Faculty"
            value={formData.Faculty}
            onChange={handleInputChange}
            disabled={loading || facultyLoading}
            className={`w-full h-12 border-2 rounded-xl p-2 focus:outline-none ${
              errors?.Faculty
                ? "border-red-500"
                : "border-emerald-400 focus:border-emerald-600"
            }`}
          >
            <option value="">
              {facultyLoading ? "Loading faculties..." : "Select Faculty"}
            </option>

            {facultyOptions.map((faculty, index) => (
              <option key={index} value={faculty}>
                {faculty}
              </option>
            ))}
          </select>

          {errors?.Faculty && (
            <p className="text-red-500 text-sm mt-1">
              {errors.Faculty}
            </p>
          )}
        </div>

        {/* Roll Number */}
        <InputGroup
          label="Roll Number"
          name="RollNo"
          type="text"
          value={formData.RollNo}
          onChange={handleInputChange}
          Icon={Hash}
          error={errors?.RollNo}
          disabled={loading}
          placeholder="Enter your class roll number."
        />

        {/* Enrollment Year */}
        <InputGroup
          label="Enrollment Year"
          name="YearOfEnrollment"
          type="text"
          value={formData.YearOfEnrollment}
          onChange={handleInputChange}
          Icon={Calendar}
          error={errors?.YearOfEnrollment}
          disabled={loading}
          placeholder="Enter enrollment year."
        />

        {/* Class */}
        <InputGroup
          label="Class"
          name="Class"
          type="text"
          value={formData.Class}
          onChange={handleInputChange}
          Icon={GraduationCap}
          error={errors?.Class}
          disabled={loading}
          placeholder="Enter classroom number."
        />

        {/* Section */}
        <InputGroup
          label="Section"
          name="Section"
          type="text"
          value={formData.Section}
          onChange={handleInputChange}
          Icon={Hash}
          error={errors?.Section}
          disabled={loading}
          placeholder="Enter section."
        />

        {/* University Registration */}
        <InputGroup
          label="University Reg No."
          name="UniversityReg"
          type="text"
          value={formData.UniversityReg}
          onChange={handleInputChange}
          Icon={Hash}
          error={errors?.UniversityReg}
          disabled={loading}
          placeholder="Enter university registration number."
        />
      </div>
    </div>
  );
}
