import { Routes, Route } from "react-router-dom";
import {
  Heart,
  Building2,
  Church,
  AlertTriangle,
  Calendar,
  Package,
  Users,
  Home,
  ClipboardList,
  DollarSign,
  LogOut,
  Bell,
  BarChart3,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  ShoppingBag,
} from "lucide-react";
import { FamilyRegistration } from "./components/FamilyRegistration";
import { HomeVisits } from "./components/HomeVisits";
import { BenefitsManagement } from "./components/BenefitsManagement";
import { StockControl } from "./components/StockControl";
import { BazarPOS } from "./components/BazarPOS";

//PAGES
import LoginPage from "./pages/LoginPage";
import DioceseLoginPage from "./pages/DioceseLoginPage";
import ParoquiaLoginPage from "./pages/ParoquiaLoginPage";
import DiocesePage from "./pages/DiocesePage";
import ParoquiaPage from "./pages/ParoquiaPage";

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/login/diocese" element={<DioceseLoginPage />} />
        <Route path="/login/paroquia" element={<ParoquiaLoginPage />} />
        <Route path="/diocese" element={<DiocesePage />} />
        <Route path="/paroquia" element={<ParoquiaPage />} />
      </Routes>
    </>
  );
}
