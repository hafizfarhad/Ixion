import axios from 'axios';

// Always use localhost when in browser context
const API_URL = typeof window !== 'undefined' 
  ? 'http://localhost:5000' 
  : (process.env.NEXT_PUBLIC_API_URL || 'http://backend:5000');

const authService = {
  login: async (email: string, password: string) => {
    const response = await axios.post(`${API_URL}/api/login`, {
      email,
      password
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.data.token) {
      localStorage.setItem('jwtToken', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  },
  
  logout: () => {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('user');
  },
  
  isAuthenticated: () => {
    return !!localStorage.getItem('jwtToken');
  },
  
  getToken: () => {
    return localStorage.getItem('jwtToken');
  }
};

export default authService;
