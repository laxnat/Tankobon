"use client"

import Link from "next/link";
import Image from "next/image";

export default function Footer() {
    return (
        <footer className="relative w-screen left-[50%] right-[50%] -translate-x-[50%] bg-light-navy border-t border-white/10 mt-40 rounded-t-3xl">
            <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-3 items-center text-white/70">
                {/* Left — logo */}
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 select-none"
                >
                  <div className="relative w-10 h-10 shrink-0">
                    <Image
                      src="/tankobon.png"
                      alt="Tankōbon logo"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <span className="text-2xl font-display text-white hover:text-reg-blue transition-colors tracking-tight">Tankōbon</span>
                </Link>

                {/* Center — description */}
                <p className="text-sm text-white/55">
                  Your personal manga library tracker — built for fans, by fans.
                </p>

                {/* Right — built-by + social links */}
                <div className="flex items-center justify-end gap-3">
                  <p className="text-sm text-white/55">Built by Axl Allan Tan</p>
                  <span className="flex items-center gap-3">
                    <a
                      href="https://github.com/laxnat"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white/55 hover:text-white transition-colors"
                      aria-label="GitHub"
                    >
                      {/* GitHub mark SVG */}
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M12 0C5.373 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.51 11.51 0 0 1 12 6.601c.957.005 1.923.128 2.917.38C17.59 5.509 18.597 5.83 18.597 5.83c.652 1.653.241 2.874.117 3.176.771.84 1.236 1.91 1.236 3.221 0 4.61-2.807 5.625-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.562 21.8 24 17.302 24 12 24 5.373 18.627 0 12 0z" />
                      </svg>
                    </a>
                    <a
                      href="https://www.linkedin.com/in/axl-allan-tan"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white/55 hover:text-white transition-colors"
                      aria-label="LinkedIn"
                    >
                      {/* LinkedIn mark SVG */}
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                      </svg>
                    </a>
                  </span>
                </div>
            </div>
        </footer>
    )
}

