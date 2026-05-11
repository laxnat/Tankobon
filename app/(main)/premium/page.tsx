"use client";

import Link from "next/link";
import { Check, Star } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";

// ── Feature lists ────────────────────────────────────────────────────────────
// Edit these independently — each card only shows its own list.

const FREE_FEATURES: string[] = [
  "Search & browse manga",
  "3D virtual bookshelf up to 50 titles",
  "Track reading progress",
  "Basic reading stats",
  "Volume ownership tracking",
  "Personal notes per manga",
];

const PREMIUM_FEATURES: string[] = [
  "Everything in Free",
  "Unlimited 3D virtual bookshelf size",
  "Advanced reading stats",
  "Reading history & activity log",
  "Reading goals & yearly progress tracker",
  "Volume release notifications",
];

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show:   { opacity: 1, y: 0  },
};

export default function PremiumPage() {
  const { data: session } = useSession();
  const isPremium = session?.user?.isPremium;
  const [loading, setLoading] = useState(false);

  async function handleUpgrade() {
    setLoading(true);
    const toastId = toast.loading("Opening checkout…");
    try {
      const res = await fetch("/api/checkout", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        toast.dismiss(toastId);
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch {
      toast.error("Couldn't start checkout. Please try again.", { id: toastId });
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen pt-28 pb-24 px-4">

      {/* ── Header ── */}
      <motion.div
        className="max-w-2xl mx-auto text-center mb-6"
        variants={fadeUp}
        initial="hidden"
        animate="show"
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        <h1 className="text-5xl font-display text-white tracking-tight mt-12 mb-4">
          Free forever.{" "}
          <span className="text-reg-blue">Unlock more.</span>
        </h1>
        <p className="text-white/55 leading-relaxed">
          Tankōbon is free to use. Premium removes the limits and goes deeper for serious collectors.
        </p>
      </motion.div>

      {/* ── Cards ── */}
      <div className="max-w-3xl mx-auto grid md:grid-cols-2 gap-5">

        {/* Free */}
        <motion.div
          className="relative flex flex-col rounded-2xl p-8"
          style={{
            background: "linear-gradient(145deg, rgba(255,255,255,0.08) 0%, rgba(209,213,219,0.08) 100%)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
        >
          <div className="mb-6">
            <p className="text-xs font-display tracking-widest text-white/40 uppercase mb-2">
              Free
            </p>
            <div className="flex items-end gap-1">
              <span className="text-4xl text-white">$0</span>
              <span className="text-white/40 mb-1">/month</span>
            </div>
            <p className="text-white/45 text-sm mt-2">
              Everything you need to get started.
            </p>
          </div>

          {/* Divider */}
          <div className="h-px bg-white/[0.07] mb-6" />

          {/* Feature list */}
          <ul className="flex flex-col gap-3 flex-1">
            {FREE_FEATURES.map((label) => (
              <li key={label} className="flex items-center gap-3">
                <span className="flex-shrink-0 w-4 h-4 rounded-full bg-reg-blue/70 flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 text-white/75 stroke-[2.5]" />
                </span>
                <span className="text-white/75 text-sm">{label}</span>
              </li>
            ))}
          </ul>

          <div className="mt-8">
            {session ? (
              <div className="w-full text-center py-2.5 text-white/35 text-sm border border-white/[0.07] rounded-xl">
                Your current plan
              </div>
            ) : (
              <Link
                href="/register"
                className="block w-full text-center py-2.5 text-white/75 text-sm border border-white/10 rounded-xl hover:border-white/20 hover:text-white transition-colors duration-150"
              >
                Get started free
              </Link>
            )}
          </div>
        </motion.div>

        {/* Premium */}
        <motion.div
          className="relative flex flex-col rounded-2xl p-8 overflow-hidden"
          style={{
            background: "linear-gradient(145deg, rgba(21,31,46,0.8) 0%, rgba(17,17,26,0.95) 100%)",
            border: "1px solid rgba(96, 165, 250, 0.2)",
          }}
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
        >
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-display tracking-widest text-reg-blue uppercase">
                Premium
              </p>
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-reg-blue text-white/55 text-[10px]"
              >
                Best value
              </span>
            </div>
            <div className="flex items-end gap-1">
              <span className="text-4xl text-white">$8.99</span>
              <span className="text-white/40 mb-1">/month</span>
            </div>
            <p className="text-white/45 text-sm mt-2">
              For dedicated collectors who want it all.
            </p>
          </div>

          {/* Divider */}
          <div className="h-px mb-6" style={{ background: "rgba(250,204,21,0.12)" }} />

          {/* Feature list */}
          <ul className="flex flex-col gap-3 flex-1">
            {PREMIUM_FEATURES.map((label) => (
              <li key={label} className="flex items-center gap-3">
                <span className="flex-shrink-0 w-4 h-4 rounded-full bg-reg-blue/70 flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 text-white/75 stroke-[2.5]" />
                </span>
                <span className="text-white/75 text-sm">{label}</span>
              </li>
            ))}
          </ul>

          <div className="mt-8">
            {isPremium ? (
              <div className="w-full text-center py-2.5 text-white/55 text-sm border border-white/55 rounded-xl">
                Your current plan
              </div>
            ) : session ? (
              <button
                onClick={handleUpgrade}
                disabled={loading}
                className="w-full py-2.5 text-sm text-white bg-reg-blue hover:bg-reg-blue/70 active:bg-blue-500 rounded-xl transition-colors duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Redirecting…" : "Upgrade to Premium"}
              </button>
            ) : (
              <Link
                href="/register"
                className="block w-full text-center py-2.5 text-sm text-white bg-reg-blue hover:bg-reg-blue/70 rounded-xl transition-colors duration-150"
              >
                Get started
              </Link>
            )}
          </div>
        </motion.div>

      </div>

      {/* ── Fine print ── */}
      <motion.p
        className="text-center text-white/55 text-xs mt-10"
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        transition={{ duration: 0.4, ease: "easeOut", delay: 0.2 }}
      >
        Payments processed securely via Stripe. Cancel anytime.
      </motion.p>
    </div>
  );
}
