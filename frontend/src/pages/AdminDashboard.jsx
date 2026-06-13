import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import { useApp } from "../store/AppContext.jsx";

const ADMIN_TABS = [
  { path: "/admin/dashboard", label: "📊 Dashboard" },
  { path: "/admin/restaurants", label: "🏪 Restaurants" },
  { path: "/admin/bookings", label: "📅 Bookings" },
  { path: "/admin/payments", label: "💳 Payments" },
  { path: "/admin/reviews", label: "⭐ Reviews" },
  { path: "/admin/users", label: "👥 Users" },
  { path: "/admin/reports", label: "📈 Reports" },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { rests, users, bks, activities, isUserActive, isNewRestaurant, groupBookings } = useApp();

  const totalRev = bks.filter((b) => b.st === "confirmed").reduce((s, b) => s + b.dep, 0);
  const totalBalance = bks.filter((b) => b.st === "confirmed").reduce((s, b) => s + (b.tot - b.dep), 0);
  const top5 = useMemo(() => [...rests].sort((a, b) => b.lk - a.lk).slice(0, 5), [rests]);
  const newRests = rests.filter((r) => isNewRestaurant(r));

  const todayStr = new Date().toISOString().split("T")[0];
  const todayBookings = bks.filter((b) => b.dt === todayStr);
  const todayRev = todayBookings.filter((b) => b.st === "confirmed").reduce((s, b) => s + b.dep, 0);
  const checkedIn = bks.filter((b) => b.checkedIn);
  const onlineUsers = users.filter((u) => isUserActive(u.id)).length;
  const pendingGroups = groupBookings.filter((gb) => gb.status === "pending");

  const todayActivities = activities.filter((a) => new Date(a.timestamp).toDateString() === new Date().toDateString());
  const recentActivities = useMemo(() => [...activities].reverse().slice(0, 15), [activities]);

  const revenueByDay = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const ds = d.toISOString().split("T")[0];
      days.push({ day: d.toLocaleDateString("en-GB", { weekday: "short" }), date: d.toLocaleDateString("en-GB", { day: "numeric", month: "short" }), rev: bks.filter((b) => b.dt === ds && b.st === "confirmed").reduce((s, b) => s + b.dep, 0) });
    }
    return days;
  }, [bks]);
  const maxRev = Math.max(...revenueByDay.map((d) => d.rev), 1);

  const actionIcons = { page_view: "📌", searched: "🔍", clicked_restaurant: "👀", viewed_restaurant: "🏪", left_restaurant: "🚪", added_to_cart: "🛒", went_to_cart: "📋", booking_confirmed: "✅", cancelled_booking: "❌", posted_review: "⭐", logged_out: "👋", checked_in: "📍", group_booking_submitted: "👥", invited_friend: "💌" };

  const formatDate = (d) => new Date(d).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-purple-50/30">
      <Navbar tabs={ADMIN_TABS} title="Admin" role="Admin" />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 print-area">

        <div className="bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 rounded-3xl p-8 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-20"><div className="absolute top-0 right-0 w-96 h-96 bg-purple-500 rounded-full blur-3xl" /></div>
          <div className="relative z-10">
            <h1 className="text-3xl font-black mb-2">PocketBite Admin</h1>
            <p className="text-white/80">Platform overview - Real-time data</p>
            <div className="flex flex-wrap gap-3 mt-3">
              <span className="bg-white/20 px-3 py-1.5 rounded-full text-sm font-bold">{"🟢"} {onlineUsers} online</span>
              <span className="bg-white/20 px-3 py-1.5 rounded-full text-sm font-bold">{"📊"} {todayActivities.length} actions today</span>
              <span className="bg-white/20 px-3 py-1.5 rounded-full text-sm font-bold">{"📍"} {checkedIn.length} checked in</span>
              {pendingGroups.length > 0 ? <span className="bg-amber-500/40 px-3 py-1.5 rounded-full text-sm font-bold animate-pulse">{"👥"} {pendingGroups.length} pending groups</span> : null}
              {newRests.length > 0 ? <span className="bg-green-500/40 px-3 py-1.5 rounded-full text-sm font-bold">{"✨"} {newRests.length} new spots</span> : null}
            </div>
          </div>
        </div>

        {/* Main Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { l: "Total Revenue", v: "KES " + totalRev.toLocaleString(), i: "💰", c: "from-emerald-400 to-green-500" },
            { l: "Today's Revenue", v: "KES " + todayRev.toLocaleString(), i: "📅", c: "from-blue-400 to-cyan-500" },
            { l: "Pending Balance", v: "KES " + totalBalance.toLocaleString(), i: "⏳", c: "from-orange-400 to-pink-500" },
            { l: "Online Users", v: onlineUsers, i: "🟢", c: "from-green-400 to-emerald-500" },
          ].map((s) => (
            <div key={s.l} className="bg-white rounded-3xl p-5 shadow-lg border">
              <div className={"w-12 h-12 rounded-2xl bg-gradient-to-br " + s.c + " flex items-center justify-center text-2xl mb-3 shadow-md"}>{s.i}</div>
              <p className="text-2xl font-black">{s.v}</p>
              <p className="text-sm text-gray-600">{s.l}</p>
            </div>
          ))}
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          {[
            { l: "Restaurants", v: rests.length, i: "🏪" },
            { l: "Users", v: users.length, i: "👥" },
            { l: "Bookings", v: bks.length, i: "🎫" },
            { l: "Confirmed", v: bks.filter((b) => b.st === "confirmed").length, i: "✅" },
            { l: "Checked In", v: checkedIn.length, i: "📍" },
            { l: "Cancelled", v: bks.filter((b) => b.st === "cancelled").length, i: "❌" },
          ].map((s) => (
            <div key={s.l} className="bg-white rounded-2xl p-3 shadow-sm border text-center"><p className="text-lg">{s.i}</p><p className="text-xl font-black">{s.v}</p><p className="text-[10px] text-gray-500 font-bold uppercase">{s.l}</p></div>
          ))}
        </div>

        {/* Revenue Chart */}
        <div className="bg-white rounded-3xl p-6 shadow-lg border">
          <div className="flex justify-between items-center mb-6">
            <div><h3 className="font-black text-lg">Revenue - Last 7 Days</h3><p className="text-sm text-gray-500">Confirmed bookings</p></div>
            <button onClick={() => window.print()} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold print-hidden">{"🖨️"} Print</button>
          </div>
          <div className="flex items-end gap-3 h-48">
            {revenueByDay.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center group">
                <div className="relative w-full"><div className="w-full bg-gradient-to-t from-purple-500 to-indigo-500 rounded-t-xl transition-all hover:opacity-80" style={{ height: (d.rev / maxRev) * 192 + "px", minHeight: d.rev > 0 ? "8px" : "2px" }} /><div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 whitespace-nowrap">KES {d.rev.toLocaleString()}</div></div>
                <p className="text-xs text-gray-400 font-bold mt-2">{d.day}</p>
                <p className="text-[10px] text-gray-300">{d.date}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Bookings */}
          <div className="bg-white rounded-3xl p-6 shadow-lg border">
            <h3 className="font-black text-xl mb-4">Recent Bookings</h3>
            {bks.length === 0 ? <p className="text-gray-500 text-center py-8">No bookings</p> : (
              <div className="space-y-3 max-h-72 overflow-y-auto">
                {bks.slice().reverse().slice(0, 8).map((bk) => (
                  <div key={bk.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                    <div>
                      <p className="font-bold text-sm">{bk.dn} {"→"} {bk.rn}</p>
                      <p className="text-[11px] text-gray-500">{bk.dt} at {bk.tm} - KES {bk.dep}</p>
                      {bk.checkedIn ? <p className="text-[10px] text-purple-600 font-bold">{"📍"} Checked in</p> : null}
                    </div>
                    <span className={"px-2 py-1 rounded-full text-[10px] font-bold " + (bk.checkedIn ? "bg-purple-100 text-purple-700" : bk.st === "confirmed" ? "bg-green-100 text-green-700" : bk.st === "cancelled" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700")}>
                      {bk.checkedIn ? "CHECKED IN" : bk.st.replace("_", " ").toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top Restaurants */}
          <div className="bg-white rounded-3xl p-6 shadow-lg border">
            <h3 className="font-black text-xl mb-4">Top Restaurants</h3>
            <div className="space-y-3">
              {top5.map((r, i) => {
                const rBks = bks.filter((b) => b.rid === r.id && b.st === "confirmed");
                const rRev = rBks.reduce((s, b) => s + b.dep, 0);
                return (
                  <div key={r.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <span className={"w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-sm shadow " + (i === 0 ? "bg-amber-500" : i === 1 ? "bg-gray-400" : "bg-orange-300")}>{i === 0 ? "👑" : "#" + (i + 1)}</span>
                    <img src={r.img} className="w-12 h-12 rounded-lg object-cover shadow-sm" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2"><p className="font-bold text-sm">{r.n}</p>{isNewRestaurant(r) ? <span className="text-[9px] bg-green-500 text-white px-1.5 py-0.5 rounded-full font-black">NEW</span> : null}</div>
                      <p className="text-[11px] text-gray-500">{r.cui} - {rBks.length} bookings</p>
                    </div>
                    <div className="text-right"><span className="text-sm font-bold text-pink-600">{"❤️"} {r.lk}</span><p className="text-[10px] text-emerald-600 font-bold">KES {rRev.toLocaleString()}</p></div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Live Activity Feed */}
        <div className="bg-white rounded-3xl p-6 shadow-lg border">
          <div className="flex justify-between items-center mb-4">
            <div><h3 className="font-black text-xl">{"🔴"} Live Activity Feed</h3><p className="text-sm text-gray-500">{activities.length} total tracked</p></div>
            <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-600 rounded-full text-xs font-black border border-red-100"><span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />LIVE</span>
          </div>
          {recentActivities.length === 0 ? (
            <div className="text-center py-12"><p className="text-5xl mb-3">{"📊"}</p><p className="font-bold text-gray-500">No activities yet</p></div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {recentActivities.map((a) => (
                <div key={a.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-sm flex-shrink-0">{actionIcons[a.action] || "📌"}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm"><span className="font-bold text-gray-900">{a.userName}</span> <span className="text-gray-500">{a.action.replace(/_/g, " ")}</span></p>
                    <div className="flex flex-wrap gap-1 mt-0.5">
                      {a.details?.restaurantName ? <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-bold">{"📍"} {a.details.restaurantName}</span> : null}
                      {a.details?.query ? <span className="text-[10px] bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded font-bold">{a.details.query}</span> : null}
                      {a.details?.foodName ? <span className="text-[10px] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded font-bold">{a.details.foodName}</span> : null}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0"><p className="text-[10px] text-gray-400">{formatDate(a.timestamp)}</p><span className={"text-[9px] px-1.5 py-0.5 rounded-full font-bold " + (a.userRole === "diner" ? "bg-green-50 text-green-600" : a.userRole === "restaurant" ? "bg-purple-50 text-purple-600" : "bg-amber-50 text-amber-600")}>{a.userRole}</span></div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="hidden print:block text-center mt-8 pt-4 border-t"><p className="text-xs text-gray-400">PocketBite - Confidential Report - {new Date().toLocaleString()}</p></div>
      </main>
    </div>
  );
}