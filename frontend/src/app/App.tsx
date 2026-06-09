import { Routes, Route, Navigate } from "react-router-dom";

// PAGES
import LoginPage from "./pages/LoginPage";
import DioceseLoginPage from "./pages/DioceseLoginPage";
import ParoquiaLoginPage from "./pages/ParoquiaLoginPage";
import DiocesePage from "./pages/DiocesePage";
import ParoquiaPage from "./pages/ParoquiaPage";

// ACESSIBILIDADE GLOBAL
import AccessibilityPanel from "./components/accessibility/AccessibilityPanel";
import "../styles/accessibility.css";

export default function App() {
  return (
    <>
      <Routes>
        {/* Redireciona o '/' para a tela de seleção de login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/login" element={<LoginPage />} />
        <Route path="/login/diocese" element={<DioceseLoginPage />} />
        <Route path="/login/paroquia" element={<ParoquiaLoginPage />} />
        <Route path="/diocese" element={<DiocesePage />} />
        <Route path="/paroquia" element={<ParoquiaPage />} />
      </Routes>

      <AccessibilityPanel />
    </>
  );
}