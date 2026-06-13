import { useState, useMemo } from "react";
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

const ACTION_LABELS = {
  page_view: { icon: "📌", label: "Viewed page" },
  searched: { icon: "🔍", label: "Searched" },
  clicked_restaurant: { icon: "👀", label: "Clicked restaurant" },
  viewed_restaurant: { icon: "🏪", label: "Viewed restaurant" },
  left_restaurant: { icon: "🚪", label: "Left restaurant" },
  filtered_menu: { icon: "🍽️", label: "Filtered menu" },
  added_to_cart: { icon: "🛒", label: "Added to cart" },
  went_to_cart: { icon: "📋", label: "Went to cart" },
  clicked_offer: { icon: "🎉", label: "Clicked offer" },
  clicked_similar_restaurant: { icon: "💜", label: "Clicked similar" },
  liked_restaurant: { icon: "❤️", label: "Liked restaurant" },
  unliked_restaurant: { icon: "💔", label: "Unliked restaurant" },
  added_to_wishlist: { icon: "💖", label: "Added to wishlist" },
  removed_from_wishlist: { icon: "💔", label: "Removed from wishlist" },
  booking_confirmed: { icon: "✅", label: "Booking confirmed" },
  cancelled_booking: { icon: "❌", label: "Cancelled booking" },
  posted_review: { icon: "⭐", label: "Posted review" },
  logged_out: { icon: "🚪", label: "Logged out" },
};

export default function AdminUsersPage() {
  const { users, bks, activities, getUserActivitySummary, isUserActive } = useApp();
  const [selectedUser, setSelectedUser] = useState(null);
  const [roleFilter, setRoleFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activityFilter, setActivityFilter] = useState("all");

  const filteredUsers = useMemo(() => {
    let list = [...users];
    if (roleFilter !== "all") list = list.filter((u) => u.role === roleFilter);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (u) =>
          u.nm?.toLowerCase().includes(q) ||
          u.em?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [users, roleFilter, searchQuery]);

  const formatDuration = (seconds) => {
    if (!seconds || seconds < 1) return "< 1s";
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleString("en-GB", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatFullDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const getLastLogin = (user) => {
    const history = user.loginHistory || [];
    if (history.length === 0) return null;
    return history[history.length - 1];
  };

  const getSessionDuration = (user) => {
    const lastSession = getLastLogin(user);
    if (!lastSession) return "—";
    const inTime = new Date(lastSession.in).getTime();
    const outTime = lastSession.out ? new Date(lastSession.out).getTime() : Date.now();
    return formatDuration(Math.round((outTime - inTime) / 1000));
  };

  const totalActivities = activities.length;
  const todayActivities = activities.filter(
    (a) => new Date(a.timestamp).toDateString() === new Date().toDateString()
  ).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-purple-50/30">
      <Navbar tabs={ADMIN_TABS} title="Admin" role="Admin" />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* Header */}
        <div className="flex justify-between items-center flex-wrap gap-3">
          <div>
            <h2 className="text-2xl font-black">👥 Platform Users & Activity Tracking</h2>
            <p className="text-sm text-gray-500">
              {users.length} users • {totalActivities} total actions • {todayActivities} today
            </p>
          </div>
          <div className="flex gap-3">
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="🔍 Search users..."
              className="px-3 py-2 border rounded-xl text-sm w-48"
            />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="border rounded-xl px-3 py-2 text-sm"
            >
              <option value="all">All Roles</option>
              <option value="diner">Diners</option>
              <option value="restaurant">Restaurants</option>
              <option value="admin">Admins</option>
            </select>
          </div>
        </div>

        {/* Role Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { role: "diner", icon: "🍽️", label: "Diners", color: "from-emerald-400 to-green-500" },
            { role: "restaurant", icon: "🍳", label: "Restaurants", color: "from-purple-400 to-indigo-500" },
            { role: "admin", icon: "👑", label: "Admins", color: "from-amber-400 to-orange-500" },
            { role: "active", icon: "🟢", label: "Online Now", color: "from-green-400 to-emerald-500" },
          ].map((r) => {
            const count = r.role === "active"
              ? users.filter((u) => isUserActive(u.id)).length
              : users.filter((u) => u.role === r.role).length;
            return (
              <div key={r.role} className="bg-white rounded-2xl p-5 shadow-lg border">
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${r.color} flex items-center justify-center text-xl shadow-md mb-3`}>
                  {r.icon}
                </div>
                <p className="text-2xl font-black">{count}</p>
                <p className="text-sm text-gray-500">{r.label}</p>
              </div>
            );
          })}
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-3xl shadow-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="text-left px-4 py-3 text-xs font-black text-gray-500 uppercase">User</th>
                  <th className="text-left px-4 py-3 text-xs font-black text-gray-500 uppercase">Email</th>
                  <th className="text-left px-4 py-3 text-xs font-black text-gray-500 uppercase">Role</th>
                  <th className="text-left px-4 py-3 text-xs font-black text-gray-500 uppercase">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-black text-gray-500 uppercase">Last Login</th>
                  <th className="text-left px-4 py-3 text-xs font-black text-gray-500 uppercase">Session</th>
                  <th className="text-left px-4 py-3 text-xs font-black text-gray-500 uppercase">Actions</th>
                  <th className="text-left px-4 py-3 text-xs font-black text-gray-500 uppercase">Activity</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => {
                  const stats = getUserActivitySummary(u.id);
                  const lastLogin = getLastLogin(u);
                  const active = isUserActive(u.id);
                  const bookings = bks.filter((b) => b.did === u.id).length;

                  return (
                    <tr
                      key={u.id}
                      className="border-b hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => setSelectedUser(u)}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-black text-sm shadow-md ${
                              u.role === "diner" ? "bg-gradient-to-br from-emerald-400 to-green-500" :
                              u.role === "restaurant" ? "bg-gradient-to-br from-purple-400 to-indigo-500" :
                              "bg-gradient-to-br from-amber-400 to-orange-500"
                            }`}>
                              {u.nm?.charAt(0).toUpperCase()}
                            </div>
                            {active && (
                              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                            )}
                          </div>
                          <span className="font-bold text-sm">{u.nm}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{u.em}</td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] px-2.5 py-1 rounded-full font-black uppercase ${
                          u.role === "diner" ? "bg-green-100 text-green-700" :
                          u.role === "restaurant" ? "bg-purple-100 text-purple-700" :
                          "bg-amber-100 text-amber-700"
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full font-bold ${active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                          {active ? "🟢 Online" : "⚪ Offline"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {lastLogin ? formatDate(lastLogin.in) : "—"}
                      </td>
                      <td className="px-4 py-3 text-xs font-bold text-gray-600">
                        {getSessionDuration(u)}
                      </td>
                      <td className="px-4 py-3 text-sm font-bold">{bookings} bookings</td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-blue-600 font-bold hover:underline">
                          {stats.totalActivities} actions →
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* User Activity Detail Modal */}
        {selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60" onClick={() => setSelectedUser(null)} />
            <div className="relative bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6">

              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white font-black text-xl shadow-lg ${
                      selectedUser.role === "diner" ? "bg-gradient-to-br from-emerald-400 to-green-500" :
                      selectedUser.role === "restaurant" ? "bg-gradient-to-br from-purple-400 to-indigo-500" :
                      "bg-gradient-to-br from-amber-400 to-orange-500"
                    }`}>
                      {selectedUser.nm?.charAt(0).toUpperCase()}
                    </div>
                    {isUserActive(selectedUser.id) && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-black text-xl">{selectedUser.nm}</h3>
                    <p className="text-sm text-gray-500">{selectedUser.em} • {selectedUser.role}</p>
                    <p className="text-xs text-gray-400">
                      Joined: {selectedUser.joinedAt ? formatFullDate(selectedUser.joinedAt) : "Unknown"}
                    </p>
                  </div>
                </div>
                <button onClick={() => setSelectedUser(null)} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
              </div>

              {(() => {
                const stats = getUserActivitySummary(selectedUser.id);
                const lastLogin = getLastLogin(selectedUser);
                const loginHistory = selectedUser.loginHistory || [];

                return (
                  <div className="space-y-6">

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        { l: "Total Actions", v: stats.totalActivities, i: "📊", c: "bg-blue-50 text-blue-700" },
                        { l: "Bookings", v: stats.totalBookings, i: "🎫", c: "bg-green-50 text-green-700" },
                        { l: "Total Spent", v: `KES ${stats.totalSpent.toLocaleString()}`, i: "💰", c: "bg-emerald-50 text-emerald-700" },
                        { l: "Searches", v: stats.searches, i: "🔍", c: "bg-purple-50 text-purple-700" },
                      ].map((s) => (
                        <div key={s.l} className={`rounded-xl p-3 text-center ${s.c}`}>
                          <p className="text-lg">{s.i}</p>
                          <p className="font-black text-lg">{s.v}</p>
                          <p className="text-[10px] font-bold uppercase">{s.l}</p>
                        </div>
                      ))}
                    </div>

                    {/* More Stats */}
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                      {[
                        { l: "Cart Adds", v: stats.cartAdds, i: "🛒" },
                        { l: "Wishlist", v: stats.wishlistAdds, i: "💖" },
                        { l: "Reviews", v: stats.reviewsPosted, i: "⭐" },
                        { l: "Confirmed", v: stats.confirmedBookings, i: "✅" },
                        { l: "Cancelled", v: stats.cancelledBookings, i: "❌" },
                        { l: "Page Views", v: stats.pageViews, i: "📌" },
                      ].map((s) => (
                        <div key={s.l} className="bg-gray-50 rounded-xl p-2 text-center">
                          <p className="text-sm">{s.i}</p>
                          <p className="font-black">{s.v}</p>
                          <p className="text-[9px] text-gray-500 font-bold uppercase">{s.l}</p>
                        </div>
                      ))}
                    </div>

                    {/* Login History */}
                    <div>
                      <h4 className="font-black text-lg mb-3">🔐 Login History</h4>
                      {loginHistory.length === 0 ? (
                        <p className="text-gray-500 text-sm">No login history.</p>
                      ) : (
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {loginHistory.slice().reverse().slice(0, 10).map((session, i) => (
                            <div key={i} className="flex items-center justify-between bg-gray-50 rounded-xl p-3 text-sm">
                              <div className="flex items-center gap-2">
                                <span className="text-green-500">🟢</span>
                                <span className="font-medium">{formatFullDate(session.in)}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                {session.out ? (
                                  <>
                                    <span className="text-red-400">→ {formatDate(session.out)}</span>
                                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">
                                      {formatDuration(Math.round((new Date(session.out) - new Date(session.in)) / 1000))}
                                    </span>
                                  </>
                                ) : (
                                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">
                                    Currently Active
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Restaurants Interacted With */}
                    <div>
                      <h4 className="font-black text-lg mb-3">🍽️ Restaurants Interacted With</h4>
                      {stats.restaurants.length === 0 ? (
                        <p className="text-gray-500 text-sm">No restaurant interactions yet.</p>
                      ) : (
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {stats.restaurants.map((r) => (
                            <div key={r.name} className="flex items-center justify-between bg-gray-50 rounded-xl p-3">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-black text-sm shadow">
                                  {r.name?.charAt(0)}
                                </div>
                                <div>
                                  <p className="font-bold text-sm">{r.name}</p>
                                  <p className="text-xs text-gray-500">
                                    {r.views} view{r.views === 1 ? "" : "s"} •
                                    Time spent: {formatDuration(r.totalSeconds)}
                                  </p>
                                  <div className="flex gap-1 mt-1">
                                    {[...new Set(r.actions)].slice(0, 5).map((action) => (
                                      <span key={action} className="text-[9px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-bold">
                                        {ACTION_LABELS[action]?.icon || "📌"} {ACTION_LABELS[action]?.label?.split(" ").slice(-1) || action}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-[10px] text-gray-400">Last visit</p>
                                <p className="text-xs font-bold text-gray-600">{formatDate(r.lastVisit)}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Activity Log */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-black text-lg">📋 Activity Log</h4>
                        <select
                          value={activityFilter}
                          onChange={(e) => setActivityFilter(e.target.value)}
                          className="text-xs border rounded-lg px-2 py-1"
                        >
                          <option value="all">All Actions</option>
                          <option value="viewed_restaurant">Views</option>
                          <option value="searched">Searches</option>
                          <option value="added_to_cart">Cart Adds</option>
                          <option value="booking_confirmed">Bookings</option>
                          <option value="posted_review">Reviews</option>
                        </select>
                      </div>

                      {stats.recentActivities.length === 0 ? (
                        <p className="text-gray-500 text-sm text-center py-6">No activities recorded yet.</p>
                      ) : (
                        <div className="space-y-1 max-h-80 overflow-y-auto">
                          {stats.recentActivities
                            .filter((a) => activityFilter === "all" || a.action === activityFilter)
                            .map((a) => {
                              const label = ACTION_LABELS[a.action] || { icon: "📌", label: a.action };
                              return (
                                <div key={a.id} className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0">
                                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-sm flex-shrink-0">
                                    {label.icon}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900">{label.label}</p>

                                    {/* Detail badges */}
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {a.details?.restaurantName && (
                                        <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-bold">
                                          📍 {a.details.restaurantName}
                                        </span>
                                      )}
                                      {a.details?.query && (
                                        <span className="text-[10px] bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded font-bold">
                                          🔍 "{a.details.query}"
                                        </span>
                                      )}
                                      {a.details?.foodName && (
                                        <span className="text-[10px] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded font-bold">
                                          🍽️ {a.details.foodName}
                                        </span>
                                      )}
                                      {a.details?.price && (
                                        <span className="text-[10px] bg-green-50 text-green-700 px-1.5 py-0.5 rounded font-bold">
                                          💰 KES {a.details.price}
                                        </span>
                                      )}
                                      {a.details?.durationSeconds && (
                                        <span className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-bold">
                                          ⏱️ {formatDuration(a.details.durationSeconds)}
                                        </span>
                                      )}
                                      {a.details?.rating && (
                                        <span className="text-[10px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded font-bold">
                                          ⭐ {a.details.rating}/5
                                        </span>
                                      )}
                                      {a.details?.cartTotal && (
                                        <span className="text-[10px] bg-pink-50 text-pink-700 px-1.5 py-0.5 rounded font-bold">
                                          🛒 KES {a.details.cartTotal}
                                        </span>
                                      )}
                                      {a.details?.category && (
                                        <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-bold">
                                          📂 {a.details.category}
                                        </span>
                                      )}
                                      {a.details?.page && (
                                        <span className="text-[10px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded font-bold">
                                          📄 {a.details.page}
                                        </span>
                                      )}
                                      {a.details?.toRestaurantName && (
                                        <span className="text-[10px] bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded font-bold">
                                          → {a.details.toRestaurantName}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <p className="text-[10px] text-gray-400 whitespace-nowrap flex-shrink-0">
                                    {formatDate(a.timestamp)}
                                  </p>
                                </div>
                              );
                            })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}