import { useState, useMemo } from "react";
import Navbar from "../components/Navbar.jsx";
import Receipt from "../components/Receipt.jsx";
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

export default function AdminBookingsPage() {
  const { bks, confirmBookingManually } = useApp();
  const [showReceipt, setShowReceipt] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");

  const filteredBks = useMemo(() => {
    let list = [...bks];
    if (statusFilter !== "all") list = list.filter((b) => b.st === statusFilter);
    list.sort((a, b) => {
      const tA = new Date(a.ca).getTime();
      const tB = new Date(b.ca).getTime();
      return sortOrder === "newest" ? tB - tA : tA - tB;
    });
    return list;
  }, [bks, statusFilter, sortOrder]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-purple-50/30">
      <Navbar tabs={ADMIN_TABS} title="Admin" role="Admin" />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
          <div>
            <h2 className="text-2xl font-black">📅 Platform Bookings ({filteredBks.length})</h2>
            <p className="text-sm text-gray-500">All bookings across PocketBite restaurants</p>
          </div>
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 shadow-md print:hidden"
          >
            🖨️ Print Bookings
          </button>
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

        {filteredBks.length === 0 ? (
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
                    <th className="text-left px-4 py-3 text-xs font-black text-gray-500 uppercase">Restaurant</th>
                    <th className="text-left px-4 py-3 text-xs font-black text-gray-500 uppercase">Visit</th>
                    <th className="text-left px-4 py-3 text-xs font-black text-gray-500 uppercase">Booked</th>
                    <th className="text-left px-4 py-3 text-xs font-black text-gray-500 uppercase">Deposit</th>
                    <th className="text-left px-4 py-3 text-xs font-black text-gray-500 uppercase">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-black text-gray-500 uppercase print:hidden">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBks.map((bk) => (
                    <tr key={bk.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-4 py-3 font-bold text-sm">{bk.dn}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{bk.rn}</td>
                      <td className="px-4 py-3 text-sm">
                        {bk.dt} {bk.tm}
                      </td>
                      <td className="px-4 py-3 text-[11px] text-gray-400">
                        {new Date(bk.ca).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                        })}
                      </td>
                      <td className="px-4 py-3 text-sm font-bold text-emerald-700">KES {bk.dep}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                            bk.st === "confirmed"
                              ? "bg-green-100 text-green-700"
                              : bk.st === "cancelled"
                              ? "bg-red-100 text-red-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {bk.st.toUpperCase().replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-4 py-3 flex gap-2 flex-wrap print:hidden">
                        <button
                          onClick={() => setShowReceipt(bk)}
                          className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg text-xs font-black"
                        >
                          🧾 Receipt
                        </button>
                        {bk.st === "pending_payment" && (
                          <button
                            onClick={() => {
                              if (confirm(`Manually confirm payment for ${bk.dn}?`))
                                confirmBookingManually(bk.id);
                            }}
                            className="px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-black"
                          >
                            ✓ Confirm
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
      {showReceipt && <Receipt booking={showReceipt} onClose={() => setShowReceipt(null)} />}
    </div>
  );
}