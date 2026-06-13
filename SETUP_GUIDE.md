# 🚀 PocketBite Setup Guide

Complete guide to run PocketBite locally on your computer.

## Prerequisites

- ✅ **Node.js** v18+ → https://nodejs.org
- ✅ **MongoDB** (local or MongoDB Atlas free tier)
- ✅ **Git** → https://git-scm.com
- ✅ **VS Code** → https://code.visualstudio.com

## Step 1: Backend Setup

```bash
# Terminal 1
cd backend
npm install
cp .env.example .env
```

Edit `backend/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/pocketbite
FRONTEND_URL=http://localhost:5173
JWT_SECRET=any_secret_string

# M-Pesa (see DARAJA_GUIDE.md)
MPESA_ENV=sandbox
MPESA_CONSUMER_KEY=paste_here
MPESA_CONSUMER_SECRET=paste_here
MPESA_SHORTCODE=6668495
MPESA_PASSKEY=paste_here
MPESA_CALLBACK_URL=https://your-ngrok.ngrok-free.app/api/mpesa/callback

# Africa's Talking
AT_USERNAME=sandbox
AT_API_KEY=paste_here
```

Seed the database (creates 30 restaurants):
```bash
npm run seed
npm run dev
```

✅ Backend runs on http://localhost:5000

## Step 2: Frontend Setup

```bash
# Terminal 2 (from project root)
npm install
npm run dev
```

✅ Frontend runs on http://localhost:5173

## Step 3: Open the App

Browser: **http://localhost:5173**

## 🎯 Where to Find Each Feature

All frontend code is in **`src/App.tsx`** — one single file with the entire app.

Search the file (Ctrl+F) for these keywords to find sections:

| Feature | Search keyword |
|---------|---------------|
| Landing page | `view==="landing"` |
| Pop-ups | `showFloater`, `showLilacFloater` |
| Auth | `view==="auth"` |
| Diner home | `dtab==="home"` |
| Recommendations | `recRests`, `recFoods` |
| Restaurant detail | `selR?` |
| Cart | `showCart` |
| M-Pesa payment | `payModal` |
| Receipt | `showReceipt` |
| Reminders | `reminders.length` |
| Restaurant Reviews tab | `rtab==="reviews"` |
| Restaurant Menu tab | `rtab==="menu"` |
| Restaurant Offers tab | `rtab==="offers"` |
| Admin Users tab | `atab==="users"` |
| Admin Reviews tab | `atab==="reviews"` |

## VS Code Tips

Recommended extensions:
- Tailwind CSS IntelliSense
- ES7+ React snippets
- Prettier

Enable **Word Wrap** in VS Code to read the long JSX lines:
- View → Word Wrap (Alt+Z)

## Common Issues

### "Cannot connect to MongoDB"
- Start MongoDB: `mongod`
- Or use MongoDB Atlas free tier

### "Port already in use"
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :5000 | grep LISTEN
kill -9 <PID>
```

### CORS errors
- Verify `FRONTEND_URL` in `backend/.env` matches your frontend
- Both servers must be running

## Next Steps

1. ✅ Read [DARAJA_GUIDE.md](./DARAJA_GUIDE.md) for M-Pesa setup
2. ✅ Test with sample accounts (signup as Diner/Restaurant/Admin)
3. ✅ Customize 30 restaurants in `backend/seed/seed.js` or directly in `src/App.tsx`
