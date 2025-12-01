import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
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
      localStorage.getItem("username") || sessionStorage.getItem("username");
    const storedRole =
      localStorage.getItem("role") || sessionStorage.getItem("role");
    const storedPhoto =
      localStorage.getItem("ProfileImagePath") ||
      sessionStorage.getItem("ProfileImagePath");
    const storedName =
      localStorage.getItem("name") || sessionStorage.getItem("name");

    if (storedUsername) {
      setUser({
        name: storedName,
        username: storedUsername,
        role: storedRole || "Administrator",
        photoURL: storedPhoto
          ? `http://localhost:9000/public/${storedPhoto}`
          : defaultUser.photoURL,
      });
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);