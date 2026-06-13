import { useState } from "react";
import { useApp } from "../store/AppContext.jsx";

export default function ReminderCard() {
  const { reminders, setDismissedReminders, setReminders, user, remindersEnabled } = useApp();
  const [collapsed, setCollapsed] = useState(false);

  if (!remindersEnabled || !reminders.length || user?.role !== "diner") return null;

  return (
    <div className="bg-gradient-to-br from-sky-50 via-blue-50 to-cyan-50 border-2 border-sky-200 rounded-2xl p-4 shadow-md">
      {/* Header with show/hide toggle */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center text-white text-base shadow-md animate-pulse">
            🔔
          </div>
          <div>
            <p className="text-[10px] font-black text-sky-700 uppercase tracking-widest leading-tight">
              Upcoming Bookings
            </p>
            <h3 className="font-black text-sm text-sky-900 leading-tight">
              {reminders.length} table{reminders.length === 1 ? "" : "s"} reserved ✨
            </h3>
          </div>
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="px-3 py-1.5 bg-white border border-sky-200 hover:bg-sky-100 rounded-lg text-[10px] font-black text-sky-700 transition-all flex items-center gap-1"
        >
          {collapsed ? "👁 SHOW" : "🙈 HIDE"}
        </button>
      </div>

      {/* Body — show/hide controlled */}
      {!collapsed && (
        <div className="space-y-2 mt-3">
          {reminders.map((b) => {
            const visit = new Date(`${b.dt}T${b.tm || "00:00"}`);
            const diffMs = visit.getTime() - Date.now();
            const minsUntil = Math.round(diffMs / 60000);
            const hoursUntil = Math.round(diffMs / 3600000);

            let timeLabel = "Coming up";
            let timeColor = "bg-sky-200 text-sky-800";
            if (diffMs <= 0) {
              timeLabel = "🚨 NOW";
              timeColor = "bg-red-500 text-white";
            } else if (minsUntil < 60) {
              timeLabel = `⏰ In ${minsUntil}m`;
              timeColor = "bg-yellow-400 text-yellow-900";
            } else if (hoursUntil <= 6) {
              timeLabel = `🔔 In ${hoursUntil}h`;
              timeColor = "bg-orange-300 text-orange-900";
            } else {
              timeLabel = `📌 In ${hoursUntil}h`;
            }

            return (
              <div
                key={b.id}
                className="bg-white/80 backdrop-blur rounded-xl p-3 border border-sky-100 hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-sm text-gray-900 truncate">{b.rn}</p>
                    <p className="text-[11px] text-gray-600">
                      📅 {b.dt} • 🕒 {b.tm}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] px-2.5 py-1 rounded-full font-black ${timeColor}`}>
                      {timeLabel}
                    </span>
                    <button
                      onClick={() => {
                        setDismissedReminders((p) => [...p, b.id]);
                        setReminders((p) => p.filter((x) => x.id !== b.id));
                      }}
                      className="w-6 h-6 rounded-full bg-gray-100 hover:bg-red-100 hover:text-red-600 flex items-center justify-center text-gray-500 transition-all text-xs"
                      title="Dismiss"
                    >
                      ✕
                    </button>
                  </div>
                </div>
                <div className="mt-1.5 pt-1.5 border-t border-sky-100 flex items-center justify-between text-[10px]">
                  <span className="text-gray-600">
                    🧾 <span className="font-mono font-bold text-sky-700">{b.qr}</span>
                  </span>
                  <span className="text-orange-600 font-bold">
                    Balance KES {b.tot - b.dep}
                  </span>
                </div>
              </div>
            );
          })}
          <p className="text-[10px] text-center text-sky-600 italic">
            💙 Toggle reminders ON/OFF anytime in My Bookings
          </p>
        </div>
      )}
    </div>
  );
}