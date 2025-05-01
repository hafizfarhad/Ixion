import { useState, useEffect } from 'react';
import jwtDecode from 'jwt-decode';

interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  roles: string[];
  is_admin: boolean;
}

interface DecodedToken {
  user_id: string;
  email: string;
  roles: string[];
  is_admin: boolean;
  exp: number; // Expiration timestamp
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Check for token in localStorage
    const token = localStorage.getItem('jwtToken');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      try {
        // Parse the stored user
        const parsedUser = JSON.parse(storedUser) as User;
        setUser(parsedUser);
        
        // Check token expiration
        const decoded = jwtDecode(token) as DecodedToken;
        const isExpired = decoded.exp * 1000 < Date.now();
        
        if (isExpired) {
          console.log('Token has expired, clearing auth state');
          localStorage.removeItem('jwtToken');
          localStorage.removeItem('user');
          setUser(null);
        }
      } catch (error) {
        console.error('Error processing auth data:', error);
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('user');
        setUser(null);
      }
    }
    
    setLoading(false);
  }, []);
  
  return { user, loading, isAuthenticated: !!user };
}
