import { NavLink } from "react-router-dom";
import { LayoutDashboard, ArrowLeftRight, Tags, Target, BarChart3, Repeat } from "lucide-react";

const NAV_ITEMS = [
  { to: "/", label: "Início", icon: LayoutDashboard },
  { to: "/transacoes", label: "Transações", icon: ArrowLeftRight },
  { to: "/recorrencias", label: "Fixas", icon: Repeat },
  { to: "/categorias", label: "Categorias", icon: Tags },
  { to: "/metas", label: "Metas", icon: Target },
  { to: "/relatorios", label: "Relatórios", icon: BarChart3 },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex border-t border-border bg-bg-card md:hidden">
      {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === "/"}
          className={({ isActive }) =>
            `flex flex-1 flex-col items-center gap-1 py-2.5 text-muted ${
              isActive ? "text-accent-green" : "text-text-muted"
            }`
          }
        >
          <Icon size={20} />
          <span className="leading-none">{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
