import { useState, useMemo } from "react";
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

export default function RestaurantPaymentsPage() {
  const { myRest, bks } = useApp();
  const [sortOrder, setSortOrder] = useState("newest");

  const payments = useMemo(() => {
    if (!myRest) return [];
    return bks
      .filter((b) => b.rid === myRest.id && b.st === "confirmed" && b.mc)
      .sort((a, b) => {
        const tA = new Date(a.ca).getTime();
        const tB = new Date(b.ca).getTime();
        return sortOrder === "newest" ? tB - tA : tA - tB;
      });
  }, [myRest, bks, sortOrder]);

  const totalRevenue = payments.reduce((s, b) => s + b.dep, 0);
  const totalBalance = payments.reduce((s, b) => s + (b.tot - b.dep), 0);

  if (!myRest) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-purple-50/30">
      <Navbar tabs={REST_TABS} title={myRest.n} role="Restaurant" />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <div className="flex justify-between items-center flex-wrap gap-3">
          <div>
            <h2 className="text-2xl font-black">💳 Payment Management</h2>
            <p className="text-sm text-gray-500">
              All confirmed M-Pesa deposits for {myRest.n}
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setSortOrder("newest")}
              className={`px-3 py-2 rounded-xl text-xs font-bold border ${
                sortOrder === "newest"
                  ? "bg-emerald-600 text-white border-emerald-600"
                  : "border-gray-200 text-gray-700"
              }`}
            >
              ⬇ Newest
            </button>
            <button
              onClick={() => setSortOrder("oldest")}
              className={`px-3 py-2 rounded-xl text-xs font-bold border ${
                sortOrder === "oldest"
                  ? "bg-emerald-600 text-white border-emerald-600"
                  : "border-gray-200 text-gray-700"
              }`}
            >
              ⬆ Oldest
            </button>
            <button
              onClick={() => window.print()}
              className="px-3 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
            >
              🖨️ Print
            </button>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-5 shadow-lg border border-emerald-100">
            <div className="text-2xl mb-2">💚</div>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">
              Deposits Received
            </p>
            <p className="text-2xl font-black text-emerald-600 mt-2">
              KES {totalRevenue.toLocaleString()}
            </p>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-5 shadow-lg border border-orange-100">
            <div className="text-2xl mb-2">💰</div>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">
              Balance Due at Restaurant
            </p>
            <p className="text-2xl font-black text-orange-600 mt-2">
              KES {totalBalance.toLocaleString()}
            </p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-5 shadow-lg border border-purple-100">
            <div className="text-2xl mb-2">🎫</div>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">
              Successful Payments
            </p>
            <p className="text-2xl font-black text-purple-600 mt-2">
              {payments.length}
            </p>
          </div>
        </div>

        {/* Table */}
        {payments.length === 0 ? (
          <div className="py-16 bg-white rounded-3xl border-2 border-dashed text-center text-gray-400">
            <span className="text-5xl mb-3 block">💸</span>
            <p className="font-bold">No payments yet</p>
            <p className="text-xs mt-1">
              Confirmed M-Pesa transactions will appear here
            </p>
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
                      <td className="px-4 py-3 font-mono font-bold text-emerald-700 text-xs">
                        {b.mc}
                      </td>
                      <td className="px-4 py-3 font-bold text-sm">{b.dn}</td>
                      <td className="px-4 py-3 text-xs text-gray-600">{b.dp || "—"}</td>
                      <td className="px-4 py-3 text-[11px] text-gray-500">
                        {new Date(b.ca).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-4 py-3 text-sm font-bold text-emerald-700">
                        KES {b.dep}
                      </td>
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