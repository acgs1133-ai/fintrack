import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { fmtMoeda } from "../../utils/formatters";
import EmptyState from "../ui/EmptyState";
import { PieChart as PieIcon } from "lucide-react";

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div className="rounded-lg border border-border bg-bg-card px-3 py-2 text-body-sm shadow-lg">
      <p className="font-medium text-text-primary">{item.name}</p>
      <p className="tabular-nums text-text-secondary">{fmtMoeda(item.value)}</p>
    </div>
  );
}

export default function GraficoPizza({ dados }) {
  if (!dados || dados.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-bg-card p-5">
        <EmptyState icon={PieIcon} title="Sem gastos no período" description="Adicione transações para ver a distribuição por categoria." />
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-bg-card p-5">
      <p className="text-body-sm font-medium text-text-secondary">Distribuição por categoria</p>
      <div className="mt-3 h-56">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={dados} dataKey="gasto" nameKey="nome" innerRadius={50} outerRadius={80} paddingAngle={2}>
              {dados.map((entry) => (
                <Cell key={entry.id} fill={entry.cor} stroke="none" />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
