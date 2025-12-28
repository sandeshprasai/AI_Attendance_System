import{Phone,User} from "lucide-react";
import InputGroup from "../ui/InputGroup";

export default function GuardianInfoSection ({ formData, handleInputChange, errors,loading, }) {

  return (
    <div className="bg-white p-6 rounded-xl shadow space-y-6">
      <h3 className="text-xl font-bold text-emerald-600 flex items-center gap-2">
        <User className="w-6 h-6" /> Guardian Information
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputGroup
          label="Guardian Name"
          name="GuardianName"
          type="text"
          value={formData.GuardianName}
          onChange={handleInputChange}
          Icon={User}
          error={errors?.GuardianName}
          disabled={loading}
          placeholder="Enter guardian's full name."
        />

        <InputGroup
          label="Guardian Phone"
          name="GuardianPhone"
          type="text"
          value={formData.GuardianPhone}
          onChange={handleInputChange}
          Icon={Phone}  
          error={errors?.GuardianPhone}
          disabled={loading}
          placeholder="Enter guardian's phone number."
        />  
        </div>
    </div>
  );
};
