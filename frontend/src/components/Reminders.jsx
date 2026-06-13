import { useState, useEffect } from "react";
import { useApp } from "../store/AppContext.jsx";

function CountdownTimer({ targetDate, targetTime }) {
  const [timeLeft, setTimeLeft] = useState("");
  const [urgency, setUrgency] = useState("normal"); // normal | soon | now

  useEffect(() => {
    const update = () => {
      const target = new Date(`${targetDate}T${targetTime || "00:00"}`);
      const now = new Date();
      const diff = target.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft("Now! 🎉");
        setUrgency("now");
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h ${minutes}m`);
        setUrgency("normal");
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
        setUrgency(hours <= 2 ? "soon" : "normal");
      } else {
        setTimeLeft(`${minutes}m ${seconds}s`);
        setUrgency("soon");
      }
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [targetDate, targetTime]);

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-black ${
      urgency === "now"
        ? "bg-green-500 text-white animate-pulse"
        : urgency === "soon"
        ? "bg-red-100 text-red-700 animate-pulse"
        : "bg-white/80 text-gray-700"
    }`}>
      <span>⏱️</span>
      <span>{timeLeft}</span>
    </div>
  );
}

export default function Reminders() {
  const { user, reminders, setDismissedReminders, remindersEnabled, setRemindersEnabled } = useApp();
  const [minimized, setMinimized] = useState(false);

  if (!user || !remindersEnabled || reminders.length === 0) return null;

  const dismiss = (id) => {
    setDismissedReminders((prev) => [...prev, id]);
  };

  // Diner reminders
  if (user.role === "diner") {
    return (
      <>
        <div className="fixed bottom-6 left-6 z-40">
          <button
            onClick={() => setMinimized(!minimized)}
            className={`px-4 py-2 rounded-full text-sm font-bold shadow-lg transition-all ${
              minimized ? "bg-gray-200 text-gray-700" : "bg-sky-600 text-white"
            }`}
          >
            {minimized ? `🔕 ${reminders.length} Reminder${reminders.length > 1 ? "s" : ""}` : "🔔 Hide Reminders"}
          </button>
        </div>

        {!minimized && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4 space-y-3">
            {reminders.map((b) => (
              <div key={b.id} className="bg-sky-50 border border-sky-200 rounded-2xl shadow-xl p-4 backdrop-blur">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-black text-sky-800">⏰ Reminder</p>
                      <CountdownTimer targetDate={b.dt} targetTime={b.tm} />
                    </div>
                    <p className="text-sm text-sky-700">
                      Your table at <strong>{b.rn}</strong>
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      <span className="text-[10px] bg-sky-200 text-sky-800 px-2 py-0.5 rounded-full font-bold">
                        📅 {b.dt}
                      </span>
                      <span className="text-[10px] bg-sky-200 text-sky-800 px-2 py-0.5 rounded-full font-bold">
                        🕐 {b.tm}
                      </span>
                      <span className="text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-bold">
                        💰 Balance: KES {(b.tot - b.dep).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <button onClick={() => dismiss(b.id)} className="text-sky-400 text-xl hover:text-sky-600 ml-2">×</button>
                </div>
                <div className="mt-3 flex gap-2">
                  <button onClick={() => dismiss(b.id)} className="text-xs px-3 py-1.5 bg-white rounded-lg border border-sky-200 font-medium hover:bg-sky-50">
                    Dismiss
                  </button>
                  <button onClick={() => setRemindersEnabled(false)} className="text-xs px-3 py-1.5 bg-sky-600 text-white rounded-lg font-medium hover:bg-sky-700">
                    Turn off all
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </>
    );
  }

  // Restaurant reminders
  if (user.role === "restaurant") {
    return (
      <>
        <div className="fixed bottom-6 left-6 z-40">
          <button
            onClick={() => setMinimized(!minimized)}
            className={`px-4 py-2 rounded-full text-sm font-bold shadow-lg transition-all ${
              minimized ? "bg-gray-200 text-gray-700" : "bg-purple-600 text-white"
            }`}
          >
            {minimized ? `🔕 ${reminders.length} Upcoming` : `🔔 ${reminders.length} Upcoming`}
          </button>
        </div>

        {!minimized && (
          <div className="fixed top-20 right-6 z-50 w-full max-w-sm space-y-3">
            {reminders.map((b) => (
              <div key={b.id} className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-2xl shadow-xl p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-black text-purple-800">📅 Upcoming</p>
                      <CountdownTimer targetDate={b.dt} targetTime={b.tm} />
                    </div>
                    <p className="text-sm text-purple-700">
                      <strong>{b.dn}</strong> has a reservation
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      <span className="text-[10px] bg-purple-200 text-purple-800 px-2 py-0.5 rounded-full font-bold">
                        📅 {b.dt}
                      </span>
                      <span className="text-[10px] bg-purple-200 text-purple-800 px-2 py-0.5 rounded-full font-bold">
                        🕐 {b.tm}
                      </span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">
                        🍽️ {b.items?.length || 0} items
                      </span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">
                        💰 KES {b.dep}
                      </span>
                      <span className="text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-bold">
                        Balance: KES {b.tot - b.dep}
                      </span>
                      {b.mc && (
                        <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold font-mono">
                          {b.mc}
                        </span>
                      )}
                    </div>
                    {b.dp && (
                      <p className="text-[11px] text-purple-600 mt-1.5">📞 {b.dp}</p>
                    )}
                    {/* Order details */}
                    {b.items && b.items.length > 0 && (
                      <div className="mt-2 bg-white/60 rounded-lg p-2">
                        <p className="text-[10px] font-bold text-purple-700 uppercase mb-1">Order:</p>
                        {b.items.slice(0, 3).map((item, idx) => (
                          <p key={idx} className="text-[10px] text-purple-600">
                            • {item.f?.n || item.name} × {item.q || item.quantity}
                          </p>
                        ))}
                        {b.items.length > 3 && (
                          <p className="text-[10px] text-purple-400">+{b.items.length - 3} more</p>
                        )}
                      </div>
                    )}
                  </div>
                  <button onClick={() => dismiss(b.id)} className="text-purple-400 text-xl hover:text-purple-600 ml-2">×</button>
                </div>
                <div className="mt-3 flex gap-2">
                  <button onClick={() => dismiss(b.id)} className="text-xs px-3 py-1.5 bg-white rounded-lg border border-purple-200 font-medium hover:bg-purple-50">
                    Dismiss
                  </button>
                  <button onClick={() => setRemindersEnabled(false)} className="text-xs px-3 py-1.5 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700">
                    Turn off
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </>
    );
  }

  return null;
}