import { useEffect, useMemo, useState } from "react";
import { Plus, Upload, Receipt } from "lucide-react";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import EmptyState from "../components/ui/EmptyState";
import { SkeletonList } from "../components/ui/Skeleton";
import TransacaoItem from "../components/transacoes/TransacaoItem";
import TransacaoForm from "../components/transacoes/TransacaoForm";
import FiltroTransacoes from "../components/transacoes/FiltroTransacoes";
import ImportarCSV from "../components/transacoes/ImportarCSV";
import { useTransacoes } from "../hooks/useTransacoes";
import { useToast } from "../hooks/useToast";
import { fmtMoeda } from "../utils/formatters";

const hoje = new Date();

export default function Transacoes() {
  const { transacoes, loading, erro, fetchTransacoes, addTransacao, updateTransacao, deleteTransacao } = useTransacoes();
  const { showToast } = useToast();

  const [filtros, setFiltros] = useState({
    mes: hoje.getMonth() + 1,
    ano: hoje.getFullYear(),
    tipo: "",
    categoriaId: "",
    q: "",
  });

  const [modalForm, setModalForm] = useState(false);
  const [modalImportar, setModalImportar] = useState(false);
  const [transacaoEditando, setTransacaoEditando] = useState(null);
  const [transacaoExcluindo, setTransacaoExcluindo] = useState(null);
  const [excluindo, setExcluindo] = useState(false);

  useEffect(() => {
    fetchTransacoes(filtros).catch((err) => showToast(err.message, "error"));
  }, [filtros]);

  const totais = useMemo(() => {
    const receitas = transacoes.filter((t) => t.valor > 0).reduce((acc, t) => acc + t.valor, 0);
    const despesas = Math.abs(transacoes.filter((t) => t.valor < 0).reduce((acc, t) => acc + t.valor, 0));
    return { receitas, despesas, saldo: receitas - despesas };
  }, [transacoes]);

  function handleNovaTransacao() {
    setTransacaoEditando(null);
    setModalForm(true);
  }

  function handleEditar(transacao) {
    setTransacaoEditando(transacao);
    setModalForm(true);
  }

  async function handleSalvar(payload) {
    if (transacaoEditando) {
      await updateTransacao(transacaoEditando.id, payload);
    } else {
      await addTransacao(payload);
    }
    setModalForm(false);
    await fetchTransacoes(filtros);
  }

  async function handleConfirmarExclusao() {
    setExcluindo(true);
    try {
      await deleteTransacao(transacaoExcluindo.id);
      showToast("Transação excluída", "success");
      setTransacaoExcluindo(null);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setExcluindo(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-title font-semibold text-text-primary">Transações</h1>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => setModalImportar(true)}>
            <Upload size={16} />
            Importar CSV
          </Button>
          <Button variant="primary" onClick={handleNovaTransacao}>
            <Plus size={16} />
            Nova transação
          </Button>
        </div>
      </div>

      <FiltroTransacoes filtros={filtros} onChange={setFiltros} />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-bg-card p-4">
          <p className="text-body-sm text-text-secondary">Receitas do período</p>
          <p className="mt-1 text-subtitle font-semibold tabular-nums text-accent-green">{fmtMoeda(totais.receitas)}</p>
        </div>
        <div className="rounded-xl border border-border bg-bg-card p-4">
          <p className="text-body-sm text-text-secondary">Despesas do período</p>
          <p className="mt-1 text-subtitle font-semibold tabular-nums text-accent-red">{fmtMoeda(totais.despesas)}</p>
        </div>
        <div className="rounded-xl border border-border bg-bg-card p-4">
          <p className="text-body-sm text-text-secondary">Saldo do período</p>
          <p className="mt-1 text-subtitle font-semibold tabular-nums text-text-primary">{fmtMoeda(totais.saldo)}</p>
        </div>
      </div>

      {erro && !loading && (
        <div className="rounded-xl border border-accent-red/30 bg-accent-red/5 p-4 text-body-sm text-accent-red">
          {erro}
        </div>
      )}

      {loading ? (
        <SkeletonList rows={5} />
      ) : transacoes.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="Nenhuma transação neste período"
          description="Adicione sua primeira transação ou ajuste os filtros."
          actionLabel="Adicionar primeira transação"
          onAction={handleNovaTransacao}
        />
      ) : (
        <div className="space-y-2">
          {transacoes.map((t) => (
            <TransacaoItem key={t.id} transacao={t} onEdit={handleEditar} onDelete={setTransacaoExcluindo} />
          ))}
        </div>
      )}

      <Modal
        isOpen={modalForm}
        onClose={() => setModalForm(false)}
        title={transacaoEditando ? "Editar transação" : "Nova transação"}
      >
        <TransacaoForm
          transacaoEditando={transacaoEditando}
          onSave={handleSalvar}
          onCancel={() => setModalForm(false)}
        />
      </Modal>

      <Modal isOpen={modalImportar} onClose={() => setModalImportar(false)} title="Importar CSV" size="lg">
        <ImportarCSV onClose={() => setModalImportar(false)} />
      </Modal>

      <ConfirmDialog
        isOpen={!!transacaoExcluindo}
        onClose={() => setTransacaoExcluindo(null)}
        onConfirm={handleConfirmarExclusao}
        title="Excluir transação?"
        description="Tem certeza? Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        loading={excluindo}
      />
    </div>
  );
}
