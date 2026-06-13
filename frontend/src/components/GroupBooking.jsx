import { useState } from "react";
import { useApp } from "../store/AppContext.jsx";

export default function GroupBooking({ restaurant }) {
  const { submitGroupBooking, notify } = useApp();
  const [show, setShow] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);
  const [groupData, setGroupData] = useState({
    partySize: 4, occasion: "", specialRequests: "", isPrivate: false, preferredDate: "", preferredTime: "19:00",
  });

  const handleSubmit = () => {
    if (!groupData.preferredDate) { notify("Please select a date"); return; }
    if (!groupData.occasion) { notify("Please select an occasion"); return; }
    const result = submitGroupBooking({ ...groupData, restaurantId: restaurant.id, restaurantName: restaurant.n, restaurantImg: restaurant.img });
    setSubmittedData(result);
    setSubmitted(true);
  };

  if (submitted && submittedData) {
    return (
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 rounded-2xl p-5 space-y-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-3xl">{"✅"}</span>
          </div>
          <h4 className="font-black text-indigo-800 text-lg">Request Submitted!</h4>
          <p className="text-sm text-indigo-600 mt-1">Your group booking has been sent to {restaurant.n} for approval.</p>
        </div>

        <div className="bg-white rounded-xl p-4 space-y-2 border border-indigo-100">
          <div className="flex justify-between text-sm"><span className="text-gray-500">Restaurant</span><span className="font-bold">{restaurant.n}</span></div>
          <div className="flex justify-between text-sm"><span className="text-gray-500">Party Size</span><span className="font-bold">{submittedData.partySize} guests</span></div>
          <div className="flex justify-between text-sm"><span className="text-gray-500">Date</span><span className="font-bold">{submittedData.preferredDate}</span></div>
          <div className="flex justify-between text-sm"><span className="text-gray-500">Time</span><span className="font-bold">{submittedData.preferredTime}</span></div>
          <div className="flex justify-between text-sm"><span className="text-gray-500">Occasion</span><span className="font-bold">{submittedData.occasion}</span></div>
          {submittedData.isPrivate ? <div className="flex justify-between text-sm"><span className="text-gray-500">Private Dining</span><span className="font-bold text-purple-700">Yes</span></div> : null}
          {submittedData.specialRequests ? <div className="text-sm"><span className="text-gray-500 block">Special Requests:</span><span className="font-medium text-gray-700">{submittedData.specialRequests}</span></div> : null}
          <div className="flex justify-between text-sm pt-2 border-t"><span className="text-gray-500">Status</span><span className="px-2.5 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-black">PENDING APPROVAL</span></div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
          <p className="text-xs text-blue-700">{"🔔"} You will be notified when {restaurant.n} responds. Check your notifications page for updates.</p>
        </div>

        <div className="flex gap-2">
          <button onClick={() => { setSubmitted(false); setShow(false); setGroupData({ partySize: 4, occasion: "", specialRequests: "", isPrivate: false, preferredDate: "", preferredTime: "19:00" }); }} className="flex-1 py-3 border border-gray-200 rounded-xl font-bold text-sm">
            New Request
          </button>
        </div>
      </div>
    );
  }

  if (!show) {
    return (
      <button onClick={() => setShow(true)} className="w-full py-3.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-black text-sm hover:opacity-90 transition-all shadow-lg">
        {"👥"} Book a Group / Event Slot
      </button>
    );
  }

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-5 border border-indigo-200 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2"><span className="text-xl">{"👥"}</span><h4 className="font-black text-indigo-900">Group / Event Booking</h4></div>
        <button onClick={() => setShow(false)} className="text-indigo-400 hover:text-indigo-600 text-lg">{"✕"}</button>
      </div>

      <div>
        <label className="text-xs font-bold text-indigo-700 block mb-1.5">Party Size *</label>
        <div className="flex gap-2 flex-wrap">
          {[2, 4, 6, 8, 10, 15, 20, 30].map((size) => (
            <button key={size} onClick={() => setGroupData({ ...groupData, partySize: size })} className={"px-3.5 py-2 rounded-xl text-sm font-bold transition-all " + (groupData.partySize === size ? "bg-indigo-600 text-white shadow-md" : "bg-white text-indigo-700 border border-indigo-200 hover:border-indigo-400")}>{size}</button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs font-bold text-indigo-700 block mb-1.5">Occasion *</label>
        <div className="flex flex-wrap gap-2">
          {["Birthday", "Anniversary", "Business", "Date Night", "Family", "Graduation", "Wedding", "Other"].map((occ) => (
            <button key={occ} onClick={() => setGroupData({ ...groupData, occasion: occ })} className={"px-3 py-1.5 rounded-lg text-xs font-bold transition-all " + (groupData.occasion === occ ? "bg-indigo-600 text-white" : "bg-white text-indigo-700 border border-indigo-200 hover:border-indigo-400")}>{occ}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div><label className="text-xs font-bold text-indigo-700 block mb-1">Preferred Date *</label><input type="date" value={groupData.preferredDate} onChange={(e) => setGroupData({ ...groupData, preferredDate: e.target.value })} min={new Date().toISOString().split("T")[0]} className="w-full px-3 py-2.5 bg-white border border-indigo-200 rounded-xl text-sm focus:border-indigo-500 focus:outline-none" /></div>
        <div><label className="text-xs font-bold text-indigo-700 block mb-1">Preferred Time *</label><input type="time" value={groupData.preferredTime} onChange={(e) => setGroupData({ ...groupData, preferredTime: e.target.value })} className="w-full px-3 py-2.5 bg-white border border-indigo-200 rounded-xl text-sm focus:border-indigo-500 focus:outline-none" /></div>
      </div>

      <div><label className="text-xs font-bold text-indigo-700 block mb-1">Special Requests</label><textarea value={groupData.specialRequests} onChange={(e) => setGroupData({ ...groupData, specialRequests: e.target.value })} placeholder="Cake arrangement, decorations, dietary needs, high chair..." rows={2} className="w-full px-3 py-2 bg-white border border-indigo-200 rounded-xl text-sm resize-none focus:border-indigo-500 focus:outline-none" /></div>

      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input type="checkbox" checked={groupData.isPrivate} onChange={(e) => setGroupData({ ...groupData, isPrivate: e.target.checked })} className="rounded border-indigo-300" />
        <span className="font-bold text-indigo-700">Request private dining area</span>
      </label>

      <button onClick={handleSubmit} disabled={!groupData.preferredDate || !groupData.occasion} className="w-full py-3.5 bg-indigo-600 text-white rounded-xl font-black text-sm hover:bg-indigo-700 disabled:opacity-50 shadow-lg transition-all">
        {"📋"} Submit Booking Request ({groupData.partySize} guests)
      </button>
    </div>
  );
}