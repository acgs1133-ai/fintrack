import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { fmtMoeda } from "../../utils/formatters";

// Comparação contextual: gasto do mês vs média dos últimos 3 meses, por categoria.
export default function ComparativoCategorias({ dados }) {
  const lista = (dados || []).filter((c) => c.atual > 0);

  return (
    <div className="rounded-xl border border-border bg-bg-card p-5">
      <p className="text-body-sm font-medium text-text-secondary">Comparado à sua média (3 meses)</p>

      {lista.length === 0 ? (
        <p className="py-6 text-center text-body-sm text-text-muted">
          Sem gastos suficientes para comparar este mês.
        </p>
      ) : (
        <div className="mt-3 space-y-2">
          {lista.map((c) => {
            const semMedia = c.variacao == null;
            const subiu = !semMedia && c.variacao > 0;
            const desceu = !semMedia && c.variacao < 0;
            const Icon = subiu ? TrendingUp : desceu ? TrendingDown : Minus;
            const cor = c.alerta
              ? "text-accent-red"
              : subiu
              ? "text-accent-yellow"
              : desceu
              ? "text-accent-green"
              : "text-text-muted";

            return (
              <div key={c.id} className="flex items-center gap-3">
                <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: c.cor }} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-body-sm text-text-primary">{c.nome}</p>
                  <p className="text-muted text-text-muted tabular-nums">
                    {fmtMoeda(c.atual)} · média {fmtMoeda(c.media)}
                  </p>
                </div>
                <span className={`flex shrink-0 items-center gap-1 text-body-sm font-medium tabular-nums ${cor}`}>
                  <Icon size={14} />
                  {semMedia ? "novo" : `${c.variacao > 0 ? "+" : ""}${c.variacao}%`}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {lista.some((c) => c.alerta) && (
        <div className="mt-3 rounded-lg border border-accent-red/30 bg-accent-red/5 p-3 text-body-sm text-accent-red">
          {lista
            .filter((c) => c.alerta)
            .slice(0, 1)
            .map((c) => (
              <span key={c.id}>
                Gasto com {c.nome} está {c.variacao}% acima da sua média.
              </span>
            ))}
        </div>
      )}
    </div>
  );
}
