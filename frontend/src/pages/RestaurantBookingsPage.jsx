import { useState, useMemo } from "react";
import Navbar from "../components/Navbar.jsx";
import Receipt from "../components/Receipt.jsx";
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

export default function RestaurantBookingsPage() {
  const { myRest, bks } = useApp();
  const [showReceipt, setShowReceipt] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");

  const rb = useMemo(() => {
    if (!myRest) return [];
    let list = bks.filter((b) => b.rid === myRest.id);
    if (statusFilter !== "all") list = list.filter((b) => b.st === statusFilter);
    list.sort((a, b) => {
      const tA = new Date(a.ca).getTime();
      const tB = new Date(b.ca).getTime();
      return sortOrder === "newest" ? tB - tA : tA - tB;
    });
    return list;
  }, [myRest, bks, statusFilter, sortOrder]);

  // Stats
  const totalBookings = bks.filter((b) => b.rid === myRest?.id).length;
  const confirmedCount = bks.filter((b) => b.rid === myRest?.id && b.st === "confirmed").length;
  const cancelledCount = bks.filter((b) => b.rid === myRest?.id && b.st === "cancelled").length;
  const pendingCount = bks.filter((b) => b.rid === myRest?.id && b.st === "pending_payment").length;
  const totalRevenue = bks
    .filter((b) => b.rid === myRest?.id && b.st === "confirmed")
    .reduce((s, b) => s + b.dep, 0);

  if (!myRest) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-purple-50/30">
      <Navbar tabs={REST_TABS} title={myRest.n} role="Restaurant" />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h2 className="text-2xl font-black">📅 Live Bookings ({rb.length})</h2>
            <p className="text-sm text-gray-500">
              All diner bookings including confirmed, pending, and cancelled.
            </p>
          </div>
          <div className="flex gap-2 flex-wrap items-center">
            <span className="inline-flex items-center gap-2 px-3 py-2 bg-green-50 text-green-700 rounded-xl text-xs font-black border border-green-100">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> LIVE SYNC ON
            </span>
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 shadow-md print:hidden"
            >
              🖨️ Print
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          {[
            { l: "Total", v: totalBookings, c: "bg-blue-50 text-blue-700 border-blue-100" },
            { l: "Confirmed", v: confirmedCount, c: "bg-green-50 text-green-700 border-green-100" },
            { l: "Pending", v: pendingCount, c: "bg-amber-50 text-amber-700 border-amber-100" },
            { l: "Cancelled", v: cancelledCount, c: "bg-red-50 text-red-700 border-red-100" },
            { l: "Revenue", v: `KES ${totalRevenue.toLocaleString()}`, c: "bg-emerald-50 text-emerald-700 border-emerald-100" },
          ].map((s) => (
            <div key={s.l} className={`rounded-2xl p-4 border font-bold text-center ${s.c}`}>
              <p className="text-xl font-black">{s.v}</p>
              <p className="text-xs">{s.l}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border p-3 mb-4 flex flex-wrap items-center gap-3 print:hidden">
          <span className="text-xs font-bold text-gray-500 uppercase">Filter:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-gray-50 border rounded-lg text-sm font-medium"
          >
            <option value="all">All Statuses</option>
            <option value="pending_payment">Pending Payment</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
            <option value="completed">Completed</option>
          </select>
          <span className="text-xs font-bold text-gray-500 uppercase ml-2">Sort:</span>
          <button
            onClick={() => setSortOrder("newest")}
            className={`px-3 py-1.5 rounded-lg text-sm font-bold border ${
              sortOrder === "newest"
                ? "bg-emerald-600 text-white border-emerald-600"
                : "border-gray-200 text-gray-700"
            }`}
          >
            ⬇ Newest First
          </button>
          <button
            onClick={() => setSortOrder("oldest")}
            className={`px-3 py-1.5 rounded-lg text-sm font-bold border ${
              sortOrder === "oldest"
                ? "bg-emerald-600 text-white border-emerald-600"
                : "border-gray-200 text-gray-700"
            }`}
          >
            ⬆ Oldest First
          </button>
        </div>

        {/* Bookings Table */}
        {rb.length === 0 ? (
          <div className="py-16 bg-white rounded-3xl border-2 border-dashed text-center text-gray-400">
            <span className="text-5xl mb-3 block">📭</span>
            <p className="font-bold">No bookings match your filter</p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-lg border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left px-4 py-3 text-xs font-black text-gray-500 uppercase">Diner</th>
                    <th className="text-left px-4 py-3 text-xs font-black text-gray-500 uppercase">Phone</th>
                    <th className="text-left px-4 py-3 text-xs font-black text-gray-500 uppercase">Visit Date & Time</th>
                    <th className="text-left px-4 py-3 text-xs font-black text-gray-500 uppercase">Booked On</th>
                    <th className="text-left px-4 py-3 text-xs font-black text-gray-500 uppercase">Total</th>
                    <th className="text-left px-4 py-3 text-xs font-black text-gray-500 uppercase">Deposit</th>
                    <th className="text-left px-4 py-3 text-xs font-black text-gray-500 uppercase">Balance</th>
                    <th className="text-left px-4 py-3 text-xs font-black text-gray-500 uppercase">M-Pesa</th>
                    <th className="text-left px-4 py-3 text-xs font-black text-gray-500 uppercase">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-black text-gray-500 uppercase print:hidden">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rb.map((bk) => (
                    <tr key={bk.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-4 py-3 font-bold text-sm">{bk.dn}</td>
                      <td className="px-4 py-3 text-xs text-gray-600">{bk.dp || "—"}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{bk.dt} at {bk.tm}</td>
                      <td className="px-4 py-3 text-[11px] text-gray-400">
                        {new Date(bk.ca).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}{" "}
                        {new Date(bk.ca).toLocaleTimeString("en-GB", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="px-4 py-3 text-sm font-bold">KES {bk.tot}</td>
                      <td className="px-4 py-3 text-sm font-bold text-emerald-700">KES {bk.dep}</td>
                      <td className="px-4 py-3 text-sm font-bold text-orange-600">KES {bk.tot - bk.dep}</td>
                      <td className="px-4 py-3 text-xs font-mono text-gray-500">{bk.mc || "—"}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                            bk.st === "confirmed"
                              ? "bg-green-100 text-green-700"
                              : bk.st === "cancelled"
                              ? "bg-red-100 text-red-700"
                              : bk.st === "completed"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {bk.st.toUpperCase().replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-4 py-3 print:hidden">
                        <button
                          onClick={() => setShowReceipt(bk)}
                          className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg text-xs font-black hover:bg-purple-200"
                        >
                          🧾 Receipt
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Receipt Modal */}
      {showReceipt && <Receipt booking={showReceipt} onClose={() => setShowReceipt(null)} />}
    </div>
  );
}