import { useMemo } from "react";
import { useApp } from "../store/AppContext.jsx";

export default function TimeSlotSuggester({ restaurant, selectedDate, onSelectSlot }) {
  const { bks } = useApp();

  const suggestions = useMemo(() => {
    if (!restaurant || !selectedDate) return [];

    // Parse opening/closing hours
    const parseTime = (timeStr) => {
      if (!timeStr) return 0;
      const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
      if (!match) return 0;
      let hours = parseInt(match[1]);
      const mins = parseInt(match[2]);
      const period = match[3].toUpperCase();
      if (period === "PM" && hours !== 12) hours += 12;
      if (period === "AM" && hours === 12) hours = 0;
      return hours * 60 + mins;
    };

    const openMins = parseTime(restaurant.oh);
    const closeMins = parseTime(restaurant.ch);

    // Get existing bookings for this date
    const dateBookings = bks.filter(
      (b) => b.rid === restaurant.id && b.dt === selectedDate && b.st !== "cancelled"
    );

    // Generate 30-min slots
    const slots = [];
    for (let mins = openMins; mins < closeMins - 30; mins += 30) {
      const hours = Math.floor(mins / 60);
      const m = mins % 60;
      const timeStr = `${String(hours).padStart(2, "0")}:${String(m).padStart(2, "0")}`;

      // Count bookings in this time window
      const bookingsInSlot = dateBookings.filter((b) => {
        const [bH, bM] = (b.tm || "00:00").split(":").map(Number);
        const bMins = bH * 60 + bM;
        return Math.abs(bMins - mins) < 60;
      }).length;

      // AI scoring: prefer less busy times, lunch/dinner peaks
      let score = 100;
      score -= bookingsInSlot * 20; // Less busy = higher score
      if (hours >= 12 && hours <= 14) score += 15; // Lunch boost
      if (hours >= 18 && hours <= 20) score += 15; // Dinner boost
      if (hours >= 10 && hours <= 11) score += 5; // Brunch boost

      const crowdLevel =
        bookingsInSlot === 0 ? "empty" :
        bookingsInSlot <= 2 ? "low" :
        bookingsInSlot <= 4 ? "moderate" : "busy";

      const period = hours < 12 ? "AM" : "PM";
      const displayHour = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;

      slots.push({
        time: timeStr,
        display: `${displayHour}:${String(m).padStart(2, "0")} ${period}`,
        score,
        crowdLevel,
        bookingsInSlot,
        recommended: score >= 80,
      });
    }

    return slots.sort((a, b) => b.score - a.score);
  }, [restaurant, selectedDate, bks]);

  if (!restaurant || !selectedDate || suggestions.length === 0) return null;

  const topPicks = suggestions.filter((s) => s.recommended).slice(0, 3);
  const allSlots = suggestions.sort((a, b) => {
    const [aH] = a.time.split(":").map(Number);
    const [bH] = b.time.split(":").map(Number);
    return aH - bH;
  });

  const crowdColors = {
    empty: "bg-green-100 text-green-700 border-green-200",
    low: "bg-emerald-50 text-emerald-700 border-emerald-200",
    moderate: "bg-amber-50 text-amber-700 border-amber-200",
    busy: "bg-red-50 text-red-700 border-red-200",
  };

  const crowdLabels = {
    empty: "🟢 Empty",
    low: "🟡 Quiet",
    moderate: "🟠 Moderate",
    busy: "🔴 Busy",
  };

  return (
    <div className="space-y-4">
      {/* AI Top Picks */}
      {topPicks.length > 0 && (
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-4 border border-purple-100">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">🤖</span>
            <div>
              <p className="text-xs font-bold text-purple-600 uppercase tracking-wider">AI SUGGESTION</p>
              <p className="text-sm font-black text-gray-900">Best times for you</p>
            </div>
          </div>
          <div className="flex gap-2">
            {topPicks.map((slot) => (
              <button
                key={slot.time}
                onClick={() => onSelectSlot(slot.time)}
                className="flex-1 py-3 bg-white rounded-xl border-2 border-purple-200 hover:border-purple-500 transition-all text-center group"
              >
                <p className="font-black text-lg text-purple-700 group-hover:text-purple-900">{slot.display}</p>
                <p className="text-[10px] text-purple-500 font-bold">{crowdLabels[slot.crowdLevel]}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* All Available Slots */}
      <div>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">All Available Slots</p>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto">
          {allSlots.map((slot) => (
            <button
              key={slot.time}
              onClick={() => onSelectSlot(slot.time)}
              className={`py-2 px-2 rounded-xl border text-center transition-all hover:scale-105 ${crowdColors[slot.crowdLevel]}`}
            >
              <p className="font-bold text-sm">{slot.display}</p>
              <p className="text-[9px] font-bold">{crowdLabels[slot.crowdLevel]}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}