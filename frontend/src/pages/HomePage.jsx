import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import SharedList from "../components/SharedList.jsx";
import { useApp } from "../store/AppContext.jsx";
import { useSocket } from "../store/SocketContext.jsx";

const DINER_TABS = [
  { path: "/home", label: "Home" },
  { path: "/wishlist", label: "Wishlist" },
  { path: "/my-bookings", label: "Bookings" },
];

export default function HomePage() {
  const navigate = useNavigate();
  const { user, rests, bks, notify, trackActivity, isNewRestaurant, groupBookings } = useApp();
  const { socket } = useSocket();

  const [search, setSearch] = useState("");
  const [catF, setCatF] = useState("all");
  const [cuisineF, setCuisineF] = useState("all");
  const [sortBy, setSortBy] = useState("popular");
  const [budgetMax, setBudgetMax] = useState(12000);
  const [showBF, setShowBF] = useState(false);
  const [newOfferAlert, setNewOfferAlert] = useState(null);

  useEffect(() => { trackActivity("page_view", { page: "home" }); }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on("new_offer_added", ({ restaurantName, offer }) => {
      notify("New deal from " + restaurantName + ": " + offer.t + " — " + offer.disc + "% OFF!");
      setNewOfferAlert({ restaurantName, offer });
      setTimeout(() => setNewOfferAlert(null), 8000);
    });
    return () => socket.off("new_offer_added");
  }, [socket, notify]);

  const handleSearch = (value) => { setSearch(value); if (value.length > 2) trackActivity("searched", { query: value }); };

  const cuisines = useMemo(() => [...new Set(rests.map((r) => r.cui))].sort(), [rests]);

  const hasActiveFilters = catF !== "all" || cuisineF !== "all" || sortBy !== "popular" || showBF || search;

  const clearAllFilters = () => {
    setCatF("all");
    setCuisineF("all");
    setSortBy("popular");
    setBudgetMax(12000);
    setShowBF(false);
    setSearch("");
    notify("All filters cleared");
  };

  const filtered = useMemo(() => {
    let list = [...rests];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((r) =>
        r.n.toLowerCase().includes(q) ||
        r.cui.toLowerCase().includes(q) ||
        r.loc.toLowerCase().includes(q) ||
        r.menu.some((m) => m.n.toLowerCase().includes(q))
      );
    }
    if (catF !== "all") list = list.filter((r) => r.cat === catF);
    if (cuisineF !== "all") list = list.filter((r) => r.cui === cuisineF);
    if (showBF) list = list.filter((r) => r.bmin <= budgetMax);
    if (sortBy === "low") list.sort((a, b) => a.bmin - b.bmin);
    else if (sortBy === "high") list.sort((a, b) => b.bmax - a.bmax);
    else if (sortBy === "rating") list.sort((a, b) => b.rt - a.rt);
    else list.sort((a, b) => b.lk - a.lk);
    return list;
  }, [rests, search, catF, cuisineF, budgetMax, showBF, sortBy]);

  const top5 = useMemo(() => [...rests].sort((a, b) => b.lk - a.lk).slice(0, 5), [rests]);
  const newRests = useMemo(() => rests.filter((r) => isNewRestaurant(r)), [rests, isNewRestaurant]);

  const recRests = useMemo(() => {
    if (!user) return [];
    const likedCuisines = rests.filter((r) => user.lk?.includes(r.id)).map((r) => r.cui);
    let recs = rests.filter((r) => !user.lk?.includes(r.id) && likedCuisines.includes(r.cui)).sort((a, b) => b.rt - a.rt);
    if (recs.length < 3) recs = [...recs, ...rests.filter((r) => !recs.find((x) => x.id === r.id)).sort((a, b) => b.rt - a.rt)];
    return recs.slice(0, 4);
  }, [rests, user, bks]);

  const recFoods = useMemo(() => {
    const allPop = [];
    rests.forEach((r) => r.menu.filter((m) => m.pop).forEach((m) => allPop.push({ food: m, rest: r })));
    return allPop.sort(() => Math.random() - 0.5).slice(0, 6);
  }, [rests]);

  const liveOffers = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    const offers = [];
    rests.forEach((r) => { r.off?.forEach((o) => { if (!o.a) return; if (o.vs && today < o.vs) return; if (o.vu && today > o.vu) return; offers.push({ ...o, restName: r.n, restId: r.id, restImg: r.img }); }); });
    return offers;
  }, [rests]);

  const myGroupUpdates = useMemo(() => {
    return groupBookings.filter((gb) => gb.dinerId === user?.id && gb.status !== "pending");
  }, [groupBookings, user]);

  const goToRestaurant = (r) => { trackActivity("clicked_restaurant", { restaurantId: r.id, restaurantName: r.n }); navigate("/restaurant/" + r.id); };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-amber-50/30">
      <Navbar tabs={DINER_TABS} title={user.nm} role="Diner" />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8">

        {/* Offer Alert */}
        {newOfferAlert ? (
          <div className="bg-gradient-to-r from-pink-500 to-orange-500 text-white rounded-2xl p-4 shadow-lg flex items-center justify-between animate-bounce" style={{ animationDuration: "2s" }}>
            <div className="flex items-center gap-3"><span className="text-3xl">{"🎉"}</span><div><p className="font-black">New Deal!</p><p className="text-sm text-white/90">{newOfferAlert.restaurantName}: {newOfferAlert.offer.t}</p></div></div>
            <button onClick={() => setNewOfferAlert(null)} className="text-white/70 hover:text-white text-xl">{"×"}</button>
          </div>
        ) : null}

        {/* Group Updates */}
        {myGroupUpdates.length > 0 ? (
          <div className="space-y-2">
            {myGroupUpdates.filter((gb) => !gb.seen).slice(0, 2).map((gb) => (
              <div key={gb.id} className={"rounded-2xl p-4 flex items-center justify-between " + (gb.status === "approved" ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200")}>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{gb.status === "approved" ? "✅" : "❌"}</span>
                  <div>
                    <p className="font-black text-sm">{gb.status === "approved" ? "Group Booking Approved!" : "Group Booking Declined"}</p>
                    <p className="text-xs text-gray-600">{gb.restaurantName} - {gb.partySize} guests on {gb.preferredDate}</p>
                    {gb.declineReason ? <p className="text-xs text-red-600 mt-0.5">Reason: {gb.declineReason}</p> : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {/* Hero */}
        <div className="relative bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 rounded-3xl p-8 md:p-12 text-white overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-900/20 rounded-full blur-3xl" />
          <p className="text-xs font-bold tracking-widest uppercase text-emerald-200 mb-2">HELLO HUNGRY FOODIE!</p>
          <h2 className="text-3xl md:text-4xl font-black mb-3">Discover Your Next Favourite Spot</h2>
          <p className="text-emerald-100 max-w-xl mb-6">Search by budget, category, cuisine, or dish. Book instantly with M-Pesa!</p>
          <input value={search} onChange={(e) => handleSearch(e.target.value)} placeholder="Search restaurants, cuisines, or dishes..." className="w-full max-w-xl pl-4 pr-4 py-3.5 bg-white rounded-xl text-gray-900 font-medium focus:outline-none shadow-lg" />
          <p className="text-amber-200 text-xs font-bold tracking-widest uppercase mt-4">YOUR POCKET, YOUR BITE</p>
        </div>

        {/* New Restaurants */}
        {newRests.length > 0 ? (
          <div className="bg-gradient-to-r from-green-100 via-emerald-50 to-teal-100 rounded-3xl p-5 shadow-lg border border-green-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-xl shadow text-white">{"✨"}</div>
              <div><p className="text-xs font-bold uppercase tracking-wider text-green-700">JUST ARRIVED</p><h3 className="font-black text-lg text-gray-900">New on PocketBite</h3></div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {newRests.slice(0, 4).map((r) => (
                <div key={r.id} onClick={() => goToRestaurant(r)} className="cursor-pointer group bg-white rounded-2xl overflow-hidden border border-green-200 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1">
                  <div className="relative h-24 overflow-hidden"><img src={r.img} className="w-full h-full object-cover group-hover:scale-105 transition-transform" /><span className="absolute top-2 left-2 px-2 py-0.5 bg-green-600 text-white text-[9px] font-black rounded-full animate-pulse shadow">NEW</span></div>
                  <div className="p-2.5"><h4 className="font-bold text-sm truncate">{r.n}</h4><p className="text-[10px] text-gray-500">{r.cui} - {r.cat}</p></div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <SharedList />

        {/* Recommended */}
        {recRests.length > 0 ? (
          <div className="bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 rounded-3xl shadow-lg border border-purple-100 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white text-lg shadow-md">{"💡"}</div>
              <div><p className="text-xs font-bold text-purple-600 uppercase tracking-wider">PICKED FOR YOU</p><h3 className="font-black text-lg text-gray-900">Recommended</h3></div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {recRests.map((r) => (
                <div key={r.id} onClick={() => goToRestaurant(r)} className="cursor-pointer group bg-white rounded-2xl overflow-hidden border border-purple-100 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1">
                  <div className="relative h-28 overflow-hidden"><img src={r.img} className="w-full h-full object-cover group-hover:scale-105 transition-transform" /><div className="absolute bottom-2 right-2 bg-white/90 px-2 py-0.5 rounded-lg text-xs font-bold flex items-center gap-0.5 shadow"><span className="text-amber-500">{"★"}</span> {r.rt}</div></div>
                  <div className="p-3"><h4 className="font-bold text-sm truncate">{r.n}</h4><p className="text-[11px] text-gray-500">{r.cui}</p><p className="text-[11px] font-bold text-emerald-600 mt-1">KES {r.bmin}-{r.bmax}</p></div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* Limited Deals */}
        <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 rounded-3xl shadow-lg border border-green-200 p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white text-lg shadow">{"🔥"}</div>
            <div><p className="text-xs font-bold text-green-700 uppercase tracking-wider">LIMITED TIME</p><h3 className="font-black text-lg text-gray-900">Trending Dishes</h3></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {recFoods.map((rf, idx) => (
              <div key={idx} onClick={() => goToRestaurant(rf.rest)} className="cursor-pointer group bg-white rounded-xl overflow-hidden border border-green-100 shadow-sm hover:shadow-md transition-all">
                <div className="relative h-20 overflow-hidden"><img src={rf.food.img} className="w-full h-full object-cover group-hover:scale-110 transition-transform" /><span className="absolute top-1 right-1 px-1.5 py-0.5 bg-green-600 text-white text-[9px] font-black rounded-full">LIMITED</span></div>
                <div className="p-2"><h4 className="font-bold text-xs truncate">{rf.food.n}</h4><p className="text-[10px] text-gray-400 truncate">{rf.rest.n}</p><p className="text-[11px] font-black text-emerald-600">KES {rf.food.p}</p></div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Offers */}
        {liveOffers.length > 0 ? (
          <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 rounded-3xl shadow-lg border border-amber-200 p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-600 to-orange-600 flex items-center justify-center text-white text-lg shadow">{"🎉"}</div>
              <div><p className="text-xs font-bold text-amber-700 uppercase tracking-wider">OFFERS</p><h3 className="font-black text-lg text-amber-900">Restaurant Deals</h3></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {liveOffers.map((o) => (
                <div key={o.id} onClick={() => { trackActivity("clicked_offer", { offerTitle: o.t, restaurantName: o.restName }); navigate("/restaurant/" + o.restId); }} className="cursor-pointer bg-white rounded-2xl overflow-hidden border border-amber-100 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1">
                  <div className="relative h-24 overflow-hidden"><img src={o.restImg} className="w-full h-full object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-amber-900/60 to-transparent" /><span className="absolute bottom-2 left-2 text-white font-bold text-sm drop-shadow">{o.restName}</span><span className="absolute top-2 right-2 bg-amber-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full">{o.disc}% OFF</span></div>
                  <div className="p-3"><h4 className="font-bold text-sm text-amber-900">{o.t}</h4><p className="text-xs text-amber-700 mt-0.5">{o.d}</p></div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* Top Ranked */}
        <div className="bg-gradient-to-br from-amber-50 via-white to-orange-50 rounded-3xl shadow-lg border border-amber-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-600 to-yellow-800 flex items-center justify-center text-white shadow">{"🏆"}</div>
            <div><p className="text-xs font-bold text-amber-700 uppercase tracking-wider">MOST POPULAR</p><h3 className="font-black text-lg">Top by Likes</h3></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {top5.map((r, i) => (
              <div key={r.id} onClick={() => goToRestaurant(r)} className="cursor-pointer group">
                <div className="relative h-32 rounded-2xl overflow-hidden"><img src={r.img} className="w-full h-full object-cover group-hover:scale-105 transition-transform" /><div className={"absolute top-2 left-2 w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-black shadow-lg " + (i === 0 ? "bg-amber-600" : i === 1 ? "bg-amber-500" : i === 2 ? "bg-amber-400" : "bg-gray-700")}>{i === 0 ? "👑" : "#" + (i + 1)}</div></div>
                <p className="font-bold text-sm mt-2 truncate">{r.n}</p>
                <div className="flex items-center justify-between text-xs"><span className="text-amber-700 font-bold">{"♥"} {r.lk}</span><span className="text-amber-500 font-bold">{"★"} {r.rt}</span></div>
              </div>
            ))}
          </div>
        </div>

        {/* Budget Filter */}
        <div className="bg-white rounded-3xl shadow-lg border border-amber-100 p-5 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3"><span className="text-2xl">{"⚙️"}</span><div><p className="font-bold text-amber-900">Budget Filter</p><p className="text-xs text-amber-600">Filter by budget</p></div></div>
          <div className="flex items-center gap-4">
            {showBF ? (
              <div className="flex items-center gap-2"><span className="text-xs font-bold text-gray-500">KES 50</span><input type="range" min="50" max="12000" step="50" value={budgetMax} onChange={(e) => setBudgetMax(+e.target.value)} className="w-64 md:w-96 accent-amber-600" /><span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded">KES {budgetMax}</span></div>
            ) : null}
            <button onClick={() => setShowBF(!showBF)} className={"w-12 h-6 rounded-full relative " + (showBF ? "bg-amber-500" : "bg-gray-300")}><div className={"w-5 h-5 rounded-full bg-white shadow absolute top-0.5 transition-all " + (showBF ? "left-6" : "left-0.5")} /></button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-3">
          {/* Category + Sort */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-gray-500 uppercase">Category:</span>
            {["all", "local", "formal", "highend"].map((cat) => (
              <button key={cat} onClick={() => setCatF(catF === cat && cat !== "all" ? "all" : cat)} className={"px-3 py-1.5 rounded-xl text-xs font-bold border transition-all " + (catF === cat ? (cat === "all" ? "bg-gray-200 text-gray-700 border-gray-200" : "bg-emerald-600 text-white border-emerald-600") : "border-gray-200 text-gray-600 hover:border-gray-300")}>
                {cat === "all" ? "All" : cat === "local" ? "Local" : cat === "formal" ? "Formal" : "High-End"}
              </button>
            ))}
            <span className="text-gray-300">|</span>
            <span className="text-xs font-bold text-gray-500 uppercase">Sort:</span>
            {[{ key: "popular", label: "Popular" }, { key: "rating", label: "Rating" }, { key: "low", label: "Low-High" }, { key: "high", label: "High-Low" }].map((s) => (
              <button key={s.key} onClick={() => setSortBy(sortBy === s.key && s.key !== "popular" ? "popular" : s.key)} className={"px-3 py-1.5 rounded-xl text-xs font-bold border transition-all " + (sortBy === s.key ? (s.key === "popular" ? "bg-gray-200 text-gray-700 border-gray-200" : "bg-amber-600 text-white border-amber-600") : "border-gray-200 text-gray-600 hover:border-gray-300")}>
                {s.label}
              </button>
            ))}
            <span className="ml-auto text-xs text-gray-400">{filtered.length} spots</span>
          </div>

          {/* Cuisine */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-gray-500 uppercase">Cuisine:</span>
            <button onClick={() => setCuisineF("all")} className={"px-3 py-1.5 rounded-xl text-xs font-bold border transition-all " + (cuisineF === "all" ? "bg-gray-200 text-gray-700 border-gray-200" : "border-gray-200 text-gray-600 hover:border-gray-300")}>All</button>
            {cuisines.map((cui) => (
              <button key={cui} onClick={() => setCuisineF(cuisineF === cui ? "all" : cui)} className={"px-3 py-1.5 rounded-xl text-xs font-bold border transition-all " + (cuisineF === cui ? "bg-purple-600 text-white border-purple-600" : "border-gray-200 text-gray-600 hover:border-gray-300")}>{cui}</button>
            ))}
          </div>

          {/* Clear All */}
          {hasActiveFilters ? (
            <div className="flex justify-end">
              <button onClick={clearAllFilters} className="px-4 py-1.5 bg-red-50 text-red-600 rounded-xl text-xs font-bold border border-red-200 hover:bg-red-100 transition-all">{"✕"} Clear All Filters</button>
            </div>
          ) : null}
        </div>

        {/* Categories */}
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { t: "Local Gem", d: "Cozy everyday spots", c: "from-green-400 to-emerald-600", i: "🏡", cat: "local" },
            { t: "Formal", d: "Elegant dine-in", c: "from-purple-400 to-indigo-600", i: "✨", cat: "formal" },
            { t: "High-End", d: "Luxury fine dining", c: "from-amber-700 to-yellow-900", i: "👑", cat: "highend" },
          ].map((c) => (
            <div key={c.t} onClick={() => setCatF(catF === c.cat ? "all" : c.cat)} className={"group relative rounded-2xl p-4 text-white bg-gradient-to-br shadow-lg transition-all hover:-translate-y-1 cursor-pointer " + c.c + (catF === c.cat ? " ring-4 ring-white/50 scale-[1.02]" : "")}>
              <div className="absolute top-0 right-0 p-3 opacity-20 text-5xl">{c.i}</div>
              <div className="relative z-10">
                <span className="inline-block px-2.5 py-0.5 bg-white/20 rounded-full text-[9px] font-black uppercase mb-2 tracking-widest">{catF === c.cat ? "Active" : "Category"}</span>
                <h4 className="font-black text-xl mb-1">{c.i} {c.t}</h4>
                <p className="text-xs text-white/90">{c.d}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Restaurant Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((r) => (
            <div key={r.id} className="bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-xl border border-gray-100 group cursor-pointer transition-all hover:-translate-y-1" onClick={() => goToRestaurant(r)}>
              <div className="relative h-52 overflow-hidden">
                <img src={r.img} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                <span className={"absolute top-3 left-3 px-3 py-1 rounded-full text-[11px] font-black text-white " + (r.cat === "local" ? "bg-green-500" : r.cat === "formal" ? "bg-purple-500" : "bg-amber-800")}>{r.cat === "local" ? "Local" : r.cat === "formal" ? "Formal" : "High-End"}</span>
                {r.off?.filter((o) => o.a).length > 0 ? <span className="absolute top-3 left-20 px-2 py-1 rounded-full text-[10px] font-black bg-pink-500 text-white animate-pulse">OFFER</span> : null}
                {isNewRestaurant(r) ? <span className="absolute top-12 left-3 px-2.5 py-1 rounded-full text-[10px] font-black bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg animate-pulse">NEW</span> : null}
                {r.status ? <span className={"absolute top-3 right-3 px-2 py-1 rounded-full text-[10px] font-bold " + (r.status === "open" ? "bg-green-500 text-white" : r.status === "busy" ? "bg-amber-500 text-white" : "bg-red-500 text-white")}>{r.status === "open" ? "Open" : r.status === "busy" ? "Busy" : "Closed"}</span> : null}
                <div className="absolute bottom-3 right-3 bg-white/90 px-2.5 py-1 rounded-lg flex items-center gap-1 shadow"><span className="text-amber-500">{"★"}</span><span className="font-bold text-sm">{r.rt}</span><span className="text-xs text-gray-500">({r.rv?.length || 0})</span></div>
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2"><h3 className="font-black text-lg">{r.n}</h3>{isNewRestaurant(r) ? <span className="text-[9px] bg-green-500 text-white px-1.5 py-0.5 rounded-full font-black">NEW</span> : null}</div>
                  <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200 whitespace-nowrap">KES {r.bmin}-{r.bmax}</span>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2 mb-3">{r.desc}</p>
                <div className="flex gap-2 text-xs text-gray-500 mb-2"><span>{"📍"} {r.loc}</span><span>{"🕐"} {r.oh} - {r.ch}</span></div>
                <div className="flex gap-1.5">{r.tags?.map((t) => <span key={t} className={"text-[11px] px-2 py-0.5 rounded border font-medium " + (t === "New" ? "bg-green-50 border-green-200 text-green-700" : "bg-gray-50 border-gray-100 text-gray-600")}>{t}</span>)}</div>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed">
            <span className="text-5xl block mb-4">{"🔍"}</span>
            <p className="font-bold text-gray-500">No restaurants match your filters</p>
            <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filters</p>
            <button onClick={clearAllFilters} className="mt-4 px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-bold">Clear All Filters</button>
          </div>
        ) : null}

        {/* Footer */}
        <div className="text-center py-8 bg-gradient-to-r from-amber-50 to-orange-50 rounded-3xl border border-amber-100">
          <p className="text-lg font-black text-amber-800 tracking-widest uppercase">YOUR POCKET, YOUR BITE</p>
          <p className="text-xs text-amber-600 mt-1 font-medium">PocketBite 2026 - Authentic Dining</p>
          <div className="flex justify-center gap-4 mt-3">
            <span className="text-xs text-amber-500">30+ Spots</span>
            <span className="text-xs text-amber-500">Verified Reviews</span>
            <span className="text-xs text-amber-500">M-Pesa Ready</span>
          </div>
        </div>
      </main>
    </div>
  );
}