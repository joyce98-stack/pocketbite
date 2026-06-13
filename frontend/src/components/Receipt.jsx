import { useApp } from "../store/AppContext.jsx";

export default function Receipt({ booking, onClose }) {
  const { notify } = useApp();
  if (!booking) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 print:bg-white">
      <div className="absolute inset-0 bg-black/60 print:hidden" onClick={onClose} />
      <div id="pb-receipt" className="relative bg-white rounded-3xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto print:rounded-none print:shadow-none print:max-w-full">
        <div className="text-center mb-4 pb-4 border-b-2 border-dashed border-gray-200">
          <div className="text-3xl mb-1">🍴</div>
          <h3 className="font-black text-xl">PocketBite Receipt</h3>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Official Deposit Confirmation</p>
        </div>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between"><span className="text-gray-500">Restaurant</span><span className="font-black">{booking.rn}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Diner</span><span className="font-bold">{booking.dn}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Phone</span><span className="font-bold">{booking.dp || "—"}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Visit Date</span><span className="font-bold">{booking.dt} at {booking.tm}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">M-Pesa Code</span><span className="font-mono font-bold text-emerald-700">{booking.mc || "Pending"}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Booking ID</span><span className="font-mono font-bold text-purple-700">{booking.qr}</span></div>
        </div>
        <div className="border-t-2 border-dashed border-gray-200 my-4 pt-3">
          <p className="text-xs font-black uppercase text-gray-400 mb-2">Order Summary</p>
          {booking.items.map(i => (
            <div key={i.f.id} className="flex justify-between text-sm py-1"><span>{i.f.n} × {i.q}</span><span className="font-bold">KES {i.f.p * i.q}</span></div>
          ))}
        </div>
        <div className="bg-gray-50 rounded-2xl p-4 space-y-2 text-sm">
          <div className="flex justify-between"><span>Subtotal</span><span className="font-bold">KES {booking.tot}</span></div>
          <div className="flex justify-between text-emerald-700"><span>✓ Deposit Paid (30%)</span><span className="font-black">KES {booking.dep}</span></div>
          <div className="flex justify-between text-orange-600 pt-2 border-t border-gray-200"><span className="font-bold">Balance at Restaurant</span><span className="font-black text-lg">KES {booking.tot - booking.dep}</span></div>
        </div>
        <div className="mt-4 p-4 bg-purple-50 rounded-2xl border-2 border-dashed border-purple-200 text-center">
          <div className="inline-block bg-white p-2 rounded-xl shadow-sm">
            <div className="grid grid-cols-10 gap-px w-32 h-32 mx-auto">
              {Array.from({ length: 100 }).map((_, i) => {
                const seed = booking.qr.charCodeAt(i % booking.qr.length) + i;
                return <div key={i} className={seed % 3 === 0 ? "bg-purple-800" : "bg-white"} />;
              })}
            </div>
          </div>
          <p className="font-mono font-bold text-sm mt-2 text-purple-700">{booking.qr}</p>
          <p className="text-[10px] text-gray-500 mt-1">Show this QR code at the restaurant for check-in</p>
        </div>
        <div className="flex gap-2 mt-4 print:hidden">
          <button onClick={() => window.print()} className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-black text-sm hover:bg-emerald-700">🖨 Print Receipt</button>
          <button onClick={() => { navigator.clipboard.writeText(booking.qr); notify("QR copied! 📋"); }} className="flex-1 py-3 bg-purple-600 text-white rounded-xl font-black text-sm hover:bg-purple-700">📋 Copy QR</button>
          <button onClick={onClose} className="px-4 py-3 border rounded-xl font-bold text-sm">Close</button>
        </div>
        <p className="text-[10px] text-gray-400 text-center mt-4 pt-4 border-t">Thank you for choosing PocketBite 💖<br />Till No: 6668495 • pocketbite.co.ke</p>
      </div>
    </div>
  );
}
