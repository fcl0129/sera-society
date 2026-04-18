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
import RequestAccess from "./pages/RequestAccess";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Faq from "./pages/Faq";
import NotFound from "./pages/NotFound";

import RoleRoute from "./components/RoleRoute";
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

          <Route path="/request-access" element={<RequestAccess />} />

          <Route path="/ops" element={<OpsHome />} />
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
              <RoleRoute allow={["bartender", "host_admin"]}>
                <BartenderPanel />
              </RoleRoute>
            }
          />
          <Route
            path="/ops/guest"
            element={
              <RoleRoute allow={["guest", "host_admin", "bartender"]}>
                <GuestEventPage />
              </RoleRoute>
            }
          />

          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/faq" element={<Faq />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
