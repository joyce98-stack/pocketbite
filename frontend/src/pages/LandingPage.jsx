import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function LandingPage() {
  const navigate = useNavigate();
  const [showFloater, setShowFloater] = useState(true);
  const [showLilac, setShowLilac] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 relative overflow-hidden">
      {/* Decorations */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-32 left-16 text-pink-200 opacity-40" style={{ fontSize: 80 }}>♡</div>
        <div className="absolute top-48 right-24 text-emerald-200 opacity-30" style={{ fontSize: 60 }}>☁</div>
        <div className="absolute bottom-40 left-1/4 text-amber-200 opacity-30" style={{ fontSize: 50 }}>☆</div>
        <div className="absolute top-1/3 left-1/2 text-emerald-100 opacity-20" style={{ fontSize: 100 }}>✦</div>
      </div>

      {/* Nav */}
      <nav className="relative z-20 flex items-center justify-between max-w-7xl mx-auto px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-200 text-xl">🍴</div>
          <span className="text-xl font-black text-gray-900">PocketBite</span>
        </div>
        <button onClick={() => navigate("/auth")} className="px-5 py-2.5 rounded-full border border-emerald-200 bg-white/80 text-sm font-bold text-emerald-700 shadow-sm hover:bg-emerald-50">Login / Sign up</button>
      </nav>

      {/* Hero */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 pt-10 pb-8 text-center">
        <div className="inline-flex items-center gap-2 px-5 py-2 bg-emerald-50 border border-emerald-200 rounded-full mb-8">
          <span className="text-emerald-600 font-bold text-sm">▶ READY TO FEAST? 🍔 ✨</span>
        </div>
        <div className="mb-6 flex justify-end mr-4">
          <div className="px-4 py-2 border-2 border-emerald-200 rounded-full">
            <span className="text-emerald-700 font-bold text-sm">✨ FRESH & AUTHENTIC 🌿</span>
          </div>
        </div>
        <h1 className="text-6xl md:text-8xl font-black text-gray-900 leading-[0.95] mb-6 tracking-tight">
          Taste the<br />
          <span className="bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 bg-clip-text text-transparent">Freshness</span><br />
          of Every Bite.
        </h1>
        <p className="text-gray-500 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
          Discover hidden local gems 🍔, lively formal spots 🌷, and high-end luxury retreats ✨.
          PocketBite is your portal to authentic dining with real-time M-Pesa booking & verified reviews!
        </p>
        <div className="flex items-center justify-center gap-4 mb-12 flex-wrap">
          <button onClick={() => navigate("/auth?mode=signup")} className="px-8 py-4 bg-gray-900 text-white rounded-full font-bold text-sm tracking-wider hover:bg-gray-800 shadow-xl">BEGIN YOUR JOURNEY →</button>
          <button onClick={() => navigate("/auth")} className="px-8 py-4 border-2 border-gray-300 rounded-full font-bold text-sm tracking-wider text-gray-700 hover:bg-gray-50">⊚ EXPLORE FEATURES</button>
        </div>
        <div className="flex items-center justify-center gap-12 text-xs font-bold text-gray-400 uppercase tracking-widest flex-wrap">
          <span>🍽️ 30+ SPOTS</span>
          <span>💎 VERIFIED REVIEWS</span>
          <span>📱 M-PESA STK</span>
          <span className="hidden md:inline">⚡ LIVE BOOKING</span>
        </div>
      </section>

      <footer className="relative z-10 text-center py-6 text-xs text-gray-400 font-semibold tracking-wider uppercase">POCKETBITE 2026 • AUTHENTIC DINING 🌿</footer>

      {/* Floating pop-ups */}
      {showFloater && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce" style={{ animationDuration: "3s" }}>
          <div className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-2xl shadow-2xl p-4 w-64 relative border-4 border-white/20">
            <button onClick={() => setShowFloater(false)} className="absolute -top-2 -right-2 bg-white text-emerald-600 rounded-full w-6 h-6 flex items-center justify-center shadow-lg font-bold">×</button>
            <div className="flex justify-center gap-1 text-2xl mb-2">🍕 🍜 🍰</div>
            <p className="font-black text-center mb-1 leading-tight text-base">Craving something? 🤤</p>
            <p className="text-[10px] text-center text-white/90 mb-3 font-bold uppercase tracking-widest">Nairobi's Best Spots</p>
            <button onClick={() => navigate("/auth?mode=signup")} className="w-full py-2.5 bg-white text-emerald-700 rounded-xl font-black text-xs hover:bg-gray-50 shadow-md">🔥 START FEASTING →</button>
          </div>
        </div>
      )}

      {showLilac && (
        <div className="fixed bottom-6 left-6 z-50 animate-pulse">
          <div className="bg-gradient-to-r from-purple-400 to-indigo-500 text-white rounded-2xl shadow-2xl p-4 w-64 relative border-4 border-white/20">
            <button onClick={() => setShowLilac(false)} className="absolute -top-2 -right-2 bg-white text-purple-600 rounded-full w-6 h-6 flex items-center justify-center shadow-lg font-bold">×</button>
            <div className="flex justify-center gap-2 text-2xl mb-2">🍓 🍇 🍹</div>
            <p className="font-black text-center mb-1 leading-tight text-base italic">Sweet Vibe, Sweet Price ✨</p>
            <p className="text-[10px] text-center text-purple-50 mb-3 font-medium">Book now and get instant M-Pesa confirmation!</p>
            <button onClick={() => navigate("/auth")} className="w-full py-2.5 bg-purple-900/30 backdrop-blur text-white border-2 border-white/50 rounded-xl font-black text-xs hover:bg-white/20">🍭 ENTER PORTAL</button>
          </div>
        </div>
      )}
    </div>
  );
}
