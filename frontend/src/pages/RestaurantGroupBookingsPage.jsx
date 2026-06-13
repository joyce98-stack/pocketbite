import { useState } from "react";
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

export default function RestaurantGroupBookingsPage() {
  const navigate = useNavigate();
  const { myRest, groupBookings, respondGroupBooking, notify } = useApp();
  const [declineId, setDeclineId] = useState(null);
  const [declineReason, setDeclineReason] = useState("");

  if (!myRest) return null;

  // Directly read from AppContext groupBookings
  const myGB = groupBookings.filter((gb) => gb.restaurantId === myRest.id);
  const pending = myGB.filter((gb) => gb.status === "pending");
  const approved = myGB.filter((gb) => gb.status === "approved");
  const rejected = myGB.filter((gb) => gb.status === "rejected");

  const handleApprove = (gbId) => {
    respondGroupBooking(gbId, true, "");
    notify("Approved! Diner has been notified with a welcome note.");
  };

  const handleDecline = () => {
    if (!declineReason.trim()) { notify("Please provide a reason for declining"); return; }
    respondGroupBooking(declineId, false, declineReason);
    setDeclineId(null);
    setDeclineReason("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-purple-50/30">
      <Navbar tabs={REST_TABS} title={myRest.n} role="Restaurant" />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        <div>
          <h2 className="text-2xl font-black">{"👥"} Group Booking Requests</h2>
          <p className="text-sm text-gray-500">{myGB.length} total - {pending.length} pending - {approved.length} approved - {rejected.length} declined</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-center">
            <p className="text-2xl font-black text-amber-600">{pending.length}</p>
            <p className="text-xs font-bold text-amber-700">Pending</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-2xl p-3 text-center">
            <p className="text-2xl font-black text-green-600">{approved.length}</p>
            <p className="text-xs font-bold text-green-700">Approved</p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-2xl p-3 text-center">
            <p className="text-2xl font-black text-red-500">{rejected.length}</p>
            <p className="text-xs font-bold text-red-600">Declined</p>
          </div>
        </div>

        {/* Pending */}
        {pending.length > 0 ? (
          <div className="space-y-4">
            <h3 className="font-black text-lg text-amber-800">{"⏳"} Awaiting Your Decision</h3>
            {pending.map((gb) => (
              <div key={gb.id} className="bg-white rounded-2xl p-5 shadow-lg border-2 border-amber-200">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-black text-lg shadow">{gb.dinerName?.charAt(0).toUpperCase()}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-black text-lg">{gb.dinerName}</p>
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-[10px] font-black">PENDING</span>
                    </div>
                    {gb.dinerEmail ? <p className="text-xs text-gray-500">{gb.dinerEmail}</p> : null}

                    <div className="flex flex-wrap gap-2 mt-3">
                      <span className="text-xs bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-full font-bold">{"👥"} {gb.partySize} guests</span>
                      <span className="text-xs bg-purple-100 text-purple-700 px-2.5 py-1 rounded-full font-bold">{"📅"} {gb.preferredDate}</span>
                      <span className="text-xs bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full font-bold">{"🕐"} {gb.preferredTime}</span>
                      {gb.occasion ? <span className="text-xs bg-pink-100 text-pink-700 px-2.5 py-1 rounded-full font-bold">{gb.occasion}</span> : null}
                      {gb.isPrivate ? <span className="text-xs bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full font-bold">{"🔒"} Private Dining</span> : null}
                    </div>

                    {gb.specialRequests ? (
                      <div className="mt-3 bg-gray-50 rounded-lg p-3 border">
                        <p className="text-xs font-bold text-gray-500 mb-1">Special Requests:</p>
                        <p className="text-sm text-gray-700">{gb.specialRequests}</p>
                      </div>
                    ) : null}

                    <p className="text-[10px] text-gray-400 mt-2">Submitted: {new Date(gb.submittedAt).toLocaleString()}</p>
                  </div>
                </div>

                {declineId === gb.id ? (
                  <div className="mt-4 bg-red-50 rounded-xl p-4 border border-red-200 space-y-3">
                    <p className="text-sm font-bold text-red-700">Why are you declining this request? *</p>
                    <p className="text-xs text-red-600">This reason will be sent to the diner in their notification.</p>
                    <textarea value={declineReason} onChange={(e) => setDeclineReason(e.target.value)} placeholder="e.g. Fully booked, capacity exceeded..." rows={3} className="w-full px-3 py-2 bg-white border border-red-200 rounded-xl text-sm resize-none focus:outline-none focus:border-red-400" />
                    <div className="flex gap-2">
                      <button onClick={handleDecline} disabled={!declineReason.trim()} className="flex-1 py-2.5 bg-red-500 text-white rounded-xl font-bold text-sm hover:bg-red-600 disabled:opacity-50">Send Decline</button>
                      <button onClick={() => { setDeclineId(null); setDeclineReason(""); }} className="px-4 py-2.5 border border-red-200 rounded-xl font-bold text-sm text-red-600">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-3 mt-4">
                    <button onClick={() => handleApprove(gb.id)} className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-black text-sm hover:bg-emerald-700 shadow-lg">{"✅"} Approve</button>
                    <button onClick={() => setDeclineId(gb.id)} className="flex-1 py-3 bg-red-500 text-white rounded-xl font-black text-sm hover:bg-red-600">{"❌"} Decline</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed">
            <span className="text-5xl block mb-4">{"👥"}</span>
            <p className="font-bold text-gray-500">No pending group requests</p>
            <p className="text-sm text-gray-400 mt-1">When diners submit group requests, they will appear here instantly.</p>
          </div>
        )}

        {/* Approved */}
        {approved.length > 0 ? (
          <div className="space-y-3">
            <h3 className="font-black text-lg text-green-700">{"✅"} Approved ({approved.length})</h3>
            {approved.map((gb) => (
              <div key={gb.id} className="bg-white rounded-2xl p-4 shadow-sm border border-green-200">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-sm">{gb.dinerName} - {gb.partySize} guests</p>
                    <p className="text-xs text-gray-500">{gb.preferredDate} at {gb.preferredTime} - {gb.occasion}</p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">APPROVED</span>
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {/* Rejected */}
        {rejected.length > 0 ? (
          <div className="space-y-3">
            <h3 className="font-black text-lg text-red-600">{"❌"} Declined ({rejected.length})</h3>
            {rejected.map((gb) => (
              <div key={gb.id} className="bg-white rounded-2xl p-4 shadow-sm border border-red-200">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-sm">{gb.dinerName} - {gb.partySize} guests</p>
                    <p className="text-xs text-gray-500">{gb.preferredDate} at {gb.preferredTime}</p>
                    {gb.declineReason ? <p className="text-xs text-red-600 mt-1 bg-red-50 px-2 py-1 rounded">Reason: {gb.declineReason}</p> : null}
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">DECLINED</span>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </main>
    </div>
  );
}