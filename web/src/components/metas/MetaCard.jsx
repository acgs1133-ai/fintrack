import { useEffect, useState } from "react";
import { Pencil, Trash2, CheckCircle2, PiggyBank, TrendingUp, AlertTriangle, SlidersHorizontal } from "lucide-react";
import Modal from "../ui/Modal";
import Input from "../ui/Input";
import Button from "../ui/Button";
import { fmtMoeda, fmtData } from "../../utils/formatters";
import { useAppStore } from "../../store/useAppStore";
import { useToast } from "../../hooks/useToast";

export default function MetaCard({ meta, onEdit, onDelete, onDepositar }) {
  const { showToast } = useToast();
  const metaProjecao = useAppStore((s) => s.metaProjecao);
  const [modalDeposito, setModalDeposito] = useState(false);
  const [valorDeposito, setValorDeposito] = useState("");
  const [erroDeposito, setErroDeposito] = useState(null);
  const [depositando, setDepositando] = useState(false);
  const [projecao, setProjecao] = useState(null);

  const percentual = Math.min((meta.valorAtual / meta.valorAlvo) * 100, 100);

  async function carregarProjecao() {
    try {
      setProjecao(await metaProjecao(meta.id));
    } catch {
      setProjecao(null);
    }
  }

  useEffect(() => {
    carregarProjecao();
  }, [meta.id, meta.valorAtual, meta.prazo, meta.valorAlvo]);

  async function handleDepositar(e) {
    e.preventDefault();
    const valor = parseFloat(valorDeposito.replace(",", "."));
    if (!valor || isNaN(valor) || valor <= 0) {
      setErroDeposito("Informe um valor maior que zero.");
      return;
    }
    setErroDeposito(null);
    setDepositando(true);
    try {
      await onDepositar(meta.id, valor);
      showToast("Depósito realizado com sucesso", "success");
      setModalDeposito(false);
      setValorDeposito("");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setDepositando(false);
    }
  }

  return (
    <div
      className={`group rounded-xl border bg-bg-card p-4 ${
        meta.concluida ? "border-accent-green/30 opacity-70" : "border-border"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className="text-body font-medium text-text-primary">{meta.nome}</span>
          {meta.concluida && (
            <span className="inline-flex items-center gap-1 rounded-full bg-accent-green/15 px-2 py-0.5 text-muted font-medium text-accent-green">
              <CheckCircle2 size={11} />
              Concluída
            </span>
          )}
        </div>
        <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            onClick={() => onEdit(meta)}
            aria-label="Editar meta"
            className="rounded-lg p-1.5 text-text-secondary hover:bg-bg-hover hover:text-accent-blue"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => onDelete(meta)}
            aria-label="Excluir meta"
            className="rounded-lg p-1.5 text-text-secondary hover:bg-bg-hover hover:text-accent-red"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-bg-hover">
        <div
          className={`h-full rounded-full ${meta.concluida ? "bg-accent-green" : "bg-accent-blue"}`}
          style={{ width: `${percentual}%` }}
        />
      </div>

      <div className="mt-2 flex items-center justify-between text-body-sm">
        <span className="tabular-nums text-text-primary font-medium">{fmtMoeda(meta.valorAtual)}</span>
        <span className="tabular-nums text-text-muted">de {fmtMoeda(meta.valorAlvo)}</span>
      </div>

      <p className="mt-2 text-muted text-text-muted">Prazo: {fmtData(meta.prazo)}</p>

      {!meta.concluida && projecao && <Projecao projecao={projecao} onAjustar={() => onEdit(meta)} />}

      {!meta.concluida && (
        <Button variant="ghost" fullWidth className="mt-3" onClick={() => setModalDeposito(true)}>
          <PiggyBank size={15} />
          Depositar
        </Button>
      )}

      <Modal isOpen={modalDeposito} onClose={() => setModalDeposito(false)} title={`Depositar em "${meta.nome}"`} size="sm">
        <form onSubmit={handleDepositar} className="space-y-4">
          <Input
            label="Valor"
            required
            value={valorDeposito}
            onChange={(e) => setValorDeposito(e.target.value)}
            placeholder="0,00"
            inputMode="decimal"
            error={erroDeposito}
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" type="button" onClick={() => setModalDeposito(false)}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit" loading={depositando}>
              Depositar
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

// Projeção realista a partir do histórico de aportes (Feature 5).
function Projecao({ projecao, onAjustar }) {
  const { temHistorico, mediaMensal, mesesNoRitmo, noRitmo, valorMensalNecessario, prazoMeses } = projecao;

  if (!temHistorico) {
    return (
      <div className="mt-3 rounded-lg border border-border bg-bg-hover/40 p-3 text-muted text-text-secondary">
        Ainda sem histórico de aportes para projetar. Para bater no prazo ({prazoMeses}{" "}
        {prazoMeses === 1 ? "mês" : "meses"}), guarde{" "}
        <span className="font-medium text-text-primary">{fmtMoeda(valorMensalNecessario)}/mês</span>.
      </div>
    );
  }

  return (
    <div
      className={`mt-3 rounded-lg border p-3 text-muted ${
        noRitmo ? "border-accent-green/25 bg-accent-green/5" : "border-accent-yellow/25 bg-accent-yellow/5"
      }`}
    >
      <p className="flex items-center gap-1.5 text-text-secondary">
        <TrendingUp size={13} className="text-text-muted" />
        No seu ritmo ({fmtMoeda(mediaMensal)}/mês), você atinge em{" "}
        <span className="font-medium text-text-primary">
          {mesesNoRitmo} {mesesNoRitmo === 1 ? "mês" : "meses"}
        </span>
        .
      </p>
      {!noRitmo && (
        <>
          <p className="mt-1.5 flex items-center gap-1.5 text-accent-yellow">
            <AlertTriangle size={13} />
            Ritmo insuficiente para o prazo. Guarde {fmtMoeda(valorMensalNecessario)}/mês para cumprir.
          </p>
          <button
            onClick={onAjustar}
            className="mt-2 inline-flex items-center gap-1.5 text-body-sm font-medium text-accent-blue hover:underline"
          >
            <SlidersHorizontal size={13} />
            Ajustar meta
          </button>
        </>
      )}
    </div>
  );
}
