import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";

const AppContext = createContext(null);
export const useApp = () => useContext(AppContext);

const FOOD_IMGS = [
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400",
  "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400",
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400",
  "https://images.unsplash.com/photo-1544025162-d76694265947?w=400",
  "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400",
];

const REST_IMGS = [
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800",
  "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800",
  "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800",
  "https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?w=800",
  "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800",
];

const INITIAL_RESTAURANTS = [
  {
    id: "r1", n: "Mama Oliech", em: "mamaoliech@pb.ke", cat: "local", cui: "Kenyan",
    loc: "Kilimani, Nairobi", desc: "Cozy spot for authentic ugali & nyama choma",
    img: REST_IMGS[0], bmin: 100, bmax: 1200, lk: 245, rt: 4.5,
    rv: [{ id: "rv0", dn: "Guest", r: 5, c: "Amazing food!", v: true, dt: "2026-01-15T12:00:00" }],
    tags: ["Local", "Family"], ben: ["WiFi 📶", "Car Park 🚗"],
    oh: "7:00 AM", ch: "10:00 PM", ph: "+254 700 000 000",
    off: [], status: "open", createdAt: new Date().toISOString(), closedDates: [],
    menu: [
      { id: "f1-1", n: "Ugali & Sukuma", p: 350, d: "Classic combo", img: FOOD_IMGS[0], cat: "Main", pop: true },
      { id: "f1-2", n: "Nyama Choma", p: 850, d: "Grilled meat", img: FOOD_IMGS[1], cat: "Main", pop: true },
      { id: "f1-3", n: "Pilau", p: 450, d: "Spiced rice", img: FOOD_IMGS[2], cat: "Main" },
      { id: "f1-4", n: "Chapati", p: 50, d: "Flatbread", img: FOOD_IMGS[3], cat: "Starter" },
      { id: "f1-5", n: "Mandazi", p: 100, d: "Sweet dough", img: FOOD_IMGS[4], cat: "Dessert", pop: true },
    ],
  },
  {
    id: "r2", n: "Talisman", em: "talisman@pb.ke", cat: "formal", cui: "International",
    loc: "Karen, Nairobi", desc: "Elegant dining in magical garden setting",
    img: REST_IMGS[1], bmin: 1500, bmax: 4500, lk: 312, rt: 4.8,
    rv: [{ id: "rv1", dn: "Foodie", r: 5, c: "Beautiful ambiance!", v: true, dt: "2026-01-20T18:00:00" }],
    tags: ["Date Night", "Premium"], ben: ["Garden 🌳", "Private Dining 🔒"],
    oh: "12:00 PM", ch: "11:00 PM", ph: "+254 700 000 001",
    off: [{ id: "o1", t: "Happy Hour", d: "20% off mains 3-6PM", disc: 20, vu: "2026-12-31", a: true }],
    status: "open", createdAt: new Date().toISOString(), closedDates: [],
    menu: [
      { id: "f2-1", n: "Caesar Salad", p: 950, d: "Fresh greens", img: FOOD_IMGS[0], cat: "Starter", pop: true },
      { id: "f2-2", n: "Grilled Salmon", p: 2200, d: "Atlantic salmon", img: FOOD_IMGS[1], cat: "Main", pop: true },
      { id: "f2-3", n: "Risotto", p: 1800, d: "Creamy arborio", img: FOOD_IMGS[2], cat: "Main" },
      { id: "f2-4", n: "Tiramisu", p: 800, d: "Italian dessert", img: FOOD_IMGS[3], cat: "Dessert" },
      { id: "f2-5", n: "Bruschetta", p: 650, d: "Toasted bread", img: FOOD_IMGS[4], cat: "Starter" },
    ],
  },
  {
    id: "r3", n: "The Monarch Room", em: "monarch@pb.ke", cat: "highend", cui: "Fine Dining",
    loc: "Westlands, Nairobi", desc: "Luxury fine dining with regal interiors",
    img: REST_IMGS[2], bmin: 4000, bmax: 12000, lk: 189, rt: 4.9,
    rv: [{ id: "rv2", dn: "VIP", r: 5, c: "World class!", v: true, dt: "2026-02-01T19:00:00" }],
    tags: ["Luxury", "Celebration"], ben: ["Valet 🚙", "Wine Cellar 🍷"],
    oh: "6:00 PM", ch: "12:00 AM", ph: "+254 700 000 002",
    off: [], status: "open", createdAt: new Date().toISOString(), closedDates: [],
    menu: [
      { id: "f3-1", n: "Wagyu Steak", p: 5500, d: "A5 grade", img: FOOD_IMGS[0], cat: "Main", pop: true },
      { id: "f3-2", n: "Lobster Thermidor", p: 4800, d: "Butter poached", img: FOOD_IMGS[1], cat: "Main", pop: true },
      { id: "f3-3", n: "Truffle Risotto", p: 3200, d: "Black truffle", img: FOOD_IMGS[2], cat: "Main" },
      { id: "f3-4", n: "Foie Gras", p: 2800, d: "Duck liver", img: FOOD_IMGS[3], cat: "Starter" },
      { id: "f3-5", n: "Chocolate Souffle", p: 1500, d: "Hot dessert", img: FOOD_IMGS[4], cat: "Dessert" },
    ],
  },
];

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState(() => JSON.parse(localStorage.getItem("pb_u") || "[]"));
  const [rests, setRests] = useState(() => {
    const s = localStorage.getItem("pb_r");
    return s ? JSON.parse(s) : INITIAL_RESTAURANTS;
  });
  const [bks, setBks] = useState(() => JSON.parse(localStorage.getItem("pb_bk") || "[]"));
  const [toast, setToast] = useState(null);
  const [cart, setCart] = useState([]);
  const [activeBk, setActiveBk] = useState(null);
  const [reminders, setReminders] = useState([]);
  const [dismissedReminders, setDismissedReminders] = useState(() => JSON.parse(localStorage.getItem("pb_dr") || "[]"));
  const [remindersEnabled, setRemindersEnabled] = useState(() => {
    const v = localStorage.getItem("pb_re");
    return v === null ? true : v === "true";
  });
  const [welcomeCard, setWelcomeCard] = useState(null);
  const [activeSessions, setActiveSessions] = useState(() => JSON.parse(localStorage.getItem("pb_as") || "{}"));
  const [activities, setActivities] = useState(() => JSON.parse(localStorage.getItem("pb_activities") || "[]"));
  const [groupBookings, setGroupBookings] = useState(() => JSON.parse(localStorage.getItem("pb_gb") || "[]"));
  const [notifications, setNotifications] = useState(() => JSON.parse(localStorage.getItem("pb_notifs") || "[]"));

  useEffect(() => { localStorage.setItem("pb_u", JSON.stringify(users)); }, [users]);
  useEffect(() => { localStorage.setItem("pb_r", JSON.stringify(rests)); }, [rests]);
  useEffect(() => { localStorage.setItem("pb_bk", JSON.stringify(bks)); }, [bks]);
  useEffect(() => { localStorage.setItem("pb_dr", JSON.stringify(dismissedReminders)); }, [dismissedReminders]);
  useEffect(() => { localStorage.setItem("pb_re", String(remindersEnabled)); }, [remindersEnabled]);
  useEffect(() => { localStorage.setItem("pb_as", JSON.stringify(activeSessions)); }, [activeSessions]);
  useEffect(() => { localStorage.setItem("pb_activities", JSON.stringify(activities)); }, [activities]);
  useEffect(() => { localStorage.setItem("pb_gb", JSON.stringify(groupBookings)); }, [groupBookings]);
  useEffect(() => { localStorage.setItem("pb_notifs", JSON.stringify(notifications)); }, [notifications]);

  const notify = useCallback((m) => { setToast(m); setTimeout(() => setToast(null), 4000); }, []);

  const myRest = useMemo(() => user?.role === "restaurant" ? rests.find((r) => r.em === user.em) : null, [user, rests]);

  useEffect(() => {
    if (!user) return;
    const ping = () => setActiveSessions((prev) => ({ ...prev, [user.id]: Date.now() }));
    ping();
    const interval = setInterval(ping, 5000);
    return () => clearInterval(interval);
  }, [user]);

  const isUserActive = useCallback((uid) => activeSessions[uid] && Date.now() - activeSessions[uid] < 30000, [activeSessions]);

  const trackActivity = useCallback((action, details = {}) => {
    if (!user) return;
    setActivities((prev) => {
      const updated = [...prev, {
        id: "act" + Date.now() + Math.random().toString(36).slice(2, 6),
        userId: user.id, userName: user.nm, userEmail: user.em, userRole: user.role,
        action, details, timestamp: new Date().toISOString(),
      }];
      return updated.length > 500 ? updated.slice(-500) : updated;
    });
  }, [user]);

  const getUserActivities = useCallback((userId) => activities.filter((a) => a.userId === userId), [activities]);

  const getUserActivitySummary = useCallback((userId) => {
    const userActs = activities.filter((a) => a.userId === userId);
    const userBookings = bks.filter((b) => b.did === userId);
    const ri = {};
    userActs.filter((a) => a.details?.restaurantName).forEach((a) => {
      const n = a.details.restaurantName;
      if (!ri[n]) ri[n] = { name: n, restaurantId: a.details.restaurantId, views: 0, totalSeconds: 0, lastVisit: a.timestamp, actions: [] };
      if (a.action === "viewed_restaurant") ri[n].views++;
      if (a.action === "left_restaurant" && a.details.durationSeconds) ri[n].totalSeconds += a.details.durationSeconds;
      if (a.timestamp > ri[n].lastVisit) ri[n].lastVisit = a.timestamp;
      ri[n].actions.push(a.action);
    });
    return {
      totalActivities: userActs.length, totalBookings: userBookings.length,
      confirmedBookings: userBookings.filter((b) => b.st === "confirmed").length,
      cancelledBookings: userBookings.filter((b) => b.st === "cancelled").length,
      totalSpent: userBookings.filter((b) => b.st === "confirmed").reduce((s, b) => s + b.dep, 0),
      restaurants: Object.values(ri).sort((a, b) => b.views - a.views),
      recentActivities: userActs.slice(-20).reverse(),
      searches: userActs.filter((a) => a.action === "searched").length,
      cartAdds: userActs.filter((a) => a.action === "added_to_cart").length,
      wishlistAdds: userActs.filter((a) => a.action === "added_to_wishlist").length,
      reviewsPosted: userActs.filter((a) => a.action === "posted_review").length,
      pageViews: userActs.filter((a) => a.action === "page_view").length,
    };
  }, [activities, bks]);

  const isNewRestaurant = useCallback((rest) => {
    if (!rest.createdAt) return rest.tags?.includes("New");
    return (new Date() - new Date(rest.createdAt)) / (1000 * 60 * 60 * 24) <= 7;
  }, []);

  const isClosedDate = useCallback((restId, dateStr) => {
    const rest = rests.find((r) => r.id === restId);
    return rest?.closedDates?.includes(dateStr) || false;
  }, [rests]);

  const addNotification = useCallback((targetUserId, notif) => {
    setNotifications((prev) => [...prev, {
      id: "n" + Date.now() + Math.random().toString(36).slice(2, 4),
      targetUserId, ...notif, read: false, createdAt: new Date().toISOString(),
    }]);
  }, []);

  // Reminders
  useEffect(() => {
    if (!user || !remindersEnabled) { setReminders([]); return; }
    const interval = setInterval(() => {
      const now = new Date();
      let upcoming = [];
      if (user.role === "diner") {
        upcoming = bks.filter((b) => b.did === user.id && b.st === "confirmed" && !dismissedReminders.includes(b.id))
          .filter((b) => new Date(b.dt + "T" + (b.tm || "00:00")).getTime() >= now.getTime() - 3600000)
          .sort((a, b) => new Date(a.dt + "T" + a.tm) - new Date(b.dt + "T" + b.tm)).slice(0, 3);
      } else if (user.role === "restaurant" && myRest) {
        upcoming = bks.filter((b) => b.rid === myRest.id && b.st === "confirmed" && !dismissedReminders.includes(b.id))
          .filter((b) => { const d = new Date(b.dt + "T" + (b.tm || "00:00")).getTime() - now.getTime(); return d <= 86400000 && d >= -3600000; })
          .sort((a, b) => new Date(a.dt + "T" + a.tm) - new Date(b.dt + "T" + b.tm)).slice(0, 3);
      }
      setReminders(upcoming);
    }, 3000);
    return () => clearInterval(interval);
  }, [user, bks, dismissedReminders, remindersEnabled, myRest]);

  // Group booking
  const submitGroupBooking = useCallback((data) => {
    const gb = {
      id: "gb" + Date.now(), ...data,
      dinerId: user.id, dinerName: user.nm, dinerEmail: user.em,
      status: "pending", declineReason: "", submittedAt: new Date().toISOString(), respondedAt: null,
    };
    setGroupBookings((prev) => [...prev, gb]);
    const restData = rests.find((r) => r.id === data.restaurantId);
    if (restData) {
      const restOwner = users.find((u) => u.role === "restaurant" && u.em === restData.em);
      if (restOwner) {
        addNotification(restOwner.id, {
          type: "group_booking_request", title: "New Group Booking Request",
          message: user.nm + " wants to book for " + data.partySize + " guests on " + data.preferredDate + " at " + data.preferredTime,
          data: gb,
        });
      }
    }
    notify("Group booking request submitted!");
    trackActivity("group_booking_submitted", { restaurantName: data.restaurantName, partySize: data.partySize });
    return gb;
  }, [user, rests, users, addNotification, notify, trackActivity]);

  const respondGroupBooking = useCallback((gbId, approved, reason) => {
    setGroupBookings((prev) => prev.map((gb) => {
      if (gb.id !== gbId) return gb;
      const updated = { ...gb, status: approved ? "approved" : "rejected", declineReason: reason || "", respondedAt: new Date().toISOString() };
      addNotification(gb.dinerId, {
        type: approved ? "group_booking_approved" : "group_booking_rejected",
        title: approved ? "Group Booking Approved!" : "Group Booking Declined",
        message: approved
          ? "Your group booking at " + gb.restaurantName + " for " + gb.partySize + " guests on " + gb.preferredDate + " has been approved! Welcome!"
          : "Your group booking at " + gb.restaurantName + " was declined." + (reason ? " Reason: " + reason : ""),
        data: updated,
      });
      return updated;
    }));
    notify(approved ? "Approved! Diner notified." : "Declined. Diner notified.");
  }, [addNotification, notify]);

  const sendInvite = useCallback((targetEmail, restaurantId, restaurantName) => {
    const targetUser = users.find((u) => u.em === targetEmail && u.role === "diner");
    if (targetUser) {
      addNotification(targetUser.id, {
        type: "dining_invite", title: "Dining Invitation!",
        message: user.nm + " invited you to dine at " + restaurantName + "!",
        data: { restaurantId, restaurantName, invitedBy: user.nm, invitedByEmail: user.em },
      });
      notify("Invite sent to " + targetEmail + "!");
    } else {
      notify("Invite sent! They'll see it when they join.");
    }
    trackActivity("invited_friend", { restaurantName, invitedEmail: targetEmail });
  }, [user, users, addNotification, notify, trackActivity]);

  // Auth
  const signup = useCallback((email, password, name, role) => {
    if (users.find((u) => u.em === email && u.role === role)) { notify("Account exists!"); return null; }
    if (role === "restaurant") {
      const existing = rests.find((r) => r.n.toLowerCase() === name.toLowerCase());
      if (existing) { setRests((p) => p.map((r) => (r.id === existing.id ? { ...r, em: email } : r))); }
      else {
        setRests((p) => [...p, {
          id: "r" + Date.now(), n: name, em: email, cat: "local", cui: "Kenyan", loc: "Nairobi, Kenya",
          desc: "Welcome to " + name + "!", img: REST_IMGS[Math.floor(Math.random() * REST_IMGS.length)],
          bmin: 500, bmax: 2000, lk: 0, rt: 4.5, rv: [],
          menu: [
            { id: "f-" + Date.now() + "-1", n: "Signature Dish", p: 850, d: "Chef's special", img: FOOD_IMGS[0], cat: "Main", pop: true },
            { id: "f-" + Date.now() + "-2", n: "Daily Soup", p: 350, d: "Fresh soup", img: FOOD_IMGS[1], cat: "Starter" },
            { id: "f-" + Date.now() + "-3", n: "House Dessert", p: 450, d: "Sweet treat", img: FOOD_IMGS[2], cat: "Dessert" },
          ],
          ben: ["WiFi 📶", "Car Park 🚗"], oh: "10:00 AM", ch: "10:00 PM", ph: "+254 700 000 000",
          off: [], tags: ["New"], status: "open", createdAt: new Date().toISOString(), closedDates: [],
        }]);
      }
    }
    const nu = { id: "u" + Date.now(), em: email, pw: password, role, nm: name, wl: [], lk: [], joinedAt: new Date().toISOString(), loginHistory: [{ in: new Date().toISOString(), out: null }] };
    setUsers((p) => [...p, nu]); setUser(nu);
    setActiveSessions((prev) => ({ ...prev, [nu.id]: Date.now() }));
    notify("Welcome " + name + "!"); return nu;
  }, [users, rests, notify]);

  const login = useCallback((email, password, role) => {
    const u = users.find((x) => x.em === email && x.pw === password && x.role === role);
    if (!u) { notify("Invalid credentials"); return null; }
    const updated = { ...u, loginHistory: [...(u.loginHistory || []), { in: new Date().toISOString(), out: null }] };
    setUser(updated); setUsers((p) => p.map((x) => (x.id === u.id ? updated : x)));
    setActiveSessions((prev) => ({ ...prev, [u.id]: Date.now() }));
    notify("Welcome back " + u.nm + "!"); return updated;
  }, [users, notify]);

  const logout = useCallback(() => {
    if (user) {
      trackActivity("logged_out", {});
      setUsers((p) => p.map((u) => {
        if (u.id !== user.id) return u;
        const h = [...(u.loginHistory || [])];
        if (h.length > 0 && !h[h.length - 1].out) h[h.length - 1] = { ...h[h.length - 1], out: new Date().toISOString() };
        return { ...u, loginHistory: h };
      }));
      setActiveSessions((prev) => { const n = { ...prev }; delete n[user.id]; return n; });
    }
    setUser(null); setCart([]);
  }, [user, trackActivity]);

  // Restaurant/Diner actions
  const toggleLike = useCallback((rid) => {
    if (!user) return;
    const has = user.lk.includes(rid);
    const nu = { ...user, lk: has ? user.lk.filter((i) => i !== rid) : [...user.lk, rid] };
    setUser(nu); setUsers((p) => p.map((u) => (u.id === nu.id ? nu : u)));
    setRests((p) => p.map((r) => (r.id === rid ? { ...r, lk: r.lk + (has ? -1 : 1) } : r)));
    trackActivity(has ? "unliked_restaurant" : "liked_restaurant", { restaurantId: rid, restaurantName: rests.find((r) => r.id === rid)?.n });
  }, [user, rests, trackActivity]);

  const toggleWish = useCallback((rid) => {
    if (!user) return;
    const has = user.wl.includes(rid);
    const nu = { ...user, wl: has ? user.wl.filter((i) => i !== rid) : [...user.wl, rid] };
    setUser(nu); setUsers((p) => p.map((u) => (u.id === nu.id ? nu : u)));
    notify(has ? "Removed" : "Added to wishlist");
    trackActivity(has ? "removed_from_wishlist" : "added_to_wishlist", { restaurantId: rid, restaurantName: rests.find((r) => r.id === rid)?.n });
  }, [user, rests, notify, trackActivity]);

  const addCart = useCallback((f, restName) => {
    setCart((c) => { const x = c.find((i) => i.f.id === f.id); return x ? c.map((i) => (i.f.id === f.id ? { ...i, q: i.q + 1 } : i)) : [...c, { f, q: 1 }]; });
    notify(f.n + " added to cart");
    trackActivity("added_to_cart", { foodName: f.n, price: f.p, restaurantName: restName || "Unknown" });
  }, [notify, trackActivity]);

  const cancelBk = useCallback((id) => {
    const bk = bks.find((b) => b.id === id);
    setBks((p) => p.map((b) => (b.id === id ? { ...b, st: "cancelled" } : b)));
    notify("Cancelled. Deposit non-refundable.");
    trackActivity("cancelled_booking", { bookingId: id, restaurantName: bk?.rn });
  }, [bks, notify, trackActivity]);

  const adjustBooking = useCallback((bookingId, newDate, newTime) => {
    const booking = bks.find((b) => b.id === bookingId);
    if (!booking) return;
    setBks((prev) => prev.map((b) => b.id === bookingId ? { ...b, dt: newDate, tm: newTime, adjusted: true } : b));

    // Notify restaurant
    const restData = rests.find((r) => r.id === booking.rid);
    const restOwner = users.find((u) => u.role === "restaurant" && u.em === restData?.em);
    if (restOwner) {
      addNotification(restOwner.id, {
        type: "booking_adjusted", title: "Booking Adjusted",
        message: (user?.nm || "A diner") + " changed their booking to " + newDate + " at " + newTime,
        data: { bookingId, dinerName: user?.nm, newDate, newTime, restaurantName: booking.rn },
      });
    }
    notify("Booking adjusted!");
    trackActivity("adjusted_booking", { bookingId, newDate, newTime, restaurantName: booking.rn });
  }, [bks, rests, users, user, addNotification, notify, trackActivity]);

  const confirmBookingManually = useCallback((id) => {
    const mc = "MAN" + Math.random().toString(36).substring(2, 10).toUpperCase();
    setBks((p) => p.map((b) => (b.id === id ? { ...b, st: "confirmed", mc, manuallyConfirmed: true } : b)));
    notify("Confirmed. M-Pesa: " + mc);
  }, [notify]);

  const addReview = useCallback((bk, rating, comment) => {
    const rv = { id: "rv" + Date.now(), dn: user.nm, r: rating, c: comment, v: true, dt: new Date().toISOString() };
    setRests((p) => p.map((x) => x.id === bk.rid ? { ...x, rv: [...x.rv, rv], rt: +((x.rt * x.rv.length + rating) / (x.rv.length + 1)).toFixed(1) } : x));
    setBks((p) => p.map((b) => (b.id === bk.id ? { ...b, st: "completed" } : b)));
    notify("Review posted!");
    trackActivity("posted_review", { restaurantId: bk.rid, restaurantName: bk.rn, rating });
  }, [user, notify, trackActivity]);

  const deleteReview = useCallback((restId, revId) => {
    setRests((p) => p.map((x) => {
      if (x.id !== restId) return x;
      const nrv = x.rv.filter((rv) => rv.id !== revId);
      return { ...x, rv: nrv, rt: nrv.length ? +(nrv.reduce((s, rv) => s + rv.r, 0) / nrv.length).toFixed(1) : 0 };
    }));
    notify("Review deleted");
  }, [notify]);

  const value = {
    user, setUser, users, setUsers, rests, setRests, bks, setBks,
    toast, setToast, notify, cart, setCart, activeBk, setActiveBk,
    reminders, setReminders, dismissedReminders, setDismissedReminders,
    remindersEnabled, setRemindersEnabled, welcomeCard, setWelcomeCard,
    myRest, FOOD_IMGS, REST_IMGS, activeSessions, isUserActive,
    activities, setActivities, trackActivity, getUserActivities, getUserActivitySummary,
    isNewRestaurant, isClosedDate,
    groupBookings, setGroupBookings, notifications, setNotifications, addNotification,
    submitGroupBooking, respondGroupBooking, sendInvite,
    signup, login, logout,
    toggleLike, toggleWish, addCart, cancelBk, adjustBooking, confirmBookingManually,
    addReview, deleteReview,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}