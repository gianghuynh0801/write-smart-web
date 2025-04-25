import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { I18nextProvider } from "react-i18next";
import i18n from "./utils/i18n";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import EmailVerified from "./pages/EmailVerified";
import AdminLogin from "./pages/AdminLogin";
import EmailVerification from "./pages/EmailVerification";
import VerifyEmailPrompt from "./pages/VerifyEmailPrompt";
import DashboardLayout, { Dashboard, CreateContent, Credits, Connections, Settings, Subscriptions, Articles } from "./pages/dashboard";
import AdminLayout, { AdminDashboard, AdminUsers, AdminCredits, AdminSubscriptions, AdminSettings } from "./pages/admin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <I18nextProvider i18n={i18n}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/email-verified" element={<EmailVerified />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/verify-email" element={<EmailVerification />} />
            <Route path="/verify-email-prompt" element={<VerifyEmailPrompt />} />

            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="create" element={<CreateContent />} />
              <Route path="credits" element={<Credits />} />
              <Route path="subscriptions" element={<Subscriptions />} />
              <Route path="connections" element={<Connections />} />
              <Route path="settings" element={<Settings />} />
              <Route path="articles" element={<Articles />} />
            </Route>

            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="credits" element={<AdminCredits />} />
              <Route path="subscriptions" element={<AdminSubscriptions />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </I18nextProvider>
  </QueryClientProvider>
);

export default App;
