import React from 'react';
import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="border-t border-[#3d3d3d] pt-4 pb-8 px-6 mt-auto">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <Link href="/" className="font-medium text-gray-400 hover:text-white">
              Ixion
            </Link>
          </div>
          
          <div className="text-sm text-gray-500">
            © {currentYear} Ixion Security. All rights reserved.
          </div>
          
          <div className="mt-4 md:mt-0 flex space-x-4">
            <Link href="/privacy" className="text-sm text-gray-400 hover:text-white">
              Privacy policy
            </Link>
            <Link href="/terms" className="text-sm text-gray-400 hover:text-white">
              Terms of use
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}