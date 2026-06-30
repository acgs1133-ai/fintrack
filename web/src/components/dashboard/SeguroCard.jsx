import { ShieldCheck, Info } from "lucide-react";
import { fmtMoeda } from "../../utils/formatters";

// Saldo "seguro para gastar": saldo atual menos recorrências previstas e reserva de metas.
export default function SeguroCard({ dados }) {
  if (!dados) return null;
  const { saldoAtual, recorrenciasPrevistas, reservaMetas, seguro } = dados;
  const positivo = seguro >= 0;

  return (
    <div className="rounded-xl border border-accent-green/25 bg-accent-green/5 p-5">
      <div className="flex items-center gap-2">
        <ShieldCheck size={16} className="text-accent-green" />
        <p className="text-body-sm font-medium text-text-primary">Seguro para gastar</p>
        <span
          className="text-text-muted"
          title="Diferente do saldo da conta: já desconta as contas fixas/assinaturas previstas até o fim do mês e a reserva mensal das suas metas ativas."
        >
          <Info size={14} />
        </span>
      </div>

      <p className={`mt-2 text-hero font-semibold tabular-nums ${positivo ? "text-accent-green" : "text-accent-red"}`}>
        {fmtMoeda(seguro)}
      </p>
      <p className="mt-1 text-muted text-text-muted">
        Quanto você pode gastar sem comprometer contas fixas e metas — não é o saldo bruto.
      </p>

      <div className="mt-3 space-y-1.5 border-t border-border pt-3 text-body-sm">
        <Linha label="Saldo atual" valor={saldoAtual} />
        <Linha label="− Recorrências previstas no mês" valor={-recorrenciasPrevistas} />
        <Linha label="− Reserva das metas ativas" valor={-reservaMetas} />
      </div>
    </div>
  );
}

function Linha({ label, valor }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-text-secondary">{label}</span>
      <span className="tabular-nums text-text-primary">{fmtMoeda(valor)}</span>
    </div>
  );
}
