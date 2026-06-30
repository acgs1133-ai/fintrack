import { fmtMoeda, fmtPorcentagem } from "../../utils/formatters";

export default function OrcamentoBar({ gasto, orcamentoTotal }) {
  const percentual = orcamentoTotal ? Math.min((gasto / orcamentoTotal) * 100, 100) : 0;

  let cor = "bg-accent-green";
  if (percentual >= 90) cor = "bg-accent-red";
  else if (percentual >= 70) cor = "bg-accent-yellow";

  return (
    <div className="rounded-xl border border-border bg-bg-card p-5">
      <div className="flex items-center justify-between">
        <p className="text-body-sm text-text-secondary">Orçamento do mês</p>
        <p className="text-body-sm font-medium text-text-primary tabular-nums">
          {fmtMoeda(gasto)} / {orcamentoTotal ? fmtMoeda(orcamentoTotal) : "sem limite"}
        </p>
      </div>
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-bg-hover">
        <div className={`h-full rounded-full transition-all ${cor}`} style={{ width: `${percentual}%` }} />
      </div>
      <p className="mt-1.5 text-muted text-text-muted">{fmtPorcentagem(gasto, orcamentoTotal)} utilizado</p>
    </div>
  );
}
