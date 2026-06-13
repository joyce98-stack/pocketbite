import { useMemo, useState } from "react";
import Navbar from "../components/Navbar.jsx";
import { useApp } from "../store/AppContext.jsx";

const ADMIN_TABS = [
  { path: "/admin/dashboard", label: "Dashboard" },
  { path: "/admin/restaurants", label: "Restaurants" },
  { path: "/admin/bookings", label: "Bookings" },
  { path: "/admin/payments", label: "Payments" },
  { path: "/admin/reviews", label: "Reviews" },
  { path: "/admin/users", label: "Users" },
  { path: "/admin/reports", label: "Reports" },
];

export default function AdminReportsPage() {
  const { rests, bks, users } = useApp();
  const [chartType, setChartType] = useState("bar"); // bar | line | pie

  const totalRev = bks.filter((b) => b.st === "confirmed").reduce((s, b) => s + b.dep, 0);
  const totalBalance = bks.filter((b) => b.st === "confirmed").reduce((s, b) => s + (b.tot - b.dep), 0);

  const revenueByDay = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const ds = d.toISOString().split("T")[0];
      const dayRev = bks.filter((b) => b.dt === ds && b.st === "confirmed").reduce((s, b) => s + b.dep, 0);
      const dayCount = bks.filter((b) => b.dt === ds && b.st === "confirmed").length;
      days.push({
        day: d.toLocaleDateString("en-GB", { weekday: "short" }),
        date: d.toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
        rev: dayRev,
        count: dayCount,
      });
    }
    return days;
  }, [bks]);

  const maxRev = Math.max(...revenueByDay.map((d) => d.rev), 1);

  const categoryData = useMemo(() => {
    return ["local", "formal", "highend"].map((cat) => {
      const catBks = bks.filter((b) => b.st === "confirmed" && rests.find((r) => r.id === b.rid)?.cat === cat);
      return { cat, rev: catBks.reduce((s, b) => s + b.dep, 0), count: catBks.length };
    });
  }, [bks, rests]);

  const totalCatRev = categoryData.reduce((s, c) => s + c.rev, 0) || 1;

  const statusData = useMemo(() => {
    return [
      { label: "Confirmed", count: bks.filter((b) => b.st === "confirmed").length, color: "bg-green-500" },
      { label: "Pending", count: bks.filter((b) => b.st === "pending_payment").length, color: "bg-amber-500" },
      { label: "Cancelled", count: bks.filter((b) => b.st === "cancelled").length, color: "bg-red-500" },
    ];
  }, [bks]);

  const totalStatus = statusData.reduce((s, d) => s + d.count, 0) || 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-purple-50/30">
      <Navbar tabs={ADMIN_TABS} title="Admin" role="Admin" />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 print-area">

        {/* Header */}
        <div className="flex justify-between items-center flex-wrap gap-3 print-hidden">
          <div>
            <h2 className="text-2xl font-black">{"📊"} Platform Reports</h2>
            <p className="text-sm text-gray-500">Real-time analytics</p>
          </div>
          <div className="flex gap-2">
            <div className="flex bg-gray-100 rounded-xl p-1">
              {[
                { key: "bar", label: "Bar" },
                { key: "line", label: "Line" },
                { key: "pie", label: "Pie" },
              ].map((t) => (
                <button key={t.key} onClick={() => setChartType(t.key)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${chartType === t.key ? "bg-white shadow text-gray-900" : "text-gray-500"}`}>
                  {t.label}
                </button>
              ))}
            </div>
            <button onClick={() => window.print()} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700">
              {"🖨️"} Print Report
            </button>
          </div>
        </div>

        {/* Print Header (only shows when printing) */}
        <div className="hidden print:block text-center mb-6">
          <h1 className="text-2xl font-black">PocketBite Platform Report</h1>
          <p className="text-sm text-gray-500">Generated: {new Date().toLocaleString()}</p>
          <p className="text-xs text-gray-400">Your Pocket, Your Bite</p>
        </div>

        {/* Stats Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { l: "Total Revenue", v: "KES " + totalRev.toLocaleString(), c: "text-emerald-600" },
            { l: "Pending Balance", v: "KES " + totalBalance.toLocaleString(), c: "text-orange-600" },
            { l: "Total Bookings", v: bks.length, c: "text-blue-600" },
            { l: "Active Users", v: users.length, c: "text-purple-600" },
          ].map((s) => (
            <div key={s.l} className="bg-white rounded-2xl p-5 shadow-lg border">
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{s.l}</p>
              <p className={`text-2xl font-black mt-2 ${s.c}`}>{s.v}</p>
            </div>
          ))}
        </div>

        {/* Revenue Chart */}
        <div className="bg-white rounded-3xl p-6 shadow-lg border">
          <h3 className="font-black text-lg mb-2">Revenue - Last 7 Days</h3>
          <p className="text-sm text-gray-500 mb-6">Based on confirmed bookings</p>

          {/* BAR Chart */}
          {chartType === "bar" && (
            <div className="flex items-end gap-3 h-48">
              {revenueByDay.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center group">
                  <div className="relative w-full">
                    <div className="w-full bg-gradient-to-t from-purple-500 to-indigo-500 rounded-t-xl transition-all hover:opacity-80" style={{ height: (d.rev / maxRev) * 192 + "px", minHeight: d.rev > 0 ? "8px" : "2px" }} />
                    <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 whitespace-nowrap">
                      KES {d.rev.toLocaleString()}
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 font-bold mt-2">{d.day}</p>
                  <p className="text-[10px] text-gray-300">{d.date}</p>
                </div>
              ))}
            </div>
          )}

          {/* LINE Chart */}
          {chartType === "line" && (
            <div className="relative h-48">
              <svg viewBox="0 0 700 200" className="w-full h-full">
                {/* Grid lines */}
                {[0, 50, 100, 150, 200].map((y) => (
                  <line key={y} x1="0" y1={y} x2="700" y2={y} stroke="#f0f0f0" strokeWidth="1" />
                ))}
                {/* Line */}
                <polyline
                  fill="none"
                  stroke="#8b5cf6"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={revenueByDay.map((d, i) => {
                    const x = i * 100 + 50;
                    const y = 200 - (d.rev / maxRev) * 180;
                    return x + "," + y;
                  }).join(" ")}
                />
                {/* Area fill */}
                <polygon
                  fill="url(#lineGrad)"
                  opacity="0.2"
                  points={
                    revenueByDay.map((d, i) => {
                      const x = i * 100 + 50;
                      const y = 200 - (d.rev / maxRev) * 180;
                      return x + "," + y;
                    }).join(" ") + " 650,200 50,200"
                  }
                />
                {/* Dots */}
                {revenueByDay.map((d, i) => {
                  const x = i * 100 + 50;
                  const y = 200 - (d.rev / maxRev) * 180;
                  return <circle key={i} cx={x} cy={y} r="5" fill="#8b5cf6" stroke="white" strokeWidth="2" />;
                })}
                <defs>
                  <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="flex justify-between mt-2 text-xs text-gray-400 font-bold px-6">
                {revenueByDay.map((d) => <span key={d.day}>{d.day}</span>)}
              </div>
            </div>
          )}

          {/* PIE Chart */}
          {chartType === "pie" && (
            <div className="flex items-center justify-center gap-8">
              <div className="relative w-48 h-48">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  {(() => {
                    let offset = 0;
                    const colors = ["#10b981", "#f59e0b", "#ef4444"];
                    return statusData.map((d, i) => {
                      const pct = (d.count / totalStatus) * 100;
                      const dasharray = pct + " " + (100 - pct);
                      const el = (
                        <circle key={d.label} cx="50" cy="50" r="40" fill="none" stroke={colors[i]} strokeWidth="20"
                          strokeDasharray={dasharray} strokeDashoffset={-offset} />
                      );
                      offset += pct;
                      return el;
                    });
                  })()}
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-2xl font-black">{bks.length}</p>
                    <p className="text-[10px] text-gray-500">Total</p>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                {statusData.map((d) => (
                  <div key={d.label} className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${d.color}`} />
                    <span className="text-sm font-bold">{d.label}: {d.count}</span>
                    <span className="text-xs text-gray-400">({Math.round((d.count / totalStatus) * 100)}%)</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Revenue by Category */}
        <div className="bg-white rounded-3xl p-6 shadow-lg border">
          <h3 className="font-black text-lg mb-4">Revenue by Category</h3>
          <div className="space-y-4">
            {categoryData.map((c) => {
              const pct = Math.round((c.rev / totalCatRev) * 100);
              const colors = { local: "bg-green-500", formal: "bg-purple-500", highend: "bg-amber-600" };
              return (
                <div key={c.cat}>
                  <div className="flex justify-between text-sm font-bold mb-1">
                    <span className="uppercase">{c.cat}</span>
                    <span>KES {c.rev.toLocaleString()} ({pct}%) - {c.count} bookings</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3">
                    <div className={`h-3 rounded-full ${colors[c.cat]}`} style={{ width: pct + "%" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Print Footer */}
        <div className="hidden print:block text-center mt-8 pt-4 border-t">
          <p className="text-xs text-gray-400">PocketBite - Your Pocket, Your Bite - Confidential Report</p>
        </div>
      </main>
    </div>
  );
}