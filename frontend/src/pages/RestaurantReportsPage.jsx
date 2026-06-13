import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import { useApp } from "../store/AppContext.jsx";

const REST_TABS = [
  { path: "/restaurant/dashboard", label: "📊 Dashboard" },
  { path: "/restaurant/menu", label: "🍽️ Menu" },
  { path: "/restaurant/bookings", label: "📅 Bookings" },
  { path: "/restaurant/notifications", label: "🔔 Alerts" },
  { path: "/restaurant/group-bookings", label: "👥 Group" },
  { path: "/restaurant/reports", label: "📈 Reports" },
  { path: "/restaurant/offers", label: "🎉 Offers" },
];

export default function RestaurantReportsPage() {
  const navigate = useNavigate();
  const { myRest, bks } = useApp();
  const [chartType, setChartType] = useState("bar");

  if (!myRest) return null;

  const rb = bks.filter((b) => b.rid === myRest.id);
  const confirmed = rb.filter((b) => b.st === "confirmed");
  const totalRev = confirmed.reduce((s, b) => s + b.dep, 0);
  const totalBalance = confirmed.reduce((s, b) => s + (b.tot - b.dep), 0);

  const revenueByDay = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const ds = d.toISOString().split("T")[0];
      const dayRev = rb.filter((b) => b.dt === ds && b.st === "confirmed").reduce((s, b) => s + b.dep, 0);
      days.push({ day: d.toLocaleDateString("en-GB", { weekday: "short" }), date: d.toLocaleDateString("en-GB", { day: "numeric", month: "short" }), rev: dayRev, count: rb.filter((b) => b.dt === ds && b.st === "confirmed").length });
    }
    return days;
  }, [rb]);

  const maxRev = Math.max(...revenueByDay.map((d) => d.rev), 1);

  const topItems = useMemo(() => {
    const counts = {};
    confirmed.forEach((b) => b.items?.forEach((item) => {
      const name = item.f?.n || "Item";
      counts[name] = (counts[name] || 0) + (item.q || 1);
    }));
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 8);
  }, [confirmed]);

  const maxItem = topItems.length > 0 ? topItems[0][1] : 1;

  const handlePrint = () => window.print();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-purple-50/30 print-area">
      <div className="print-hidden"><Navbar tabs={REST_TABS} title={myRest.n} role="Restaurant" /></div>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* Print Header */}
        <div className="hidden print:block text-center mb-6 pb-4 border-b">
          <h1 className="text-2xl font-black">{myRest.n} - Business Report</h1>
          <p className="text-sm text-gray-500">Generated: {new Date().toLocaleString()}</p>
          <p className="text-xs text-gray-400">PocketBite Platform</p>
        </div>

        {/* Controls */}
        <div className="flex justify-between items-center flex-wrap gap-3 print-hidden">
          <div><h2 className="text-2xl font-black">{"📈"} Reports</h2><p className="text-sm text-gray-500">Performance analytics</p></div>
          <div className="flex gap-2">
            <div className="flex bg-gray-100 rounded-xl p-1">
              {[{ key: "bar", label: "Bar" }, { key: "line", label: "Line" }, { key: "pie", label: "Pie" }].map((t) => (
                <button key={t.key} onClick={() => setChartType(t.key)} className={"px-3 py-1.5 rounded-lg text-xs font-bold " + (chartType === t.key ? "bg-white shadow" : "text-gray-500")}>{t.label}</button>
              ))}
            </div>
            <button onClick={handlePrint} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700">{"🖨️"} Print</button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { l: "Total Revenue", v: "KES " + totalRev.toLocaleString(), c: "text-emerald-600" },
            { l: "Pending Balance", v: "KES " + totalBalance.toLocaleString(), c: "text-orange-600" },
            { l: "Confirmed", v: confirmed.length, c: "text-green-600" },
            { l: "Cancelled", v: rb.filter((b) => b.st === "cancelled").length, c: "text-red-600" },
          ].map((s) => <div key={s.l} className="bg-white rounded-2xl p-5 shadow-lg border"><p className="text-xs text-gray-400 font-bold uppercase">{s.l}</p><p className={"text-2xl font-black mt-2 " + s.c}>{s.v}</p></div>)}
        </div>

        {/* Revenue Chart */}
        <div className="bg-white rounded-3xl p-6 shadow-lg border">
          <h3 className="font-black text-lg mb-2">Revenue - Last 7 Days</h3>
          <p className="text-sm text-gray-500 mb-6">Based on confirmed bookings</p>
          {chartType === "bar" && (
            <div className="flex items-end gap-3 h-48">
              {revenueByDay.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center">
                  <div className="relative w-full"><div className="w-full bg-gradient-to-t from-purple-500 to-indigo-500 rounded-t-xl" style={{ height: (d.rev / maxRev) * 192 + "px", minHeight: d.rev > 0 ? "8px" : "2px" }} /><div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded-lg opacity-0 hover:opacity-100 whitespace-nowrap print:opacity-100 print:top-0 print:static print:translate-x-0">KES {d.rev}</div></div>
                  <p className="text-xs text-gray-400 font-bold mt-2">{d.day}</p>
                  <p className="text-[10px] text-gray-300">{d.date}</p>
                </div>
              ))}
            </div>
          )}
          {chartType === "line" && (
            <div className="relative h-48">
              <svg viewBox="0 0 700 200" className="w-full h-full">
                <polyline fill="none" stroke="#8b5cf6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" points={revenueByDay.map((d, i) => (i * 100 + 50) + "," + (200 - (d.rev / maxRev) * 180)).join(" ")} />
                {revenueByDay.map((d, i) => <circle key={i} cx={i * 100 + 50} cy={200 - (d.rev / maxRev) * 180} r="5" fill="#8b5cf6" stroke="white" strokeWidth="2" />)}
              </svg>
              <div className="flex justify-between mt-2 text-xs text-gray-400 font-bold px-6">{revenueByDay.map((d) => <span key={d.day}>{d.day}</span>)}</div>
            </div>
          )}
          {chartType === "pie" && (
            <div className="flex items-center justify-center gap-8">
              <div className="relative w-48 h-48">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  {(() => {
                    let offset = 0;
                    const colors = ["#10b981", "#f59e0b", "#ef4444"];
                    const data = [{ label: "Confirmed", count: confirmed.length }, { label: "Pending", count: rb.filter((b) => b.st === "pending_payment").length }, { label: "Cancelled", count: rb.filter((b) => b.st === "cancelled").length }];
                    const total = data.reduce((s, d) => s + d.count, 0) || 1;
                    return data.map((d, i) => { const pct = (d.count / total) * 100; const el = <circle key={i} cx="50" cy="50" r="40" fill="none" stroke={colors[i]} strokeWidth="20" strokeDasharray={pct + " " + (100 - pct)} strokeDashoffset={-offset} />; offset += pct; return el; });
                  })()}
                </svg>
                <div className="absolute inset-0 flex items-center justify-center"><div className="text-center"><p className="text-2xl font-black">{rb.length}</p><p className="text-[10px] text-gray-500">Total</p></div></div>
              </div>
              <div className="space-y-2">
                {[{ label: "Confirmed", count: confirmed.length, color: "bg-green-500" }, { label: "Pending", count: rb.filter((b) => b.st === "pending_payment").length, color: "bg-amber-500" }, { label: "Cancelled", count: rb.filter((b) => b.st === "cancelled").length, color: "bg-red-500" }].map((d) => (
                  <div key={d.label} className="flex items-center gap-2"><div className={"w-3 h-3 rounded-full " + d.color}/><span className="text-sm font-bold">{d.label}: {d.count}</span><span className="text-xs text-gray-400">({rb.length > 0 ? Math.round((d.count / rb.length) * 100) : 0}%)</span></div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Top Items */}
        <div className="bg-white rounded-3xl p-6 shadow-lg border">
          <h3 className="font-black text-lg mb-4">{"🍽️"} Top Ordered Items</h3>
          {topItems.length === 0 ? <p className="text-gray-500 text-center py-6">No orders yet</p> : (
            <div className="space-y-3">
              {topItems.map(([name, count]) => (
                <div key={name}>
                  <div className="flex justify-between text-sm font-bold mb-1"><span>{name}</span><span>{count} ordered</span></div>
                  <div className="w-full bg-gray-100 rounded-full h-2"><div className="h-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500" style={{ width: (count / maxItem) * 100 + "%" }}/></div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="hidden print:block text-center mt-8 pt-4 border-t"><p className="text-xs text-gray-400">PocketBite - {myRest.n} - Generated {new Date().toLocaleString()}</p></div>
      </main>
    </div>
  );
}