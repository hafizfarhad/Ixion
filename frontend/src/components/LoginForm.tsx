import React, { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FormSubmitEvent, InputChangeEvent } from '@/types';

// In browser environment, use the browser-specific API URL
const API_URL = typeof window !== 'undefined' 
  ? (process.env.NEXT_PUBLIC_BROWSER_API_URL || 'http://localhost:5000')
  : (process.env.NEXT_PUBLIC_API_URL || 'http://backend:5000');

interface LoginFormProps {
  // Any props can be added here if needed in the future
}

export default function LoginForm({}: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: FormSubmitEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      console.log(`Attempting to login with API URL: ${API_URL}`);
      
      const response = await axios.post(`${API_URL}/api/login`, {
        email,
        password
      }, {
        // Add timeout and additional headers
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      console.log('Login response:', response.data);
      
      // Store the token in localStorage
      localStorage.setItem('jwtToken', response.data.token);
      
      // Also store basic user info for quick access
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Add a small delay before redirecting
      setTimeout(() => {
        router.push('/dashboard');
      }, 100);
    } catch (err) {
      console.error('Login error:', err);
      
      if (axios.isAxiosError(err)) {
        if (err.code === 'ECONNABORTED') {
          setError('Connection timeout. Please try again.');
        } else if (err.response) {
          // Server responded with an error status
          setError(err.response.data?.error || 'Invalid email or password');
        } else if (err.request) {
          // Request was made but no response received
          setError('Unable to reach the server. Please check your connection.');
        } else {
          setError('An error occurred during login. Please try again.');
        }
      } else {
        setError('An unexpected error occurred.');
      }
      
      setIsLoading(false);
    }
  };

  const handleEmailChange = (e: InputChangeEvent) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e: InputChangeEvent) => {
    setPassword(e.target.value);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="p-3 bg-red-900/30 border border-red-800 text-red-300 text-sm rounded-lg">
          {error}
        </div>
      )}
      
      <div>
        <label htmlFor="email" className="block mb-2 text-sm text-gray-300">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={handleEmailChange}
          placeholder="your@email.com"
          className="w-full p-3 border rounded-lg bg-[#252525] border-[#3d3d3d] text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
          required
        />
      </div>
      
      <div>
        <div className="flex justify-between mb-2">
          <label htmlFor="password" className="text-sm text-gray-300">
            Password
          </label>
          <Link href="/forgot-password" className="text-sm text-purple-400 hover:text-purple-300">
            Forgot password?
          </Link>
        </div>
        <input
          id="password"
          type="password"
          value={password}
          onChange={handlePasswordChange}
          placeholder="Password"
          className="w-full p-3 border rounded-lg bg-[#252525] border-[#3d3d3d] text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
          required
        />
      </div>
      
      <button
        type="submit"
        disabled={isLoading}
        className="w-full p-3 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors font-medium"
      >
        {isLoading ? 'Signing in...' : 'Sign in'}
      </button>
    </form>
  );
}