import ImageUploader from "../ui/ImageUploader";
import { User } from "lucide-react";

export default function ProfilePhotoSection({ imagePreview, handleImageUpload, removeImage, error }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow space-y-4">
      <h3 className="text-xl font-bold text-cyan-600 flex items-center gap-2">
        <User className="w-6 h-6" /> Profile Photo
      </h3>

      <ImageUploader
        imagePreview={imagePreview}
        onUpload={handleImageUpload}
        onRemove={removeImage}
      />

      {error && (
        <p className="text-red-500 text-sm mt-1">
          {error}
        </p>
      )}
    </div>
  );
}