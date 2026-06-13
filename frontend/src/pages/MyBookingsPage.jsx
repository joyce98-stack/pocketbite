import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Receipt from "../components/Receipt.jsx";
import { useApp } from "../store/AppContext.jsx";
import { useSocket } from "../store/SocketContext.jsx";

const DINER_TABS = [
  { path: "/home", label: "Home" },
  { path: "/wishlist", label: "Wishlist" },
  { path: "/my-bookings", label: "Bookings" },
  { path: "/notifications", label: "Alerts" },
];

export default function MyBookingsPage() {
  const navigate = useNavigate();
  const { user, bks, setBks, rests, notify, addReview, trackActivity, addNotification } = useApp();
  const { socket } = useSocket();
  const [showReceipt, setShowReceipt] = useState(null);
  const [showReview, setShowReview] = useState(null);
  const [reviewPhotos, setReviewPhotos] = useState([]);
  const [editBooking, setEditBooking] = useState(null);
  const [editDate, setEditDate] = useState("");
  const [editTime, setEditTime] = useState("");

  const myBookings = bks.filter((b) => b.did === user?.id).sort((a, b) => new Date(b.ca) - new Date(a.ca));

  const canCheckIn = (booking) => {
    if (booking.st !== "confirmed" || booking.checkedIn) return false;
    const now = new Date();
    const bookingTime = new Date(booking.dt + "T" + (booking.tm || "00:00"));
    const diffMins = (bookingTime - now) / (1000 * 60);
    return diffMins <= 30 && diffMins >= -120;
  };

  const handleCheckIn = (booking) => {
    setBks((prev) => prev.map((b) => b.id === booking.id ? { ...b, checkedIn: true, checkedInAt: new Date().toISOString() } : b));
    notify("Checked in at " + booking.rn + "!");
    trackActivity("checked_in", { restaurantName: booking.rn, bookingId: booking.id });
    if (socket) socket.emit("diner_checked_in", { dinerName: user.nm, restaurantId: booking.rid, bookingId: booking.id });
  };

  const handleAdjust = () => {
    if (!editDate || !editTime) { notify("Please select date and time"); return; }
    const booking = myBookings.find((b) => b.id === editBooking.id);
    const rest = rests.find((r) => r.id === booking.rid);

    setBks((prev) => prev.map((b) => b.id === editBooking.id ? { ...b, dt: editDate, tm: editTime, adjusted: true, oldDate: b.dt, oldTime: b.tm } : b));

    // Notify restaurant
    if (rest && rest.em) {
      const restOwner = users.find((u) => u.em === rest.em && u.role === "restaurant");
      if (restOwner) {
        addNotification(restOwner.id, {
          type: "booking_adjusted",
          title: "Booking Adjusted by " + user.nm,
          message: user.nm + " changed their booking at " + rest.n + " to " + editDate + " at " + editTime,
          data: { bookingId: editBooking.id, dinerName: user.nm, newDate: editDate, newTime: editTime, restaurantId: booking.rid },
        });
      }
    }
    if (socket) socket.emit("booking_adjusted", { dinerName: user.nm, restaurantId: booking.rid, newDate: editDate, newTime: editTime, bookingId: editBooking.id });

    setEditBooking(null);
    notify("Booking adjusted! Restaurant has been notified.");
    trackActivity("adjusted_booking", { bookingId: editBooking.id, newDate: editDate, newTime: editTime });
  };

  const handleReview = (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const rating = parseInt(fd.get("rating"));
    const comment = fd.get("comment");
    if (reviewPhotos.length === 0) { notify("Please add at least one photo as evidence"); return; }
    addReview(showReview, rating, comment);
    trackActivity("posted_review", { restaurantName: showReview.rn, rating, photoCount: reviewPhotos.length });
    setShowReview(null);
    setReviewPhotos([]);
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    setReviewPhotos((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
  };

  const statusColor = (st) => {
    if (st === "confirmed") return "bg-green-100 text-green-700";
    if (st === "cancelled") return "bg-red-100 text-red-700";
    if (st === "completed") return "bg-blue-100 text-blue-700";
    return "bg-amber-100 text-amber-700";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-purple-50/30">
      <Navbar tabs={DINER_TABS} title={user.nm} role="Diner" />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-4">
        <h2 className="text-2xl font-black">{"🎫"} My Bookings</h2>
        {myBookings.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed">
            <span className="text-5xl block mb-4">{"🍽️"}</span>
            <p className="font-bold text-gray-500">No bookings yet</p>
            <button onClick={() => navigate("/home")} className="mt-4 px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-bold">Browse Restaurants</button>
          </div>
        ) : (
          <div className="space-y-4">
            {myBookings.map((bk) => (
              <div key={bk.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-bold text-lg">{bk.rn}</h4>
                    <p className="text-sm text-gray-600">{bk.dt} at {bk.tm}</p>
                    <p className="text-xs text-gray-500 mt-1">{bk.items?.length || 0} items - KES {bk.tot}</p>
                    {bk.checkedIn ? <p className="text-xs text-purple-600 font-bold mt-1">{"✅"} Checked in at {new Date(bk.checkedInAt).toLocaleTimeString()}</p> : null}
                    {bk.adjusted ? <p className="text-xs text-blue-600 font-bold mt-1">{"📝"} Booking was adjusted from {bk.oldDate} {bk.oldTime}</p> : null}
                  </div>
                  <span className={"px-3 py-1 rounded-full text-[11px] font-bold " + statusColor(bk.st)}>{bk.st.replace("_", " ").toUpperCase()}</span>
                </div>
                {bk.mc ? <p className="text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg font-mono mb-3">M-Pesa: {bk.mc}</p> : null}
                <div className="flex gap-2 flex-wrap">
                  {(bk.st === "confirmed" || bk.st === "completed") ? <button onClick={() => setShowReceipt(bk)} className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg text-xs font-bold">{"🧾"} Receipt</button> : null}
                  {canCheckIn(bk) ? <button onClick={() => handleCheckIn(bk)} className="px-3 py-1.5 bg-green-500 text-white rounded-lg text-xs font-bold animate-pulse">{"📍"} Check In Now</button> : null}
                  {bk.st === "confirmed" && !bk.checkedIn && !canCheckIn(bk) ? <span className="px-3 py-1.5 bg-gray-100 text-gray-500 rounded-lg text-xs font-bold">{"🕐"} Check-in opens 30min before</span> : null}
                  {bk.checkedIn && bk.st !== "completed" ? <button onClick={() => setShowReview(bk)} className="px-3 py-1.5 bg-amber-100 text-amber-700 rounded-lg text-xs font-bold">{"⭐"} Review</button> : null}
                  {bk.st === "confirmed" && !bk.checkedIn ? <button onClick={() => { setEditBooking(bk); setEditDate(bk.dt); setEditTime(bk.tm); }} className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-xs font-bold">{"📝"} Adjust</button> : null}
                  {bk.st === "confirmed" && !bk.checkedIn ? <button onClick={() => { setBks((p) => p.map((b) => b.id === bk.id ? { ...b, st: "cancelled" } : b)); notify("Booking cancelled. Deposit non-refundable."); }} className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs font-bold">Cancel</button> : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Adjust Modal */}
      {editBooking ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setEditBooking(null)} />
          <div className="relative bg-white rounded-3xl w-full max-w-md p-6 space-y-4">
            <h3 className="font-black text-xl">{"📝"} Adjust Booking</h3>
            <p className="text-sm text-gray-600">Change date or time for {editBooking.rn}. The restaurant will be notified automatically.</p>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs font-bold block mb-1">New Date</label><input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} min={new Date().toISOString().split("T")[0]} className="w-full px-3 py-2.5 border rounded-xl" /></div>
              <div><label className="text-xs font-bold block mb-1">New Time</label><input type="time" value={editTime} onChange={(e) => setEditTime(e.target.value)} className="w-full px-3 py-2.5 border rounded-xl" /></div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-2"><p className="text-xs text-blue-700">{"💡"} The restaurant will receive a notification about this change.</p></div>
            <div className="flex gap-2">
              <button onClick={() => setEditBooking(null)} className="flex-1 py-3 border rounded-xl font-bold">Cancel</button>
              <button onClick={handleAdjust} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-black">Save Changes</button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Review Modal */}
      {showReview ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => { setShowReview(null); setReviewPhotos([]); }} />
          <div className="relative bg-white rounded-3xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="font-black text-xl mb-1">{"⭐"} Review {showReview.rn}</h3>
            <p className="text-xs text-gray-500 mb-4">Share your experience with photo proof</p>
            <form onSubmit={handleReview} className="space-y-4">
              <div className="flex gap-3 justify-center">{[1,2,3,4,5].map((n) => <label key={n} className="cursor-pointer"><input type="radio" name="rating" value={n} defaultChecked={n===5} className="sr-only peer"/><span className="text-3xl grayscale peer-checked:grayscale-0 peer-checked:scale-125 inline-block">{"⭐"}</span></label>)}</div>
              <textarea name="comment" required rows={3} placeholder="How was the food, service, ambience?" className="w-full px-3 py-2.5 border rounded-xl resize-none"/>
              <div>
                <label className="text-xs font-bold block mb-2">{"📸"} Food/Drink Photos (Required)</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {reviewPhotos.map((url, i) => <div key={i} className="relative w-16 h-16"><img src={url} className="w-full h-full object-cover rounded-lg border"/><button type="button" onClick={() => setReviewPhotos((p) => p.filter((_, idx) => idx !== i))} className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-[10px] font-bold">{"×"}</button></div>)}
                  <label className="w-16 h-16 border-2 border-dashed border-amber-300 rounded-lg flex items-center justify-center cursor-pointer hover:bg-amber-50"><span className="text-xl text-amber-400">{"+"}</span><input type="file" accept="image/*" multiple onChange={handlePhotoUpload} className="hidden"/></label>
                </div>
                {reviewPhotos.length === 0 ? <p className="text-[11px] text-red-500 font-bold">At least 1 photo required</p> : <p className="text-[11px] text-green-600 font-bold">{reviewPhotos.length} photo(s) added</p>}
              </div>
              <div className="flex gap-2"><button type="button" onClick={() => { setShowReview(null); setReviewPhotos([]); }} className="flex-1 py-2.5 border rounded-xl font-bold">Cancel</button><button type="submit" disabled={reviewPhotos.length === 0} className="flex-1 py-2.5 bg-amber-500 text-white rounded-xl font-bold disabled:opacity-50">Submit Review</button></div>
              <p className="text-[11px] text-center text-green-700 bg-green-50 py-1.5 rounded-lg font-medium">{"✓"} VERIFIED review (checked-in diner)</p>
            </form>
          </div>
        </div>
      ) : null}

      {showReceipt ? <div className="fixed inset-0 z-50 flex items-center justify-center p-4"><div className="absolute inset-0 bg-black/60" onClick={() => setShowReceipt(null)}/><div className="relative w-full max-w-md"><Receipt booking={showReceipt} onClose={() => setShowReceipt(null)}/></div></div> : null}
    </div>
  );
}