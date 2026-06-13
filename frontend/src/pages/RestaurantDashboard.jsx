import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import { useApp } from "../store/AppContext.jsx";

const REST_TABS = [
  { path: "/restaurant/dashboard", label: "📊 Dashboard" },
  { path: "/restaurant/menu", label: "🍽️ Menu" },
  { path: "/restaurant/bookings", label: "📅 Bookings" },
  { path: "/restaurant/group-bookings", label: "👥 Group" },
  { path: "/restaurant/notifications", label: "🔔 Alerts" },
  { path: "/restaurant/payments", label: "💳 Payments" },
  { path: "/restaurant/reviews", label: "⭐ Reviews" },
  { path: "/restaurant/reports", label: "📈 Reports" },
  { path: "/restaurant/offers", label: "🎉 Offers" },
];

export default function RestaurantDashboard() {
  const navigate = useNavigate();
  const { user, myRest, bks, setRests, notify, groupBookings, notifications } = useApp();
  const [status, setStatus] = useState(myRest?.status || "open");
  const [showCheckedIn, setShowCheckedIn] = useState(false);

  useEffect(() => {
    if (myRest?.status) setStatus(myRest.status);
  }, [myRest?.status]);

  if (!myRest) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl p-8 shadow-xl border max-w-md text-center">
          <div className="text-6xl mb-4">{"🍳"}</div>
          <h2 className="text-2xl font-black mb-2">No Restaurant Linked</h2>
          <p className="text-gray-500">Your account ({user.em}) is not linked to a restaurant.</p>
        </div>
      </div>
    );
  }

  const rb = bks.filter((b) => b.rid === myRest.id);
  const confirmed = rb.filter((b) => b.st === "confirmed");
  const checkedIn = rb.filter((b) => b.checkedIn);
  const cancelled = rb.filter((b) => b.st === "cancelled");
  const pending = rb.filter((b) => b.st === "pending_payment");
  const rev = confirmed.reduce((s, b) => s + b.dep, 0);
  const todayStr = new Date().toISOString().split("T")[0];
  const todayBookings = rb.filter((b) => b.dt === todayStr);
  const pendingGroups = groupBookings.filter((gb) => gb.restaurantId === myRest.id && gb.status === "pending");
  const restNotifs = (notifications || []).filter((n) => n.targetUserId === user?.id && !n.read);

  const updateStatus = (s) => {
    setStatus(s);
    setRests((prev) => prev.map((r) => (r.id === myRest.id ? { ...r, status: s } : r)));
    notify("Status: " + s.toUpperCase());
  };

  const updateHours = (field, value) => {
    setRests((prev) => prev.map((r) => (r.id === myRest.id ? { ...r, [field]: value } : r)));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-purple-50/30">
      <Navbar tabs={REST_TABS} title={myRest.n} role="Restaurant" />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* Live Banner */}
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-green-100 bg-white/80 p-4 shadow-sm">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-green-600">Live portal</p>
            <p className="text-sm text-gray-600">Bookings and group requests reflect automatically.</p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-xl bg-green-50 px-3 py-2 text-xs font-black text-green-700">
            <span className="h-2 w-2 animate-pulse rounded-full bg-green-500"></span>LIVE
          </span>
        </div>

        {/* Alerts */}
        {restNotifs.length > 0 ? (
          <div onClick={() => navigate("/restaurant/notifications")} className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:shadow-md">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{"🔔"}</span>
              <div>
                <p className="font-black text-blue-900">{restNotifs.length} New Notification{restNotifs.length > 1 ? "s" : ""}</p>
                <p className="text-xs text-blue-700">{restNotifs[0].title}</p>
              </div>
            </div>
            <span className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold text-xs">View {"→"}</span>
          </div>
        ) : null}

        {pendingGroups.length > 0 ? (
          <div onClick={() => navigate("/restaurant/group-bookings")} className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:shadow-md">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{"⚠️"}</span>
              <div>
                <p className="font-black text-amber-900">{pendingGroups.length} Group Request{pendingGroups.length > 1 ? "s" : ""} Awaiting Approval</p>
                <p className="text-xs text-amber-700">Tap to review and approve/decline.</p>
              </div>
            </div>
            <span className="px-4 py-2 bg-amber-500 text-white rounded-xl font-bold text-xs">Review {"→"}</span>
          </div>
        ) : null}

        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 rounded-3xl p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="relative z-10">
            <h1 className="text-3xl font-black">{myRest.n}</h1>
            <p className="text-white/90">{myRest.cui} - {myRest.loc}</p>
            <div className="flex flex-wrap gap-3 mt-3">
              <span className="bg-white/20 px-3 py-1.5 rounded-full text-sm font-bold">{"⭐"} {myRest.rt}</span>
              <span className="bg-white/20 px-3 py-1.5 rounded-full text-sm font-bold">{"❤️"} {myRest.lk}</span>
              <span className="bg-white/20 px-3 py-1.5 rounded-full text-sm font-bold">{"💬"} {myRest.rv.length}</span>
              <span className="bg-white/20 px-3 py-1.5 rounded-full text-sm font-bold">{"🕐"} {myRest.oh} - {myRest.ch}</span>
            </div>
          </div>
        </div>

        {/* Status - Clean 3-column grid */}
        <div className="bg-white rounded-3xl p-6 shadow-lg border">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-black text-lg">Current Status</h3>
              <p className="text-xs text-gray-500">Diners see this on your page</p>
            </div>
            <span className={"px-3 py-1.5 rounded-full text-xs font-black " + (status === "open" ? "bg-green-100 text-green-700" : status === "busy" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700")}>
              {status === "open" ? "🟢 OPEN" : status === "busy" ? "🟡 BUSY" : "🔴 CLOSED"}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { key: "open", icon: "🟢", label: "Open", color: "from-green-500 to-emerald-600", desc: "Accept bookings" },
              { key: "busy", icon: "🟡", label: "Busy", color: "from-amber-500 to-orange-500", desc: "Limited capacity" },
              { key: "closed", icon: "🔴", label: "Closed", color: "from-red-500 to-rose-600", desc: "No bookings" },
            ].map((s) => (
              <button
                key={s.key}
                onClick={() => updateStatus(s.key)}
                className={
                  "p-4 rounded-2xl text-white shadow-lg transition-all text-center " +
                  (status === s.key
                    ? "bg-gradient-to-br " + s.color + " ring-4 ring-offset-2 ring-purple-300 scale-105"
                    : "bg-gray-200 text-gray-500 hover:bg-gray-300")
                }
              >
                <div className="text-2xl mb-1">{s.icon}</div>
                <div className="font-black">{s.label}</div>
                <div className="text-[10px] opacity-80">{s.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Hours - Clean 2-column */}
        <div className="bg-white rounded-3xl p-6 shadow-lg border">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-black text-lg">{"🕐"} Operating Hours</h3>
              <p className="text-xs text-gray-500">Auto-saved when changed</p>
            </div>
            <span className="text-xs text-green-600 font-bold">{"✓"} Auto-saved</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-50 rounded-2xl p-4 border border-green-100">
              <label className="text-xs font-black text-green-700 uppercase tracking-wider block mb-2">Opens At</label>
              <input value={myRest.oh} onChange={(e) => updateHours("oh", e.target.value)} className="w-full px-4 py-3 bg-white border border-green-200 rounded-xl font-bold text-green-800 focus:outline-none focus:border-green-500" />
            </div>
            <div className="bg-red-50 rounded-2xl p-4 border border-red-100">
              <label className="text-xs font-black text-red-700 uppercase tracking-wider block mb-2">Closes At</label>
              <input value={myRest.ch} onChange={(e) => updateHours("ch", e.target.value)} className="w-full px-4 py-3 bg-white border border-red-200 rounded-xl font-bold text-red-800 focus:outline-none focus:border-red-500" />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { l: "Today", v: todayBookings.length, i: "📅", c: "from-blue-500 to-cyan-500" },
            { l: "Total", v: rb.length, i: "🎫", c: "from-emerald-500 to-green-500" },
            { l: "Revenue", v: "KES " + rev.toLocaleString(), i: "💰", c: "from-orange-500 to-pink-500" },
            { l: "Checked In", v: checkedIn.length, i: "📍", c: "from-purple-500 to-indigo-500", clickable: true },
          ].map((s) => (
            <div key={s.l} onClick={s.clickable ? () => setShowCheckedIn(!showCheckedIn) : undefined} className={"bg-white rounded-3xl p-5 shadow-lg border " + (s.clickable ? "cursor-pointer hover:shadow-xl" : "")}>
              <div className={"w-12 h-12 rounded-2xl bg-gradient-to-br " + s.c + " flex items-center justify-center text-2xl shadow-lg mb-3"}>{s.i}</div>
              <p className="text-2xl font-black">{s.v}</p>
              <p className="text-sm text-gray-600">{s.l}</p>
            </div>
          ))}
        </div>

        {/* Checked In Detail */}
        {showCheckedIn ? (
          <div className="bg-white rounded-3xl p-6 shadow-lg border">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-black text-xl">{"📍"} Checked-In Diners ({checkedIn.length})</h3>
              <button onClick={() => setShowCheckedIn(false)} className="text-gray-400 text-lg">{"✕"}</button>
            </div>
            {checkedIn.length === 0 ? <p className="text-gray-500 text-center py-6">No diners checked in.</p> : (
              <div className="space-y-3">
                {checkedIn.map((bk) => (
                  <div key={bk.id} className="flex items-center justify-between p-4 bg-purple-50 rounded-xl border border-purple-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-black text-sm">{bk.dn?.charAt(0).toUpperCase()}</div>
                      <div>
                        <p className="font-bold text-sm">{bk.dn}</p>
                        <p className="text-xs text-purple-600">Checked in: {new Date(bk.checkedInAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}</p>
                        <p className="text-[10px] text-gray-500">{bk.dt} at {bk.tm} - {bk.items?.length || 0} items</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm text-emerald-700">KES {bk.dep}</p>
                      <p className="text-[10px] text-gray-400">Balance: KES {bk.tot - bk.dep}</p>
                      {bk.mc ? <p className="text-[10px] text-gray-400 font-mono">{bk.mc}</p> : null}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : null}

        {/* Status Breakdown */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { l: "Confirmed", v: confirmed.length, c: "bg-green-100 text-green-700" },
            { l: "Checked In", v: checkedIn.length, c: "bg-purple-100 text-purple-700" },
            { l: "Pending", v: pending.length, c: "bg-amber-100 text-amber-700" },
            { l: "Cancelled", v: cancelled.length, c: "bg-red-100 text-red-700" },
          ].map((s) => (
            <div key={s.l} className={"rounded-xl p-3 text-center " + s.c}><p className="text-xl font-black">{s.v}</p><p className="text-[10px] font-bold">{s.l}</p></div>
          ))}
        </div>

        {/* Pending Groups */}
        {pendingGroups.length > 0 ? (
          <div className="bg-white rounded-3xl p-6 shadow-lg border">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-black text-xl">{"👥"} Pending Group Requests</h3>
              <button onClick={() => navigate("/restaurant/group-bookings")} className="text-sm font-bold text-indigo-600 hover:underline">View All {"→"}</button>
            </div>
            <div className="space-y-3">
              {pendingGroups.slice(0, 3).map((gb) => (
                <div key={gb.id} onClick={() => navigate("/restaurant/group-bookings")} className="flex items-center justify-between p-3 bg-amber-50 rounded-xl border border-amber-200 cursor-pointer hover:shadow-md">
                  <div>
                    <p className="font-bold text-sm">{gb.dinerName}</p>
                    <p className="text-xs text-amber-700">{gb.partySize} guests - {gb.preferredDate} at {gb.preferredTime} - {gb.occasion}</p>
                  </div>
                  <span className="px-3 py-1.5 bg-amber-500 text-white rounded-lg text-xs font-bold">Review</span>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* Recent Bookings */}
        <div className="bg-white rounded-3xl p-6 shadow-lg border">
          <h3 className="font-black text-xl mb-4">Recent Bookings</h3>
          {rb.length === 0 ? <p className="text-gray-500 text-center py-8">No bookings</p> : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {rb.slice().reverse().slice(0, 12).map((bk) => (
                <div key={bk.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100">
                  <div className="flex items-center gap-3">
                    <div className={"w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold " + (bk.checkedIn ? "bg-purple-500" : bk.st === "confirmed" ? "bg-green-500" : bk.st === "cancelled" ? "bg-red-400" : "bg-amber-500")}>
                      {bk.checkedIn ? "📍" : bk.st === "confirmed" ? "✓" : bk.st === "cancelled" ? "✕" : "⏳"}
                    </div>
                    <div>
                      <p className="font-bold text-sm">{bk.dn}</p>
                      <p className="text-xs text-gray-500">{bk.dt} at {bk.tm} - {bk.items?.length || 0} items</p>
                      {bk.checkedIn ? <p className="text-[10px] text-purple-600 font-bold">Checked in</p> : null}
                      {bk.adjusted ? <p className="text-[10px] text-blue-600 font-bold">Adjusted</p> : null}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm text-emerald-700">KES {bk.dep}</p>
                    <span className={"text-[10px] px-2 py-0.5 rounded-full font-bold " + (bk.checkedIn ? "bg-purple-100 text-purple-700" : bk.st === "confirmed" ? "bg-green-100 text-green-700" : bk.st === "cancelled" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700")}>
                      {bk.checkedIn ? "CHECKED IN" : bk.st.replace("_", " ").toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="text-center py-4"><p className="text-xs text-gray-300 font-black tracking-widest uppercase">YOUR POCKET, YOUR BITE</p></div>
      </main>
    </div>
  );
}