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

export default function AdminPaymentsPage() {
  const { bks } = useApp();
  const [sortOrder, setSortOrder] = useState("newest");
  const [restFilter, setRestFilter] = useState("all");

  // Only confirmed bookings with M-Pesa code count as payments
  const payments = useMemo(() => {
    let list = bks.filter((b) => b.st === "confirmed" && b.mc);
    if (restFilter !== "all") list = list.filter((b) => b.rn === restFilter);
    list.sort((a, b) => {
      const tA = new Date(a.ca).getTime();
      const tB = new Date(b.ca).getTime();
      return sortOrder === "newest" ? tB - tA : tA - tB;
    });
    return list;
  }, [bks, sortOrder, restFilter]);

  const totalRevenue = payments.reduce((s, b) => s + b.dep, 0);
  const totalBalance = payments.reduce((s, b) => s + (b.tot - b.dep), 0);
  const avgPayment = payments.length ? Math.round(totalRevenue / payments.length) : 0;

  const restaurants = useMemo(() => {
    const set = new Set();
    bks.forEach((b) => {
      if (b.st === "confirmed" && b.rn) set.add(b.rn);
    });
    return Array.from(set);
  }, [bks]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-purple-50/30">
      <Navbar tabs={ADMIN_TABS} title="Admin" role="Admin" />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <div className="flex justify-between items-center flex-wrap gap-3">
          <div>
            <h2 className="text-2xl font-black">💳 Network Payments</h2>
            <p className="text-sm text-gray-500">
              All M-Pesa transactions across PocketBite ({payments.length} total)
            </p>
          </div>
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 shadow-md print:hidden"
          >
            🖨️ Print Report
          </button>
        </div>

        {/* Summary cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-5 shadow-lg border border-emerald-100">
            <div className="text-2xl mb-2">💎</div>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Total Revenue</p>
            <p className="text-2xl font-black text-emerald-600 mt-2">
              KES {totalRevenue.toLocaleString()}
            </p>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-5 shadow-lg border border-orange-100">
            <div className="text-2xl mb-2">💰</div>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">
              Balance at Restaurants
            </p>
            <p className="text-2xl font-black text-orange-600 mt-2">
              KES {totalBalance.toLocaleString()}
            </p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-5 shadow-lg border border-purple-100">
            <div className="text-2xl mb-2">📲</div>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">
              Successful Payments
            </p>
            <p className="text-2xl font-black text-purple-600 mt-2">{payments.length}</p>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-5 shadow-lg border border-blue-100">
            <div className="text-2xl mb-2">📊</div>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Avg per Booking</p>
            <p className="text-2xl font-black text-blue-600 mt-2">KES {avgPayment.toLocaleString()}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border p-3 flex flex-wrap items-center gap-3 print:hidden">
          <span className="text-xs font-bold text-gray-500 uppercase">Restaurant:</span>
          <select
            value={restFilter}
            onChange={(e) => setRestFilter(e.target.value)}
            className="px-3 py-1.5 bg-gray-50 border rounded-lg text-sm font-medium"
          >
            <option value="all">All Restaurants</option>
            {restaurants.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
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
            ⬇ Newest
          </button>
          <button
            onClick={() => setSortOrder("oldest")}
            className={`px-3 py-1.5 rounded-lg text-sm font-bold border ${
              sortOrder === "oldest"
                ? "bg-emerald-600 text-white border-emerald-600"
                : "border-gray-200 text-gray-700"
            }`}
          >
            ⬆ Oldest
          </button>
        </div>

        {/* Table */}
        {payments.length === 0 ? (
          <div className="py-16 bg-white rounded-3xl border-2 border-dashed text-center text-gray-400">
            <span className="text-5xl mb-3 block">💸</span>
            <p className="font-bold">No payments match your filter</p>
            <p className="text-xs mt-1">Confirmed M-Pesa transactions will appear here</p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-lg border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left px-4 py-3 text-xs font-black text-gray-500 uppercase">
                      M-Pesa Code
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-black text-gray-500 uppercase">
                      Diner
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-black text-gray-500 uppercase">
                      Restaurant
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-black text-gray-500 uppercase">
                      Phone
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-black text-gray-500 uppercase">
                      Date
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-black text-gray-500 uppercase">
                      Deposit
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-black text-gray-500 uppercase">
                      Balance
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-black text-gray-500 uppercase">
                      Source
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((b) => (
                    <tr key={b.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono font-bold text-emerald-700 text-xs">{b.mc}</td>
                      <td className="px-4 py-3 font-bold text-sm">{b.dn}</td>
                      <td className="px-4 py-3 text-sm">{b.rn}</td>
                      <td className="px-4 py-3 text-xs text-gray-600">{b.dp || "—"}</td>
                      <td className="px-4 py-3 text-[11px] text-gray-500">
                        {new Date(b.ca).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-4 py-3 text-sm font-bold text-emerald-700">KES {b.dep}</td>
                      <td className="px-4 py-3 text-sm font-bold text-orange-600">
                        KES {b.tot - b.dep}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-[10px] px-2 py-1 rounded-full font-black ${
                            b.manuallyConfirmed
                              ? "bg-purple-100 text-purple-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {b.manuallyConfirmed ? "MANUAL" : "M-PESA"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}