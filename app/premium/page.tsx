"use client";

import Link from "next/link";
import { Check, X, Star } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";

// ── Feature rows ─────────────────────────────────────────────────────────────
// Set `free: true` for features available on the free plan.
// Set `free: false` for premium-only features.
const FEATURES: { label: string; free: boolean }[] = [
  { label: "Search & browse manga",          free: true  },
  { label: "Add up to 50 titles",            free: true  },
  { label: "Track reading progress",         free: true  },
  { label: "Basic reading stats",            free: true  },
  { label: "Unlimited library size",         free: false },
  { label: "Volume ownership tracking",      free: false },
  { label: "Advanced reading analytics",     free: false },
  { label: "Personal notes per manga",       free: false },
  { label: "Priority support",              free: false },
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
        className="max-w-2xl mx-auto text-center mb-16"
        variants={fadeUp}
        initial="hidden"
        animate="show"
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 text-xs font-medium tracking-wide mb-6">
          <Star className="w-3 h-3 fill-yellow-400" />
          Plans & Pricing
        </div>
        <h1 className="text-5xl font-extrabold text-white tracking-tight mb-4">
          Free forever.{" "}
          <span className="text-yellow-400">Unlock more.</span>
        </h1>
        <p className="text-white/55 text-lg leading-relaxed">
          Tankōbon is free to use. Premium removes the limits and goes deeper
          for serious collectors.
        </p>
      </motion.div>

      {/* ── Cards ── */}
      <div className="max-w-3xl mx-auto grid md:grid-cols-2 gap-5">

        {/* Free */}
        <motion.div
          className="relative flex flex-col bg-light-navy/30 border border-white/[0.07] rounded-2xl p-8"
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
        >
          <div className="mb-6">
            <p className="text-xs font-semibold tracking-widest text-white/40 uppercase mb-2">
              Free
            </p>
            <div className="flex items-end gap-1">
              <span className="text-4xl font-extrabold text-white">$0</span>
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
            {FEATURES.map((f) => (
              <li key={f.label} className="flex items-center gap-3">
                {f.free ? (
                  <span className="flex-shrink-0 w-4 h-4 rounded-full bg-blue-500/15 flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-blue-400 stroke-[2.5]" />
                  </span>
                ) : (
                  <span className="flex-shrink-0 w-4 h-4 rounded-full bg-white/5 flex items-center justify-center">
                    <X className="w-2.5 h-2.5 text-white/20 stroke-[2.5]" />
                  </span>
                )}
                <span className={f.free ? "text-white/75 text-sm" : "text-white/25 text-sm"}>
                  {f.label}
                </span>
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
                className="block w-full text-center py-2.5 text-white/75 text-sm font-medium border border-white/10 rounded-xl hover:border-white/20 hover:text-white transition-colors duration-150"
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
            background: "linear-gradient(145deg, rgba(21,31,46,0.9) 0%, rgba(17,17,26,0.95) 100%)",
            border: "1px solid rgba(250,204,21,0.2)",
            boxShadow: "0 0 40px rgba(250,204,21,0.06), 0 8px 32px rgba(0,0,0,0.4)",
          }}
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
        >
          {/* Subtle gold glow top edge */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px"
            style={{ background: "linear-gradient(90deg, transparent, rgba(250,204,21,0.5), transparent)" }}
          />

          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold tracking-widest text-yellow-400/70 uppercase">
                Premium
              </p>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 text-[10px] font-medium">
                <Star className="w-2.5 h-2.5 fill-yellow-400" />
                Best value
              </span>
            </div>
            <div className="flex items-end gap-1">
              <span className="text-4xl font-extrabold text-white">$X</span>
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
            {FEATURES.map((f) => (
              <li key={f.label} className="flex items-center gap-3">
                <span className="flex-shrink-0 w-4 h-4 rounded-full bg-yellow-400/15 flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 text-yellow-400 stroke-[2.5]" />
                </span>
                <span className="text-white/75 text-sm">{f.label}</span>
              </li>
            ))}
          </ul>

          <div className="mt-8">
            {isPremium ? (
              <div className="w-full text-center py-2.5 text-yellow-400/50 text-sm border border-yellow-400/15 rounded-xl">
                Your current plan
              </div>
            ) : session ? (
              <button
                onClick={handleUpgrade}
                disabled={loading}
                className="w-full py-2.5 text-sm font-semibold text-yellow-900 bg-yellow-400 hover:bg-yellow-300 active:bg-yellow-500 rounded-xl transition-colors duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Redirecting…" : "Upgrade to Premium"}
              </button>
            ) : (
              <Link
                href="/register"
                className="block w-full text-center py-2.5 text-sm font-semibold text-yellow-900 bg-yellow-400 hover:bg-yellow-300 rounded-xl transition-colors duration-150"
              >
                Get started
              </Link>
            )}
          </div>
        </motion.div>

      </div>

      {/* ── Fine print ── */}
      <motion.p
        className="text-center text-white/25 text-xs mt-10"
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
