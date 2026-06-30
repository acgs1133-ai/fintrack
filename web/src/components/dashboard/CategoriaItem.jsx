import { fmtMoeda, fmtPorcentagem } from "../../utils/formatters";

export default function CategoriaItem({ nome, cor, gasto, orcamento }) {
  const percentual = orcamento ? Math.min((gasto / orcamento) * 100, 100) : 0;

  let corBarra = "bg-accent-green";
  if (percentual >= 90) corBarra = "bg-accent-red";
  else if (percentual >= 70) corBarra = "bg-accent-yellow";

  return (
    <div className="py-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: cor }} />
          <span className="text-body-sm text-text-primary">{nome}</span>
        </div>
        <span className="text-body-sm tabular-nums text-text-secondary">
          {fmtMoeda(gasto)} {orcamento ? `/ ${fmtMoeda(orcamento)}` : ""}
        </span>
      </div>
      {orcamento ? (
        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-bg-hover">
          <div className={`h-full rounded-full ${corBarra}`} style={{ width: `${percentual}%` }} />
        </div>
      ) : (
        <p className="mt-1 text-muted text-text-muted">{fmtPorcentagem(gasto, gasto)} sem limite definido</p>
      )}
    </div>
  );
}
