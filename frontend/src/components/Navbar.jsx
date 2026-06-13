import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useApp } from "../store/AppContext.jsx";

export default function Navbar({ tabs, title, role }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, cart, notifications, user } = useApp();
  const [mobileMenu, setMobileMenu] = useState(false);

  const cartCount = cart?.reduce((s, i) => s + i.q, 0) || 0;
  const unreadNotifs = (notifications || []).filter((n) => n.targetUserId === user?.id && !n.read).length;

  return (
    <>
      <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-gray-100 shadow-sm">
        {/* Top row: Logo + User info */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer flex-shrink-0" onClick={() => navigate(tabs[0]?.path || "/")}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-white shadow-md text-base">{"🍴"}</div>
            <span className="font-black text-gray-900 hidden sm:inline">{title}</span>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <span className="text-xs text-gray-400 capitalize">{role}</span>
            <button onClick={logout} className="text-xs font-bold text-gray-400 hover:text-red-500 transition-colors">Logout</button>
          </div>

          {/* Mobile action buttons */}
          <div className="flex md:hidden items-center gap-2">
            {role === "Diner" ? (
              <>
                <button onClick={() => navigate("/cart")} className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <span className="text-lg">{"🛒"}</span>
                  {cartCount > 0 ? (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-pink-500 text-white text-[9px] font-black rounded-full flex items-center justify-center animate-bounce">
                      {cartCount}
                    </span>
                  ) : null}
                </button>
                <button onClick={() => navigate("/notifications")} className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <span className="text-lg">{"🔔"}</span>
                  {unreadNotifs > 0 ? (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center animate-bounce">
                      {unreadNotifs}
                    </span>
                  ) : null}
                </button>
              </>
            ) : null}
            <button onClick={() => setMobileMenu(!mobileMenu)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              {mobileMenu ? "✕" : "☰"}
            </button>
          </div>
        </div>

        {/* Scrollable tabs row - Smooth */}
        <div className="border-t border-gray-100 bg-white">
          <div className="max-w-7xl mx-auto px-2 sm:px-4">
            <div 
              className="flex gap-1.5 overflow-x-auto py-2.5 smooth-scroll"
              style={{ 
                scrollbarWidth: "none", 
                msOverflowStyle: "none",
                scrollBehavior: "smooth",
                WebkitOverflowScrolling: "touch"
              }}
            >
              {tabs.map((t) => {
                const isActive = location.pathname === t.path;
                return (
                  <button
                    key={t.path}
                    onClick={() => navigate(t.path)}
                    className={`
                      flex-shrink-0 px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap
                      transition-all duration-300 ease-out
                      ${isActive 
                        ? "bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-md shadow-emerald-200 scale-105" 
                        : "bg-gray-50 text-gray-600 hover:bg-gray-100 hover:scale-105"
                      }
                    `}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenu ? (
          <div className="md:hidden border-t bg-white px-4 pb-4 pt-2 space-y-1 animate-slideDown">
            {navTabs.map((t) => (
              <button 
                key={t.path} 
                onClick={() => { navigate(t.path); setMobileMenu(false); }} 
                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  location.pathname === t.path 
                    ? "text-emerald-700 bg-emerald-50" 
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {t.label}
              </button>
            ))}
            <div className="pt-2 border-t mt-2 flex items-center justify-between px-4">
              <div>
                <p className="font-bold text-sm text-gray-900">{title}</p>
                <p className="text-xs text-gray-400 capitalize">{role}</p>
              </div>
              <button 
                onClick={() => { logout(); setMobileMenu(false); }} 
                className="px-4 py-2 bg-red-50 text-red-600 rounded-xl text-xs font-bold hover:bg-red-100 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        ) : null}
      </nav>

      {/* CSS for smooth scrolling and animations */}
      <style>{`
        .smooth-scroll::-webkit-scrollbar {
          display: none;
        }
        .smooth-scroll {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </>
  );
}