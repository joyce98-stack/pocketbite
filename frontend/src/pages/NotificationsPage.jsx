import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import { useApp } from "../store/AppContext.jsx";

const DINER_TABS = [
  { path: "/home", label: "Home" },
  { path: "/wishlist", label: "Wishlist" },
  { path: "/my-bookings", label: "Bookings" },
  { path: "/notifications", label: "Notifications" },
];

export default function NotificationsPage() {
  const navigate = useNavigate();
  const { user, notifications, setNotifications } = useApp();

  const myNotifs = useMemo(() => {
    return notifications
      .filter((n) => n.targetUserId === user?.id)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [notifications, user]);

  const unreadCount = myNotifs.filter((n) => !n.read).length;

  const markRead = (id) => {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => n.targetUserId === user?.id ? { ...n, read: true } : n));
  };

  const clearAll = () => {
    setNotifications((prev) => prev.filter((n) => n.targetUserId !== user?.id));
  };

  const getIcon = (type) => {
    switch (type) {
      case "group_booking_approved": return "✅";
      case "group_booking_rejected": return "❌";
      case "group_booking_request": return "👥";
      case "dining_invite": return "💌";
      case "payment_confirmed": return "💰";
      case "booking_reminder": return "⏰";
      default: return "🔔";
    }
  };

  const getColor = (type) => {
    switch (type) {
      case "group_booking_approved": return "border-green-200 bg-green-50";
      case "group_booking_rejected": return "border-red-200 bg-red-50";
      case "dining_invite": return "border-pink-200 bg-pink-50";
      case "group_booking_request": return "border-indigo-200 bg-indigo-50";
      default: return "border-gray-200 bg-gray-50";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-purple-50/30">
      <Navbar tabs={DINER_TABS} title={user.nm} role="Diner" />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black">{"🔔"} Notifications</h2>
            <p className="text-sm text-gray-500">{unreadCount} unread</p>
          </div>
          <div className="flex gap-2">
            {unreadCount > 0 ? (
              <button onClick={markAllRead} className="px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold hover:bg-emerald-200">
                Mark all read
              </button>
            ) : null}
            {myNotifs.length > 0 ? (
              <button onClick={clearAll} className="px-3 py-1.5 bg-red-50 text-red-500 rounded-lg text-xs font-bold hover:bg-red-100">
                Clear all
              </button>
            ) : null}
          </div>
        </div>

        {myNotifs.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed">
            <span className="text-5xl block mb-4">{"🔔"}</span>
            <p className="font-bold text-gray-500">No notifications yet</p>
            <p className="text-sm text-gray-400 mt-1">Group booking responses and dining invites will appear here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {myNotifs.map((n) => (
              <div key={n.id} onClick={() => markRead(n.id)} className={"rounded-2xl p-4 border shadow-sm transition-all cursor-pointer " + getColor(n.type) + (n.read ? " opacity-70" : " shadow-md")}>
                <div className="flex items-start gap-3">
                  <div className="text-2xl flex-shrink-0">{getIcon(n.type)}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-black text-sm">{n.title}</p>
                      {!n.read ? <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" /> : null}
                    </div>
                    <p className="text-sm text-gray-700 mt-1">{n.message}</p>

                    {/* Group booking details */}
                    {n.data?.partySize ? (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        <span className="text-[10px] bg-white px-2 py-0.5 rounded-full font-bold text-gray-600 border">
                          {"👥"} {n.data.partySize} guests
                        </span>
                        <span className="text-[10px] bg-white px-2 py-0.5 rounded-full font-bold text-gray-600 border">
                          {"📅"} {n.data.preferredDate}
                        </span>
                        <span className="text-[10px] bg-white px-2 py-0.5 rounded-full font-bold text-gray-600 border">
                          {"🕐"} {n.data.preferredTime}
                        </span>
                        {n.data.occasion ? (
                          <span className="text-[10px] bg-white px-2 py-0.5 rounded-full font-bold text-gray-600 border">
                            {n.data.occasion}
                          </span>
                        ) : null}
                      </div>
                    ) : null}

                    {/* Dining invite action */}
                    {n.type === "dining_invite" && n.data?.restaurantId ? (
                      <button onClick={(e) => { e.stopPropagation(); navigate("/restaurant/" + n.data.restaurantId); }} className="mt-2 px-3 py-1.5 bg-pink-500 text-white rounded-lg text-xs font-bold hover:bg-pink-600">
                        View Restaurant {"→"}
                      </button>
                    ) : null}

                    {/* Decline reason */}
                    {n.data?.declineReason ? (
                      <div className="mt-2 bg-white rounded-lg p-2 border border-red-200">
                        <p className="text-xs text-red-700"><strong>Reason:</strong> {n.data.declineReason}</p>
                      </div>
                    ) : null}

                    {/* Welcome note for approved */}
                    {n.type === "group_booking_approved" ? (
                      <div className="mt-2 bg-white rounded-lg p-2 border border-green-200">
                        <p className="text-xs text-green-700">{"🎉"} Welcome! Your table is reserved. We look forward to hosting you!</p>
                      </div>
                    ) : null}

                    <p className="text-[10px] text-gray-400 mt-2">
                      {new Date(n.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })} at{" "}
                      {new Date(n.createdAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}