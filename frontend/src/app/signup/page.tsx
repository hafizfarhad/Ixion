'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import SignupForm from '@/components/SignupForm';

// Get the API URL from environment or use a default
// In Docker environment, use backend service name instead of localhost
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://backend:5000';

export default function SignUp() {
  const [isFirstUser, setIsFirstUser] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  // Check if this is the first user registration (system setup)
  useEffect(() => {
    const checkInitialSetup = async () => {
      try {
        const response = await fetch(`${API_URL}/api/system/status`);
        const data = await response.json();
        
        if (data.hasUsers) {
          // If system already has users, redirect to login
          router.push('/login?message=Registration+is+only+available+for+initial+setup');
        } else {
          // This is the first user - they will become admin
          setIsFirstUser(true);
        }
      } catch (err) {
        console.error('Error checking system status:', err);
        setError('Unable to determine if this is initial system setup.');
      } finally {
        setIsLoading(false);
      }
    };

    checkInitialSetup();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-[#1c1c1c] text-white">
        <div className="w-full max-w-md p-8 space-y-8 bg-[#252525] rounded-xl border border-[#3d3d3d] shadow-lg">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
          <p className="text-center">Checking system status...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-[#1c1c1c] text-white">
        <div className="w-full max-w-md p-8 space-y-8 bg-[#252525] rounded-xl border border-[#3d3d3d] shadow-lg">
          <div className="text-center">
            <h2 className="text-xl font-bold text-red-400">Error</h2>
            <p className="mt-2">{error}</p>
            <Link 
              href="/login"
              className="mt-4 inline-block px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!isFirstUser) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-[#1c1c1c] text-white">
        <div className="w-full max-w-md p-8 space-y-8 bg-[#252525] rounded-xl border border-[#3d3d3d] shadow-lg">
          <div className="text-center">
            <h2 className="text-xl font-bold">Registration Restricted</h2>
            <p className="mt-2">User registration is only available during initial system setup or by admin invitation.</p>
            <p className="mt-2">Please contact your system administrator or use an invitation link.</p>
            <Link 
              href="/login"
              className="mt-4 inline-block px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-[#1c1c1c] text-white">
      <div className="w-full max-w-md p-8 space-y-8 bg-[#252525] rounded-xl border border-[#3d3d3d] shadow-lg">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Initial System Setup</h1>
          <p className="mt-2 text-gray-400">Create the administrator account for your IAM system</p>
        </div>
        
        <SignupForm isAdminSetup={true} />
        
        <div className="text-center text-sm">
          <p className="text-gray-500">Already have an account?{' '}
            <Link href="/login" className="text-purple-400 hover:text-purple-300">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}