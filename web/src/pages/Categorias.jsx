import { useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Tags } from "lucide-react";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Modal from "../components/ui/Modal";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import EmptyState from "../components/ui/EmptyState";
import Skeleton from "../components/ui/Skeleton";
import { useCategorias } from "../hooks/useCategorias";
import { useToast } from "../hooks/useToast";
import { validarCategoria } from "../utils/validators";
import { fmtMoeda, fmtPorcentagem } from "../utils/formatters";
import api from "../services/api";

const CORES_PREDEFINIDAS = [
  "#22C55E", "#EF4444", "#3B82F6", "#EAB308",
  "#A855F7", "#F97316", "#06B6D4", "#71717A",
  "#EC4899", "#14B8A6", "#F59E0B", "#6366F1",
];

const hoje = new Date();

function CategoriaForm({ categoriaEditando, onSave, onCancel }) {
  const { showToast } = useToast();
  const [nome, setNome] = useState(categoriaEditando?.nome || "");
  const [cor, setCor] = useState(categoriaEditando?.cor || CORES_PREDEFINIDAS[0]);
  const [orcamento, setOrcamento] = useState(
    categoriaEditando?.orcamento ? String(categoriaEditando.orcamento) : ""
  );
  const [erros, setErros] = useState({});
  const [salvando, setSalvando] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    const { erros: errosValidacao, valido } = validarCategoria({ nome, orcamento });
    setErros(errosValidacao);
    if (!valido) return;

    setSalvando(true);
    try {
      await onSave({
        nome: nome.trim(),
        cor,
        orcamento: orcamento ? Number(orcamento.replace(",", ".")) : null,
      });
      showToast(categoriaEditando ? "Categoria atualizada" : "Categoria criada", "success");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Nome" required value={nome} onChange={(e) => setNome(e.target.value)} error={erros.nome} />

      <div>
        <label className="mb-1.5 block text-body-sm font-medium text-text-secondary">Cor</label>
        <div className="flex flex-wrap gap-2">
          {CORES_PREDEFINIDAS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCor(c)}
              aria-label={`Selecionar cor ${c}`}
              className={`h-8 w-8 rounded-full transition-transform ${cor === c ? "ring-2 ring-offset-2 ring-offset-bg-card ring-text-primary scale-110" : ""}`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>

      <Input
        label="Orçamento mensal (opcional)"
        value={orcamento}
        onChange={(e) => setOrcamento(e.target.value)}
        placeholder="0,00"
        inputMode="decimal"
        error={erros.orcamento}
      />

      <div className="flex justify-end gap-2 pt-2">
        <Button variant="ghost" type="button" onClick={onCancel}>
          Cancelar
        </Button>
        <Button variant="primary" type="submit" loading={salvando}>
          Salvar
        </Button>
      </div>
    </form>
  );
}

export default function Categorias() {
  const { categorias, loading, erro, fetchCategorias, addCategoria, updateCategoria, deleteCategoria } =
    useCategorias();
  const { showToast } = useToast();

  const [gastosPorCategoria, setGastosPorCategoria] = useState({});
  const [modalForm, setModalForm] = useState(false);
  const [categoriaEditando, setCategoriaEditando] = useState(null);
  const [categoriaExcluindo, setCategoriaExcluindo] = useState(null);
  const [excluindo, setExcluindo] = useState(false);
  const [erroExclusao, setErroExclusao] = useState(null);

  useEffect(() => {
    fetchCategorias().catch((err) => showToast(err.message, "error"));
    api
      .get("/api/relatorios/por-categoria", { params: { mes: hoje.getMonth() + 1, ano: hoje.getFullYear() } })
      .then((data) => {
        const mapa = {};
        data.forEach((d) => {
          mapa[d.id] = d.gasto;
        });
        setGastosPorCategoria(mapa);
      })
      .catch(() => {});
  }, []);

  function handleNova() {
    setCategoriaEditando(null);
    setModalForm(true);
  }

  function handleEditar(categoria) {
    setCategoriaEditando(categoria);
    setModalForm(true);
  }

  async function handleSalvar(payload) {
    if (categoriaEditando) {
      await updateCategoria(categoriaEditando.id, payload);
    } else {
      await addCategoria(payload);
    }
    setModalForm(false);
    await fetchCategorias();
  }

  async function handleConfirmarExclusao() {
    setExcluindo(true);
    setErroExclusao(null);
    try {
      await deleteCategoria(categoriaExcluindo.id);
      showToast("Categoria excluída", "success");
      setCategoriaExcluindo(null);
    } catch (err) {
      setErroExclusao(err.message);
    } finally {
      setExcluindo(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-title font-semibold text-text-primary">Categorias</h1>
        <Button variant="primary" onClick={handleNova}>
          <Plus size={16} />
          Nova categoria
        </Button>
      </div>

      {erro && !loading && (
        <div className="rounded-xl border border-accent-red/30 bg-accent-red/5 p-4 text-body-sm text-accent-red">
          {erro}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} variant="card" className="h-36" />
          ))}
        </div>
      ) : categorias.length === 0 ? (
        <EmptyState
          icon={Tags}
          title="Nenhuma categoria cadastrada"
          description="Crie categorias para organizar suas transações."
          actionLabel="Criar primeira categoria"
          onAction={handleNova}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categorias.map((categoria) => {
            const gasto = gastosPorCategoria[categoria.id] || 0;
            const percentual = categoria.orcamento ? Math.min((gasto / categoria.orcamento) * 100, 100) : 0;
            let corBarra = "bg-accent-green";
            if (percentual >= 90) corBarra = "bg-accent-red";
            else if (percentual >= 70) corBarra = "bg-accent-yellow";

            return (
              <div key={categoria.id} className="group rounded-xl border border-border bg-bg-card p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: categoria.cor }} />
                    <span className="text-body font-medium text-text-primary">{categoria.nome}</span>
                  </div>
                  <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      onClick={() => handleEditar(categoria)}
                      aria-label="Editar categoria"
                      className="rounded-lg p-1.5 text-text-secondary hover:bg-bg-hover hover:text-accent-blue"
                    >
                      <Pencil size={14} />
                    </button>
                    {!categoria.sistema && (
                      <button
                        onClick={() => {
                          setErroExclusao(null);
                          setCategoriaExcluindo(categoria);
                        }}
                        aria-label="Excluir categoria"
                        className="rounded-lg p-1.5 text-text-secondary hover:bg-bg-hover hover:text-accent-red"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>

                <p className="mt-3 text-muted text-text-muted">
                  {categoria.orcamento ? `Orçamento: ${fmtMoeda(categoria.orcamento)}` : "Sem limite"}
                </p>
                <p className="mt-1 text-body-sm tabular-nums text-text-secondary">{fmtMoeda(gasto)} gastos este mês</p>

                {categoria.orcamento ? (
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-bg-hover">
                    <div className={`h-full rounded-full ${corBarra}`} style={{ width: `${percentual}%` }} />
                  </div>
                ) : null}

                <p className="mt-2 text-muted text-text-muted">
                  {categoria._count?.transacoes || 0} transações
                  {categoria.orcamento ? ` · ${fmtPorcentagem(gasto, categoria.orcamento)} do orçamento` : ""}
                </p>
              </div>
            );
          })}
        </div>
      )}

      <Modal
        isOpen={modalForm}
        onClose={() => setModalForm(false)}
        title={categoriaEditando ? "Editar categoria" : "Nova categoria"}
      >
        <CategoriaForm
          categoriaEditando={categoriaEditando}
          onSave={handleSalvar}
          onCancel={() => setModalForm(false)}
        />
      </Modal>

      <ConfirmDialog
        isOpen={!!categoriaExcluindo}
        onClose={() => setCategoriaExcluindo(null)}
        onConfirm={handleConfirmarExclusao}
        title="Excluir categoria?"
        description={erroExclusao || "Tem certeza? Esta ação não pode ser desfeita."}
        confirmLabel="Excluir"
        loading={excluindo}
      />
    </div>
  );
}
