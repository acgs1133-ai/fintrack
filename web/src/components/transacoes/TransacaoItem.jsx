import { Pencil, Trash2, Users, Repeat } from "lucide-react";
import Badge from "../ui/Badge";
import { fmtMoeda, fmtData } from "../../utils/formatters";
import { ESSENCIAL_LABEL } from "../../utils/essencialidade";

export default function TransacaoItem({ transacao, onEdit, onDelete }) {
  const receita = transacao.valor > 0;
  const numPessoas = transacao.divisao?.numPessoas;

  return (
    <div className="group flex items-center gap-3 rounded-xl border border-border bg-bg-card p-3 transition-colors hover:bg-bg-hover">
      <span className="h-9 w-9 shrink-0 rounded-full" style={{ backgroundColor: `${transacao.categoria.cor}1A` }}>
        <span
          className="flex h-full w-full items-center justify-center rounded-full text-body-sm font-semibold"
          style={{ color: transacao.categoria.cor }}
        >
          {transacao.categoria.nome.charAt(0)}
        </span>
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-body-sm font-medium text-text-primary">{transacao.descricao}</p>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <Badge color={transacao.categoria.cor}>{transacao.categoria.nome}</Badge>
          {transacao.essencial && (
            <span
              className={`rounded-full px-2 py-0.5 text-muted font-medium ${
                transacao.essencial === "NECESSIDADE"
                  ? "bg-accent-green/15 text-accent-green"
                  : "bg-accent-yellow/15 text-accent-yellow"
              }`}
            >
              {ESSENCIAL_LABEL[transacao.essencial]}
            </span>
          )}
          {transacao.recorrente && (
            <span className="inline-flex items-center gap-1 text-muted text-text-muted">
              <Repeat size={11} /> fixa
            </span>
          )}
          {numPessoas > 1 && (
            <span className="inline-flex items-center gap-1 text-muted text-accent-cyan">
              <Users size={11} /> dividida ({numPessoas})
            </span>
          )}
          <span className="text-muted text-text-muted">{fmtData(transacao.data)}</span>
        </div>
      </div>

      <p className={`shrink-0 text-body-sm font-medium tabular-nums ${receita ? "text-accent-green" : "text-text-primary"}`}>
        {receita ? "+" : ""}
        {fmtMoeda(transacao.valor)}
      </p>

      {(onEdit || onDelete) && (
        <div className="ml-1 flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          {onEdit && (
            <button
              onClick={() => onEdit(transacao)}
              aria-label="Editar transação"
              className="rounded-lg p-1.5 text-text-secondary hover:bg-bg-base hover:text-accent-blue"
            >
              <Pencil size={15} />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(transacao)}
              aria-label="Excluir transação"
              className="rounded-lg p-1.5 text-text-secondary hover:bg-bg-base hover:text-accent-red"
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
