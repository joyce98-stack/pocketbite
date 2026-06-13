import Navbar from "../components/Navbar.jsx";
import { useApp } from "../store/AppContext.jsx";

const ADMIN_TABS = [
  { path: "/admin/dashboard", label: "📊 Dashboard" },
  { path: "/admin/restaurants", label: "🏪 Restaurants" },
  { path: "/admin/bookings", label: "📅 Bookings" },
  { path: "/admin/reviews", label: "⭐ Reviews" },
  { path: "/admin/users", label: "👥 Users" },
  { path: "/admin/reports", label: "📈 Reports" },
];

export default function AdminReviewsPage() {
  const { rests, deleteReview } = useApp();
  const total = rests.reduce((s,r) => s + r.rv.length, 0);
  const hasReviews = rests.filter(r => r.rv.length > 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-purple-50/30">
      <Navbar tabs={ADMIN_TABS} title="Admin" role="Admin" />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <div className="flex justify-between items-center flex-wrap gap-3">
          <div>
            <h2 className="text-2xl font-black">⭐ Platform Reviews</h2>
            <p className="text-sm text-gray-500 mt-1">All verified reviews across {rests.length} restaurants</p>
          </div>
          <span className="text-sm font-black text-amber-600 bg-amber-50 px-3 py-2 rounded-xl border border-amber-100">Total: {total} reviews</span>
        </div>

        {hasReviews.length === 0 ? (
          <div className="py-16 bg-white rounded-3xl border-2 border-dashed text-center text-gray-400">
            <span className="text-5xl mb-4 block">💬</span>
            <p className="font-bold">No reviews on the platform yet</p>
          </div>
        ) : hasReviews.map(rest => (
          <div key={rest.id} className="bg-white rounded-3xl shadow-lg border overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-amber-50 p-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={rest.img} className="w-10 h-10 rounded-xl object-cover shadow-sm" />
                <div>
                  <h4 className="font-black text-gray-900">{rest.n}</h4>
                  <p className="text-[11px] text-gray-500">{rest.cui} • {rest.rv.length} review{rest.rv.length === 1 ? "" : "s"} • ★ {rest.rt}</p>
                </div>
              </div>
            </div>
            <div className="divide-y divide-gray-50">{rest.rv.map(rv => (
              <div key={rv.id} className="p-4 hover:bg-gray-50/50">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-black text-xs shadow">{rv.dn.charAt(0).toUpperCase()}</div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-gray-900">{rv.dn}</span>
                        {rv.v && <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-[8px] font-black rounded-full">✓ VERIFIED</span>}
                      </div>
                      <p className="text-[10px] text-gray-400 font-medium">📅 {new Date(rv.dt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs">{[...Array(5)].map((_,i) => <span key={i} className={i < rv.r ? "text-amber-400" : "text-gray-200"}>★</span>)}</span>
                    <button onClick={() => { if (confirm(`Delete review by ${rv.dn} for ${rest.n}?`)) deleteReview(rest.id, rv.id); }} className="px-2 py-1 bg-red-50 text-red-500 rounded-lg text-[10px] font-black border border-red-100">🗑</button>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-2 italic">"{rv.c}"</p>
              </div>
            ))}</div>
          </div>
        ))}
      </main>
    </div>
  );
}
