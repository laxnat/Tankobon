"use client";

import { motion } from "framer-motion";
import { Search, BookOpen, Package, StickyNote, Cloud, BarChart3 } from "lucide-react";

const FEATURES = [
  {
    id: 1,
    title: "Search Manga",
    desc: "Search thousands of titles using the MyAnimeList database.",
    accent: "#02A9FF",
    icon: Search,
  },
  {
    id: 2,
    title: "Track Progress",
    desc: "Keep track of chapters read, ratings, and reading status for each manga.",
    accent: "#a1a1ce",
    icon: BookOpen,
  },
  {
    id: 3,
    title: "Track Physically",
    desc: "Log every volume you own and watch your shelf grow.",
    accent: "#8BA0B2",
    icon: Package,
  },
  {
    id: 4,
    title: "Personal Notes",
    desc: "Add notes to any manga and organize your collection your way.",
    accent: "#cfcfe8",
    icon: StickyNote,
  },
  {
    id: 5,
    title: "Cloud Sync",
    desc: "Your library is always up to date across every device.",
    accent: "#02A9FF",
    icon: Cloud,
  },
  {
    id: 6,
    title: "Reading Stats",
    desc: "See milestones and achievements as your collection grows.",
    accent: "#EF233C",
    icon: BarChart3,
  },
] as const;

// Typed as a 4-tuple so Framer Motion's Easing type is satisfied.
// number[] fails because TS can't prove it has exactly 4 elements.
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

// ── Variant definitions ───────────────────────────────────────────────────────

// Header: stagger the label and title in sequence
const headerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.13 } },
};
const headerChild = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: EASE } },
};

// Grid: stagger each card as it enters
const gridContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
};

// Card itself
const cardVariant = {
  hidden: { opacity: 0, y: 36 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

// Accent rule — draws left-to-right after the card appears
const accentLineVariant = {
  hidden: { scaleX: 0 },
  visible: {
    scaleX: 1,
    transition: { duration: 0.65, ease: EASE, delay: 0.18 },
  },
};

// Icon badge — scales in slightly after card
const iconVariant = {
  hidden: { opacity: 0, scale: 0.75 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.45, ease: EASE, delay: 0.22 },
  },
  // Variant propagation: parent whileHover="hovered" lifts this too
  hovered: { scale: 1.1, transition: { duration: 0.2, ease: EASE } },
};

// Ghost number — fades in last, brightens on hover
const ghostVariant = {
  hidden: { opacity: 0 },
  visible: { opacity: 0.032, transition: { duration: 0.9, delay: 0.28 } },
  hovered: { opacity: 0.075, transition: { duration: 0.3 } },
};

// Card text block — slides up slightly behind card entry
const contentVariant = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: EASE, delay: 0.2 },
  },
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function FeaturesGallery() {
  return (
    <section className="py-28 px-6">
      <div className="max-w-6xl mx-auto">

        {/* Editorial header — animates in as the section scrolls into view */}
        <motion.div
          className="mb-16"
          variants={headerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
        >
          <motion.p
            variants={headerChild}
            className="font-mono uppercase text-white/25 mb-4"
            style={{ fontSize: 11, letterSpacing: "0.22em" }}
          >
            What&apos;s inside
          </motion.p>
          <motion.h2
            variants={headerChild}
            className="font-display text-white uppercase"
            style={{
              fontSize: "clamp(2.4rem, 5vw, 3.6rem)",
              letterSpacing: "-0.025em",
              lineHeight: 1,
            }}
          >
            Features
          </motion.h2>
        </motion.div>

        {/* Grid — staggerChildren drives card entrance order */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
          style={{
            gap: "1px",
            background: "rgba(255,255,255,0.06)",
            outline: "1px solid rgba(255,255,255,0.06)",
          }}
          variants={gridContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
        >
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.id}
                variants={cardVariant}
                // whileHover propagates "hovered" to all children that define it
                whileHover="hovered"
                style={{
                  background: "#11111a",
                  padding: "40px 36px 36px",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Accent rule — scaleX 0→1 from left edge */}
                <motion.div
                  variants={accentLineVariant}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 1,
                    background: `linear-gradient(90deg, ${feature.accent}70, ${feature.accent}00 55%)`,
                    transformOrigin: "left center",
                  }}
                />

                {/* Ghost number — fades in, brightens on hover via propagation */}
                <motion.span
                  aria-hidden
                  variants={ghostVariant}
                  style={{
                    position: "absolute",
                    bottom: -20,
                    right: -6,
                    fontSize: "clamp(110px, 13vw, 148px)",
                    fontWeight: 900,
                    color: "#ffffff",
                    lineHeight: 1,
                    fontFamily: "var(--font-archivo-black)",
                    letterSpacing: "-0.06em",
                    pointerEvents: "none",
                    userSelect: "none",
                  }}
                >
                  {String(feature.id).padStart(2, "0")}
                </motion.span>

                {/* Icon badge — scales in, slight lift on hover */}
                <motion.div
                  variants={iconVariant}
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 9,
                    background: `${feature.accent}0f`,
                    border: `1px solid ${feature.accent}25`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 52,
                  }}
                >
                  <Icon size={16} color={feature.accent} strokeWidth={1.5} />
                </motion.div>

                {/* Title + description — slide up after card */}
                <motion.div variants={contentVariant}>
                  <h3
                    className="font-display uppercase"
                    style={{
                      color: "#ffffff",
                      fontSize: 17,
                      fontWeight: 600,
                      marginBottom: 10,
                      letterSpacing: "-0.01em",
                      lineHeight: 1.3,
                    }}
                  >
                    {feature.title}
                  </h3>
                  <p
                    style={{
                      color: "rgba(255,255,255,0.36)",
                      fontSize: 13,
                      lineHeight: 1.7,
                    }}
                  >
                    {feature.desc}
                  </p>
                </motion.div>
              </motion.div>
            );
          })}
        </motion.div>

      </div>
    </section>
  );
}
