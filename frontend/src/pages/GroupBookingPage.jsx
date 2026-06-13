import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import { useApp } from "../store/AppContext.jsx";
import { useSocket } from "../store/SocketContext.jsx";

const DINER_TABS = [
  { path: "/home", label: "Home" },
  { path: "/visited", label: "📍 Visited" },
  { path: "/social", label: "👥 Social" },
  { path: "/my-bookings", label: "📅 Bookings" },
  { path: "/cart", label: "🛒 Cart" },
  { path: "/notifications", label: "🔔 Notifications" },
];

export default function GroupBookingPage() {
  const { restId } = useParams();
  const navigate = useNavigate();
  const { user, rests, submitGroupBooking, notify } = useApp();
  const { socket } = useSocket();
  const rest = rests.find((r) => r.id === restId);

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [guests, setGuests] = useState(6);
  const [occasion, setOccasion] = useState("");
  const [notes, setNotes] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);

  if (!rest) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-5xl mb-4">{"🍽️"}</p>
          <p className="font-bold text-gray-500">Restaurant not found</p>
          <button onClick={() => navigate("/home")} className="mt-4 px-6 py-2 bg-emerald-600 text-white rounded-xl font-bold">Go Home</button>
        </div>
      </div>
    );
  }

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!date) { notify("Please select a date"); return; }
    if (!time) { notify("Please select a time"); return; }
    if (guests < 2) { notify("Minimum 2 guests required"); return; }

    setIsSubmitting(true);

    setTimeout(() => {
      const result = submitGroupBooking({
        partySize: guests,
        occasion: occasion,
        specialRequests: notes,
        isPrivate: isPrivate,
        preferredDate: date,
        preferredTime: time,
        restaurantId: rest.id,
        restaurantName: rest.n,
        restaurantImg: rest.img,
      });

      // Emit via socket for real-time reflection on restaurant portal
      if (socket) {
        socket.emit("group_booking_submitted", {
          ...result,
          restaurantId: rest.id,
        });
      }

      setSubmittedData(result);
      setIsSubmitting(false);
      setShowSuccess(true);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
      <Navbar tabs={DINER_TABS} title={user.nm} role="Diner" />
      <main className="max-w-2xl mx-auto px-4 py-8 relative">

        {/* Success Overlay */}
        {showSuccess ? (
          <div className="bg-white rounded-3xl p-8 shadow-xl border border-green-200 space-y-6">
            <div className="text-center">
              <div className="w-24 h-24 bg-green-500 text-white rounded-full flex items-center justify-center text-5xl mx-auto mb-4 shadow-xl shadow-green-200">{"✓"}</div>
              <h2 className="text-3xl font-black text-gray-900 mb-2">Request Sent!</h2>
              <p className="text-gray-600 font-medium">Your group booking request has been sent to <strong className="text-indigo-600">{rest.n}</strong></p>
            </div>

            {/* Request Summary */}
            {submittedData ? (
              <div className="bg-gray-50 rounded-2xl p-5 space-y-2.5 border">
                <div className="flex justify-between text-sm"><span className="text-gray-500">Restaurant</span><span className="font-bold">{rest.n}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Guests</span><span className="font-bold">{submittedData.partySize}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Date</span><span className="font-bold">{submittedData.preferredDate}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Time</span><span className="font-bold">{submittedData.preferredTime}</span></div>
                {submittedData.occasion ? <div className="flex justify-between text-sm"><span className="text-gray-500">Occasion</span><span className="font-bold">{submittedData.occasion}</span></div> : null}
                {submittedData.isPrivate ? <div className="flex justify-between text-sm"><span className="text-gray-500">Private Dining</span><span className="font-bold text-purple-700">Yes</span></div> : null}
                {submittedData.specialRequests ? <div className="text-sm"><span className="text-gray-500 block">Special Requests:</span><span className="font-medium">{submittedData.specialRequests}</span></div> : null}
                <div className="flex justify-between text-sm pt-2 border-t"><span className="text-gray-500">Status</span><span className="px-2.5 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-black animate-pulse">AWAITING APPROVAL</span></div>
              </div>
            ) : null}

            <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center">
              <p className="text-xs text-green-700 font-bold">{"🔔"} The restaurant has been notified instantly. You will receive a notification when they respond.</p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center">
              <p className="text-xs text-blue-700">{"💡"} Check your <strong>Notifications</strong> page for the restaurant's approval or decline with their reason.</p>
            </div>

            <div className="flex gap-3">
              <button onClick={() => navigate("/notifications")} className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-black text-sm hover:bg-indigo-700">
                {"🔔"} View Notifications
              </button>
              <button onClick={() => navigate("/home")} className="flex-1 py-3 border border-gray-200 rounded-xl font-bold text-sm hover:bg-gray-50">
                Back to Home
              </button>
            </div>

            <button onClick={() => { setShowSuccess(false); setDate(""); setTime(""); setGuests(6); setOccasion(""); setNotes(""); setIsPrivate(false); setSubmittedData(null); }} className="w-full py-2 text-indigo-600 font-bold text-sm underline">
              Submit Another Request
            </button>
          </div>
        ) : (
          /* Booking Form */
          <div className="bg-white rounded-3xl p-8 shadow-xl border border-indigo-100">
            <button onClick={() => navigate(-1)} className="text-gray-400 mb-4 font-bold hover:text-gray-600">{"←"} Go Back</button>

            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-3xl shadow-md">{"🎉"}</div>
              <div>
                <h2 className="text-2xl font-black text-gray-900">Group Reservation</h2>
                <p className="text-sm text-gray-500 font-medium mt-1">Submit a request to <strong className="text-indigo-600">{rest.n}</strong></p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1 block ml-1">Date *</label>
                  <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required min={new Date().toISOString().split("T")[0]} className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl font-bold focus:border-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1 block ml-1">Time *</label>
                  <input type="time" value={time} onChange={(e) => setTime(e.target.value)} required className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl font-bold focus:border-indigo-500 outline-none" />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1 block ml-1">Number of Guests *</label>
                <div className="flex gap-2 flex-wrap">
                  {[2, 4, 6, 8, 10, 15, 20, 30].map((n) => (
                    <button key={n} type="button" onClick={() => setGuests(n)} className={"px-4 py-2.5 rounded-xl text-sm font-bold transition-all " + (guests === n ? "bg-indigo-600 text-white shadow-md" : "bg-gray-50 border border-gray-200 text-gray-700 hover:border-indigo-300")}>{n}</button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1 block ml-1">Occasion</label>
                <div className="flex flex-wrap gap-2">
                  {["Birthday", "Anniversary", "Business", "Date Night", "Family", "Graduation", "Wedding", "Other"].map((occ) => (
                    <button key={occ} type="button" onClick={() => setOccasion(occasion === occ ? "" : occ)} className={"px-3 py-1.5 rounded-lg text-xs font-bold transition-all " + (occasion === occ ? "bg-indigo-600 text-white" : "bg-gray-50 border border-gray-200 text-gray-700 hover:border-indigo-300")}>{occ}</button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1 block ml-1">Special Requests</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Dietary requirements, seating preferences, decorations..." rows={3} className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl resize-none focus:border-indigo-500 outline-none text-sm font-medium" />
              </div>

              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={isPrivate} onChange={(e) => setIsPrivate(e.target.checked)} className="rounded border-indigo-300" />
                <span className="font-bold text-indigo-700">Request private dining area</span>
              </label>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                <p className="text-xs text-amber-700">{"💡"} The restaurant will review your request and respond with approval or decline. You will be notified instantly.</p>
              </div>

              <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-gray-900 hover:bg-indigo-600 text-white rounded-xl font-black text-lg shadow-lg hover:shadow-indigo-200 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2">
                {isSubmitting ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Submitting...</span>
                  </>
                ) : (
                  "📋 Submit Booking Request"
                )}
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}