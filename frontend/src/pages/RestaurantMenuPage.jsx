import { useState } from "react";
import Navbar from "../components/Navbar.jsx";
import { useApp } from "../store/AppContext.jsx";

const REST_TABS = [
  { path: "/restaurant/dashboard", label: "📊 Dashboard" },
  { path: "/restaurant/menu", label: "🍽️ Menu" },
  { path: "/restaurant/bookings", label: "📅 Bookings" },
  { path: "/restaurant/payments", label: "💳 Payments" },
  { path: "/restaurant/reviews", label: "⭐ Reviews" },
  { path: "/restaurant/reports", label: "📈 Reports" },
  { path: "/restaurant/offers", label: "🎉 Offers" },
];

export default function RestaurantMenuPage() {
  const { myRest, setRests, notify, FOOD_IMGS } = useApp();
  const [editing, setEditing] = useState(null);

  if (!myRest) return null;

  const saveItem = (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const it = {
      id: editing?.id || "f" + Date.now(),
      n: fd.get("n"),
      p: +fd.get("p"),
      d: fd.get("d"),
      img: fd.get("img") || FOOD_IMGS[0],
      cat: fd.get("cat"),
      pop: fd.get("pop") === "on",
    };
    setRests((p) =>
      p.map((x) =>
        x.id === myRest.id
          ? {
              ...x,
              menu: editing ? x.menu.map((m) => (m.id === editing.id ? it : m)) : [...x.menu, it],
            }
          : x
      )
    );
    setEditing(null);
    notify(editing ? "Item updated ✅" : "Item added ✅");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-purple-50/30">
      <Navbar tabs={REST_TABS} title={myRest.n} role="Restaurant" />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <div className="flex justify-between items-center flex-wrap gap-3">
          <div>
            <h2 className="text-2xl font-black">🍽️ {myRest.n} — Menu</h2>
            <p className="text-sm text-gray-500 mt-1">
              {myRest.menu.length} items • Add, edit, or remove your dishes
            </p>
          </div>
          <button
            onClick={() => setEditing({})}
            className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-bold shadow-md"
          >
            + Add New Item
          </button>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {myRest.menu.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl overflow-hidden border shadow-sm hover:shadow-lg transition-all"
            >
              <div className="relative h-36">
                <img src={item.img} className="w-full h-full object-cover" />
                {item.pop && (
                  <span className="absolute top-2 left-2 px-2 py-0.5 bg-orange-500 text-white text-[10px] font-black rounded-full">
                    🔥 POPULAR
                  </span>
                )}
                <span className="absolute top-2 right-2 px-2 py-0.5 bg-white/95 text-[10px] font-bold rounded-full">
                  {item.cat}
                </span>
              </div>
              <div className="p-4">
                <h4 className="font-bold">{item.n}</h4>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.d}</p>
                <div className="flex justify-between items-center mt-3 pt-3 border-t">
                  <span className="font-black text-emerald-700 text-lg">KES {item.p}</span>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => setEditing(item)}
                      className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-xs font-black"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Remove "${item.n}"?`)) {
                          setRests((p) =>
                            p.map((x) =>
                              x.id === myRest.id
                                ? { ...x, menu: x.menu.filter((m) => m.id !== item.id) }
                                : x
                            )
                          );
                          notify("Removed");
                        }
                      }}
                      className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs font-black"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {editing !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setEditing(null)} />
          <div className="relative bg-white rounded-3xl w-full max-w-md p-6">
            <h3 className="font-black text-2xl mb-6">{editing.id ? "Edit Item" : "Add Menu Item"}</h3>
            <form onSubmit={saveItem} className="space-y-3">
              <input
                name="n"
                required
                defaultValue={editing.n}
                placeholder="Dish Name"
                className="w-full px-4 py-3 bg-gray-50 border rounded-xl"
              />
              <textarea
                name="d"
                required
                defaultValue={editing.d}
                placeholder="Description"
                rows={2}
                className="w-full px-4 py-3 bg-gray-50 border rounded-xl"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  name="p"
                  type="number"
                  required
                  defaultValue={editing.p}
                  placeholder="Price KES"
                  className="w-full px-4 py-3 bg-gray-50 border rounded-xl"
                />
                <select
                  name="cat"
                  defaultValue={editing.cat || "Main"}
                  className="w-full px-4 py-3 bg-gray-50 border rounded-xl"
                >
                  <option>Starter</option>
                  <option>Main</option>
                  <option>Dessert</option>
                  <option>Drink</option>
                </select>
              </div>
              <input
                name="img"
                defaultValue={editing.img}
                placeholder="Image URL (optional)"
                className="w-full px-4 py-3 bg-gray-50 border rounded-xl"
              />
              <label className="flex items-center gap-2 text-sm font-bold">
                <input type="checkbox" name="pop" defaultChecked={editing.pop} /> Mark as Popular 🔥
              </label>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="flex-1 py-3 border rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-black"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}