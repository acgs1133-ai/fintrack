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
    <nav className="fixed bottom-4 left-4 right-4 z-40 md:hidden">
      <div className="flex items-center justify-around rounded-2xl bg-bg-card/60 px-1 py-1.5 shadow-2xl shadow-black/60 backdrop-blur-xl">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 rounded-xl px-2 py-1.5 transition-all ${
                isActive
                  ? "bg-accent-green/15 text-accent-green"
                  : "text-text-muted"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={19} strokeWidth={isActive ? 2.5 : 1.8} />
                <span className="text-[9px] font-medium leading-none tracking-tight">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
