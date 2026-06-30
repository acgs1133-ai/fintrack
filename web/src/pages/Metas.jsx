import { useEffect, useMemo, useState } from "react";
import { Plus, Target } from "lucide-react";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import EmptyState from "../components/ui/EmptyState";
import Skeleton from "../components/ui/Skeleton";
import MetaCard from "../components/metas/MetaCard";
import MetaForm from "../components/metas/MetaForm";
import { useMetas } from "../hooks/useMetas";
import { useToast } from "../hooks/useToast";

export default function Metas() {
  const { metas, loading, erro, fetchMetas, addMeta, updateMeta, depositarMeta, deleteMeta } = useMetas();
  const { showToast } = useToast();

  const [modalForm, setModalForm] = useState(false);
  const [metaEditando, setMetaEditando] = useState(null);
  const [metaExcluindo, setMetaExcluindo] = useState(null);
  const [excluindo, setExcluindo] = useState(false);

  useEffect(() => {
    fetchMetas().catch((err) => showToast(err.message, "error"));
  }, []);

  const metasOrdenadas = useMemo(
    () => [...metas].sort((a, b) => Number(a.concluida) - Number(b.concluida)),
    [metas]
  );

  function handleNova() {
    setMetaEditando(null);
    setModalForm(true);
  }

  function handleEditar(meta) {
    setMetaEditando(meta);
    setModalForm(true);
  }

  async function handleSalvar(payload) {
    if (metaEditando) {
      await updateMeta(metaEditando.id, payload);
    } else {
      await addMeta(payload);
    }
    setModalForm(false);
  }

  async function handleConfirmarExclusao() {
    setExcluindo(true);
    try {
      await deleteMeta(metaExcluindo.id);
      showToast("Meta excluída", "success");
      setMetaExcluindo(null);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setExcluindo(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-title font-semibold text-text-primary">Metas</h1>
        <Button variant="primary" onClick={handleNova}>
          <Plus size={16} />
          Nova meta
        </Button>
      </div>

      {erro && !loading && (
        <div className="rounded-xl border border-accent-red/30 bg-accent-red/5 p-4 text-body-sm text-accent-red">
          {erro}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Skeleton variant="card" className="h-44" />
          <Skeleton variant="card" className="h-44" />
        </div>
      ) : metas.length === 0 ? (
        <EmptyState
          icon={Target}
          title="Você ainda não tem metas"
          description="Crie metas financeiras e acompanhe seu progresso."
          actionLabel="Criar primeira meta"
          onAction={handleNova}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {metasOrdenadas.map((meta) => (
            <MetaCard
              key={meta.id}
              meta={meta}
              onEdit={handleEditar}
              onDelete={setMetaExcluindo}
              onDepositar={depositarMeta}
            />
          ))}
        </div>
      )}

      <Modal isOpen={modalForm} onClose={() => setModalForm(false)} title={metaEditando ? "Editar meta" : "Nova meta"}>
        <MetaForm metaEditando={metaEditando} onSave={handleSalvar} onCancel={() => setModalForm(false)} />
      </Modal>

      <ConfirmDialog
        isOpen={!!metaExcluindo}
        onClose={() => setMetaExcluindo(null)}
        onConfirm={handleConfirmarExclusao}
        title="Excluir meta?"
        description="Tem certeza? Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        loading={excluindo}
      />
    </div>
  );
}
