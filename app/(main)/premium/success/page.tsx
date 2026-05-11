// app/premium/success/page.tsx

import Link from "next/link";
import { CheckCircle } from "lucide-react";

export default function PremiumSuccessPage() {
    return (
        <div className="min-h-screen flex items-center justify-center px-8">
            <div className="max-w-md w-full bg-light-navy/40 border border-white/5 rounded-2xl p-10 shadow-lg text-center">
                <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-6" />
                <h1 className="text-3xl font-bold text-white mb-3">You're Premium!</h1>
                <p className="text-white-purple mb-6">
                    Your payment was successful. Premium features are now active on your account.
                </p>
                <Link
                    href="/dashboard"
                    className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md shadow-blue-600/30 transition"
                >
                    Go to Dashboard
                </Link>
            </div>
        </div>
    );
}