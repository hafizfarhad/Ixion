import React, { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface LoginFormProps {
  // Any props can be added here if needed in the future
}

export default function LoginForm({}: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const response = await axios.post('http://localhost:5000/api/login', {
        email,
        password
      });
      
      localStorage.setItem('jwtToken', response.data.token);
      router.push('/dashboard');
    } catch (err) {
      setError('Invalid email or password');
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
          onChange={(e) => setPassword(e.target.value)}
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