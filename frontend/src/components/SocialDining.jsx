import { useState, useMemo } from "react";
import { useApp } from "../store/AppContext.jsx";

export default function SocialDining({ restaurant }) {
  const { user, users, bks, notify, trackActivity } = useApp();
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [sharedList, setSharedList] = useState(() =>
    JSON.parse(localStorage.getItem("pb_shared_lists") || "[]")
  );

  const friendsWhoDined = useMemo(() => {
    const dinerIds = bks.filter((b) => b.rid === restaurant.id && b.st === "confirmed" && b.did !== user.id).map((b) => b.did);
    const uniqueIds = [...new Set(dinerIds)];
    return uniqueIds.map((id) => {
      const u = users.find((u) => u.id === id);
      const bookingCount = bks.filter((b) => b.rid === restaurant.id && b.did === id && b.st === "confirmed").length;
      return u ? { ...u, bookingCount } : null;
    }).filter(Boolean).slice(0, 6);
  }, [bks, restaurant.id, users, user.id]);

  const popularAmongFriends = useMemo(() => {
    const likedRestIds = users.filter((u) => u.id !== user.id && u.role === "diner").flatMap((u) => u.lk || []);
    const counts = {};
    likedRestIds.forEach((id) => { counts[id] = (counts[id] || 0) + 1; });
    return counts[restaurant.id] || 0;
  }, [users, restaurant.id, user.id]);

  const shareRestaurant = () => {
    const shareText = "Check out " + restaurant.n + " on PocketBite!\n" + restaurant.desc + "\nRating: " + restaurant.rt + "\nBudget: KES " + restaurant.bmin + "-" + restaurant.bmax;
    navigator.clipboard.writeText(shareText);
    notify("Copied! Share with friends.");
    trackActivity("shared_restaurant", { restaurantId: restaurant.id, restaurantName: restaurant.n });
  };

  const addToSharedList = () => {
    const entry = { id: "sl" + Date.now(), userId: user.id, userName: user.nm, restaurantId: restaurant.id, restaurantName: restaurant.n, addedAt: new Date().toISOString() };
    const updated = [...sharedList, entry];
    setSharedList(updated);
    localStorage.setItem("pb_shared_lists", JSON.stringify(updated));
    notify("Added to shared list!");
    trackActivity("added_to_shared_list", { restaurantId: restaurant.id, restaurantName: restaurant.n });
  };

  const inviteFriend = () => {
    if (!inviteEmail) return;
    notify("Invite sent to " + inviteEmail);
    trackActivity("invited_friend", { restaurantId: restaurant.id, restaurantName: restaurant.n, invitedEmail: inviteEmail });
    setInviteEmail("");
    setShowInvite(false);
  };

  return (
    <div className="bg-gradient-to-br from-pink-50 via-rose-50 to-red-50 rounded-3xl shadow-lg border border-pink-100 p-5 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-white text-lg shadow-md">{"💕"}</div>
        <div>
          <p className="text-xs font-bold text-pink-600 uppercase tracking-wider">SOCIAL DINING</p>
          <h3 className="font-black text-lg text-gray-900">Dine Together</h3>
        </div>
        <span className="ml-auto text-xs bg-pink-100 text-pink-600 px-2 py-0.5 rounded-full font-bold">Core</span>
      </div>

      {friendsWhoDined.length > 0 ? (
        <div>
          <p className="text-xs font-bold text-pink-700 mb-2">Others who dined here</p>
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {friendsWhoDined.map((friend) => (
                <div key={friend.id} className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-400 to-purple-400 flex items-center justify-center text-white font-black text-xs border-2 border-white shadow-sm" title={friend.nm + " (" + friend.bookingCount + " visits)"}>
                  {friend.nm?.charAt(0).toUpperCase()}
                </div>
              ))}
            </div>
            <p className="text-xs text-pink-700 font-medium">{friendsWhoDined.length} {"diner" + (friendsWhoDined.length > 1 ? "s" : "")} visited</p>
          </div>
        </div>
      ) : null}

      {popularAmongFriends > 0 ? (
        <div className="bg-white rounded-xl p-3 flex items-center gap-3 border border-pink-100">
          <span className="text-2xl">{"🔥"}</span>
          <div>
            <p className="font-bold text-sm text-pink-800">Popular among PocketBite diners!</p>
            <p className="text-xs text-pink-600">{popularAmongFriends} {"other diner" + (popularAmongFriends > 1 ? "s" : "")} liked this spot</p>
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-3 gap-2">
        <button onClick={shareRestaurant} className="py-3 bg-white rounded-xl border border-pink-200 text-center hover:bg-pink-50 transition-all">
          <span className="text-lg block mb-0.5">{"📤"}</span>
          <span className="text-[10px] font-bold text-pink-700">Share</span>
        </button>
        <button onClick={addToSharedList} className="py-3 bg-white rounded-xl border border-pink-200 text-center hover:bg-pink-50 transition-all">
          <span className="text-lg block mb-0.5">{"📋"}</span>
          <span className="text-[10px] font-bold text-pink-700">Save</span>
        </button>
        <button onClick={() => setShowInvite(!showInvite)} className="py-3 bg-white rounded-xl border border-pink-200 text-center hover:bg-pink-50 transition-all">
          <span className="text-lg block mb-0.5">{"👥"}</span>
          <span className="text-[10px] font-bold text-pink-700">Invite</span>
        </button>
      </div>

      {showInvite ? (
        <div className="bg-white rounded-xl p-3 border border-pink-200 space-y-2">
          <p className="text-xs font-bold text-pink-700">Invite a friend to dine here</p>
          <div className="flex gap-2">
            <input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="friend@email.com" className="flex-1 px-3 py-2 bg-gray-50 border border-pink-200 rounded-lg text-sm focus:outline-none focus:border-pink-500" />
            <button onClick={inviteFriend} disabled={!inviteEmail} className="px-4 py-2 bg-pink-500 text-white rounded-lg font-bold text-xs disabled:opacity-50 hover:bg-pink-600">Send</button>
          </div>
        </div>
      ) : null}

      <div className="bg-white/60 rounded-xl p-3 border border-pink-100">
        <p className="text-[11px] text-pink-600 font-medium">{"💡"} <strong>Tip:</strong> Planning a group outing? Use the Group Booking feature above!</p>
      </div>
    </div>
  );
}