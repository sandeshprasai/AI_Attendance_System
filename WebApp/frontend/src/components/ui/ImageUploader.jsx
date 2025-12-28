import { Upload, X } from "lucide-react";

export default function ImageUploader({ imagePreview, onUpload, onRemove }) {
  return (
    <div className="flex flex-col items-center space-y-3">
      {imagePreview ? (
        <div className="relative group">
          <img
            src={imagePreview}
            className="w-40 h-40 rounded-full object-cover border-4 border-cyan-400"
          />

          <button
            onClick={onRemove}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <label className="w-40 h-40 border-2 border-dashed border-cyan-400 rounded-full flex flex-col items-center justify-center cursor-pointer">
          <Upload className="w-10 h-10 text-cyan-500" />
          <span className="text-xs text-cyan-500">Upload</span>
          <input type="file" className="hidden" onChange={onUpload} />
        </label>
      )}
    </div>
  );
}