import ImageUploader from "../ui/ImageUploader";
import { User } from "lucide-react";

export default function ProfilePhotoSection({ imagePreview, handleImageUpload, removeImage, error }) {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
      <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-cyan-100 flex items-center justify-center">
          <User className="w-4 h-4 text-cyan-600" />
        </div>
        Profile Photo
      </h3>

      <ImageUploader
        imagePreview={imagePreview}
        onUpload={handleImageUpload}
        onRemove={removeImage}
      />

      {error && (
        <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
          <span className="font-bold">⚠</span> {error}
        </p>
      )}
    </div>
  );
}