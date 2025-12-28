import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const defaultUser = {
    name: "Admin User",
    username: "adminuser",
    role: "Administrator",
    photoURL:
      "https://www.wisden.com/static-assets/images/players/3993.png?v=23.77",
  };

  const [user, setUser] = useState(defaultUser);

  useEffect(() => {
    const storedUsername =
      localStorage.getItem("username") ||
      sessionStorage.getItem("username");

    const storedRole =
      localStorage.getItem("role") ||
      sessionStorage.getItem("role");

    const storedPhotoURL =
      localStorage.getItem("ProfileImageURL") ||
      sessionStorage.getItem("ProfileImageURL");

    const storedName =
      localStorage.getItem("name") ||
      sessionStorage.getItem("name");

    if (storedUsername) {
      setUser({
        name: storedName || defaultUser.name,
        username: storedUsername,
        role: storedRole || defaultUser.role,
        photoURL: storedPhotoURL || defaultUser.photoURL,
      });
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}