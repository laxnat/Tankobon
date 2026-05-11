"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Menu, X, Star } from "lucide-react";

const EASE = "cubic-bezier(0.4, 0, 0.2, 1)";

// Aave-style multi-layer shadow — adapted for dark surfaces
const SHADOW_REST = [
  "0px 0.6px 0.6px -1.25px rgba(0,0,0,0.40)",
  "0px 2.3px 2.3px -2.5px rgba(0,0,0,0.35)",
  "0px 10px 10px -3.75px rgba(0,0,0,0.22)",
].join(", ");

const SHADOW_RAISED = [
  "0px 0.6px 0.6px -1.25px rgba(0,0,0,0.50)",
  "0px 2.3px 2.3px -2.5px rgba(0,0,0,0.45)",
  "0px 14px 18px -3.75px rgba(0,0,0,0.38)",
].join(", ");

export default function Navbar() {
  const { data: session } = useSession();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobile, setIsMobile]     = useState(false);
  const [menuOpen, setMenuOpen]     = useState(false);

  // Compact state: scrolled on desktop only
  const compact = isScrolled && !isMobile;

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 72);
    const onResize = () => setIsMobile(window.innerWidth < 768);
    onResize();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  return (
    <>
      {/*
        Outer shell: fixed, full-width, flex-centers the card.
        px-4 ensures the card always has breathing room on all screens.
        pointer-events-none so clicks pass through empty flanks.
      */}
      <div className="fixed top-0 left-0 right-0 z-40 flex justify-center pointer-events-none px-4">
        <div
          className="w-full pointer-events-auto"
          style={{
            // max-w-5xl (1024px) at rest → max-w-4xl (896px) when compact
            maxWidth:             compact ? "896px" : "1024px",
            borderRadius:         "16px",
            background:           isScrolled ? "rgba(17, 17, 26, 0.85)" : "transparent",
            backdropFilter:       isScrolled ? "blur(20px) saturate(160%)" : "none",
            WebkitBackdropFilter: isScrolled ? "blur(20px) saturate(160%)" : "none",
            border:               "none",
            boxShadow:            isScrolled ? SHADOW_RAISED : "none",
            marginTop:            "12px",
            transition: [
              `max-width 0.52s ${EASE}`,
              `background 0.32s ease`,
              `box-shadow 0.32s ease`,
            ].join(", "),
          }}
        >
          <div
            className="flex items-center justify-between"
            style={{
              height:       compact ? "52px" : "68px",
              paddingLeft:  "20px",
              paddingRight: "20px",
              transition:   `height 0.52s ${EASE}`,
            }}
          >

            {/* ── Logo ── */}
            <Link
              href="/"
              className="flex shrink-0 select-none items-center gap-2"
            >
              <div
                className="relative flex-shrink-0"
                style={{
                  width:      compact ? "32px" : "48px",
                  height:     compact ? "32px" : "48px",
                  transition: `width 0.52s ${EASE}, height 0.52s ${EASE}`,
                }}
              >
                <Image
                  src="/tankobon.png"
                  alt="Tankōbon logo"
                  fill
                  className="object-contain"
                />
              </div>
              <span
                className="font-display text-white tracking-[-0.015em] hover:text-reg-blue transition-colors duration-300 leading-none"
                style={{
                  fontSize:   compact ? "0.9375rem" : "1.1875rem",
                  transition: `font-size 0.52s ${EASE}`,
                }}
              >
                Tankōbon
              </span>
            </Link>

            {/* ── Desktop nav ── */}
            <div className="hidden md:flex items-center gap-0.5">
              {/* Premium CTA — hidden once the user already has premium */}
              {!session?.user?.isPremium && (
                <NavLink href="/premium" compact={compact}>Pricing</NavLink>
              )}

              {session ? (
                <>
                  <NavLink href="/dashboard" compact={compact}>Dashboard</NavLink>
                </>
              ) : (
                <>
                  <NavLink href="/login" compact={compact}>Sign In</NavLink>

                  <Link
                    href="/register"
                    className="font-medium text-white bg-reg-blue hover:bg-reg-blue/55 active:bg-blue-700 rounded-xl transition-colors duration-150 select-none"
                    style={{
                      fontSize:   compact ? "0.8125rem" : "0.875rem",
                      padding:    compact ? "5px 14px"  : "7px 16px",
                      marginLeft: "4px",
                      transition: [
                        `font-size 0.52s ${EASE}`,
                        `padding 0.52s ${EASE}`,
                        "background 0.15s ease",
                      ].join(", "),
                    }}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>

            {/* ── Mobile hamburger ── */}
            <button
              className="md:hidden p-1.5 text-white/55 hover:text-white transition-colors duration-200"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
            >
              {menuOpen
                ? <X    className="w-[18px] h-[18px]" />
                : <Menu className="w-[18px] h-[18px]" />
              }
            </button>

          </div>
        </div>
      </div>

      {/* ── Mobile menu overlay ── */}
      <div
        className={`fixed inset-0 z-30 md:hidden transition-opacity duration-300 ${
          menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Scrim */}
        <div
          className="absolute inset-0 bg-black/25"
          onClick={() => setMenuOpen(false)}
        />

        {/* Slide-down sheet */}
        <div
          className={`absolute top-0 left-0 right-0 border-b border-white/[0.07] transition-transform duration-300 ${
            menuOpen ? "translate-y-0" : "-translate-y-full"
          }`}
          style={{
            background:           "rgba(13, 13, 21, 0.97)",
            backdropFilter:       "blur(20px) saturate(160%)",
            WebkitBackdropFilter: "blur(20px) saturate(160%)",
            // 12px margin + 68px nav height + 8px gap
            paddingTop:           "88px",
          }}
        >
          <div className="px-5 py-2 flex flex-col">
            {/* Premium CTA — hidden once the user already has premium */}
            {!session?.user?.isPremium && (
              <MobileNavLink href="/premium" onClick={() => setMenuOpen(false)}>
                <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                <span className="text-yellow-400">Premium</span>
              </MobileNavLink>
            )}

            {session ? (
              <>
                <MobileNavLink href="/dashboard" onClick={() => setMenuOpen(false)}>
                  <span>Dashboard</span>
                  {session.user?.isPremium && (
                    <span className="ml-auto inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 text-[11px] font-medium rounded-full">
                      <Star className="w-2.5 h-2.5 fill-yellow-400" />
                      Premium
                    </span>
                  )}
                </MobileNavLink>
              </>
            ) : (
              <>
                <MobileNavLink href="/login"    onClick={() => setMenuOpen(false)}>Sign In</MobileNavLink>
                <MobileNavLink href="/register" onClick={() => setMenuOpen(false)}>Sign Up</MobileNavLink>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function NavLink({
  href,
  children,
  compact,
}: {
  href:     string;
  children: React.ReactNode;
  compact?: boolean;
}) {
  return (
    <Link
      href={href}
      className="font-medium text-white/65 hover:text-white hover:underline rounded-lg transition-all duration-150 select-none"
      style={{
        fontSize:      compact ? "0.8125rem" : "0.875rem",
        padding:       compact ? "4px 10px"  : "6px 13px",
        letterSpacing: "-0.005em",
        transition: [
          `font-size 0.52s ${EASE}`,
          `padding 0.52s ${EASE}`,
          "color 0.15s ease",
          "background 0.15s ease",
        ].join(", "),
      }}
    >
      {children}
    </Link>
  );
}

function MobileNavLink({
  href,
  children,
  onClick,
}: {
  href:     string;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-2 px-1 py-3.5 text-[0.9375rem] font-normal text-white/65 hover:text-white border-b border-white/[0.06] last:border-0 transition-colors duration-150 select-none"
    >
      {children}
    </Link>
  );
}
