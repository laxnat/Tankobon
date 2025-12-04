"use client";

import Link from "next/link";

export default function Home() {
  // Smooth scroll for "Learn More"
  const scrollToFeatures = () => {
    const section = document.getElementById("features-section");
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen pt-24 px-4">
      {/* Hero Section */}
      <section className="relative flex flex-col justify-start items-center text-center h-screen px-8 pt-[25vh]">
        <div className="max-w-3xl mx-auto animate-fade-in">
          <h1 className="text-7xl font-extrabold text-white mb-6 tracking-tight drop-shadow-lg">
            Tankōbon
          </h1>

          {/* Definition */}
          <p className="text-xl text-blue-300/80 italic mb-8">
            <span className="font-semibold text-white">tankōbon (単行本)</span> — a standalone manga volume, 
            often collecting chapters originally serialized in magazines.
          </p>

          {/* Short description */}
          <p className="text-white/80 text-lg leading-relaxed max-w-xl mx-auto mb-12">
            Welcome to <span className="text-white font-semibold">Tankōbon</span> — your personal manga library tracker.
            Search, save, and organize your manga collection while discovering new favorites along the way.
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
            <button
              onClick={scrollToFeatures}
              className="px-8 py-3 bg-blue-600/90 text-white rounded-lg hover:bg-blue-700 transition text-lg font-regular backdrop-blur-sm"
            >
              Learn More
            </button>

            <Link
              href="/register"
              className="px-8 py-3 bg-transparent text-white-purple border border-white-purple rounded-lg hover:border-white hover:text-white transition text-lg font-regular"
            >
              Get Started
            </Link>
          </div>

          {/* Divider */}
          <div className="h-[1px] w-2/3 mx-auto bg-gradient-to-r from-transparent via-white/20 to-transparent mb-10" />

          {/* Scroll-down indicator */}
          <div className="animate-bounce text-white/50 text-sm tracking-widest">
            ▼ SCROLL
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative w-screen left-[50%] right-[50%] -translate-x-[50%]">
        <div id="features-section" className="max-w-5xl scroll-mt-32 px-6 sm:px-8 mx-auto text-center">
          <h2 className="text-5xl font-extrabold text-white mb-4 tracking-tight">
            Features
          </h2>
          <p className="text-white/60 text-lg mb-16 max-w-2xl mx-auto">
            Everything you need to organize, track, and enjoy your manga collection — all in one place.
          </p>

          <div className="grid gap-10 sm:gap-12 md:grid-cols-2">
            {[
              {
                title: "Search Manga",
                desc: "Search through thousands of manga titles using the MyAnimeList database.",
              },
              {
                title: "Track Progress",
                desc: "Keep track of chapters read, ratings, and reading status for each manga.",
              },
              {
                title: "Track Physically",
                desc: "Keep track of volumes owned for each manga.",
              },
              {
                title: "Personal Notes",
                desc: "Add personal notes and organize your collection exactly how you want.",
              },
              {
                title: "Cloud Sync",
                desc: "Access your collection anytime, anywhere — automatically synced across devices.",
              },
              {
                title: "Reading Stats",
                desc: "See your reading stats, milestones, and achievements as your library grows.",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="relative group bg-gradient-to-b from-light-navy/40 to-light-navy/20 p-8 rounded-2xl border border-white/10 hover:border-blue-500/40 transition-all duration-300 hover:shadow-[0_0_25px_rgba(59,130,246,0.15)]"
              >
                {/* v1 Badge */}
                <div className="absolute top-4 right-4">
                  <div className="border border-white/30 text-white/60 text-xs px-2 py-0.5 rounded-full font-mono group-hover:border-blue-400 group-hover:text-blue-400 transition-colors">
                    v1
                  </div>
                </div>

                {/* Feature Title */}
                <h3 className="text-2xl font-semibold text-white mb-4 mt-2 tracking-wide">
                  {feature.title}
                </h3>

                {/* Divider Line */}
                <div className="w-12 h-[2px] bg-blue-500/40 mx-auto mb-4 group-hover:w-20 transition-all duration-300"></div>

                {/* Description */}
                <p className="text-white/70 leading-relaxed text-base max-w-xs mx-auto">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}