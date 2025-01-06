'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

const Navbar = () => {
  const pathname = usePathname();
  
  const isActive = (path: string) => pathname === path;

  return (
    <nav className="bg-white shadow mb-4">
      <div className="mx-auto px-4">
        <div className="flex h-16 items-center justify-start space-x-4">
          <Link href="/" 
                className={`px-3 py-2 rounded-md ${isActive('/') ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-100'}`}>
            Dashboard
          </Link>
          <Link href="/raw-data"
                className={`px-3 py-2 rounded-md ${isActive('/raw-data') ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-100'}`}>
            Raw Data
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
