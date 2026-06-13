import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import { useApp } from "../store/AppContext.jsx";

const DINER_TABS = [
  { path: "/home", label: "Home" },
  { path: "/wishlist", label: "♡ Wishlist" },
  { path: "/my-bookings", label: "My Bookings" },
];

export default function WishlistPage() {
  const navigate = useNavigate();
  const { user, rests } = useApp();
  const wished = rests.filter(r => user.wl.includes(r.id));

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-purple-50/30">
      <Navbar tabs={DINER_TABS} title={user.nm} role="Diner" />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <h2 className="text-2xl font-black mb-6">💖 My Wishlist</h2>
        {wished.length === 0 ? (
          <p className="text-gray-500 text-center py-16 bg-white rounded-3xl border-2 border-dashed">Empty! Start exploring 🌟</p>
        ) : (
          <div className="grid md:grid-cols-3 gap-4">
            {wished.map(r => (
              <div key={r.id} onClick={() => navigate(`/restaurant/${r.id}`)} className="cursor-pointer flex gap-4 bg-white rounded-2xl p-4 border shadow-sm hover:shadow-md">
                <img src={r.img} className="w-20 h-20 rounded-xl object-cover" />
                <div>
                  <h4 className="font-bold">{r.n}</h4>
                  <p className="text-xs text-gray-500">{r.cui} • {r.loc}</p>
                  <p className="text-xs text-emerald-700 font-bold mt-1">KES {r.bmin}–{r.bmax}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
