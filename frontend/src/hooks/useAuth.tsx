import { useState, useEffect, createContext, useContext } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

// Define user type
export interface AuthUser {
  id: number;
  email: string;
  first_name?: string;
  last_name?: string;
  roles: string[];
  is_admin: boolean;
  permissions?: string[];
  mfa_enabled?: boolean;
}

// In browser environment, use the browser-specific API URL
const API_URL = typeof window !== 'undefined' 
  ? (process.env.NEXT_PUBLIC_BROWSER_API_URL || 'http://localhost:5000')
  : (process.env.NEXT_PUBLIC_API_URL || 'http://backend:5000');

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
  hasPermission: (permission: string) => boolean;
}

// Create the auth context with default values to prevent SSR errors
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  login: async () => { throw new Error('AuthContext not initialized') },
  logout: () => {},
  isAdmin: false,
  hasPermission: () => false
});

// AuthProvider component
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Check if the user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('jwtToken');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // Try to get user data from /api/iam/me endpoint
        const response = await axios.get(`${API_URL}/api/iam/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setUser(response.data);
      } catch (err) {
        console.error('Auth check failed:', err);
        // Fallback to stored user data if the endpoint fails
        try {
          const storedUserJson = localStorage.getItem('user');
          if (storedUserJson) {
            const storedUser = JSON.parse(storedUserJson);
            console.log('Using stored user data as fallback:', storedUser);
            setUser(storedUser);
          } else {
            // If we don't have stored user data, remove the token
            localStorage.removeItem('jwtToken');
          }
        } catch (parseErr) {
          console.error('Failed to parse stored user data:', parseErr);
          localStorage.removeItem('jwtToken');
        }
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(`${API_URL}/api/login`, { email, password });
      const { token, user } = response.data;
      
      // Store token first
      localStorage.setItem('jwtToken', token);
      
      // Set user data in state
      setUser(user);
      
      // Only redirect after user data is set
      setTimeout(() => {
        router.push('/dashboard');
      }, 100);
      
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Login failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('jwtToken');
    setUser(null);
    router.push('/login');
  };

  // Check if user is admin
  const isAdmin = user?.is_admin || user?.roles?.includes('admin') || false;

  // Check if user has specific permission
  const hasPermission = (permission: string) => {
    if (!user || !user.permissions) return false;
    return user.permissions.includes(permission);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      error, 
      login, 
      logout,
      isAdmin,
      hasPermission
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context - modified to be SSR-safe
export const useAuth = () => {
  const context = useContext(AuthContext);
  // Instead of throwing an error, return the context (which now has default values)
  return context;
};

export default useAuth;