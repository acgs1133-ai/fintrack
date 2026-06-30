import { ArrowUp, ArrowDown } from "lucide-react";
import { fmtMoeda } from "../../utils/formatters";

export default function SaldoCard({ saldo, variacaoPercentual, mesLabel }) {
  const positivo = saldo >= 0;
  const variacaoPositiva = variacaoPercentual >= 0;

  return (
    <div className="rounded-xl border border-border bg-bg-card p-5">
      <p className="text-body-sm text-text-secondary">Saldo de {mesLabel}</p>
      <p
        className={`mt-2 text-saldo font-semibold tabular-nums ${
          positivo ? "text-accent-green" : "text-accent-red"
        }`}
      >
        {fmtMoeda(saldo)}
      </p>
      <div className="mt-2 flex items-center gap-1 text-body-sm">
        {variacaoPositiva ? (
          <ArrowUp size={14} className="text-accent-green" />
        ) : (
          <ArrowDown size={14} className="text-accent-red" />
        )}
        <span className={variacaoPositiva ? "text-accent-green" : "text-accent-red"}>
          {Math.abs(variacaoPercentual)}%
        </span>
        <span className="text-text-muted">vs mês anterior</span>
      </div>
    </div>
  );
}
