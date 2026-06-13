import { useMemo, useState } from "react";
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

export default function RestaurantNotificationsPage() {
  const navigate = useNavigate();
  const { user, notifications, setNotifications, respondGroupBooking, notify } = useApp();
  const [replyText, setReplyText] = useState("");
  const [replyId, setReplyId] = useState(null);

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

  const handleApprove = (gbId) => {
    respondGroupBooking(gbId, true, "");
    notify("Approved! Diner notified with welcome note.");
  };

  const handleDecline = () => {
    if (!replyText.trim()) { notify("Please provide a reason"); return; }
    respondGroupBooking(replyId, false, replyText);
    setReplyId(null);
    setReplyText("");
    notify("Declined with reason sent to diner.");
  };

  const getIcon = (type) => {
    switch (type) {
      case "group_booking_request": return "👥";
      case "diner_checked_in": return "📍";
      case "booking_adjusted": return "📝";
      case "new_review": return "⭐";
      case "booking_reminder": return "⏰";
      case "new_booking": return "🎫";
      default: return "🔔";
    }
  };

  const getColor = (type) => {
    switch (type) {
      case "group_booking_request": return "border-indigo-200 bg-indigo-50";
      case "diner_checked_in": return "border-purple-200 bg-purple-50";
      case "booking_adjusted": return "border-blue-200 bg-blue-50";
      case "new_review": return "border-amber-200 bg-amber-50";
      default: return "border-gray-200 bg-gray-50";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-purple-50/30">
      <Navbar tabs={REST_TABS} title={user.nm} role="Restaurant" />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-4">

        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black">{"🔔"} Notifications</h2>
            <p className="text-sm text-gray-500">{unreadCount} unread</p>
          </div>
          <div className="flex gap-2">
            {unreadCount > 0 ? <button onClick={markAllRead} className="px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold hover:bg-emerald-200">Mark all read</button> : null}
            {myNotifs.length > 0 ? <button onClick={clearAll} className="px-3 py-1.5 bg-red-50 text-red-500 rounded-lg text-xs font-bold hover:bg-red-100">Clear all</button> : null}
          </div>
        </div>

        {myNotifs.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed">
            <span className="text-5xl block mb-4">{"🔔"}</span>
            <p className="font-bold text-gray-500">No notifications yet</p>
            <p className="text-sm text-gray-400 mt-1">Booking requests, check-ins, and reviews will appear here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {myNotifs.map((n) => (
              <div key={n.id} onClick={() => markRead(n.id)} className={"rounded-2xl p-4 border transition-all cursor-pointer " + getColor(n.type) + (n.read ? " opacity-70" : " shadow-md")}>
                <div className="flex items-start gap-3">
                  <div className="text-2xl flex-shrink-0">{getIcon(n.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-black text-sm">{n.title}</p>
                      {!n.read ? <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" /> : null}
                    </div>
                    <p className="text-sm text-gray-700 mt-1">{n.message}</p>

                    {/* Group Request Action */}
                    {n.type === "group_booking_request" && n.data ? (
                      <div className="mt-3 bg-white rounded-xl p-3 border space-y-2">
                        <div className="flex flex-wrap gap-1.5">
                          <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-bold">{"👥"} {n.data.partySize} guests</span>
                          <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-bold">{"📅"} {n.data.preferredDate}</span>
                          <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">{"🕐"} {n.data.preferredTime}</span>
                          {n.data.occasion ? <span className="text-[10px] bg-pink-100 text-pink-700 px-2 py-0.5 rounded-full font-bold">{n.data.occasion}</span> : null}
                          {n.data.isPrivate ? <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">Private Dining</span> : null}
                        </div>
                        {n.data.specialRequests ? <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded">{"📝"} {n.data.specialRequests}</p> : null}

                        {replyId === n.data.id ? (
                          <div className="space-y-2 pt-2">
                            <textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="Reason for declining..." rows={2} className="w-full px-3 py-2 bg-white border border-red-200 rounded-lg text-xs resize-none" />
                            <div className="flex gap-2">
                              <button onClick={handleDecline} className="flex-1 py-2 bg-red-500 text-white rounded-lg text-xs font-bold">Send Decline</button>
                              <button onClick={() => { setReplyId(null); setReplyText(""); }} className="px-3 py-2 border rounded-lg text-xs font-bold">Cancel</button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex gap-2 pt-2">
                            <button onClick={(e) => { e.stopPropagation(); handleApprove(n.data.id); }} className="flex-1 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold">{"✅"} Approve</button>
                            <button onClick={(e) => { e.stopPropagation(); setReplyId(n.data.id); }} className="flex-1 py-2 bg-red-500 text-white rounded-lg text-xs font-bold">{"❌"} Decline</button>
                          </div>
                        )}
                      </div>
                    ) : null}

                    {/* Booking Adjusted */}
                    {n.type === "booking_adjusted" && n.data ? (
                      <div className="mt-2 bg-white rounded-lg p-2 border">
                        <p className="text-xs text-blue-700">New date: <strong>{n.data.newDate}</strong> at <strong>{n.data.newTime}</strong></p>
                        <button onClick={(e) => { e.stopPropagation(); navigate("/restaurant/bookings"); }} className="text-xs text-blue-600 font-bold mt-1 underline">View booking →</button>
                      </div>
                    ) : null}

                    {/* Diner Checked In */}
                    {n.type === "diner_checked_in" && n.data ? (
                      <div className="mt-2 bg-white rounded-lg p-2 border">
                        <p className="text-xs text-purple-700"><strong>{n.data.dinerName}</strong> has checked in!</p>
                      </div>
                    ) : null}

                    {/* New Review */}
                    {n.type === "new_review" && n.data ? (
                      <div className="mt-2 bg-white rounded-lg p-2 border">
                        <p className="text-xs text-amber-700">New {n.data.rating}⭐ review received!</p>
                        <button onClick={(e) => { e.stopPropagation(); navigate("/restaurant/reviews"); }} className="text-xs text-amber-600 font-bold mt-1 underline">View reviews →</button>
                      </div>
                    ) : null}

                    <p className="text-[10px] text-gray-400 mt-2">{new Date(n.createdAt).toLocaleString()}</p>
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