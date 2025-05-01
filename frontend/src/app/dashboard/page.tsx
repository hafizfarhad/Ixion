'use client';
import React, { useEffect, useState } from 'react';
import nextDynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

// Create a loading component
const LoadingScreen = () => (
  <div className="flex items-center justify-center min-h-screen bg-[#1c1c1c]">
    <div className="flex flex-col items-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mb-4"></div>
      <p className="text-white">Loading your dashboard...</p>
    </div>
  </div>
);

// Create an error component
const ErrorScreen = ({ message, onRetry }: { message: string, onRetry: () => void }) => (
  <div className="flex items-center justify-center min-h-screen bg-[#1c1c1c]">
    <div className="text-center p-8 bg-[#252525] rounded-xl border border-[#3d3d3d] max-w-md">
      <h2 className="text-xl font-bold mb-4 text-red-400">Error Loading Dashboard</h2>
      <p className="text-white mb-6">{message}</p>
      <div className="flex space-x-4 justify-center">
        <button 
          onClick={onRetry}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
        >
          Try Again
        </button>
        <button 
          onClick={() => window.location.href = '/login'}
          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
        >
          Go to Login
        </button>
      </div>
    </div>
  </div>
);

// Dynamically import the real dashboard component with no SSR
const DashboardContent = nextDynamic(
  () => import('@/components/Dashboard/DashboardContent'),
  { 
    ssr: false,
    loading: () => <LoadingScreen />
  }
);

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Only run client-side
    if (typeof window !== 'undefined') {
      // Check for token directly
      const token = localStorage.getItem('jwtToken');
      
      // Add debugging
      console.log('Dashboard authentication check:');
      console.log('- Token exists:', !!token);
      console.log('- User state:', user);
      console.log('- Loading state:', loading);
      
      // Check authentication status
      if (!loading) {
        if (!token) {
          console.log('No authentication token found, redirecting to login');
          router.push('/login');
        } else {
          // If we have a token but no user object, try to create a basic one from localStorage
          if (!user) {
            try {
              const storedUser = localStorage.getItem('user');
              if (storedUser) {
                const parsedUser = JSON.parse(storedUser);
                console.log('Using stored user data:', parsedUser);
                setIsLoading(false);
              } else {
                console.log('No user data found, redirecting to login');
                router.push('/login');
              }
            } catch (e) {
              console.error('Error parsing stored user:', e);
              router.push('/login');
            }
          } else {
            console.log('User authenticated, loading dashboard');
            setIsLoading(false);
          }
        }
      }
    }
  }, [user, loading, router]);

  const handleRetry = () => {
    setError(null);
    setIsLoading(true);
    window.location.reload();
  };

  if (loading || isLoading) {
    return <LoadingScreen />;
  }

  if (error) {
    return <ErrorScreen message={error} onRetry={handleRetry} />;
  }

  return <DashboardContent />;
}

// Force dynamic rendering
export const dynamic = 'force-dynamic';