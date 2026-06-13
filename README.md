# 🍽️ PocketBite

A vibrant Kenyan restaurant booking platform with M-Pesa payments, Socket.IO real-time updates, and SMS notifications.

**Theme:** Light green, lilac purple, pink, orange & brown 🌸  
**Stack:** React + Vite + Tailwind CSS + Node.js + Express + MongoDB + Socket.IO

## 📁 Project Structure

```
pocketbite/
├── src/                  ← ⭐ Single source of truth
│   ├── App.tsx           ← Edit this file — all features live here
│   ├── main.tsx
│   └── index.css
├── frontend/             ← VS Code terminal for the frontend
│   ├── package.json      ← Run `npm install && npm run dev` from here
│   ├── vite.config.ts    ← Uses ../src/App.tsx as the app source
│   ├── tsconfig.json
│   ├── index.html
│   └── src/main.tsx      ← Tiny entry that imports the root App
├── backend/              ← VS Code terminal for the backend
│   ├── server.js
│   ├── routes/, models/, services/, seed/
│   └── .env.example
├── public/
├── index.html            ← Used by the in-browser preview
├── package.json          ← Root build (powers the download button)
├── vite.config.ts
├── DARAJA_GUIDE.md
├── SETUP_GUIDE.md
└── README.md
```

## 🚀 Run It (Two Terminals)

### Terminal 1 — Backend
```bash
cd backend
npm install
cp .env.example .env       # paste your M-Pesa & Africa's Talking keys
npm run seed
npm run dev                # http://localhost:5000
```

### Terminal 2 — Frontend
```bash
cd frontend
npm install
npm run dev                # http://localhost:5173
```

The frontend Vite config proxies `/api` and `/socket.io` to `http://localhost:5000`, so the two terminals work together automatically.

## ✏️ Where to Edit

All frontend logic is in **`src/App.tsx`** (project root). Open it once in VS Code and you can edit every feature:

| Feature | Search inside `src/App.tsx` |
|---------|-----------------------------|
| Landing page + pop-ups | `view==="landing"`, `showFloater`, `showLilacFloater` |
| Auth | `view==="auth"` |
| Diner home | `dtab==="home"` |
| Recommendations | `recRests`, `recFoods` |
| Restaurant detail + cart + payment | `selR`, `bkModal`, `payModal` |
| Receipt + QR code + reminders | `showReceipt`, `genQR`, `reminders` |
| Restaurant Menu / Reviews / Offers | `rtab==="menu"`, `rtab==="reviews"`, `rtab==="offers"` |
| Admin Users / Reviews | `atab==="users"`, `atab==="reviews"` |

When you save the file, both the **download preview** and **`npm run dev`** reflect changes instantly.

## 🔑 M-Pesa Setup

See **[DARAJA_GUIDE.md](./DARAJA_GUIDE.md)**.

Add your keys to `backend/.env`:
```env
MPESA_CONSUMER_KEY=your_key
MPESA_CONSUMER_SECRET=your_secret
MPESA_SHORTCODE=6668495
MPESA_PASSKEY=your_passkey
MPESA_CALLBACK_URL=https://your-ngrok-url.ngrok-free.app/api/mpesa/callback
AT_USERNAME=sandbox
AT_API_KEY=your_at_key
```

## 🎯 Why The Frontend Folder Is Thin

Earlier versions duplicated the code into `frontend/src/pages/*.jsx` and they kept getting out of sync with the live preview. To prevent that forever, the `frontend/` folder now **points to the single source file** (`../src/App.tsx`) via a Vite alias. There's only one place to edit, and it always matches what you see in the browser and the download.
