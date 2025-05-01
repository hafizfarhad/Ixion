import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { HeaderProps } from '@/types';

export default function Header({ showSignIn = false, showSignUp = false, showLogout = false, userName }: HeaderProps) {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('jwtToken');
    router.push('/login');
  };

  return (
    <header className="border-b border-[#3d3d3d] py-5 px-6">
      <div className="flex justify-between items-center">
        <div>
          <Link href="/" className="font-bold text-xl text-white">
            Ixion
          </Link>
        </div>

        {/* Desktop navigation */}
        <div className="hidden md:flex items-center space-x-4">
          {userName && (
            <span className="text-gray-400 text-sm mr-2">Hello {userName}</span>
          )}
          
          {showSignIn && (
            <Link href="/login" className="primary-button">
              Sign in
            </Link>
          )}
          
          {showSignUp && (
            <Link href="/signup" className="secondary-button">
              Sign up
            </Link>
          )}
          
          {showLogout && (
            <button onClick={handleLogout} className="secondary-button">
              Log out
            </button>
          )}
        </div>

        {/* Mobile menu button */}
        <button 
          className="md:hidden text-gray-400 hover:text-white"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden mt-4 pt-4 border-t border-[#3d3d3d]">
          {userName && (
            <p className="text-gray-400 text-sm mb-3">Hello {userName}</p>
          )}
          
          {showSignIn && (
            <Link href="/login" className="block py-2 text-white hover:text-purple-400">
              Sign in
            </Link>
          )}
          
          {showSignUp && (
            <Link href="/signup" className="block py-2 text-white hover:text-purple-400">
              Sign up
            </Link>
          )}
          
          {showLogout && (
            <button 
              onClick={handleLogout} 
              className="block w-full text-left py-2 text-white hover:text-purple-400"
            >
              Log out
            </button>
          )}
        </div>
      )}
    </header>
  );
}