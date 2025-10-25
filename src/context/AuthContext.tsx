// src/context/AuthContext.tsx
import { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";
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
  const isLoggingOutRef = useRef(false);

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
      isLoggingOutRef.current = true;
      if (currentToken) {
        await axios.post(`${config.API_BASE_URL}/v1/auth/logout/`, {}, {
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
      isLoggingOutRef.current = false;
    }
  };

  // Global axios interceptor to auto-logout on auth failures
  useEffect(() => {
    const respInterceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const status = error?.response?.status;
        const url: string = error?.config?.url || "";
        // Avoid loops by ignoring logout endpoint itself
        if (url.includes('/v1/auth/logout/')) {
          return Promise.reject(error);
        }
        // 401 Unauthorized or 403 Forbidden => token invalid/expired
        if (status === 401 || status === 403) {
          if (!isLoggingOutRef.current) {
            // Perform client-side logout without calling API again to prevent loops
            isLoggingOutRef.current = true;
            localStorage.removeItem('token');
            setToken(null);
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(respInterceptor);
    };
  }, [token]);

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