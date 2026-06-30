import { useState } from "react";
import { Zap, CornerDownLeft, RotateCcw, X } from "lucide-react";
import Button from "../ui/Button";
import Select from "../ui/Select";
import Modal from "../ui/Modal";
import TransacaoForm from "./TransacaoForm";
import { useAppStore } from "../../store/useAppStore";
import { useToast } from "../../hooks/useToast";
import { parseLancamentoRapido } from "../../utils/validators";
import { dataParaInputValue, fmtMoeda } from "../../utils/formatters";
import { essencialidadePadrao } from "../../utils/essencialidade";

// Lançamento rápido: "café 15" -> sugere categoria pelo histórico e salva em 1 clique.
export default function LancamentoRapido({ ultimaTransacao, onSaved }) {
  const categorias = useAppStore((s) => s.categorias);
  const sugerirCategoria = useAppStore((s) => s.sugerirCategoria);
  const addTransacao = useAppStore((s) => s.addTransacao);
  const { showToast } = useToast();

  const [texto, setTexto] = useState("");
  const [rascunho, setRascunho] = useState(null); // { descricao, valor, categoriaId, essencial, fonte }
  const [analisando, setAnalisando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [modalRepetir, setModalRepetir] = useState(false);

  const categoriaOutros = categorias.find((c) => c.nome === "Outros");

  async function analisar(e) {
    e?.preventDefault();
    const { descricao, valor } = parseLancamentoRapido(texto);
    if (!descricao) {
      showToast("Descreva o gasto. Ex: café 15", "error");
      return;
    }
    if (valor == null) {
      showToast("Inclua um valor. Ex: café 15", "error");
      return;
    }

    setAnalisando(true);
    let categoriaId = categoriaOutros?.id || categorias[0]?.id || "";
    let essencial = null;
    let fonte = "padrao";
    try {
      const res = await sugerirCategoria(descricao);
      if (res?.categoria) {
        categoriaId = res.categoria.id;
        essencial = res.essencial || null;
        fonte = res.fonte;
      }
    } catch {
      // segue com a categoria padrão "Outros"
    } finally {
      setAnalisando(false);
    }
    setRascunho({ descricao, valor, categoriaId, essencial, fonte });
  }

  async function salvar() {
    if (!rascunho) return;
    setSalvando(true);
    try {
      await addTransacao({
        descricao: rascunho.descricao,
        valor: rascunho.valor,
        tipo: "DESPESA",
        categoriaId: rascunho.categoriaId,
        data: new Date(dataParaInputValue(new Date())).toISOString(),
        recorrente: false,
        essencial: rascunho.essencial || null,
      });
      showToast("Transação adicionada", "success");
      setTexto("");
      setRascunho(null);
      onSaved?.();
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSalvando(false);
    }
  }

  // Base para "repetir última": copia categoria/valor/descrição com a data de hoje.
  const baseRepetir = ultimaTransacao
    ? {
        descricao: ultimaTransacao.descricao,
        valor: Math.abs(ultimaTransacao.valor),
        tipo: ultimaTransacao.tipo,
        categoriaId: ultimaTransacao.categoriaId,
        essencial: ultimaTransacao.essencial || null,
        recorrente: false,
        data: new Date().toISOString(),
      }
    : null;

  async function salvarRepetida(payload) {
    await addTransacao(payload);
    setModalRepetir(false);
    onSaved?.();
  }

  return (
    <div className="rounded-xl border border-accent-green/25 bg-accent-green/5 p-4">
      <div className="mb-2 flex items-center gap-2">
        <Zap size={16} className="text-accent-green" />
        <p className="text-body-sm font-medium text-text-primary">Lançamento rápido</p>
      </div>

      <form onSubmit={analisar} className="flex gap-2">
        <div className="relative flex-1">
          <input
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder='Ex: "café 15" ou "uber 23,50"'
            className="w-full rounded-lg border border-border bg-bg-hover px-3 py-2 pr-9 text-body text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent-green"
          />
          <CornerDownLeft
            size={15}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-muted"
          />
        </div>
        <Button variant="primary" type="submit" loading={analisando}>
          Lançar
        </Button>
        {baseRepetir && (
          <Button variant="ghost" type="button" onClick={() => setModalRepetir(true)}>
            <RotateCcw size={15} />
            <span className="hidden sm:inline">Repetir última</span>
          </Button>
        )}
      </form>

      {rascunho && (
        <div className="mt-3 rounded-lg border border-border bg-bg-card p-3 animate-fade-in">
          <div className="mb-3 flex items-center justify-between">
            <div className="min-w-0">
              <p className="truncate text-body-sm font-medium text-text-primary">{rascunho.descricao}</p>
              <p className="text-muted text-text-muted">
                {rascunho.fonte === "padrao"
                  ? "Sem correspondência no histórico — usando padrão. Ajuste a categoria se quiser."
                  : "Categoria sugerida pelo seu histórico. Você pode trocar."}
              </p>
            </div>
            <span className="shrink-0 text-subtitle font-semibold tabular-nums text-accent-red">
              {fmtMoeda(rascunho.valor)}
            </span>
          </div>

          <div className="flex items-end gap-2">
            <Select
              label="Categoria"
              value={rascunho.categoriaId}
              onChange={(e) => {
                const id = e.target.value;
                const cat = categorias.find((c) => c.id === id);
                setRascunho({ ...rascunho, categoriaId: id, essencial: essencialidadePadrao(cat?.nome) });
              }}
              className="flex-1"
            >
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </Select>
            <Button variant="primary" onClick={salvar} loading={salvando}>
              Salvar
            </Button>
            <button
              type="button"
              onClick={() => setRascunho(null)}
              aria-label="Cancelar"
              className="mb-1 rounded-lg p-2 text-text-secondary hover:bg-bg-hover hover:text-text-primary"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      <Modal isOpen={modalRepetir} onClose={() => setModalRepetir(false)} title="Repetir transação">
        <TransacaoForm
          transacaoEditando={baseRepetir}
          onSave={salvarRepetida}
          onCancel={() => setModalRepetir(false)}
        />
      </Modal>
    </div>
  );
}
