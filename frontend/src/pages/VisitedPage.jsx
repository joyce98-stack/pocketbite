import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import { useApp } from "../store/AppContext.jsx";

const DINER_TABS = [
  { path: "/home", label: "Home" },
  { path: "/wishlist", label: "Wishlist" },
  { path: "/my-bookings", label: "Bookings" },
];

export default function VisitedPage() {
  const navigate = useNavigate();
  const { user, bks, rests } = useApp();

  const visited = useMemo(() => {
    const checkedInBookings = bks.filter((b) => b.did === user?.id && b.checkedIn);
    const restMap = {};
    checkedInBookings.forEach((b) => {
      if (!restMap[b.rid]) {
        const rest = rests.find((r) => r.id === b.rid);
        restMap[b.rid] = { rest, visits: [], items: [] };
      }
      restMap[b.rid].visits.push(b);
      b.items?.forEach((item) => {
        const existing = restMap[b.rid].items.find((i) => i.f?.n === item.f?.n);
        if (existing) { existing.totalQty += item.q || 1; }
        else { restMap[b.rid].items.push({ ...item, totalQty: item.q || 1 }); }
      });
    });
    return Object.values(restMap).filter((v) => v.rest);
  }, [bks, rests, user]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-purple-50/30">
      <Navbar tabs={DINER_TABS} title={user.nm} role="Diner" />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <div>
          <h2 className="text-2xl font-black">{"📍"} Places I've Visited</h2>
          <p className="text-sm text-gray-500">{visited.length} restaurant{visited.length !== 1 ? "s" : ""} checked into</p>
        </div>

        {visited.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed">
            <span className="text-5xl block mb-4">{"📍"}</span>
            <p className="font-bold text-gray-500">No check-ins yet</p>
            <p className="text-sm text-gray-400 mt-1">Check in at a restaurant during your booking to see it here.</p>
            <button onClick={() => navigate("/home")} className="mt-4 px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-bold">Browse Restaurants</button>
          </div>
        ) : (
          <div className="space-y-6">
            {visited.map((v) => (
              <div key={v.rest.id} className="bg-white rounded-3xl shadow-lg border overflow-hidden">
                <div className="relative h-40 overflow-hidden cursor-pointer" onClick={() => navigate("/restaurant/" + v.rest.id)}>
                  <img src={v.rest.img} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-xl font-black text-white">{v.rest.n}</h3>
                    <div className="flex gap-2 mt-1 text-white/90 text-xs">
                      <span>{"📍"} {v.rest.loc}</span>
                      <span>{"⭐"} {v.rest.rt}</span>
                      <span>{"📅"} {v.visits.length} visit{v.visits.length > 1 ? "s" : ""}</span>
                    </div>
                  </div>
                </div>

                <div className="p-5">
                  {/* Visit history */}
                  <div className="mb-4">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Visit History</p>
                    <div className="flex flex-wrap gap-2">
                      {v.visits.map((visit) => (
                        <div key={visit.id} className="bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-1.5">
                          <p className="text-xs font-bold text-emerald-700">{visit.dt}</p>
                          <p className="text-[10px] text-emerald-600">Checked in at {new Date(visit.checkedInAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Items ordered */}
                  {v.items.length > 0 ? (
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{"🍽️"} Items Ordered</p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {v.items.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-2 bg-gray-50 rounded-xl p-2">
                            {item.f?.img ? <img src={item.f.img} className="w-10 h-10 rounded-lg object-cover" /> : null}
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold truncate">{item.f?.n || "Item"}</p>
                              <p className="text-[10px] text-gray-500">{"×"}{item.totalQty} - KES {(item.f?.p || 0) * item.totalQty}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-center py-4"><p className="text-xs text-gray-300 font-black tracking-widest uppercase">YOUR POCKET, YOUR BITE</p></div>
      </main>
    </div>
  );
}