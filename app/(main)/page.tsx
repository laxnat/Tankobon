"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import FeaturesGallery from "@/components/FeaturesGallery";

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
          <h1 className="text-7xl font-display text-white mb-6 tracking-tight drop-shadow-lg">
            Tankōbon
          </h1>

          {/* Definition */}
          <p className="text-xl text-blue-300/80 italic mb-8">
            <span className="font-semibold text-white">tankōbon (単行本)</span> — a standalone manga volume, 
            often collecting chapters originally serialized in magazines.
          </p>

          {/* Short description */}
          <p className="text-white text-lg leading-relaxed max-w-xl mx-auto mb-12">
            Welcome to <span className="text-white font-display">Tankōbon</span> — your personal manga library tracker.
            Search, save, and organize your manga collection while discovering new favorites along the way.
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
            <button
              onClick={scrollToFeatures}
              className="px-8 py-3 bg-reg-blue text-white rounded-lg hover:bg-reg-blue/70 transition text-lg font-regular backdrop-blur-sm"
            >
              Learn More
            </button>

            <Link
              href="/register"
              className="px-8 py-3 bg-transparent text-white/55 border border-white/55 rounded-lg hover:border-white hover:text-white transition text-lg"
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
      <div id="features-section">
        <FeaturesGallery />
      </div>

    </div>
  );
}