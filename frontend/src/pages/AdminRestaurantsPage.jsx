import { useState } from "react";
import Navbar from "../components/Navbar.jsx";
import { useApp } from "../store/AppContext.jsx";

const ADMIN_TABS = [
  { path: "/admin/dashboard", label: "📊 Dashboard" },
  { path: "/admin/restaurants", label: "🏪 Restaurants" },
  { path: "/admin/bookings", label: "📅 Bookings" },
  { path: "/admin/payments", label: "💳 Payments" },
  { path: "/admin/reviews", label: "⭐ Reviews" },
  { path: "/admin/users", label: "👥 Users" },
  { path: "/admin/reports", label: "📈 Reports" },
];

export default function AdminRestaurantsPage() {
  const { rests, setRests, notify, REST_IMGS, FOOD_IMGS } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);

  const handleDelete = (id) => {
    if (confirm("Remove this restaurant permanently?")) {
      setRests(rests.filter((r) => r.id !== id));
      notify("Restaurant removed 🗑️");
    }
  };

  const handleAddSpot = (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const n = fd.get("n");
    const cat = fd.get("cat");
    const cui = fd.get("cui");
    const em = n.toLowerCase().replace(/[^a-z]/g, "") + "@pocketbite.co.ke";

    const newRest = {
      id: "r" + Date.now(),
      n,
      em,
      cat,
      cui,
      loc: "Nairobi, Kenya",
      desc: `Welcome to ${n}! A new and exciting dining experience awaits. ✨`,
      img: REST_IMGS[Math.floor(Math.random() * REST_IMGS.length)],
      bmin: 500,
      bmax: 2000,
      lk: 0,
      rt: 4.5,
      rv: [],
      menu: [
        { id: `f-${Date.now()}`, n: "Signature Dish", p: 850, d: "Chef's special", img: FOOD_IMGS[0], cat: "Main", pop: true }
      ],
      ben: ["WiFi 📶"],
      oh: "08:00 AM",
      ch: "10:00 PM",
      ph: "+254 700 000 000",
      off: [],
      tags: ["New"], // This tag triggers the "Fresh Arrivals" section on the Diner home page
    };

    setRests([...rests, newRest]);
    setShowAddModal(false);
    notify(`${n} added successfully! ✅`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-purple-50/30">
      <Navbar tabs={ADMIN_TABS} title="Admin" role="Admin" />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h2 className="text-2xl font-black">🏪 Manage Restaurants ({rests.length})</h2>
          <button onClick={() => setShowAddModal(true)} className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-bold shadow-md hover:bg-emerald-700 transition-all">
            + Add New Spot
          </button>
        </div>

        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left px-4 py-3 text-xs font-black text-gray-500 uppercase">Restaurant</th>
                  <th className="text-left px-4 py-3 text-xs font-black text-gray-500 uppercase">Category</th>
                  <th className="text-left px-4 py-3 text-xs font-black text-gray-500 uppercase">Cuisine</th>
                  <th className="text-left px-4 py-3 text-xs font-black text-gray-500 uppercase">Tags</th>
                  <th className="text-left px-4 py-3 text-xs font-black text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rests.map((r) => (
                  <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img src={r.img} alt="" className="w-10 h-10 rounded-xl object-cover shadow-sm" />
                        <div>
                          <span className="font-bold text-sm text-gray-900 block">{r.n}</span>
                          <span className="text-[10px] text-gray-500">{r.em}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] px-2.5 py-1 rounded-full font-black uppercase tracking-wider ${
                        r.cat === "local" ? "bg-green-100 text-green-700" :
                        r.cat === "formal" ? "bg-purple-100 text-purple-700" : "bg-orange-100 text-orange-700"
                      }`}>
                        {r.cat}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-700">{r.cui}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 flex-wrap">
                        {r.tags?.map(t => (
                          <span key={t} className={`text-[9px] px-2 py-0.5 rounded-md font-bold uppercase ${t === "New" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"}`}>
                            {t}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => handleDelete(r.id)} className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-black uppercase hover:bg-red-100 transition-all">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* ADD SPOT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
          <div className="relative bg-white rounded-3xl w-full max-w-md p-6 overflow-y-auto max-h-[90vh]">
            <h3 className="font-black text-2xl mb-6 text-gray-900">Add New Spot 🏪</h3>
            <form onSubmit={handleAddSpot} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">Restaurant Name</label>
                <input name="n" required placeholder="e.g. Swahili Delights" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 font-bold text-gray-800" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">Category</label>
                  <select name="cat" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none font-bold text-gray-800">
                    <option value="local">Local</option>
                    <option value="formal">Formal</option>
                    <option value="highend">High-End</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">Cuisine</label>
                  <input name="cui" required placeholder="e.g. Kenyan" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none font-bold text-gray-800" />
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl mt-2">
                <p className="text-xs text-blue-800 font-bold">💡 Note:</p>
                <p className="text-[11px] text-blue-700 mt-1 leading-relaxed">
                  This restaurant will automatically be tagged as "New" and highlighted on the diner's homepage under "Fresh Arrivals".
                </p>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-4 border-2 border-gray-200 text-gray-600 rounded-xl font-black transition-colors hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-4 bg-emerald-600 text-white rounded-xl font-black shadow-lg shadow-emerald-200 hover:bg-emerald-700 hover:-translate-y-0.5 transition-all">
                  Add Spot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}