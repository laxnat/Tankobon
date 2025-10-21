"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";

export default function Home() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen flex items-center justify-center relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-white mb-6">
            Welcome to Tankōbon
          </h1>
          <p className="text-xl text-white mb-12 max-w-2xl mx-auto">
            Your personal manga library. Search, track, and manage your manga collection
            with ease. Never forget what you're reading again!
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {session ? (
              <>
                <Link
                  href="/library"
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-lg font-semibold"
                >
                  Go to My Library
                </Link>
                <Link
                  href="/search"
                  className="px-8 py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-lg hover:bg-blue-50 transition text-lg font-semibold"
                >
                  Search Manga
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/register"
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-lg font-semibold"
                >
                  Get Started
                </Link>
                <Link
                  href="/search"
                  className="px-8 py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-lg hover:bg-blue-50 transition text-lg font-semibold"
                >
                  Browse Manga
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="mt-20 grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-xl font-bold mb-2">Search Manga</h3>
            <p className="text-gray-600">
              Search through thousands of manga titles using the MyAnimeList database.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-4xl mb-4">📚</div>
            <h3 className="text-xl font-bold mb-2">Track Progress</h3>
            <p className="text-gray-600">
              Keep track of chapters read, ratings, and reading status for each manga.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-4xl mb-4">📝</div>
            <h3 className="text-xl font-bold mb-2">Personal Notes</h3>
            <p className="text-gray-600">
              Add personal notes and organize your collection exactly how you want.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}