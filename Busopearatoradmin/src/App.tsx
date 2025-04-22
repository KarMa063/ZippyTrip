import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import RoutesPage from "./pages/Routes";
import Schedule from "./pages/Schedule";
import Fleet from "./pages/Fleet";
import Analytics from "./pages/Analytics";
import RouteDetail from "./pages/RouteDetail";
import AddRoute from "./pages/AddRoute";
import Settings from "./pages/Settings";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Bookings from "./pages/Bookings";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import EditRoute from "./pages/EditRoute";
import CancellationManagement from "./pages/CancellationManagement";

const queryClient = new QueryClient();

// Protected route component
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();
  
  return (
    <Routes>
      <Route path="/login" element={
        isAuthenticated ? <Navigate to="/" replace /> : <Login />
      } />
      
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="routes" element={<RoutesPage />} />
        <Route path="routes/add" element={<AddRoute />} />
        <Route path="routes/:id" element={<RouteDetail />} />
        <Route path="routes/edit/:id" element={<EditRoute />} />
        <Route path="schedule" element={<Schedule />} />
        <Route path="fleet" element={<Fleet />} />
        <Route path="bookings" element={<Bookings />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="settings" element={<Settings />} />
        <Route path="cancellations" element={<CancellationManagement />} />
      </Route>
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <ThemeProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
