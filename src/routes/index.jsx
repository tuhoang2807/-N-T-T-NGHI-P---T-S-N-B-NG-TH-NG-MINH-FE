import React from "react";
import { Routes, Route } from "react-router-dom";

/* ===== USER PAGES ===== */
import Home from "../pages/User/HomePage";
import Profile from "../pages/User/Profile";
import Contact from "../pages/User/Contact";
import Booking from "../pages/User/Booking";
import MyBooking from "../pages/User/MyBooking";
import Login from "../pages/Login";
import RegisterPage from "../pages/Register";
import Notifications from "../pages/User/Notifications";
import News from "../pages/User/News";
import FieldDetailPage from "../pages/User/FieldDetailPage";
import BookingConfirmPage from "../pages/User/BookingConfirmPage";
import BookingPaymentPage from "../pages/User/BookingPaymentPage";
import Topup from "../pages/wallet/Topup";
import Matchmaking from "../pages/User/Matchmaking";
import AiRecommendationPage from "../pages/User/AiRecommendationPage";
import ForgotPassword from "../pages/User/ForgotPassword";


/* ===== ADMIN ===== */
import RequireAdmin from "./RequireAdmin";
import AdminLayout from "../layouts/AdminLayout";
import UsersPage from "../pages/admin/UsersPage";
import FieldSlotsPage from "../pages/Admin/FieldSlotsPage";
import FieldServicesPage from "../pages/Admin/FieldServicesPage";
import AdminBookingsPage from "../pages/Admin/AdminBookingsPage";
import DashboardPage from "../layouts/DashboardPage";

/* ===== DUMMY (tạo sau) ===== */
const Dashboard = () => <div>Dashboard</div>;
const BookingsAdmin = () => <div>Admin Bookings</div>;
const PaymentsAdmin = () => <div>Admin Payments</div>;
const SettingsAdmin = () => <div>Settings</div>;

const AppRoutes = () => {
  return (
    <Routes>
      {/* ================= USER ================= */}
      <Route path="/" element={<Home />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/booking" element={<Booking />} />
      <Route path="/my-booking" element={<MyBooking />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/notifications" element={<Notifications />} />
      <Route path="/news" element={<News />} />
      <Route path="/fields/:fieldId" element={<FieldDetailPage />} />
      <Route path="/booking/confirm" element={<BookingConfirmPage />} />
      <Route path="/booking/payment" element={<BookingPaymentPage />} />
      <Route path="/matchmaking" element={<Matchmaking />} />
      <Route path="/wallet/topup" element={<Topup />} />
      <Route path="/ai" element={<AiRecommendationPage />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      

      {/* ================= ADMIN ================= */}
      <Route element={<RequireAdmin />}>
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<DashboardPage  />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="payments" element={<PaymentsAdmin />} />
        <Route path="settings" element={<SettingsAdmin />} />
        <Route path="field-slots" element={<FieldSlotsPage />} />
        <Route path="services" element={<FieldServicesPage />} />
        <Route path="bookings" element={<AdminBookingsPage />} />

      </Route>
      </Route>

      {/* ================= FALLBACK ================= */}
      <Route path="*" element={<div>404</div>} />
    </Routes>
  );
};

export default AppRoutes;
