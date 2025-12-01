import InputGroup from "../ui/InputGroup";
import { Building2, Calendar, GraduationCap, Hash } from "lucide-react";

export default function AcademicInfoSection({ formData, handleInputChange, facultyOptions, errors }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow space-y-6">
      <h3 className="text-xl font-bold text-cyan-600 flex items-center gap-2">
        <Building2 className="w-6 h-6" />
        Academic Information
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="text-sm font-bold">Faculty</label>
          <select
            name="Faculty"
            value={formData.Faculty}
            onChange={handleInputChange}
            className="w-full h-12 border-2 rounded-xl p-2"
          >
            <option value="">Select Faculty</option>
            {facultyOptions.map(f => <option key={f}>{f}</option>)}
          </select>
          {errors?.Faculty && <p className="text-red-500 text-sm mt-1">{errors.Faculty}</p>}
        </div>

        <InputGroup
          label="Enrollment Year"
          name="YearOfEnrollment"
          type="text"
          value={formData.YearOfEnrollment}
          onChange={handleInputChange}
          Icon={Calendar}
          error={errors?.YearOfEnrollment}
        />

        <InputGroup
          label="Class"
          name="Class"
          type="text"
          value={formData.Class}
          onChange={handleInputChange}
          Icon={GraduationCap}
          error={errors?.Class}
        />

        <InputGroup
          label="Section"
          name="Section"
          type="text"
          value={formData.Section}
          onChange={handleInputChange}
          Icon={Hash}
          error={errors?.Section}
        />

        <InputGroup
          label="University Reg No."
          name="UniversityReg"
          type="text"
          value={formData.UniversityReg}
          onChange={handleInputChange}
          Icon={Hash}
          error={errors?.UniversityReg}
        />
      </div>
    </div>
  );
}