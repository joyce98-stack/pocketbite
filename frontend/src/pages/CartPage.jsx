import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Receipt from "../components/Receipt.jsx";
import { useApp } from "../store/AppContext.jsx";
import { useSocket } from "../store/SocketContext.jsx";

const DINER_TABS = [
  { path: "/home", label: "Home" },
  { path: "/wishlist", label: "♡ Wishlist" },
  { path: "/my-bookings", label: "My Bookings" },
];

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const parseTime = (timeStr) => {
  if (!timeStr) return 0;
  const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) return 0;
  let hours = parseInt(match[1]);
  const mins = parseInt(match[2]);
  const period = match[3].toUpperCase();
  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;
  return hours * 60 + mins;
};

export default function CartPage() {
  const navigate = useNavigate();
  const { user, cart, setCart, setBks, bks, notify, rests, setWelcomeCard, trackActivity } = useApp();
  const { socket } = useSocket();
  const [step, setStep] = useState("cart");
  const [selectedRestId, setSelectedRestId] = useState(null);
  const [bkDate, setBkDate] = useState("");
  const [bkTime, setBkTime] = useState("19:00");
  const [phone, setPhone] = useState(user.phone || "");
  const [activeBk, setActiveBk] = useState(null);
  const [pendingBkId, setPendingBkId] = useState(null);
  const [failedReason, setFailedReason] = useState(null);
  const [showReminder, setShowReminder] = useState(true);

  useEffect(() => {
    trackActivity("page_view", { page: "cart", itemCount: cart.length });
  }, []);

  // Group cart items by restaurant
  const cartByRestaurant = useMemo(() => {
    const groups = {};
    cart.forEach((item) => {
      const parts = item.f.id.split("-");
      const restKey = parts[0].replace("f", "r");
      const rest = rests.find((r) => r.id === restKey);
      const restId = rest?.id || restKey;
      const restName = rest?.n || "Unknown Restaurant";
      if (!groups[restId]) {
        groups[restId] = { restId, restName, rest, items: [], total: 0 };
      }
      groups[restId].items.push(item);
      groups[restId].total += item.f.p * item.q;
    });
    return Object.values(groups);
  }, [cart, rests]);

  const hasMultipleRestaurants = cartByRestaurant.length > 1;

  const selectedGroup = useMemo(() => {
    if (!selectedRestId) return null;
    return cartByRestaurant.find((g) => g.restId === selectedRestId);
  }, [selectedRestId, cartByRestaurant]);

  useEffect(() => {
    if (cartByRestaurant.length === 1 && !selectedRestId) {
      setSelectedRestId(cartByRestaurant[0].restId);
    }
  }, [cartByRestaurant, selectedRestId]);

  const selectedRest = selectedGroup?.rest;
  const selectedItems = selectedGroup?.items || [];
  const cartTot = selectedGroup?.total || 0;
  const dep = Math.round(cartTot * 0.3);
  const balance = cartTot - dep;

  // Watch booking status — matches by ID, checkoutRequestId, or phone
  useEffect(() => {
    if (!pendingBkId) return;
    const updated = bks.find((b) => b.id === pendingBkId);
    if (!updated) return;

    if (updated.st === "confirmed" && updated.mc) {
      setActiveBk(updated);
      setStep("confirmed");
      if (selectedRestId) {
        setCart((prev) => {
          const restKey = selectedRestId.replace("r", "f");
          return prev.filter((item) => !item.f.id.startsWith(restKey));
        });
      }
      setPendingBkId(null);
      if (setWelcomeCard) setWelcomeCard(updated);
      trackActivity("booking_confirmed", {
        bookingId: updated.id,
        restaurantName: updated.rn,
        deposit: updated.dep,
        mpesaCode: updated.mc,
      });
    } else if (updated.st === "cancelled") {
      setStep("failed");
      setPendingBkId(null);
      trackActivity("payment_failed", { bookingId: updated.id, restaurantName: updated.rn });
    }
  }, [bks, pendingBkId, setCart, setWelcomeCard, selectedRestId]);

  // Poll backend every 3s as fallback
  useEffect(() => {
    if (!pendingBkId || step !== "stk-prompt") return;
    const poll = setInterval(async () => {
      try {
        const res = await fetch(`${API_URL}/api/bookings/${pendingBkId}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data?.status === "confirmed" && data.mpesaCode) {
          setBks((prev) =>
            prev.map((b) =>
              b.id === pendingBkId ? { ...b, st: "confirmed", mc: data.mpesaCode } : b
            )
          );
        } else if (data?.status === "cancelled") {
          setBks((prev) =>
            prev.map((b) => (b.id === pendingBkId ? { ...b, st: "cancelled" } : b))
          );
        }
      } catch (e) {
        /* silent */
      }
    }, 3000);
    const timeout = setTimeout(() => {
      const stillPending = bks.find((b) => b.id === pendingBkId);
      if (stillPending && stillPending.st === "pending_payment") {
        setFailedReason("Payment timeout — no response from M-Pesa.");
        setBks((prev) =>
          prev.map((b) => (b.id === pendingBkId ? { ...b, st: "cancelled" } : b))
        );
        trackActivity("payment_timeout", {
          bookingId: pendingBkId,
          restaurantName: selectedRest?.n,
        });
      }
    }, 90000);
    return () => {
      clearInterval(poll);
      clearTimeout(timeout);
    };
  }, [pendingBkId, step, bks, setBks]);

  const validateBookingTime = () => {
    if (!selectedRest) return true;
    const openMins = parseTime(selectedRest.oh);
    const closeMins = parseTime(selectedRest.ch);
    const [bkHours, bkMins] = bkTime.split(":").map(Number);
    const bookingMins = bkHours * 60 + bkMins;
    if (bookingMins < openMins) {
      notify(`❌ ${selectedRest.n} opens at ${selectedRest.oh}.`);
      return false;
    }
    if (bookingMins >= closeMins) {
      notify(`❌ ${selectedRest.n} closes at ${selectedRest.ch}.`);
      return false;
    }
    if (selectedRest.status === "closed") {
      notify(`❌ ${selectedRest.n} is currently closed.`);
      return false;
    }
    return true;
  };

  const sendStkPrompt = async () => {
    if (!bkDate || !phone || !selectedRestId) return;
    if (!validateBookingTime()) return;
    setFailedReason(null);

    const newBk = {
      id: "b" + Date.now(),
      did: user.id,
      dn: user.nm,
      dp: phone,
      rid: selectedRestId,
      rn: selectedRest?.n || "Restaurant",
      items: selectedItems.map((c) => ({ f: c.f, q: c.q })),
      tot: cartTot,
      dep,
      dt: bkDate,
      tm: bkTime,
      st: "pending_payment",
      mc: null,
      mpesaCheckoutRequestId: null,
      qr: `PB-${Date.now().toString(36).toUpperCase()}`,
      ca: new Date().toISOString(),
    };

    setBks((prev) => [...prev, newBk]);
    setActiveBk(newBk);
    setPendingBkId(newBk.id);
    setStep("stk-prompt");
    trackActivity("initiated_payment", {
      bookingId: newBk.id,
      restaurantName: selectedRest?.n,
      deposit: dep,
      phone,
      itemCount: selectedItems.length,
    });

    try {
      const res = await fetch(`${API_URL}/api/mpesa/stk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: newBk.id,
          phone,
          amount: dep,
          accountReference: `PB-${newBk.id.slice(-6)}`,
          transactionDesc: `Deposit for ${selectedRest?.n || "PocketBite booking"}`,
        }),
      });
      if (!res.ok) throw new Error(await res.text());

      const data = await res.json();

      // Save checkout request ID to the booking so socket can match it
      setBks((prev) =>
        prev.map((b) =>
          b.id === newBk.id
            ? { ...b, mpesaCheckoutRequestId: data.checkoutRequestId }
            : b
        )
      );

      notify(`📲 STK push sent to ${phone}. Enter PIN on your phone.`);
      trackActivity("stk_push_sent", {
        bookingId: newBk.id,
        phone,
        amount: dep,
        checkoutRequestId: data.checkoutRequestId,
      });
    } catch (err) {
      console.error("STK push error:", err);
      notify(`❌ STK push failed: ${err.message}`);
      setBks((prev) => prev.filter((b) => b.id !== newBk.id));
      setActiveBk(null);
      setPendingBkId(null);
      setStep("book");
      trackActivity("stk_push_failed", {
        error: err.message,
        restaurantName: selectedRest?.n,
      });
    }
  };

  const cancelPendingPayment = () => {
    if (pendingBkId) {
      setBks((prev) =>
        prev.map((b) => (b.id === pendingBkId ? { ...b, st: "cancelled" } : b))
      );
      trackActivity("cancelled_pending_payment", {
        bookingId: pendingBkId,
        restaurantName: selectedRest?.n,
      });
    }
    setPendingBkId(null);
    setActiveBk(null);
    setStep("book");
    notify("Payment cancelled.");
  };

  const tryAgain = () => {
    setFailedReason(null);
    setStep("book");
    setActiveBk(null);
    setPendingBkId(null);
    trackActivity("retry_payment", { restaurantName: selectedRest?.n });
  };

  const removeItem = (foodId) => {
    const item = cart.find((c) => c.f.id === foodId);
    if (item)
      trackActivity("removed_from_cart", { foodName: item.f.n, price: item.f.p });
    setCart((c) => c.filter((x) => x.f.id !== foodId));
  };

  const clearRestaurantItems = (restId) => {
    const restKey = restId.replace("r", "f");
    setCart((prev) => prev.filter((item) => !item.f.id.startsWith(restKey)));
    if (selectedRestId === restId) setSelectedRestId(null);
    notify("Items removed from cart");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-purple-50/30">
      <Navbar tabs={DINER_TABS} title={user.nm} role="Diner" />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-4">
        <h2 className="text-2xl font-black">🛒 Your Cart</h2>

        {/* STEP 1: CART */}
        {step === "cart" && (
          <>
            {cart.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center">
                <div className="text-5xl mb-4">🍽️</div>
                <p className="font-bold text-gray-500">Your cart is empty</p>
                <p className="text-sm text-gray-400 mt-1">
                  Browse restaurants and add items to get started!
                </p>
                <button
                  onClick={() => navigate("/home")}
                  className="mt-4 px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-bold"
                >
                  Browse Restaurants
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {hasMultipleRestaurants && (
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
                    <span className="text-2xl">⚠️</span>
                    <div>
                      <p className="font-bold text-amber-900">
                        Items from {cartByRestaurant.length} restaurants
                      </p>
                      <p className="text-xs text-amber-700 mt-1">
                        You can only book from{" "}
                        <strong>one restaurant at a time</strong>. Select which
                        restaurant to proceed with.
                      </p>
                    </div>
                  </div>
                )}

                {cartByRestaurant.map((group) => {
                  const isSelected = selectedRestId === group.restId;
                  const groupDep = Math.round(group.total * 0.3);
                  return (
                    <div
                      key={group.restId}
                      className={`bg-white rounded-3xl shadow-lg border-2 overflow-hidden transition-all ${
                        isSelected
                          ? "border-emerald-500 ring-2 ring-emerald-200"
                          : "border-gray-100"
                      }`}
                    >
                      <div
                        className={`p-4 flex items-center justify-between ${
                          isSelected ? "bg-emerald-50" : "bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {group.rest && (
                            <img
                              src={group.rest.img}
                              className="w-10 h-10 rounded-xl object-cover shadow"
                            />
                          )}
                          <div>
                            <p className="font-black text-gray-900">
                              {group.restName}
                            </p>
                            <p className="text-[11px] text-gray-500">
                              {group.items.length} item
                              {group.items.length > 1 ? "s" : ""} • KES{" "}
                              {group.total.toLocaleString()}
                              {group.rest &&
                                ` • ${group.rest.oh} – ${group.rest.ch}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {hasMultipleRestaurants && (
                            <button
                              onClick={() => setSelectedRestId(group.restId)}
                              className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                                isSelected
                                  ? "bg-emerald-600 text-white shadow-lg"
                                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                              }`}
                            >
                              {isSelected ? "✓ Selected" : "Select"}
                            </button>
                          )}
                          <button
                            onClick={() => clearRestaurantItems(group.restId)}
                            className="px-3 py-2 bg-red-50 text-red-500 rounded-xl text-xs font-bold hover:bg-red-100"
                          >
                            Clear
                          </button>
                        </div>
                      </div>
                      <div className="p-4 space-y-2">
                        {group.items.map((i) => (
                          <div
                            key={i.f.id}
                            className="flex items-center gap-3 bg-gray-50 rounded-xl p-3"
                          >
                            <img
                              src={i.f.img}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-sm truncate">
                                {i.f.n}
                              </p>
                              <p className="text-xs text-gray-500">
                                KES {i.f.p}
                              </p>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() =>
                                  setCart((c) =>
                                    c.map((x) =>
                                      x.f.id === i.f.id
                                        ? { ...x, q: Math.max(1, x.q - 1) }
                                        : x
                                    )
                                  )
                                }
                                className="w-7 h-7 bg-gray-200 rounded-lg font-bold text-sm"
                              >
                                -
                              </button>
                              <span className="font-bold w-5 text-center text-sm">
                                {i.q}
                              </span>
                              <button
                                onClick={() =>
                                  setCart((c) =>
                                    c.map((x) =>
                                      x.f.id === i.f.id
                                        ? { ...x, q: x.q + 1 }
                                        : x
                                    )
                                  )
                                }
                                className="w-7 h-7 bg-gray-200 rounded-lg font-bold text-sm"
                              >
                                +
                              </button>
                            </div>
                            <button
                              onClick={() => removeItem(i.f.id)}
                              className="text-red-400 hover:text-red-600 text-lg"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="px-4 pb-4">
                        <div className="border-t pt-3 space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Subtotal</span>
                            <span className="font-bold">
                              KES {group.total.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Deposit (30%)</span>
                            <span className="font-bold text-pink-600">
                              KES {groupDep.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between text-xs text-gray-400">
                            <span>Balance at restaurant</span>
                            <span>
                              KES {(group.total - groupDep).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                <button
                  onClick={() => {
                    if (!selectedRestId) {
                      notify("Please select a restaurant first ☝️");
                      return;
                    }
                    setStep("book");
                    trackActivity("proceeded_to_booking", {
                      restaurantName: selectedRest?.n,
                      total: cartTot,
                      items: selectedItems.length,
                    });
                  }}
                  disabled={!selectedRestId}
                  className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-lg disabled:opacity-40 disabled:cursor-not-allowed shadow-lg hover:bg-emerald-700 transition-all"
                >
                  {selectedRestId
                    ? `Continue Booking at ${selectedRest?.n} → KES ${dep}`
                    : "Select a restaurant to continue"}
                </button>
              </div>
            )}
          </>
        )}

        {/* STEP 2: BOOKING */}
        {step === "book" && selectedRest && (
          <div className="bg-white rounded-3xl p-6 shadow-lg border space-y-4">
            <h3 className="font-black text-lg">📅 Booking at {selectedRest.n}</h3>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center gap-3">
              <img
                src={selectedRest.img}
                className="w-12 h-12 rounded-xl object-cover shadow"
              />
              <div>
                <p className="font-bold text-blue-900">{selectedRest.n}</p>
                <p className="text-xs text-blue-700">
                  🕐 {selectedRest.oh} — {selectedRest.ch}
                </p>
                {selectedRest.status && (
                  <p
                    className={`text-xs font-bold mt-0.5 ${
                      selectedRest.status === "open"
                        ? "text-green-600"
                        : selectedRest.status === "busy"
                        ? "text-amber-600"
                        : "text-red-600"
                    }`}
                  >
                    {selectedRest.status === "open"
                      ? "🟢 Open"
                      : selectedRest.status === "busy"
                      ? "🟡 Busy"
                      : "🔴 Closed"}
                  </p>
                )}
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 space-y-1.5">
              <p className="text-xs font-bold text-gray-500 uppercase">
                Your Order
              </p>
              {selectedItems.map((i) => (
                <div key={i.f.id} className="flex justify-between text-sm">
                  <span>
                    {i.f.n} × {i.q}
                  </span>
                  <span className="font-bold">
                    KES {(i.f.p * i.q).toLocaleString()}
                  </span>
                </div>
              ))}
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between text-sm font-bold">
                  <span>Total</span>
                  <span>KES {cartTot.toLocaleString()}</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold block mb-1">Date</label>
                <input
                  type="date"
                  value={bkDate}
                  onChange={(e) => setBkDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full px-3 py-2.5 border rounded-xl"
                />
              </div>
              <div>
                <label className="text-xs font-bold block mb-1">Time</label>
                <input
                  type="time"
                  value={bkTime}
                  onChange={(e) => setBkTime(e.target.value)}
                  className="w-full px-3 py-2.5 border rounded-xl"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold block mb-1">
                M-Pesa Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="2547XXXXXXXX"
                className="w-full px-4 py-3 border-2 rounded-xl font-bold"
              />
              <p className="text-[11px] text-gray-500 mt-1">
                A real STK push will be sent to this number.
              </p>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="font-bold text-amber-900 text-sm">
                💡 30% Deposit Required: KES {dep.toLocaleString()}
              </p>
              <p className="text-xs text-amber-700 mt-1">
                Balance KES {balance.toLocaleString()} payable at{" "}
                {selectedRest.n}.
              </p>
            </div>
            <div className="flex items-center justify-between bg-sky-50 border border-sky-200 rounded-xl p-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">🔔</span>
                <div>
                  <p className="text-sm font-bold text-sky-800">
                    Booking Reminder
                  </p>
                  <p className="text-[11px] text-sky-600">
                    Get reminded before your visit
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowReminder(!showReminder)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  showReminder
                    ? "bg-sky-600 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                {showReminder ? "On" : "Off"}
              </button>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setStep("cart")}
                className="flex-1 py-3 border-2 border-gray-200 rounded-xl font-bold"
              >
                ← Back
              </button>
              <button
                onClick={sendStkPrompt}
                disabled={!bkDate || !phone}
                className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-black disabled:opacity-50"
              >
                📲 Pay KES {dep.toLocaleString()}
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: WAIT */}
        {step === "stk-prompt" && (
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 text-white text-center">
              <div className="w-16 h-16 bg-white rounded-2xl mx-auto mb-3 flex items-center justify-center text-3xl animate-pulse">
                📱
              </div>
              <h3 className="text-xl font-black">Check Your Phone!</h3>
              <p className="text-green-100 text-sm">M-Pesa prompt sent</p>
            </div>
            <div className="p-6 text-center space-y-4">
              <div className="w-20 h-20 mx-auto mb-2 relative">
                <div className="absolute inset-0 border-4 border-green-200 rounded-full" />
                <div className="absolute inset-0 border-4 border-green-600 rounded-full border-t-transparent animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center text-2xl">
                  📲
                </div>
              </div>
              <p className="font-bold text-green-700 text-lg">{phone}</p>
              <p className="text-sm text-gray-600">
                Enter your <strong>M-Pesa PIN</strong> to pay{" "}
                <strong>KES {dep.toLocaleString()}</strong> to{" "}
                <strong>{selectedRest?.n}</strong>.
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
                ⏳{" "}
                <strong>Waiting for Safaricom confirmation.</strong> Only
                when you enter the PIN and money is deducted will this booking be
                confirmed.
                {socket && !socket.connected && (
                  <p className="text-red-600 font-bold mt-1">
                    ⚠️ Socket disconnected — using polling fallback.
                  </p>
                )}
              </div>
              <p className="text-[11px] text-gray-400">
                Auto-cancels after 90 seconds if no payment.
              </p>
              <button
                onClick={cancelPendingPayment}
                className="text-xs font-bold text-gray-500 hover:text-red-500 underline"
              >
                Cancel and go back
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: CONFIRMED */}
        {step === "confirmed" && activeBk && (
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border-2 border-emerald-200">
            <div className="bg-gradient-to-r from-emerald-500 to-green-600 p-8 text-white text-center">
              <div className="w-20 h-20 bg-white rounded-full mx-auto mb-3 flex items-center justify-center text-4xl shadow-lg">
                ✅
              </div>
              <h3 className="text-2xl font-black">Payment Confirmed!</h3>
              <p className="text-emerald-100 text-sm mt-1">
                M-Pesa receipt received & verified.
              </p>
            </div>
            <div className="p-6 space-y-3 text-center">
              <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-4 border border-purple-200">
                <p className="text-2xl mb-2">🎉</p>
                <p className="font-black text-purple-800">
                  Thank You & Welcome!
                </p>
                <p className="text-sm text-purple-600">
                  We can't wait to see you at {activeBk.rn}!
                </p>
              </div>
              <div className="bg-gray-50 rounded-2xl p-4 text-left space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500 text-sm">Restaurant</span>
                  <span className="font-black">{activeBk.rn}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 text-sm">Visit Date</span>
                  <span className="font-bold">
                    {activeBk.dt} at {activeBk.tm}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 text-sm">M-Pesa Code</span>
                  <span className="font-mono font-bold text-emerald-700">
                    {activeBk.mc}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 text-sm">Deposit Paid</span>
                  <span className="font-black text-emerald-700">
                    KES {activeBk.dep}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-orange-700 text-sm font-bold">
                    Balance
                  </span>
                  <span className="font-black text-orange-700 text-lg">
                    KES {activeBk.tot - activeBk.dep}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-center gap-3 bg-sky-50 border border-sky-200 rounded-xl p-3">
                <span className="text-lg">🔔</span>
                <span className="text-sm font-bold text-sky-800">Reminder</span>
                <button
                  onClick={() => setShowReminder(!showReminder)}
                  className={`px-4 py-1 rounded-full text-xs font-bold ${
                    showReminder
                      ? "bg-sky-600 text-white"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {showReminder ? "On" : "Off"}
                </button>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => {
                    navigate("/my-bookings");
                    trackActivity("went_to_bookings_after_payment", {
                      restaurantName: activeBk.rn,
                    });
                  }}
                  className="flex-1 py-3 border-2 border-gray-200 rounded-xl font-bold text-sm"
                >
                  My Bookings
                </button>
                <button
                  onClick={() => {
                    setStep("receipt");
                    trackActivity("viewed_receipt", {
                      restaurantName: activeBk.rn,
                      mpesaCode: activeBk.mc,
                    });
                  }}
                  className="flex-1 py-3 bg-purple-600 text-white rounded-xl font-black text-sm hover:bg-purple-700"
                >
                  🧾 Receipt
                </button>
              </div>
              {cart.length > 0 && (
                <button
                  onClick={() => {
                    setStep("cart");
                    setSelectedRestId(null);
                    setActiveBk(null);
                  }}
                  className="w-full py-2 text-emerald-600 font-bold text-sm underline"
                >
                  Continue shopping ({cart.length} items from other restaurants)
                </button>
              )}
            </div>
          </div>
        )}

        {/* STEP 4b: FAILED */}
        {step === "failed" && (
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border-2 border-red-200">
            <div className="bg-gradient-to-r from-red-500 to-rose-600 p-8 text-white text-center">
              <div className="w-20 h-20 bg-white rounded-full mx-auto mb-3 flex items-center justify-center text-4xl shadow-lg">
                ❌
              </div>
              <h3 className="text-2xl font-black">Payment Not Completed</h3>
              <p className="text-red-100 text-sm mt-1">
                {failedReason || "You cancelled or didn't enter your PIN."}
              </p>
            </div>
            <div className="p-6 space-y-3 text-center">
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-left text-sm">
                <p className="font-bold text-amber-900 mb-2">
                  ⚠️ Common reasons
                </p>
                <ul className="text-xs text-amber-800 space-y-1 list-disc list-inside">
                  <li>You declined or didn't enter your PIN</li>
                  <li>The STK push expired (~60 seconds)</li>
                  <li>Insufficient M-Pesa balance</li>
                  <li>Wrong PIN entered</li>
                </ul>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => navigate("/home")}
                  className="flex-1 py-3 border-2 rounded-xl font-bold text-sm"
                >
                  Back to Home
                </button>
                <button
                  onClick={tryAgain}
                  className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-black text-sm"
                >
                  🔄 Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: RECEIPT */}
        {step === "receipt" && activeBk && (
          <Receipt booking={activeBk} onClose={() => navigate("/my-bookings")} />
        )}
      </main>
    </div>
  );
}