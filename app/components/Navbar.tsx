"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Search } from "lucide-react";

export default function Navbar() {
  const { data: session } = useSession();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <nav 
      className={`fixed w-full z-40 backdrop-blur-lg transition-all duration-300 ${
        isScrolled ? "py-1" : "py-2"
      }`}
    >
      <div className="max-w-7xl mx-auto">
        <div className={`flex justify-between items-center transition-all duration-300 ${
          isScrolled ? "h-12" : "h-16"
        }`}>

          <Link href="/" className="text-3xl font-bold text-white">
            Tankōbon
          </Link>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/search" className="px-4 py-2 text-xl font-bold text-white-purple rounded-lg hover:text-white transition">
              Search
            </Link>

            {session ? (
              <>
                <Link href="/library" className="px-4 py-2 text-xl font-bold text-white-purple rounded-lg hover:text-white transition">
                  My Library
                </Link>
                <div className="flex items-center space-x-8">
                  <Link
                    href="/profile"
                    className="text-white-purple hover:text-white text-xl font-bold transition transform hover:scale-105"
                  >
                    {session.user?.name}
                  </Link>
                </div>
              </>
            ) : (
              <>
                <Link href="/login" className="px-4 py-2 text-xl font-bold text-white-purple rounded-lg hover:text-white transition">
                  Sign In
                </Link>
                <Link href="/register" className="px-4 py-2 text-xl font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-800 transition">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}