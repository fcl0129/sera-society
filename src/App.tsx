import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import Index from "./pages/Index";
import Login from "./pages/Login";
import Platform from "./pages/Platform";
import Invitations from "./pages/Invitations";
import EventPages from "./pages/EventPages";
import CheckIn from "./pages/CheckIn";
import Dashboard from "./pages/Dashboard";
import ManageEvents from "./pages/ManageEvents";
import RequestAccess from "./pages/RequestAccess";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Faq from "./pages/Faq";
import NfcPass from "./pages/NfcPass";
import DrinkRedeem from "./pages/DrinkRedeem";
import RedeemStation from "./pages/RedeemStation";
import BarMode from "./pages/BarMode";
import NotFound from "./pages/NotFound";

import RsvpPage from "./pages/Rsvp";

import ProtectedRoute from "./components/ProtectedRoute";
import RoleRoute from "./components/RoleRoute";
import AdminAccessRequests from "./pages/AdminAccessRequests";
import MasterRoute from "./components/MasterRoute";
import OpsHome from "./pages/ops/OpsHome";
import HostAdminDashboard from "./pages/ops/HostAdminDashboard";
import BartenderPanel from "./pages/ops/BartenderPanel";
import GuestEventPage from "./pages/ops/GuestEventPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />

      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />

          <Route path="/platform" element={<Platform />} />
          <Route path="/invitations" element={<Invitations />} />
          <Route path="/event-pages" element={<EventPages />} />

          {/* Public RSVP route */}
          <Route path="/rsvp/:token" element={<RsvpPage />} />

          <Route
            path="/check-in"
            element={
              <ProtectedRoute>
                <CheckIn />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/events"
            element={
              <ProtectedRoute>
                <ManageEvents />
              </ProtectedRoute>
            }
          />

          <Route path="/request-access" element={<RequestAccess />} />

          <Route
            path="/ops"
            element={<OpsHome />}
          />

          <Route
            path="/ops/host"
            element={
              <RoleRoute allow={["host_admin"]}>
                <HostAdminDashboard />
              </RoleRoute>
            }
          />

          <Route
            path="/ops/bartender"
            element={
              <RoleRoute allow={["bartender"]}>
                <BartenderPanel />
              </RoleRoute>
            }
          />

          <Route
            path="/ops/guest"
            element={
              <RoleRoute allow={["guest"]}>
                <GuestEventPage />
              </RoleRoute>
            }
          />

          <Route
            path="/master/access-requests"
            element={
              <MasterRoute>
                <AdminAccessRequests />
              </MasterRoute>
            }
          />

          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/faq" element={<Faq />} />
          <Route path="/nfc-pass/:tag" element={<NfcPass />} />
          <Route path="/events/:eventId/drinks" element={<DrinkRedeem />} />
          <Route path="/redeem" element={<RedeemStation />} />
          <Route path="/bar-mode" element={<BarMode />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
