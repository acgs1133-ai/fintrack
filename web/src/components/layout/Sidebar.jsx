import { NavLink } from "react-router-dom";
import { LayoutDashboard, ArrowLeftRight, Tags, Target, BarChart3, Repeat, Wallet } from "lucide-react";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/transacoes", label: "Transações", icon: ArrowLeftRight },
  { to: "/categorias", label: "Categorias", icon: Tags },
  { to: "/metas", label: "Metas", icon: Target },
  { to: "/recorrencias", label: "Recorrências", icon: Repeat },
  { to: "/relatorios", label: "Relatórios", icon: BarChart3 },
];

export default function Sidebar() {
  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-bg-card md:flex">
      <div className="flex items-center gap-2 px-5 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-green/15">
          <Wallet size={18} className="text-accent-green" />
        </div>
        <span className="text-subtitle font-semibold text-text-primary">FinTrack</span>
      </div>
      <nav className="flex flex-1 flex-col gap-1 px-3">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-body-sm font-medium transition-colors ${
                isActive
                  ? "bg-bg-hover text-text-primary"
                  : "text-text-secondary hover:bg-bg-hover hover:text-text-primary"
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="px-5 py-4 text-muted text-text-muted">FinTrack v1.0</div>
    </aside>
  );
}
