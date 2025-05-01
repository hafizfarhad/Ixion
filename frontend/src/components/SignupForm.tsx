import React, { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { FormSubmitEvent, InputChangeEvent } from '@/types';

interface SignupFormProps {
  isAdminSetup?: boolean;
}

// In browser environment, use the browser-specific API URL
const API_URL = typeof window !== 'undefined' 
  ? (process.env.NEXT_PUBLIC_BROWSER_API_URL || 'http://localhost:5000')
  : (process.env.NEXT_PUBLIC_API_URL || 'http://backend:5000');

export default function SignupForm({ isAdminSetup = false }: SignupFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: FormSubmitEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMessage('');
    
    // Validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }
    
    try {
      // Use consistent URL format whether in production or development
      const registerUrl = `${API_URL}/api/register`;
        
      console.log(`Attempting to register at: ${registerUrl}`);
      
      const response = await axios.post(registerUrl, {
        email,
        password,
        role: isAdminSetup ? 'admin' : 'user', // Set role based on whether this is initial setup
        isInitialSetup: isAdminSetup // Let the backend know this is the initial admin setup
      });
      
      if (isAdminSetup) {
        setSuccessMessage('Administrator account created successfully! Redirecting to login...');
      } else {
        setSuccessMessage('Account created successfully! Redirecting to login...');
      }
      
      // Redirect to login after a short delay
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err) {
      console.error('Registration error:', err);
      if (axios.isAxiosError(err) && err.response?.status === 409) {
        setError('User already exists with this email');
      } else if (axios.isAxiosError(err) && err.response?.status === 403) {
        setError('Initial setup has already been completed. Please contact an administrator.');
      } else {
        const errorMessage = axios.isAxiosError(err) ? err.response?.data?.error : 'Something went wrong';
        setError(errorMessage || 'Failed to create account');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="p-3 bg-red-900/30 border border-red-800 text-red-300 text-sm rounded-lg">
          {error}
        </div>
      )}
      
      {successMessage && (
        <div className="p-3 bg-green-900/30 border border-green-800 text-green-300 text-sm rounded-lg">
          {successMessage}
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
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="w-full p-3 border rounded-lg bg-[#252525] border-[#3d3d3d] text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
          required
        />
      </div>
      
      <div>
        <label htmlFor="password" className="block mb-2 text-sm text-gray-300">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full p-3 border rounded-lg bg-[#252525] border-[#3d3d3d] text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
          required
          minLength={6}
        />
        <p className="text-xs text-gray-500 mt-1">Must be at least 6 characters long</p>
      </div>
      
      <div>
        <label htmlFor="confirm-password" className="block mb-2 text-sm text-gray-300">
          Confirm Password
        </label>
        <input
          id="confirm-password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm Password"
          className="w-full p-3 border rounded-lg bg-[#252525] border-[#3d3d3d] text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
          required
        />
      </div>
      
      <button
        type="submit"
        disabled={isLoading}
        className="w-full p-3 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors font-medium"
      >
        {isLoading 
          ? isAdminSetup ? 'Creating admin account...' : 'Creating account...' 
          : isAdminSetup ? 'Create administrator account' : 'Create account'
        }
      </button>
    </form>
  );
}