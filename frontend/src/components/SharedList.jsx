import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../store/AppContext.jsx";

export default function SharedList() {
  const navigate = useNavigate();
  const { user, rests } = useApp();
  const [list] = useState(() =>
    JSON.parse(localStorage.getItem("pb_shared_lists") || "[]").filter((s) => s.userId === user?.id)
  );

  if (list.length === 0) return null;

  const restaurants = list
    .map((s) => {
      const r = rests.find((r) => r.id === s.restaurantId);
      return r ? { ...r, addedAt: s.addedAt } : null;
    })
    .filter(Boolean);

  if (restaurants.length === 0) return null;

  return (
    <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-3xl shadow-lg border border-pink-100 p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-white shadow">{"📋"}</div>
        <div>
          <p className="text-xs font-bold text-pink-600 uppercase tracking-wider">MY SHARED LIST</p>
          <h3 className="font-black text-lg text-gray-900">Saved for Later</h3>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {restaurants.slice(0, 4).map((r) => (
          <div key={r.id + r.addedAt} onClick={() => navigate("/restaurant/" + r.id)} className="cursor-pointer group bg-white rounded-2xl overflow-hidden border border-pink-100 shadow-sm hover:shadow-lg transition-all">
            <div className="relative h-20 overflow-hidden">
              <img src={r.img} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
            </div>
            <div className="p-2">
              <h4 className="font-bold text-xs truncate">{r.n}</h4>
              <p className="text-[10px] text-gray-500">{r.cui}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}