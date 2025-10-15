// src/context/AuthContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import axios from "axios";
import config from '../config/env.ts';


interface AuthContextType {
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = () => {
      const savedToken = localStorage.getItem("token");
      
      if (savedToken) {
        setToken(savedToken);
      }
      
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = (token: string) => {
    localStorage.setItem("token", token);
    setToken(token);
  };

  const logout = async (): Promise<void> => {
    const currentToken = token || localStorage.getItem("token");
    
    try {
      if (currentToken) {
        await axios.post(`${config.API_BASE_URL}/auth/logout/`, {}, {
          headers: {
            Authorization: `Token ${currentToken}`,
          },
        });
      }
    } catch (error) {
      console.error("Logout API call failed, but continuing with client-side logout:", error);
    } finally {
      localStorage.removeItem("token");
      setToken(null);
    }
  };

  return (
    <AuthContext.Provider value={{ token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};