import { User, Mail, Phone, MapPin, Calendar, Hash } from "lucide-react";
import InputGroup from "../ui/InputGroup";

export default function PersonalInfoSection({ formData, handleInputChange, errors }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow space-y-6">
      <h3 className="text-xl font-bold text-emerald-600 flex items-center gap-2">
        <User className="w-6 h-6" /> Personal Information
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputGroup
          label="Full Name"
          name="FullName"
          type="text"
          value={formData.FullName}
          onChange={handleInputChange}
          Icon={User}
          error={errors?.FullName}
        />

        <InputGroup
          label="Roll Number"
          name="RollNo"
          type="text"
          value={formData.RollNo}
          onChange={handleInputChange}
          Icon={Hash}
          error={errors?.RollNo}
        />

        <InputGroup
          label="Date of Birth"
          name="DateOfBirth"
          type="date"
          value={formData.DateOfBirth}
          onChange={handleInputChange}
          Icon={Calendar}
          error={errors?.DateOfBirth}
        />

        <InputGroup
          label="Email"
          name="Email"
          type="email"
          value={formData.Email}
          onChange={handleInputChange}
          Icon={Mail}
          error={errors?.Email}
        />

        <InputGroup
          label="Phone"
          name="Phone"
          type="text"
          value={formData.Phone}
          onChange={handleInputChange}
          Icon={Phone}
          error={errors?.Phone}
        />

        <div className="md:col-span-2">
          <label className="text-sm font-bold flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-600" />
            Full Address
          </label>
          <textarea
            name="FullAddress"
            value={formData.FullAddress}
            onChange={handleInputChange}
            className="w-full border-2 rounded-xl p-3"
          />
          {errors?.FullAddress && (
            <p className="text-red-500 text-sm mt-1">{errors.FullAddress}</p>
          )}
        </div>
      </div>
    </div>
  );
}