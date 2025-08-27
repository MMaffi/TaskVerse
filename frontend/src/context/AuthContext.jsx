import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));

  useEffect(() => {
    if (token) {
      // Aqui você pode buscar o usuário no backend se precisar
      const storedUserName = localStorage.getItem("userName");
      setUser({ name: storedUserName });
    }
  }, [token]);

  function login(userData, tokenData) {
    localStorage.setItem("token", tokenData);
    if (userData?.name) {
      localStorage.setItem("userName", userData.name);
    }
    setUser(userData);
    setToken(tokenData);
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    setUser(null);
    setToken(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}