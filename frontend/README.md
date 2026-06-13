# PocketBite Frontend

Multi-page React app with the full PocketBite system.

## Quick Start

```bash
cd frontend
npm install
npm run dev
```

Opens at **http://localhost:5173**

## Structure

```
frontend/
├── src/
│   ├── components/        # Navbar, Toast, Receipt, Reminders, ProtectedRoute
│   ├── pages/
│   │   ├── LandingPage.jsx
│   │   ├── AuthPage.jsx
│   │   ├── HomePage.jsx                    # Diner home + recommendations
│   │   ├── RestaurantDetailPage.jsx
│   │   ├── CartPage.jsx                    # Cart + booking + M-Pesa
│   │   ├── MyBookingsPage.jsx              # With Receipt + Review
│   │   ├── WishlistPage.jsx
│   │   ├── RestaurantDashboard.jsx
│   │   ├── RestaurantMenuPage.jsx
│   │   ├── RestaurantBookingsPage.jsx      # With receipt view
│   │   ├── RestaurantReviewsPage.jsx       # ⭐ Reviews + delete
│   │   ├── RestaurantOffersPage.jsx
│   │   ├── RestaurantReportsPage.jsx
│   │   ├── AdminDashboard.jsx
│   │   ├── AdminRestaurantsPage.jsx
│   │   ├── AdminBookingsPage.jsx
│   │   ├── AdminReviewsPage.jsx            # ⭐ Reviews + delete
│   │   ├── AdminUsersPage.jsx              # 👥 Users list
│   │   └── AdminReportsPage.jsx
│   ├── store/AppContext.jsx                # Central state + helpers
│   ├── data.js                             # 30 restaurants seed
│   ├── App.jsx                             # Router
│   ├── main.jsx
│   └── index.css
├── index.html
├── package.json
└── vite.config.js
```

## Backend

In a second terminal:

```bash
cd backend
npm install
cp .env.example .env
npm run seed
npm run dev
```

Vite proxies `/api` and `/socket.io` to `http://localhost:5000`.
