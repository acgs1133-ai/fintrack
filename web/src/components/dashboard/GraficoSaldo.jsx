import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { fmtMoeda } from "../../utils/formatters";

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-bg-card px-3 py-2 text-body-sm shadow-lg">
      <p className="text-text-muted">Dia {label}</p>
      <p className="font-medium text-text-primary tabular-nums">{fmtMoeda(payload[0].value)}</p>
    </div>
  );
}

export default function GraficoSaldo({ dados }) {
  return (
    <div className="rounded-xl border border-border bg-bg-card p-5">
      <p className="text-body-sm font-medium text-text-secondary">Evolução do saldo no mês</p>
      <div className="mt-3 h-56">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={dados} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="saldoGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22C55E" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#22C55E" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" vertical={false} />
            <XAxis dataKey="dia" stroke="#52525B" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#52525B" fontSize={12} tickLine={false} axisLine={false} width={50} />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="saldo"
              stroke="#22C55E"
              strokeWidth={2}
              fill="url(#saldoGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
