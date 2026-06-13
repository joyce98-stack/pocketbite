import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useApp } from "./AppContext.jsx";

const SocketContext = createContext({ socket: null, connected: false });
export const useSocket = () => useContext(SocketContext);

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

export function SocketProvider({ children }) {
  const { user, notify, setBks, myRest, setGroupBookings, addNotification, notifications, setNotifications } = useApp();
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!user) {
      if (socket) { socket.close(); setSocket(null); setConnected(false); }
      return;
    }

    const s = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    s.on("connect", () => {
      console.log("Socket connected:", s.id);
      setConnected(true);
      s.emit("join", { userId: user.id, role: user.role, restaurantId: myRest?.id });
    });

    s.on("disconnect", () => { console.log("Socket disconnected"); setConnected(false); });
    s.on("connect_error", (err) => { console.warn("Socket error:", err.message); setConnected(false); });

    // Payment success
    s.on("payment_success", (data) => {
      console.log("Payment success:", data);
      const code = data?.mpesaCode || data?.payment?.mpesaReceiptNumber || data?.booking?.mc || "";
      const checkoutId = data?.checkoutRequestId || null;
      const phone = data?.phone || null;

      setBks((prev) => {
        let matched = false;
        const updated = prev.map((b) => {
          if (b.st === "confirmed" && b.mc) return b;
          if (data?.bookingId && (b.id === data.bookingId || b._id === data.bookingId)) { matched = true; return { ...b, st: "confirmed", mc: code }; }
          if (checkoutId && b.mpesaCheckoutRequestId === checkoutId) { matched = true; return { ...b, st: "confirmed", mc: code }; }
          if (!matched && b.st === "pending_payment" && phone && (b.dp === String(phone) || b.dp === "0" + String(phone).slice(3) || "254" + b.dp.replace(/^0/, "") === String(phone))) { matched = true; return { ...b, st: "confirmed", mc: code }; }
          return b;
        });
        if (!matched) {
          const pi = updated.findIndex((b) => b.st === "pending_payment");
          if (pi !== -1) { updated[pi] = { ...updated[pi], st: "confirmed", mc: code }; matched = true; }
        }
        if (matched && code) notify("Payment confirmed! M-Pesa: " + code);
        return updated;
      });
    });

    // Payment failed
    s.on("payment_failed", (data) => {
      console.log("Payment failed:", data);
      const checkoutId = data?.checkoutRequestId || null;
      setBks((prev) => prev.map((b) => {
        if (b.st !== "pending_payment") return b;
        if (data?.bookingId && (b.id === data.bookingId)) return { ...b, st: "cancelled" };
        if (checkoutId && b.mpesaCheckoutRequestId === checkoutId) return { ...b, st: "cancelled" };
        return b;
      }));
      notify("Payment failed: " + (data?.reason || "Transaction cancelled"));
    });

    // New booking (restaurant/admin)
    s.on("new_booking", (booking) => {
      if (user.role === "restaurant") notify("New booking from " + (booking.dinerName || booking.dn));
      else if (user.role === "admin") notify("New booking: " + (booking.dinerName || booking.dn));
      setBks((prev) => {
        if (prev.find((b) => b.id === (booking._id || booking.id))) return prev;
        return [...prev, booking];
      });
    });

    // Booking cancelled
    s.on("booking_cancelled", (booking) => {
      notify("Booking cancelled by " + (booking.dinerName || booking.dn || "diner"));
      setBks((prev) => prev.map((b) => (b.id === (booking._id || booking.id)) ? { ...b, st: "cancelled" } : b));
    });

    // Group booking request (restaurant)
    s.on("group_booking_request", (data) => {
      if (user.role === "restaurant") {
        notify("New group booking request from " + data.dinerName + " for " + data.partySize + " guests!");
      }
    });

    // Group booking response (diner)
    s.on("group_booking_response", (data) => {
      if (user.role === "diner") {
        const approved = data.status === "approved";
        notify(approved ? "Your group booking was approved!" : "Your group booking was declined.");
      }
    });

    // Dining invite received
    s.on("dining_invite_received", (data) => {
      if (user.role === "diner") {
        notify(data.invitedBy + " invited you to dine at " + data.restaurantName + "!");
      }
    });

    // Diner checked in (restaurant)
    s.on("diner_checked_in", (data) => {
      if (user.role === "restaurant") {
        notify(data.dinerName + " has checked in!");
      }
    });

    // Booking adjusted (restaurant)
    s.on("booking_adjusted", (data) => {
      if (user.role === "restaurant") {
        notify(data.dinerName + " adjusted their booking to " + data.newDate + " at " + data.newTime);
      }
    });

    // New review
    s.on("new_review", () => {
      if (user.role === "restaurant") notify("New verified review received!");
    });

    // New offer
    s.on("new_offer_added", (data) => {
      if (user.role === "diner") notify("New deal from " + data.restaurantName + "!");
    });

    setSocket(s);
    return () => { s.close(); };
  }, [user?.id, myRest?.id]);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
}