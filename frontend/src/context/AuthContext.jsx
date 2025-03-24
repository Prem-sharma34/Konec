import { createContext, useState, useEffect } from "react";
import { auth, logout } from "../utils/firebase"; 
import { onAuthStateChanged } from "firebase/auth";

// Create Context
const AuthContext = createContext(null);

// Provider Component
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Listen for authentication state changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, []);

  return (
    <AuthContext.Provider value={{ user, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
