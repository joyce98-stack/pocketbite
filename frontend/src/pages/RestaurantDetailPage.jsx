import { useState, useMemo, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import TimeSlotSuggester from "../components/TimeSlotSuggester.jsx";
import WaitlistButton from "../components/WaitlistButton.jsx";
import ReviewSummary from "../components/ReviewSummary.jsx";
import SocialDining from "../components/SocialDining.jsx";
import { useApp } from "../store/AppContext.jsx";

const DINER_TABS = [
  { path: "/home", label: "Home" },
  { path: "/wishlist", label: "Wishlist" },
  { path: "/myBookings" },
];

export default function RestaurantDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, rests, cart, setCart, notify, toggleLike, toggleWish, trackActivity } = useApp();
  const [menuFilter, setMenuFilter] = useState("all");
  const startTimeRef = useRef(Date.now());

  const rest = rests.find((r) => r.id === id);

  useEffect(() => {
    if (!rest) return;
    startTimeRef.current = Date.now();
    trackActivity("viewed_restaurant", { restaurantId: rest.id, restaurantName: rest.n, cuisine: rest.cui, category: rest.cat });
    return () => {
      const dur = Math.round((Date.now() - startTimeRef.current) / 1000);
      trackActivity("left_restaurant", { restaurantId: rest.id, restaurantName: rest.n, durationSeconds: dur });
    };
  }, [rest?.id]);

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

  const isLiked = user.lk?.includes(rest.id);
  const isWished = user.wl?.includes(rest.id);

  const categories = useMemo(() => {
    const cats = [...new Set(rest.menu.map((m) => m.cat))];
    return ["all", ...cats];
  }, [rest.menu]);

  const filteredMenu = menuFilter === "all" ? rest.menu : rest.menu.filter((m) => m.cat === menuFilter);

  const liveOffers = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    return rest.off?.filter((o) => {
      if (!o.a) return false;
      if (o.vs && today < o.vs) return false;
      if (o.vu && today > o.vu) return false;
      return true;
    }) || [];
  }, [rest.off]);

  const similar = useMemo(() => {
    return rests.filter((r) => r.id !== rest.id && (r.cui === rest.cui || r.cat === rest.cat)).sort((a, b) => b.rt - a.rt).slice(0, 3);
  }, [rests, rest]);

  const addToCart = (item) => {
    setCart((c) => {
      const exists = c.find((x) => x.f.id === item.id);
      if (exists) return c.map((x) => (x.f.id === item.id ? { ...x, q: x.q + 1 } : x));
      return [...c, { f: item, q: 1 }];
    });
    notify(item.n + " added to cart");
    trackActivity("added_to_cart", { foodName: item.n, price: item.p, category: item.cat, restaurantId: rest.id, restaurantName: rest.n });
  };

  const goToSimilar = (r) => {
    trackActivity("clicked_similar_restaurant", { fromRestaurantId: rest.id, fromRestaurantName: rest.n, toRestaurantId: r.id, toRestaurantName: r.n });
    navigate("/restaurant/" + r.id);
  };

  const cartCount = cart.reduce((s, i) => s + i.q, 0);
  const cartTotal = cart.reduce((s, i) => s + i.f.p * i.q, 0);

  const badge = !rest.status || rest.status === "open"
    ? { text: "Open Now", color: "bg-green-100 text-green-700 border-green-200" }
    : rest.status === "busy"
    ? { text: "Busy", color: "bg-amber-100 text-amber-700 border-amber-200" }
    : { text: "Closed", color: "bg-red-100 text-red-700 border-red-200" };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-amber-50/30">
      <Navbar tabs={DINER_TABS} title={user.nm} role="Diner" />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* Banner */}
        <div className="relative h-72 md:h-96 rounded-3xl overflow-hidden">
          <img src={rest.img} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <button onClick={() => navigate("/home")} className="absolute top-5 left-5 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg text-lg hover:bg-white">{"←"}</button>
          <div className="absolute top-5 right-5 flex gap-2">
            <button onClick={() => toggleWish(rest.id)} className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:bg-white">{isWished ? "💖" : "🤍"}</button>
            <button onClick={() => toggleLike(rest.id)} className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:bg-white">{isLiked ? "❤️" : "🤍"}</button>
            <span className={"px-3 py-1.5 rounded-full text-xs font-bold border " + badge.color}>{badge.text}</span>
          </div>
          <div className="absolute bottom-5 left-5 right-5">
            <h1 className="text-3xl md:text-4xl font-black text-white drop-shadow-lg">{rest.n}</h1>
            <div className="flex items-center gap-3 mt-2 text-white/90 text-sm">
              <span>{"⭐"} {rest.rt} ({rest.rv?.length || 0})</span>
              <span>{"•"}</span>
              <span>{"📍"} {rest.loc}</span>
              <span>{"•"}</span>
              <span>{"❤️"} {rest.lk}</span>
            </div>
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex-1">
              <p className="text-gray-600 leading-relaxed">{rest.desc}</p>
              <div className="flex flex-wrap gap-3 mt-4">
                <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 px-3 py-2 rounded-xl">
                  <span className="text-lg">{"🕐"}</span>
                  <div><p className="text-xs font-bold text-blue-800">Hours</p><p className="text-sm font-black text-blue-900">{rest.oh} — {rest.ch}</p></div>
                </div>
                <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 px-3 py-2 rounded-xl">
                  <span className="text-lg">{"📞"}</span>
                  <div><p className="text-xs font-bold text-gray-600">Phone</p><p className="text-sm font-bold text-gray-900">{rest.ph}</p></div>
                </div>
                <div className={"flex items-center gap-2 px-3 py-2 rounded-xl border " + badge.color}>
                  <div><p className="text-xs font-bold">Status</p><p className="text-sm font-black">{badge.text}</p></div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-4">{rest.tags?.map((t) => <span key={t} className={"text-xs px-3 py-1.5 rounded-lg font-bold border " + (t === "New" ? "bg-green-50 border-green-200 text-green-700" : "bg-emerald-50 border-emerald-100 text-emerald-700")}>{t}</span>)}</div>
              <div className="flex flex-wrap gap-2 mt-3">{rest.ben?.map((b) => <span key={b} className="text-xs px-3 py-1.5 bg-gray-50 rounded-lg text-gray-600 border border-gray-100">{b}</span>)}</div>
            </div>
            <div className="flex flex-col items-end gap-3">
              <div className="px-4 py-3 bg-amber-50 rounded-xl border border-amber-200 text-center">
                <p className="text-xs text-amber-600 font-bold">Budget / Diner</p>
                <p className="text-lg font-black text-amber-800">KES {rest.bmin} – {rest.bmax}</p>
              </div>
              <span className={"text-xs px-3 py-1 rounded-full font-black uppercase " + (rest.cat === "local" ? "bg-green-100 text-green-700" : rest.cat === "formal" ? "bg-purple-100 text-purple-700" : "bg-amber-100 text-amber-800")}>{rest.cat}</span>
            </div>
          </div>
        </div>

        {/* Waitlist */}
        <WaitlistButton restaurant={rest} />

        {/* Closed Notice */}
        {rest.status === "closed" ? (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3">
            <span className="text-3xl">{"🔴"}</span>
            <div><p className="font-black text-red-800">Currently Closed</p><p className="text-sm text-red-700">Browse menu but bookings are unavailable.</p></div>
          </div>
        ) : null}

        {/* Live Offers */}
        {liveOffers.length > 0 ? (
          <div className="bg-gradient-to-r from-pink-500 to-orange-500 rounded-3xl p-5 text-white shadow-lg">
            <h3 className="font-black text-lg mb-3">{"🎉"} Active Offers</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {liveOffers.map((o) => (
                <div key={o.id} className="bg-white/20 backdrop-blur rounded-xl p-3">
                  <div className="flex justify-between items-start"><div><p className="font-bold">{o.t}</p><p className="text-sm text-white/80">{o.d}</p></div><span className="text-xs bg-white/30 px-2 py-1 rounded-full font-bold">{o.disc}% OFF</span></div>
                  <p className="text-xs text-white/70 mt-2">Valid until: {o.vu}</p>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* Group Booking Button — Links to Standalone Page */}
        <button onClick={() => { trackActivity("clicked_group_booking", { restaurantId: rest.id, restaurantName: rest.n }); navigate("/group-booking/" + rest.id); }} className="w-full py-3.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-black text-sm hover:opacity-90 transition-all shadow-lg">
          {"👥"} Book a Group / Event Slot
        </button>

        {/* Menu */}
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-4">
            <div><h3 className="font-black text-xl">{"🍽️"} Menu</h3><p className="text-sm text-gray-500">{rest.menu.length} items</p></div>
          </div>
          <div className="flex gap-2 mb-5 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <button key={cat} onClick={() => { setMenuFilter(cat); trackActivity("filtered_menu", { category: cat, restaurantName: rest.n }); }}
                className={"px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all " + (menuFilter === cat ? "bg-emerald-600 text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200")}>{cat === "all" ? "All" : cat}</button>
            ))}
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMenu.map((item) => (
              <div key={item.id} className="group bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg transition-all">
                <div className="relative h-36 overflow-hidden">
                  <img src={item.img} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  {item.pop ? <span className="absolute top-2 left-2 px-2 py-0.5 bg-orange-500 text-white text-[10px] font-black rounded-full">{"🔥"} POPULAR</span> : null}
                  <span className="absolute top-2 right-2 px-2 py-0.5 bg-white/95 text-[10px] font-bold rounded-full">{item.cat}</span>
                </div>
                <div className="p-3">
                  <h4 className="font-bold text-sm text-gray-900">{item.n}</h4>
                  <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{item.d}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-black text-emerald-700">KES {item.p}</span>
                    <button onClick={() => addToCart(item)} disabled={rest.status === "closed"}
                      className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed">Add +</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Review Summary */}
        {rest.rv?.length >= 3 ? <ReviewSummary reviews={rest.rv} /> : null}

        {/* Reviews */}
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6">
          <h3 className="font-black text-xl mb-4">{"⭐"} Reviews ({rest.rv?.length || 0})</h3>
          {rest.rv?.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No reviews yet</p>
          ) : (
            <div className="space-y-4">
              {rest.rv?.map((rv, i) => (
                <div key={i} className="py-3 border-b border-gray-100 last:border-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold text-xs">{rv.dn.charAt(0).toUpperCase()}</div>
                      <div><span className="font-bold text-sm">{rv.dn}</span>{rv.v ? <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 text-[9px] font-black rounded-full">VERIFIED</span> : null}</div>
                    </div>
                    <div className="flex text-amber-400 text-xs">{[...Array(5)].map((_, k) => <span key={k} className={k < rv.r ? "" : "text-gray-200"}>{"★"}</span>)}</div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2 italic">{rv.c}</p>
                  <p className="text-[10px] text-gray-400 mt-1">{new Date(rv.dt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })} at {new Date(rv.dt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Social Dining */}
        <SocialDining restaurant={rest} />

        {/* Similar */}
        {similar.length > 0 ? (
          <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-3xl shadow-lg border border-purple-100 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-lg shadow-md">{"💜"}</div>
              <div><p className="text-xs font-bold text-purple-600 uppercase tracking-wider">SIMILAR VIBES</p><h3 className="font-black text-lg text-gray-900">You Might Also Like</h3></div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {similar.map((rx) => (
                <div key={rx.id} onClick={() => goToSimilar(rx)} className="cursor-pointer group bg-white rounded-2xl overflow-hidden border border-purple-100 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1">
                  <div className="relative h-24 overflow-hidden">
                    <img src={rx.img} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    {rx.status ? <span className={"absolute top-1 right-1 px-1.5 py-0.5 rounded-full text-[8px] font-bold " + (rx.status === "open" ? "bg-green-500 text-white" : rx.status === "busy" ? "bg-amber-500 text-white" : "bg-red-500 text-white")}>{rx.status}</span> : null}
                  </div>
                  <div className="p-2.5"><h4 className="font-bold text-xs truncate">{rx.n}</h4><p className="text-[10px] text-gray-500">{rx.cui}</p><p className="text-[10px] font-bold text-emerald-600">{"★"} {rx.rt} - KES {rx.bmin}+</p></div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div className="h-24" />
      </main>

      {/* Sticky Cart Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t shadow-2xl px-6 py-4 safe-bottom">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-bold uppercase">TOTAL IN CART</p>
            <p className="text-xl font-black">KES {cartTotal.toLocaleString()} <span className="text-sm text-gray-400 font-normal">({cartCount} items)</span></p>
          </div>
          <button onClick={() => { trackActivity("went_to_cart", { restaurantName: rest.n, cartTotal, cartCount }); navigate("/cart"); }}
            disabled={cart.length === 0}
            className="flex items-center gap-2 px-8 py-3.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg">
            {"📋"} VIEW CART
          </button>
        </div>
      </div>
    </div>
  );
}