"use client";

import Link from "next/link";
import { Star, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import FeaturesGallery from "@/app/components/FeaturesGallery";

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
          <p className="text-white-purple text-lg leading-relaxed max-w-xl mx-auto mb-12">
            Welcome to <span className="text-white font-semibold">Tankōbon</span> — your personal manga library tracker.
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
      <div id="features-section">
        <FeaturesGallery />
      </div>

      {/* Premium teaser */}
      <section className="max-w-5xl mx-auto px-6 sm:px-8 mt-24 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden rounded-2xl px-8 py-12 md:px-14 md:py-14 flex flex-col md:flex-row items-center gap-8 md:gap-12"
          style={{
            background: "linear-gradient(135deg, rgba(21,31,46,0.7) 0%, rgba(17,17,26,0.9) 100%)",
            border: "1px solid rgba(250,204,21,0.18)",
            boxShadow: "0 0 60px rgba(250,204,21,0.05), 0 12px 40px rgba(0,0,0,0.35)",
          }}
        >
          {/* Gold shimmer top edge */}
          <div
            className="absolute top-0 left-0 right-0 h-px"
            style={{ background: "linear-gradient(90deg, transparent 10%, rgba(250,204,21,0.45) 50%, transparent 90%)" }}
          />

          {/* Left: copy */}
          <div className="flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 text-xs font-semibold tracking-wide mb-4">
              <Star className="w-3 h-3 fill-yellow-400" />
              Premium
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-3">
              Go beyond the basics.
            </h2>
            <p className="text-white/50 text-base leading-relaxed max-w-md">
              Unlimited library size, volume tracking, advanced analytics, and
              more — for collectors who take their manga seriously.
            </p>
          </div>

          {/* Right: CTA */}
          <div className="flex-shrink-0">
            <Link
              href="/premium"
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-yellow-900 bg-yellow-400 hover:bg-yellow-300 active:bg-yellow-500 rounded-xl transition-colors duration-150"
            >
              See plans
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}