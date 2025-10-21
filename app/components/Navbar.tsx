"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { Search } from "lucide-react";

export default function Navbar() {
  const { data: session } = useSession(); {/* For if user is signed in or not */}

  return (
    <nav className="fixed top-0 w-full z-40 backdrop-blur-lg bg-dark-purple shadow-lg">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">

          <Link href="/" className="text-xl font-bold text-white">
            Tankōbon
          </Link>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/search" className="px-4 py-2 font-bold text-white-purple rounded-lg hover:text-white transition">
              Search
            </Link>

            {session ? (
              <>
                <Link href="/library" className="px-4 py-2 font-bold text-white-purple rounded-lg hover:text-white transition">
                  My Library
                </Link>
                <div className="flex items-center space-x-2">
                  <span className="text-white-purple hover:text-white font-bold">{session.user?.name}</span>
                  <button onClick={() => signOut({ callbackUrl: "/" })} className="px-4 py-2 bg-red-600 font-bold text-white-purple rounded-lg hover:bg-red-700 transition">
                    Sign Out
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link href="/login" className="px-4 py-2 font-bold text-white-purple rounded-lg hover:text-white transition">
                  Sign In
                </Link>
                <Link href="/register" className="px-4 py-2 font-bold text-white bg-light-purple rounded-lg hover:bg-blue-purple transition">
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