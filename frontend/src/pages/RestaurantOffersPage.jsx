import { useState } from "react";
import Navbar from "../components/Navbar.jsx";
import { useApp } from "../store/AppContext.jsx";
import { useSocket } from "../store/SocketContext.jsx";

const REST_TABS = [
  { path: "/restaurant/dashboard", label: "📊 Dashboard" },
  { path: "/restaurant/menu", label: "🍽️ Menu" },
  { path: "/restaurant/bookings", label: "📅 Bookings" },
  { path: "/restaurant/payments", label: "💳 Payments" },
  { path: "/restaurant/reviews", label: "⭐ Reviews" },
  { path: "/restaurant/reports", label: "📈 Reports" },
  { path: "/restaurant/offers", label: "🎉 Offers" },
];

export default function RestaurantOffersPage() {
  const { myRest, setRests, notify } = useApp();
  const { socket } = useSocket();
  const [editing, setEditing] = useState(null);
  if (!myRest) return null;

  const today = new Date().toISOString().split("T")[0];

  const save = (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const off = {
      id: editing?.id || "o" + Date.now(),
      t: fd.get("t"),
      d: fd.get("d"),
      disc: +fd.get("disc"),
      vs: fd.get("vs"),
      vu: fd.get("vu"),
      a: true,
      createdAt: editing?.createdAt || new Date().toISOString(),
    };

    setRests((p) =>
      p.map((x) =>
        x.id === myRest.id
          ? {
              ...x,
              off: editing?.id
                ? x.off.map((o) => (o.id === editing.id ? off : o))
                : [...x.off, off],
            }
          : x
      )
    );

    // Emit to diners via socket so it reflects on their homepage
    if (socket) {
      socket.emit("new_offer_added", {
        restaurantId: myRest.id,
        restaurantName: myRest.n,
        offer: off,
      });
    }

    setEditing(null);
    notify(editing?.id ? "Offer updated ✅" : "Offer created & live on diner homepage! 🎉");
  };

  const toggleOffer = (offerId) => {
    setRests((p) =>
      p.map((x) =>
        x.id === myRest.id
          ? { ...x, off: x.off.map((o) => (o.id === offerId ? { ...o, a: !o.a } : o)) }
          : x
      )
    );

    const offer = myRest.off.find((o) => o.id === offerId);
    notify(offer?.a ? "Offer deactivated" : "Offer activated & live! 🎉");
  };

  const deleteOffer = (offerId) => {
    if (!confirm("Delete this offer permanently?")) return;
    setRests((p) =>
      p.map((x) =>
        x.id === myRest.id
          ? { ...x, off: x.off.filter((o) => o.id !== offerId) }
          : x
      )
    );
    notify("Offer deleted");
  };

  const getOfferStatus = (o) => {
    if (!o.a) return { label: "DISABLED", color: "bg-gray-400 text-white" };
    const now = today;
    if (o.vs && now < o.vs) return { label: "SCHEDULED", color: "bg-blue-500 text-white" };
    if (o.vu && now > o.vu) return { label: "EXPIRED", color: "bg-red-500 text-white" };
    return { label: "LIVE", color: "bg-emerald-500 text-white" };
  };

  // Sort: LIVE → SCHEDULED → DISABLED → EXPIRED
  const sortedOffers = [...myRest.off].sort((a, b) => {
    const order = { LIVE: 0, SCHEDULED: 1, DISABLED: 2, EXPIRED: 3 };
    return order[getOfferStatus(a).label] - order[getOfferStatus(b).label];
  });

  const liveCount = myRest.off.filter((o) => getOfferStatus(o).label === "LIVE").length;
  const scheduledCount = myRest.off.filter((o) => getOfferStatus(o).label === "SCHEDULED").length;
  const expiredCount = myRest.off.filter((o) => getOfferStatus(o).label === "EXPIRED").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-purple-50/30">
      <Navbar tabs={REST_TABS} title={myRest.n} role="Restaurant" />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <div className="flex justify-between items-center flex-wrap gap-3">
          <div>
            <h2 className="text-2xl font-black">🎉 {myRest.n} — Offers</h2>
            <p className="text-sm text-gray-500 mt-1">
              {myRest.off.length} offer{myRest.off.length === 1 ? "" : "s"} • Saved offers auto-reflect on diner homepage
            </p>
          </div>
          <button
            onClick={() => setEditing({})}
            className="px-5 py-2.5 bg-pink-600 text-white rounded-xl font-bold shadow-md hover:bg-pink-700"
          >
            + Create New Offer
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 text-center">
            <p className="text-2xl font-black text-emerald-600">{liveCount}</p>
            <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider">🟢 Live</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3 text-center">
            <p className="text-2xl font-black text-blue-600">{scheduledCount}</p>
            <p className="text-xs font-bold text-blue-700 uppercase tracking-wider">📅 Scheduled</p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-2xl p-3 text-center">
            <p className="text-2xl font-black text-red-500">{expiredCount}</p>
            <p className="text-xs font-bold text-red-600 uppercase tracking-wider">⏰ Expired</p>
          </div>
        </div>

        {/* Offers List */}
        {myRest.off.length === 0 ? (
          <div className="py-16 bg-white rounded-3xl border-2 border-dashed flex flex-col items-center text-gray-400">
            <span className="text-5xl mb-4">🎯</span>
            <p className="font-bold mb-2">No offers yet</p>
            <p className="text-sm">Create your first offer to attract more diners!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {sortedOffers.map((o) => {
              const status = getOfferStatus(o);
              const isActive = status.label === "LIVE";
              return (
                <div
                  key={o.id}
                  className={`rounded-2xl p-5 relative overflow-hidden shadow-lg transition-all ${
                    isActive
                      ? "bg-gradient-to-br from-pink-500 to-orange-500 text-white"
                      : status.label === "SCHEDULED"
                      ? "bg-gradient-to-br from-blue-400 to-indigo-500 text-white"
                      : status.label === "EXPIRED"
                      ? "bg-gradient-to-br from-gray-500 to-gray-700 text-white opacity-80"
                      : "bg-gradient-to-br from-gray-300 to-gray-400 text-white opacity-70"
                  }`}
                >
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-black text-xl">{o.t}</h4>
                      <span className={`text-[10px] px-2 py-1 rounded-full font-black uppercase shadow ${status.color}`}>
                        {status.label}
                      </span>
                    </div>
                    <p className="text-white/90 text-sm mb-3">{o.d}</p>

                    <div className="flex items-center gap-1.5 text-[10px] font-black bg-white/20 backdrop-blur px-2.5 py-1.5 rounded-full inline-flex mb-2">
                      <span>💯 {o.disc}% OFF</span>
                    </div>

                    {/* Timeline */}
                    <div className="bg-black/20 backdrop-blur rounded-xl p-2.5 my-3 text-[11px] space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-white/80">📅 Starts:</span>
                        <span className="font-bold">{o.vs || "Immediately"}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white/80">⏰ Expires:</span>
                        <span className="font-bold">{o.vu || "No expiry"}</span>
                      </div>
                      {o.createdAt && (
                        <div className="flex items-center justify-between pt-1 border-t border-white/20">
                          <span className="text-white/70">✍️ Created:</span>
                          <span className="font-medium text-white/90">
                            {new Date(o.createdAt).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}{" "}
                            at{" "}
                            {new Date(o.createdAt).toLocaleTimeString("en-GB", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-3 border-t border-white/20">
                      <button
                        onClick={() => setEditing(o)}
                        className="flex-1 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-black transition-all"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => toggleOffer(o.id)}
                        className="flex-1 py-2 bg-black/20 hover:bg-black/30 rounded-lg text-xs font-black transition-all"
                      >
                        {o.a ? "⏸ Deactivate" : "▶ Activate"}
                      </button>
                      <button
                        onClick={() => deleteOffer(o.id)}
                        className="px-3 py-2 bg-red-500/30 hover:bg-red-500/50 rounded-lg text-xs font-black transition-all"
                      >
                        🗑
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Create/Edit Modal */}
      {editing !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setEditing(null)} />
          <div className="relative bg-white rounded-3xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="font-black text-2xl mb-6">
              {editing.id ? "✏️ Edit Offer" : "🎉 New Offer"}
            </h3>
            <form onSubmit={save} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Title</label>
                <input
                  name="t"
                  required
                  defaultValue={editing.t}
                  placeholder="e.g. Happy Hour 🌟"
                  className="w-full px-4 py-3 bg-gray-50 border rounded-xl"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Description</label>
                <input
                  name="d"
                  required
                  defaultValue={editing.d}
                  placeholder="20% off all main courses"
                  className="w-full px-4 py-3 bg-gray-50 border rounded-xl"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Discount %</label>
                <input
                  name="disc"
                  type="number"
                  min="1"
                  max="100"
                  required
                  defaultValue={editing.disc}
                  placeholder="20"
                  className="w-full px-4 py-3 bg-gray-50 border rounded-xl"
                />
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 space-y-3">
                <p className="text-xs font-black text-blue-700 uppercase tracking-wider">📅 Timeline</p>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Valid From (optional)</label>
                  <input
                    name="vs"
                    type="date"
                    defaultValue={editing.vs || today}
                    className="w-full px-4 py-2.5 bg-white border rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Valid Until</label>
                  <input
                    name="vu"
                    type="date"
                    required
                    defaultValue={editing.vu}
                    min={today}
                    className="w-full px-4 py-2.5 bg-white border rounded-xl"
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="flex-1 py-3 border rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-pink-600 text-white rounded-xl font-black shadow-md hover:bg-pink-700"
                >
                  {editing.id ? "Save Changes" : "Create & Publish"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}