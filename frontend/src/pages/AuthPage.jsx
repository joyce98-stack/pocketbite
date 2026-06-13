import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useApp } from "../store/AppContext.jsx";

export default function AuthPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { signup, login, users, setUsers, notify } = useApp();
  const [mode, setMode] = useState(params.get("mode") === "signup" ? "signup" : "login");
  const [role, setRole] = useState("diner");
  const [showPw, setShowPw] = useState(false);

  // Forgot password states
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotRole, setForgotRole] = useState("diner");
  const [resetStep, setResetStep] = useState(1);
  const [newPw, setNewPw] = useState("");
  const [confirmNewPw, setConfirmNewPw] = useState("");
  const [foundUser, setFoundUser] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = fd.get("email");
    const password = fd.get("password");
    const name = fd.get("name") || email.split("@")[0];
    const cpw = fd.get("cpw");
    let user;
    if (mode === "signup") {
      if (password !== cpw) return alert("Passwords don't match");
      user = signup(email, password, name, role);
    } else {
      user = login(email, password, role);
    }
    if (user) {
      navigate(
        user.role === "diner"
          ? "/home"
          : user.role === "restaurant"
          ? "/restaurant/dashboard"
          : "/admin/dashboard"
      );
    }
  };

  const handleForgotPassword = () => {
    if (resetStep === 1) {
      if (!forgotEmail) {
        notify("Please enter your email ✉️");
        return;
      }
      const user = users.find((u) => u.em === forgotEmail && u.role === forgotRole);
      if (!user) {
        notify("No account found with this email and role ❌");
        return;
      }
      setFoundUser(user);
      setResetStep(2);
      notify("Account found! Create your new password 🔑");
    } else {
      if (!newPw || newPw.length < 4) {
        notify("Password must be at least 4 characters 🔐");
        return;
      }
      if (newPw !== confirmNewPw) {
        notify("Passwords don't match! 🔐");
        return;
      }
      setUsers((prev) =>
        prev.map((u) => (u.id === foundUser.id ? { ...u, pw: newPw } : u))
      );
      notify("Password reset successful! You can now login ✅");
      setMode("login");
      resetForgotState();
    }
  };

  const resetForgotState = () => {
    setResetStep(1);
    setFoundUser(null);
    setNewPw("");
    setConfirmNewPw("");
    setForgotEmail("");
    setForgotRole("diner");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 relative overflow-hidden">
      {/* Floating decorations */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-20 left-20 text-pink-200 opacity-30" style={{ fontSize: 80 }}>♡</div>
        <div className="absolute bottom-32 right-24 text-emerald-200 opacity-20" style={{ fontSize: 60 }}>☁</div>
      </div>

      <nav className="relative z-20 max-w-7xl mx-auto px-6 py-5">
        <div className="flex items-center gap-3 cursor-pointer w-fit" onClick={() => navigate("/")}>
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg text-xl">🍴</div>
          <span className="text-xl font-black text-gray-900">PocketBite</span>
        </div>
      </nav>

      <div className="relative z-10 max-w-lg mx-auto px-6 pt-4 pb-20">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">

          {/* ═══════ LOGIN / SIGNUP ═══════ */}
          {mode !== "forgot" ? (
            <>
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg text-3xl">🍴</div>
              </div>
              <h2 className="text-center font-black text-2xl text-gray-900 mb-1">
                {mode === "login" ? "WELCOME BACK! 🌸" : "JOIN THE FOODIES! 🌸"}
              </h2>
              <p className="text-center text-xs text-gray-400 font-bold tracking-widest uppercase mb-6">FOODIE ENTHUSIAST HUB</p>

              {/* Role Selector */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                {["diner", "restaurant", "admin"].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`py-4 rounded-2xl border-2 font-bold text-sm uppercase tracking-wider transition-all ${
                      role === r
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                        : "border-gray-200 text-gray-400 hover:border-gray-300"
                    }`}
                  >
                    <div className="text-2xl mb-1">{r === "diner" ? "🍽️" : r === "restaurant" ? "🍳" : "👑"}</div>
                    {r}
                  </button>
                ))}
              </div>

              {/* Auth Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === "signup" && (
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">👤</span>
                    <input name="name" required placeholder="Display Name 💖" className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-emerald-500 focus:bg-white focus:outline-none text-sm font-medium" />
                  </div>
                )}
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">✉️</span>
                  <input name="email" type="email" required placeholder="Email Address 💌" className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-emerald-500 focus:bg-white focus:outline-none text-sm font-medium" />
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔒</span>
                  <input name="password" type={showPw ? "text" : "password"} required placeholder={mode === "signup" ? "Create Password 🔑" : "Enter Password 🔑"} className="w-full pl-11 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-emerald-500 focus:bg-white focus:outline-none text-sm font-medium" />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs">👁️</button>
                </div>
                {mode === "signup" && (
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔒</span>
                    <input name="cpw" type={showPw ? "text" : "password"} required placeholder="Confirm Password 🔐" className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-emerald-500 focus:bg-white focus:outline-none text-sm font-medium" />
                  </div>
                )}
                <button type="submit" className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-black tracking-wider shadow-lg shadow-emerald-200 hover:shadow-xl transition-all">
                  {mode === "login" ? "ENTER PORTAL →" : "CREATE PROFILE →"}
                </button>
              </form>

              {/* Forgot Password Link (only on login) */}
              {mode === "login" && (
                <div className="text-center mt-4">
                  <button
                    onClick={() => { setMode("forgot"); resetForgotState(); }}
                    className="text-sm font-bold text-pink-500 hover:text-pink-700 transition-colors"
                  >
                    🔑 Forgot your password?
                  </button>
                </div>
              )}

              {/* Toggle Login/Signup */}
              <div className="mt-6 pt-5 border-t border-gray-100 text-center">
                <button onClick={() => setMode(mode === "login" ? "signup" : "login")} className="text-sm font-bold text-gray-400 hover:text-emerald-600 tracking-wider uppercase">
                  {mode === "login" ? "NEW HERE? CREATE ACCOUNT 🌸" : "ALREADY A MEMBER? SIGN IN 🌸"}
                </button>
              </div>
            </>
          ) : (

            /* ═══════ FORGOT PASSWORD ═══════ */
            <>
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-lg text-3xl">🔑</div>
              </div>
              <h2 className="text-center font-black text-2xl text-gray-900 mb-1">
                {resetStep === 1 ? "RESET PASSWORD" : "CREATE NEW PASSWORD"}
              </h2>
              <p className="text-center text-xs text-gray-400 font-bold tracking-widest uppercase mb-6">
                {resetStep === 1 ? "FIND YOUR ACCOUNT" : `RESETTING: ${foundUser?.em}`}
              </p>

              {resetStep === 1 ? (
                /* Step 1: Find Account */
                <div className="space-y-4">
                  <p className="text-xs font-bold text-gray-700 mb-1">What type of account?</p>
                  <div className="grid grid-cols-3 gap-3">
                    {["diner", "restaurant", "admin"].map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setForgotRole(r)}
                        className={`py-3 rounded-xl border-2 font-bold text-xs uppercase transition-all ${
                          forgotRole === r
                            ? "border-pink-500 bg-pink-50 text-pink-700"
                            : "border-gray-200 text-gray-400"
                        }`}
                      >
                        <div className="text-xl mb-1">{r === "diner" ? "🍽️" : r === "restaurant" ? "🍳" : "👑"}</div>
                        {r}
                      </button>
                    ))}
                  </div>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">✉️</span>
                    <input
                      type="email"
                      placeholder="Enter your email address"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-pink-500 focus:bg-white focus:outline-none text-sm font-medium"
                    />
                  </div>
                  <button
                    onClick={handleForgotPassword}
                    disabled={!forgotEmail}
                    className="w-full py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-black shadow-lg disabled:opacity-50 transition-all"
                  >
                    Find My Account →
                  </button>
                </div>
              ) : (
                /* Step 2: New Password */
                <div className="space-y-4">
                  {/* Account Found */}
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center text-white font-black text-lg shadow">
                      {foundUser?.nm?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-green-900">{foundUser?.nm}</p>
                      <p className="text-xs text-green-700">{foundUser?.em} • {foundUser?.role}</p>
                    </div>
                    <span className="text-green-600 text-xl">✅</span>
                  </div>

                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔒</span>
                    <input
                      type={showPw ? "text" : "password"}
                      placeholder="New Password 🔑"
                      value={newPw}
                      onChange={(e) => setNewPw(e.target.value)}
                      className="w-full pl-11 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-pink-500 focus:bg-white focus:outline-none text-sm font-medium"
                    />
                    <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs">👁️</button>
                  </div>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔒</span>
                    <input
                      type={showPw ? "text" : "password"}
                      placeholder="Confirm New Password 🔐"
                      value={confirmNewPw}
                      onChange={(e) => setConfirmNewPw(e.target.value)}
                      className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-pink-500 focus:bg-white focus:outline-none text-sm font-medium"
                    />
                  </div>
                  <button
                    onClick={handleForgotPassword}
                    disabled={!newPw || !confirmNewPw}
                    className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-black shadow-lg disabled:opacity-50 transition-all"
                  >
                    Reset Password ✅
                  </button>
                </div>
              )}

              {/* Back to Login */}
              <div className="mt-6 pt-5 border-t border-gray-100 text-center">
                <button
                  onClick={() => { setMode("login"); resetForgotState(); }}
                  className="text-sm font-bold text-gray-400 hover:text-emerald-600 tracking-wider uppercase"
                >
                  ← BACK TO LOGIN
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}