import { fmtMoeda } from "../../utils/formatters";

export default function MetricCard({ label, valor, icon: Icon, color = "#F4F4F5" }) {
  return (
    <div className="rounded-xl border border-border bg-bg-card p-4">
      <div className="flex items-center gap-2 text-body-sm text-text-secondary">
        {Icon && <Icon size={16} style={{ color }} />}
        {label}
      </div>
      <p className="mt-2 text-hero font-semibold tabular-nums text-text-primary">{fmtMoeda(valor)}</p>
    </div>
  );
}
