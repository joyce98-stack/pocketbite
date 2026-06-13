import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import { useApp } from "../store/AppContext.jsx";

const DINER_TABS = [
  { path: "/home", label: "Home" },
  { path: "/wishlist", label: "Wishlist" },
  { path: "/my-bookings", label: "Bookings" },
  { path: "/notifications", label: "Alerts" },
];

export default function SocialDiningPage() {
  const navigate = useNavigate();
  const { user, users, bks, rests, notify, trackActivity, sendInvite } = useApp();
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRestId, setInviteRestId] = useState("");
  const [sharedList] = useState(() => JSON.parse(localStorage.getItem("pb_shared_lists") || "[]").filter((s) => s.userId === user?.id));

  // Restaurants I've dined at
  const myDinedRests = useMemo(() => {
    const restIds = [...new Set(bks.filter((b) => b.did === user?.id && b.st === "confirmed").map((b) => b.rid))];
    return restIds.map((id) => rests.find((r) => r.id === id)).filter(Boolean);
  }, [bks, rests, user]);

  // Popular among all diners
  const popularRests = useMemo(() => {
    const counts = {};
    bks.filter((b) => b.st === "confirmed").forEach((b) => { counts[b.rid] = (counts[b.rid] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([id, count]) => {
      const r = rests.find((r) => r.id === id);
      return r ? { ...r, bookingCount: count } : null;
    }).filter(Boolean);
  }, [bks, rests]);

  // Shared list restaurants
  const savedRests = useMemo(() => {
    return sharedList.map((s) => rests.find((r) => r.id === s.restaurantId)).filter(Boolean);
  }, [sharedList, rests]);

  // Other diners' recent activity
  const recentDiners = useMemo(() => {
    const recent = bks.filter((b) => b.st === "confirmed" && b.did !== user?.id).sort((a, b) => new Date(b.ca) - new Date(a.ca)).slice(0, 8);
    return recent.map((b) => {
      const diner = users.find((u) => u.id === b.did);
      const rest = rests.find((r) => r.id === b.rid);
      return diner && rest ? { diner, rest, booking: b } : null;
    }).filter(Boolean);
  }, [bks, users, rests, user]);

  const handleInvite = () => {
    if (!inviteEmail || !inviteRestId) { notify("Select a restaurant and enter an email"); return; }
    const rest = rests.find((r) => r.id === inviteRestId);
    sendInvite(inviteEmail, inviteRestId, rest?.n || "Restaurant");
    setInviteEmail("");
    setInviteRestId("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50/30">
      <Navbar tabs={DINER_TABS} title={user.nm} role="Diner" />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-8">
        <div>
          <h2 className="text-2xl font-black">{"💕"} Social Dining</h2>
          <p className="text-sm text-gray-500">Share, invite, and discover where others are dining</p>
        </div>

        {/* Invite a Friend */}
        <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-3xl shadow-lg border border-pink-200 p-6">
          <h3 className="font-black text-lg text-pink-800 mb-4">{"💌"} Invite a Friend to Dine</h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-pink-700 block mb-1">Pick a Restaurant</label>
              <select value={inviteRestId} onChange={(e) => setInviteRestId(e.target.value)} className="w-full px-4 py-3 bg-white border border-pink-200 rounded-xl text-sm">
                <option value="">Select restaurant...</option>
                {rests.map((r) => <option key={r.id} value={r.id}>{r.n} - {r.cui}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-pink-700 block mb-1">Friend's Email</label>
              <input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="friend@email.com" className="w-full px-4 py-3 bg-white border border-pink-200 rounded-xl text-sm" />
            </div>
            <button onClick={handleInvite} disabled={!inviteEmail || !inviteRestId} className="w-full py-3 bg-pink-500 text-white rounded-xl font-black text-sm hover:bg-pink-600 disabled:opacity-50">
              Send Dining Invite {"→"}
            </button>
            <p className="text-[11px] text-pink-600">Your friend will see the invite in their notifications page.</p>
          </div>
        </div>

        {/* My Dining History */}
        {myDinedRests.length > 0 ? (
          <div>
            <h3 className="font-black text-lg mb-3">{"🍽️"} Places I've Dined</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {myDinedRests.map((r) => (
                <div key={r.id} onClick={() => navigate("/restaurant/" + r.id)} className="cursor-pointer group bg-white rounded-2xl overflow-hidden border shadow-sm hover:shadow-lg transition-all">
                  <div className="relative h-24 overflow-hidden"><img src={r.img} className="w-full h-full object-cover group-hover:scale-105 transition-transform" /></div>
                  <div className="p-3"><h4 className="font-bold text-sm truncate">{r.n}</h4><p className="text-[10px] text-gray-500">{r.cui}</p><p className="text-[10px] font-bold text-amber-500">{"★"} {r.rt}</p></div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* Saved List */}
        {savedRests.length > 0 ? (
          <div>
            <h3 className="font-black text-lg mb-3">{"📋"} My Saved List</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {savedRests.map((r) => (
                <div key={r.id} onClick={() => navigate("/restaurant/" + r.id)} className="cursor-pointer group bg-white rounded-2xl overflow-hidden border shadow-sm hover:shadow-lg transition-all">
                  <div className="relative h-24 overflow-hidden"><img src={r.img} className="w-full h-full object-cover group-hover:scale-105 transition-transform" /></div>
                  <div className="p-3"><h4 className="font-bold text-sm truncate">{r.n}</h4><p className="text-[10px] text-gray-500">{r.cui}</p></div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* Popular Among Diners */}
        <div>
          <h3 className="font-black text-lg mb-3">{"🔥"} Popular Among PocketBite Diners</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {popularRests.map((r) => (
              <div key={r.id} onClick={() => navigate("/restaurant/" + r.id)} className="cursor-pointer group bg-white rounded-2xl overflow-hidden border shadow-sm hover:shadow-lg transition-all">
                <div className="relative h-24 overflow-hidden">
                  <img src={r.img} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  <span className="absolute top-2 right-2 bg-amber-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">{r.bookingCount} bookings</span>
                </div>
                <div className="p-3"><h4 className="font-bold text-sm truncate">{r.n}</h4><p className="text-[10px] text-gray-500">{r.cui} - {"★"} {r.rt}</p></div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        {recentDiners.length > 0 ? (
          <div>
            <h3 className="font-black text-lg mb-3">{"👥"} Recent Dining Activity</h3>
            <div className="space-y-2">
              {recentDiners.map((item, idx) => (
                <div key={idx} onClick={() => navigate("/restaurant/" + item.rest.id)} className="cursor-pointer flex items-center gap-3 bg-white rounded-xl p-3 border hover:shadow-md transition-all">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-400 to-purple-400 flex items-center justify-center text-white font-black text-xs shadow">
                    {item.diner.nm?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm"><span className="font-bold">{item.diner.nm}</span> <span className="text-gray-500">dined at</span> <span className="font-bold text-emerald-700">{item.rest.n}</span></p>
                    <p className="text-[10px] text-gray-400">{new Date(item.booking.ca).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</p>
                  </div>
                  <img src={item.rest.img} className="w-10 h-10 rounded-lg object-cover" />
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* Footer */}
        <div className="text-center py-4">
          <p className="text-xs text-gray-300 font-black tracking-widest uppercase">YOUR POCKET, YOUR BITE</p>
        </div>
      </main>
    </div>
  );
}