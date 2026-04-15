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
import RequestAccess from "./pages/RequestAccess";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Faq from "./pages/Faq";
import NotFound from "./pages/NotFound";

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
          <Route path="/check-in" element={<CheckIn />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/request-access" element={<RequestAccess />} />
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
