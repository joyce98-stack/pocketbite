import Navbar from "../components/Navbar.jsx";
import { useApp } from "../store/AppContext.jsx";

const REST_TABS = [
  { path: "/restaurant/dashboard", label: "📊 Dashboard" },
  { path: "/restaurant/menu", label: "🍽️ Menu" },
  { path: "/restaurant/bookings", label: "📅 Bookings" },
  { path: "/restaurant/payments", label: "💳 Payments" },
  { path: "/restaurant/reviews", label: "⭐ Reviews" },
  { path: "/restaurant/reports", label: "📈 Reports" },
  { path: "/restaurant/offers", label: "🎉 Offers" },
];

export default function RestaurantReviewsPage() {
  const { myRest, deleteReview } = useApp();
  if (!myRest) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-purple-50/30">
      <Navbar tabs={REST_TABS} title={myRest.n} role="Restaurant" />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <div className="flex justify-between items-center flex-wrap gap-3">
          <div>
            <h2 className="text-2xl font-black">⭐ {myRest.n} — Reviews</h2>
            <p className="text-sm text-gray-500 mt-1">
              {myRest.rv.length} review{myRest.rv.length === 1 ? "" : "s"} • Only verified diners can leave reviews
            </p>
          </div>
          <span className="text-sm font-black text-amber-600 bg-amber-50 px-3 py-2 rounded-xl border border-amber-100">
            Avg: ★ {myRest.rt}
          </span>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-lg border">
          <h3 className="font-black text-lg mb-4">Rating Breakdown</h3>
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((star) => {
              const cnt = myRest.rv.filter((rv) => Math.round(rv.r) === star).length;
              const pct = myRest.rv.length ? Math.round((cnt / myRest.rv.length) * 100) : 0;
              return (
                <div key={star} className="flex items-center gap-3">
                  <span className="text-sm font-bold w-12 text-amber-500">{"★".repeat(star)}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden">
                    <div className="bg-amber-400 h-2.5 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs font-bold text-gray-500 w-10 text-right">{cnt}</span>
                </div>
              );
            })}
          </div>
        </div>

        {myRest.rv.length === 0 ? (
          <div className="py-16 bg-white rounded-3xl border-2 border-dashed text-center text-gray-400">
            <span className="text-5xl mb-4 block">💬</span>
            <p className="font-bold">No reviews yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {myRest.rv.map((rv) => (
              <div
                key={rv.id}
                className="bg-white rounded-2xl p-5 shadow-sm border hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-black text-sm shadow-md">
                      {rv.dn.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{rv.dn}</span>
                        {rv.v && (
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[9px] font-black rounded-full">
                            ✓ VERIFIED
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        📅{" "}
                        {new Date(rv.dt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}{" "}
                        at{" "}
                        {new Date(rv.dt).toLocaleTimeString("en-GB", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={i < rv.r ? "text-amber-400" : "text-gray-200"}>
                          ★
                        </span>
                      ))}
                    </div>
                    <button
                      onClick={() => {
                        if (confirm(`Delete review by ${rv.dn}?`)) deleteReview(myRest.id, rv.id);
                      }}
                      className="px-2.5 py-1 bg-red-50 text-red-500 rounded-lg text-[10px] font-black border border-red-100"
                    >
                      🗑 Delete
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-700 mt-3 bg-gray-50 rounded-xl p-3 italic">
                  "{rv.c}"
                </p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}