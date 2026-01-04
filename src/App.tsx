import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { MainLayout } from "@/components/layouts/MainLayout";

// Auth Pages
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import VerifyPage from "@/pages/auth/VerifyPage";

// User Pages
import DashboardPage from "@/pages/DashboardPage";
import SimulacrosPage from "@/pages/simulacros/SimulacrosPage";
import SimulacroExamPage from "@/pages/simulacros/SimulacroExamPage";
import SimulacroResultPage from "@/pages/simulacros/SimulacroResultPage";
import PracticasPage from "@/pages/practicas/PracticasPage";
import PracticaExamPage from "@/pages/practicas/PracticaExamPage";
import ProgresoPage from "@/pages/ProgresoPage";
import PerfilPage from "@/pages/PerfilPage";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/verify" element={<VerifyPage />} />

            {/* Protected Routes */}
            <Route
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<DashboardPage />} />
              <Route path="/simulacros" element={<SimulacrosPage />} />
              <Route path="/simulacros/:id" element={<SimulacroExamPage />} />
              <Route path="/simulacros/:id/resultado" element={<SimulacroResultPage />} />
              <Route path="/practicas" element={<PracticasPage />} />
              <Route path="/practicas/:id" element={<PracticaExamPage />} />
              <Route path="/progreso" element={<ProgresoPage />} />
              <Route path="/perfil" element={<PerfilPage />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
