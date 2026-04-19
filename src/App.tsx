import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MotionConfig } from "framer-motion";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import Index from "./pages/Index";
import Login from "./pages/Login";
import Platform from "./pages/Platform";
import Invitations from "./pages/Invitations";
import EventPages from "./pages/EventPages";
import Rsvp from "./pages/Rsvp";
import RequestAccess from "./pages/RequestAccess";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Faq from "./pages/Faq";
import NotFound from "./pages/NotFound";
import AdminAccessRequests from "./pages/AdminAccessRequests";
import CheckIn from "./pages/CheckIn";
import ManageEvents from "./pages/ManageEvents";

import RoleRoute from "./components/RoleRoute";
import OpsHome from "./pages/ops/OpsHome";
import HostAdminDashboard from "./pages/ops/HostAdminDashboard";
import BartenderPanel from "./pages/ops/BartenderPanel";
import GuestEventPage from "./pages/ops/GuestEventPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <MotionConfig reducedMotion="user">
      <TooltipProvider>
        <Toaster />
        <Sonner />

        <BrowserRouter>
          <Routes>
            {/* Public marketing */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/platform" element={<Platform />} />
            <Route path="/invitations" element={<Invitations />} />
            <Route path="/event-pages" element={<EventPages />} />
            <Route path="/rsvp/:token" element={<Rsvp />} />
            <Route path="/request-access" element={<RequestAccess />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/faq" element={<Faq />} />

            {/* Authenticated app */}
            <Route path="/ops" element={<OpsHome />} />

            {/* Admin */}
            <Route
              path="/admin"
              element={
                <RoleRoute allow={["admin", "host_admin"]}>
                  <HostAdminDashboard />
                </RoleRoute>
              }
            />
            <Route
              path="/admin/access-requests"
              element={
                <RoleRoute allow={["admin", "host_admin"]}>
                  <AdminAccessRequests />
                </RoleRoute>
              }
            />

            {/* Organizer */}
            <Route
              path="/organizer"
              element={
                <RoleRoute allow={["organizer", "admin", "host_admin"]}>
                  <HostAdminDashboard />
                </RoleRoute>
              }
            />
            <Route
              path="/manage-events"
              element={
                <RoleRoute allow={["organizer", "admin", "host_admin"]}>
                  <ManageEvents />
                </RoleRoute>
              }
            />
            <Route
              path="/check-in"
              element={
                <RoleRoute allow={["organizer", "admin", "host_admin", "bartender"]}>
                  <CheckIn />
                </RoleRoute>
              }
            />

            {/* Bartender */}
            <Route
              path="/ops/bartender"
              element={
                <RoleRoute allow={["bartender", "host_admin", "organizer", "admin"]}>
                  <BartenderPanel />
                </RoleRoute>
              }
            />

            {/* Guest */}
            <Route
              path="/ops/guest"
              element={
                <RoleRoute allow={["guest", "host_admin", "bartender", "organizer", "admin"]}>
                  <GuestEventPage />
                </RoleRoute>
              }
            />

            {/* Legacy redirect */}
            <Route
              path="/ops/host"
              element={
                <RoleRoute allow={["host_admin", "organizer", "admin"]}>
                  <HostAdminDashboard />
                </RoleRoute>
              }
            />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </MotionConfig>
  </QueryClientProvider>
);

export default App;
