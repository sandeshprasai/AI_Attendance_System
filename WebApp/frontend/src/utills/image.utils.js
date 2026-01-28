const API_URL = import.meta.env.VITE_API_URL;

export const getUserImageURL = (filename) => {
  if (!filename) return "/default-avatar.png";
  if (filename.startsWith("http")) return filename;
  return `${API_URL}public/${filename}`;
};

export const fetchUserImage = async (filename) => {
  if (!filename) return "/default-avatar.png";

  try {
    const res = await fetch(`${API_URL}public/${filename}`);
    const blob = await res.blob();
    return URL.createObjectURL(blob);
  } catch {
    return "/default-avatar.png";
  }
};