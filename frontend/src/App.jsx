import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "./store/AppContext.jsx";
import { SocketProvider } from "./store/SocketContext.jsx";
import Toast from "./components/Toast.jsx";
import Reminders from "./components/Reminders.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

import LandingPage from "./pages/LandingPage.jsx";
import AuthPage from "./pages/AuthPage.jsx";

import HomePage from "./pages/HomePage.jsx";
import RestaurantDetailPage from "./pages/RestaurantDetailPage.jsx";
import CartPage from "./pages/CartPage.jsx";
import MyBookingsPage from "./pages/MyBookingsPage.jsx";
import WishlistPage from "./pages/WishlistPage.jsx";
import NotificationsPage from "./pages/NotificationsPage.jsx";
import SocialDiningPage from "./pages/SocialDiningPage.jsx";
import VisitedPage from "./pages/VisitedPage.jsx";
import GroupBookingPage from "./pages/GroupBookingPage.jsx";

import RestaurantDashboard from "./pages/RestaurantDashboard.jsx";
import RestaurantMenuPage from "./pages/RestaurantMenuPage.jsx";
import RestaurantBookingsPage from "./pages/RestaurantBookingsPage.jsx";
import RestaurantGroupBookingsPage from "./pages/RestaurantGroupBookingsPage.jsx";
import RestaurantNotificationsPage from "./pages/RestaurantNotificationsPage.jsx";
import RestaurantPaymentsPage from "./pages/RestaurantPaymentsPage.jsx";
import RestaurantReviewsPage from "./pages/RestaurantReviewsPage.jsx";
import RestaurantOffersPage from "./pages/RestaurantOffersPage.jsx";
import RestaurantReportsPage from "./pages/RestaurantReportsPage.jsx";

import AdminDashboard from "./pages/AdminDashboard.jsx";
import AdminRestaurantsPage from "./pages/AdminRestaurantsPage.jsx";
import AdminBookingsPage from "./pages/AdminBookingsPage.jsx";
import AdminPaymentsPage from "./pages/AdminPaymentsPage.jsx";
import AdminReviewsPage from "./pages/AdminReviewsPage.jsx";
import AdminUsersPage from "./pages/AdminUsersPage.jsx";
import AdminReportsPage from "./pages/AdminReportsPage.jsx";

export default function App() {
  return (
    <AppProvider>
      <SocketProvider>
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<AuthPage />} />

            {/* Diner */}
            <Route element={<ProtectedRoute role="diner" />}>
              <Route path="/home" element={<HomePage />} />
              <Route path="/restaurant/:id" element={<RestaurantDetailPage />} />
              <Route path="/group-booking/:restId" element={<GroupBookingPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/wishlist" element={<WishlistPage />} />
              <Route path="/my-bookings" element={<MyBookingsPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/visited" element={<VisitedPage />} />
              <Route path="/social" element={<SocialDiningPage />} />
            </Route>

            {/* Restaurant */}
            <Route element={<ProtectedRoute role="restaurant" />}>
              <Route path="/restaurant/dashboard" element={<RestaurantDashboard />} />
              <Route path="/restaurant/menu" element={<RestaurantMenuPage />} />
              <Route path="/restaurant/bookings" element={<RestaurantBookingsPage />} />
              <Route path="/restaurant/notifications" element={<RestaurantNotificationsPage />} />
              <Route path="/restaurant/group-bookings" element={<RestaurantGroupBookingsPage />} />
              <Route path="/restaurant/payments" element={<RestaurantPaymentsPage />} />
              <Route path="/restaurant/reviews" element={<RestaurantReviewsPage />} />
              <Route path="/restaurant/offers" element={<RestaurantOffersPage />} />
              <Route path="/restaurant/reports" element={<RestaurantReportsPage />} />
            </Route>

            {/* Admin */}
            <Route element={<ProtectedRoute role="admin" />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/restaurants" element={<AdminRestaurantsPage />} />
              <Route path="/admin/bookings" element={<AdminBookingsPage />} />
              <Route path="/admin/payments" element={<AdminPaymentsPage />} />
              <Route path="/admin/reviews" element={<AdminReviewsPage />} />
              <Route path="/admin/users" element={<AdminUsersPage />} />
              <Route path="/admin/reports" element={<AdminReportsPage />} />
            </Route>
          </Routes>
          <Toast />
          <Reminders />
        </BrowserRouter>
      </SocketProvider>
    </AppProvider>
  );
}