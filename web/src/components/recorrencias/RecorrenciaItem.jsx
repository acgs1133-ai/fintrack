import { useState } from "react";
import { ArrowUpRight, ArrowDownRight, Ban, RotateCcw, Repeat } from "lucide-react";
import Badge from "../ui/Badge";
import { fmtMoeda, fmtData } from "../../utils/formatters";

export default function RecorrenciaItem({ serie, onToggleStatus }) {
  const [processando, setProcessando] = useState(false);
  const subiu = serie.mudou && serie.diferenca > 0;
  const desceu = serie.mudou && serie.diferenca < 0;
  const receita = serie.tipo === "RECEITA";

  async function alternar() {
    setProcessando(true);
    try {
      await onToggleStatus(serie, !serie.ativa);
    } finally {
      setProcessando(false);
    }
  }

  return (
    <div className={`rounded-xl border bg-bg-card p-4 ${serie.ativa ? "border-border" : "border-border opacity-60"}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Repeat size={14} className="shrink-0 text-text-muted" />
            <p className="truncate text-body font-medium text-text-primary">{serie.descricao}</p>
            {!serie.ativa && (
              <span className="rounded-full bg-bg-hover px-2 py-0.5 text-muted font-medium text-text-muted">
                Cancelada
              </span>
            )}
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <Badge color={serie.categoria.cor}>{serie.categoria.nome}</Badge>
            <span className="text-muted text-text-muted">
              {serie.ocorrencias}× · último em {fmtData(serie.ultimaData)}
            </span>
          </div>
        </div>

        <div className="shrink-0 text-right">
          <p className={`text-body font-semibold tabular-nums ${receita ? "text-accent-green" : "text-text-primary"}`}>
            {fmtMoeda(serie.valorAtual)}
          </p>
          <p className="text-muted text-text-muted">/mês</p>
        </div>
      </div>

      {serie.mudou && (
        <div
          className={`mt-3 flex items-center gap-1.5 rounded-lg px-3 py-2 text-body-sm ${
            subiu ? "bg-accent-red/5 text-accent-red" : "bg-accent-green/5 text-accent-green"
          }`}
        >
          {subiu ? <ArrowUpRight size={15} /> : <ArrowDownRight size={15} />}
          <span>
            {serie.descricao} {subiu ? "subiu" : "caiu"} de {fmtMoeda(serie.valorAnterior)} para{" "}
            {fmtMoeda(serie.valorAtual)}
          </span>
        </div>
      )}

      <div className="mt-3 flex items-center justify-between">
        <span className="text-muted text-text-muted">
          {serie.ativa
            ? serie.lancadaEsteMs
              ? "Já lançada este mês"
              : "Prevista para este mês"
            : "Não entra mais nas previsões"}
        </span>
        <button
          onClick={alternar}
          disabled={processando}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-body-sm font-medium transition-colors disabled:opacity-50 ${
            serie.ativa
              ? "text-accent-red hover:bg-accent-red/10"
              : "text-accent-green hover:bg-accent-green/10"
          }`}
        >
          {serie.ativa ? <Ban size={14} /> : <RotateCcw size={14} />}
          {serie.ativa ? "Cancelar" : "Reativar"}
        </button>
      </div>
    </div>
  );
}
