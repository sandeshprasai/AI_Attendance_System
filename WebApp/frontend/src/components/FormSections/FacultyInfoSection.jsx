import { GraduationCap, Hash, Calendar, BookOpen, Briefcase } from "lucide-react";
import InputGroup from "../ui/InputGroup";

export default function FacultyInfoSection({ formData, handleInputChange, errors, loading }) {
     const currentYear=new Date().getFullYear();
  return (
    <div className="bg-white p-6 rounded-xl shadow space-y-6">
      <h3 className="text-xl font-bold text-cyan-600 flex items-center gap-2">
        <GraduationCap className="w-6 h-6" /> Faculty Information
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Employee ID */}
        <InputGroup
          label="Employee ID"
          name="EmployeeId"
          type="text"
          value={formData.EmployeeId}
          onChange={handleInputChange}
          Icon={Hash}
          error={errors?.EmployeeId}
          disabled={loading}
          placeholder="Enter employee ID"
        />

        {/* Faculty Selection Dropdown */}
        <div className="space-y-1">
          <label className="text-sm font-bold flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-emerald-600" />
            Faculty
          </label>
          <select
            name="Faculty"
            value={formData.Faculty}
            onChange={handleInputChange}
            disabled={loading}
            className={`w-full h-12 px-4 border-2 rounded-xl focus:outline-none ${
              errors?.Faculty
                ? "border-red-500 focus:border-red-500"
                : "border-emerald-400 focus:border-emerald-600"
            }`}
          >
            <option value="">Select Faculty</option>
            <option value="Civil Engineering">Civil Engineering</option>
            <option value="Computer Engineering">Computer Engineering</option>
            <option value="IT Engineering">IT Engineering</option>
            <option value="Electronics & Communication">Electronics & Communication</option>
            <option value="BBA">BBA</option>
            <option value="Architecture">Architecture</option>
            
          </select>
          {errors?.Faculty && (
            <p className="text-red-500 text-sm">{errors.Faculty}</p>
          )}
        </div>
        {/* Joined Year */}

       
            <InputGroup
              label="Joined Year"
              name="JoinedYear"
              type="number"
              value={formData.JoinedYear}
              onChange={handleInputChange}
              Icon={Calendar}
              error={errors?.JoinedYear}
              disabled={loading}
              placeholder={`Year must be between 2010 and ${currentYear}.`}
            />

        {/* Subjects Selection Dropdown */}
        <div className="space-y-1">
          <label className="text-sm font-bold flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-emerald-600" />
            Subject
          </label>
          <select
            name="Subject"
            value={formData.Subject}
            onChange={handleInputChange}
            disabled={loading}
            className={`w-full h-12 px-4 border-2 rounded-xl focus:outline-none ${
              errors?.Subject
                ? "border-red-500 focus:border-red-500"
                : "border-emerald-400 focus:border-emerald-600"
            }`}
          >
            <option value="">Select Subject</option>
            <option value="Mathematics">Mathematics</option>
            <option value="Physics">Physics</option>
            <option value="Chemistry">Chemistry</option>
            <option value="Operating System">Operating System</option>
            <option value="English">English</option>
            <option value="DSA">DSA</option>
            <option value="ICT PM">ICT PM</option>
            <option value="OOP in C++">OOP in C++</option>
            <option value="Economics">Economics</option>
            <option value="SPIT">SPIT</option>
            <option value="Cloud Computing">Cloud Computing</option>
            <option value="Programming in C">Programming in C</option>  
          </select>
          {errors?.Subject && (
            <p className="text-red-500 text-sm">{errors.Subject}</p>
          )}
        </div>
      </div>
    </div>
  );
}