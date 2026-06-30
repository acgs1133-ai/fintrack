import { Routes, Route } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Transacoes from "./pages/Transacoes";
import Categorias from "./pages/Categorias";
import Metas from "./pages/Metas";
import Relatorios from "./pages/Relatorios";
import Recorrencias from "./pages/Recorrencias";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/transacoes" element={<Transacoes />} />
        <Route path="/categorias" element={<Categorias />} />
        <Route path="/metas" element={<Metas />} />
        <Route path="/recorrencias" element={<Recorrencias />} />
        <Route path="/relatorios" element={<Relatorios />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
