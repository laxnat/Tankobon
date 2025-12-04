"use client"

export default function Footer() {
    return (
        <footer className="relative w-screen left-[50%] right-[50%] -translate-x-[50%] bg-[#0a0a12] border-t border-white/10 mt-40">
        <div className="max-w-7xl mx-auto px-6 py-12 text-center text-white/70">
            {/* Title */}
            <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">Tankōbon</h3>
    
            {/* Description */}
            <p className="text-sm mb-6 text-white/60 max-w-md mx-auto">
                Your personal manga library tracker — built for fans, by fans.
            </p>
    
        </div>
    </footer>
    )
}

