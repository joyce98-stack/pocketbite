import { useState } from "react";
import { useApp } from "../store/AppContext.jsx";

export default function WaitlistButton({ restaurant }) {
  const { user, notify, trackActivity } = useApp();
  const [joined, setJoined] = useState(false);
  const [waitlistData, setWaitlistData] = useState(null);

  const joinWaitlist = () => {
    const entry = {
      id: "wl" + Date.now(),
      userId: user.id,
      userName: user.nm,
      restaurantId: restaurant.id,
      restaurantName: restaurant.n,
      joinedAt: new Date().toISOString(),
      status: "waiting",
      position: Math.floor(Math.random() * 5) + 1,
      estimatedWait: Math.floor(Math.random() * 30) + 10,
    };

    setWaitlistData(entry);
    setJoined(true);
    notify(`📋 Added to ${restaurant.n}'s waitlist! Position: #${entry.position}`);
    trackActivity("joined_waitlist", {
      restaurantId: restaurant.id,
      restaurantName: restaurant.n,
      position: entry.position,
    });
  };

  const leaveWaitlist = () => {
    setJoined(false);
    setWaitlistData(null);
    notify("Left the waitlist");
    trackActivity("left_waitlist", {
      restaurantId: restaurant.id,
      restaurantName: restaurant.n,
    });
  };

  if (restaurant.status !== "busy") return null;

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">⏳</span>
        <div>
          <p className="font-black text-amber-900">Restaurant is Busy</p>
          <p className="text-xs text-amber-700">Join the waitlist to get notified when a table opens up.</p>
        </div>
      </div>

      {!joined ? (
        <button
          onClick={joinWaitlist}
          className="w-full py-3 bg-amber-500 text-white rounded-xl font-black text-sm hover:bg-amber-600 transition-all mt-2"
        >
          📋 Join Waitlist
        </button>
      ) : (
        <div className="mt-3 space-y-2">
          <div className="bg-white rounded-xl p-3 flex items-center justify-between">
            <div>
              <p className="font-bold text-sm text-amber-900">Your Position: #{waitlistData.position}</p>
              <p className="text-xs text-amber-700">Est. wait: ~{waitlistData.estimatedWait} mins</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center font-black text-amber-700">
              #{waitlistData.position}
            </div>
          </div>
          <button
            onClick={leaveWaitlist}
            className="w-full py-2 border border-amber-300 text-amber-700 rounded-xl font-bold text-xs hover:bg-amber-100"
          >
            Leave Waitlist
          </button>
        </div>
      )}
    </div>
  );
}