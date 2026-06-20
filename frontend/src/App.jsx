// src/App.jsx — complete updated file

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider }   from "./context/AuthContext";
import AuthLayout         from "./layouts/AuthLayout";
import ProtectedRoute     from "./components/ProtectedRoute";
import LoginPage          from "./pages/LoginPage";
import RegisterPage       from "./pages/RegisterPage";
import Dashboard          from "./pages/Dashboard";
import TopicsPage         from "./pages/TopicsPage";
import NotesPage          from "./pages/NotesPage";
import MaterialsPage      from "./pages/MaterialsPage"; 
import ProfilePage from "./pages/ProfilePage";
import AIAssistantPage from "./pages/AIAssistantPage";
import ProductivityPage from "./pages/ProductivityPage";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>

          {/* Public */}
          <Route element={<AuthLayout />}>
            <Route path="/login"    element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          {/* Protected */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/topics"    element={<TopicsPage />} />
            <Route path="/notes"     element={<NotesPage />} />
            <Route path="/materials" element={<MaterialsPage />} /> 
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/ai" element={<AIAssistantPage />} />
            <Route path="/productivity" element={<ProductivityPage />} />
          </Route>

          <Route path="/"  element={<Navigate to="/dashboard" replace />} />
          <Route path="*"  element={<Navigate to="/dashboard" replace />} />


        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}