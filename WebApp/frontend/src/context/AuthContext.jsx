import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const defaultUser = {
    id: null,
    name: "Admin User",
    username: "adminuser",
    role: "Administrator",
    photoURL:
      "https://www.wisden.com/static-assets/images/players/3993.png?v=23.77",
  };

  const [user, setUser] = useState(defaultUser);

  useEffect(() => {
    const loadUserData = async () => {
      const storedUserId =
        localStorage.getItem("userId") ||
        sessionStorage.getItem("userId");

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
        // If userId is missing, try to fetch it from the backend
        let userId = storedUserId;
        
        if (!userId && storedUsername && storedRole) {
          try {
            // Try to get user ID from backend based on username and role
            const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
            if (token) {
              const API_URL = import.meta.env.VITE_API_URL;
              const response = await fetch(`${API_URL}api/v1/auth/me`, {
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              });
              
              if (response.ok) {
                const data = await response.json();
                userId = data.user?.id || data.user?._id;
                
                // Store the userId for future use
                const storage = localStorage.getItem("accessToken") ? localStorage : sessionStorage;
                if (userId) {
                  storage.setItem("userId", userId);
                }
              }
            }
          } catch (error) {
            console.warn("Could not fetch user ID from backend:", error);
          }
        }

        setUser({
          id: userId || defaultUser.id,
          name: storedName || defaultUser.name,
          username: storedUsername,
          role: storedRole || defaultUser.role,
          photoURL: storedPhotoURL || defaultUser.photoURL,
        });
      }
    };

    loadUserData();
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