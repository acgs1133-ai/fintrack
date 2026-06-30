import { useEffect, useRef, useState } from "react";
import Input from "../ui/Input";
import Select from "../ui/Select";
import Button from "../ui/Button";
import DivisaoFields from "./DivisaoFields";
import { useCategorias } from "../../hooks/useCategorias";
import { useToast } from "../../hooks/useToast";
import { useAppStore } from "../../store/useAppStore";
import { validarTransacao, parseValorMonetario } from "../../utils/validators";
import { dataParaInputValue } from "../../utils/formatters";
import { essencialidadePadrao } from "../../utils/essencialidade";

const OPCOES_ESSENCIAL = [
  { valor: "", label: "—" },
  { valor: "NECESSIDADE", label: "Necessidade" },
  { valor: "DESEJO", label: "Desejo" },
];

export default function TransacaoForm({ transacaoEditando, onSave, onCancel }) {
  const { categorias, fetchCategorias } = useCategorias();
  const { showToast } = useToast();
  const sugerirCategoria = useAppStore((s) => s.sugerirCategoria);

  const [descricao, setDescricao] = useState(transacaoEditando?.descricao || "");
  const [valor, setValor] = useState(
    transacaoEditando ? String(Math.abs(transacaoEditando.valor)).replace(".", ",") : ""
  );
  const [tipo, setTipo] = useState(transacaoEditando?.tipo || "DESPESA");
  const [categoriaId, setCategoriaId] = useState(transacaoEditando?.categoriaId || "");
  const [data, setData] = useState(
    transacaoEditando ? dataParaInputValue(transacaoEditando.data) : dataParaInputValue(new Date())
  );
  const [recorrente, setRecorrente] = useState(transacaoEditando?.recorrente || false);
  const [essencial, setEssencial] = useState(transacaoEditando?.essencial || "");
  const [divisaoAtiva, setDivisaoAtiva] = useState(!!transacaoEditando?.divisao);
  const [participantes, setParticipantes] = useState(
    transacaoEditando?.divisao?.participantes?.map((p) => ({
      nome: p.nome,
      valor: String(p.valor).replace(".", ","),
    })) || []
  );
  const [sugestao, setSugestao] = useState(null);
  const [erros, setErros] = useState({});
  const [avisoDataFutura, setAvisoDataFutura] = useState(null);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (categorias.length === 0) fetchCategorias().catch(() => {});
  }, []);

  // Lembra se o usuário escolheu manualmente categoria/essencialidade para não sobrescrever.
  const categoriaManual = useRef(!!transacaoEditando?.categoriaId);
  const essencialManual = useRef(!!transacaoEditando?.essencial);

  // Sugestão automática de categoria com base no histórico (debounce).
  useEffect(() => {
    if (categoriaManual.current || descricao.trim().length < 2) {
      setSugestao(null);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await sugerirCategoria(descricao.trim());
        if (res?.categoria && !categoriaManual.current) {
          setCategoriaId(res.categoria.id);
          setSugestao({ nome: res.categoria.nome, fonte: res.fonte });
          if (!essencialManual.current && res.essencial) setEssencial(res.essencial);
        } else {
          setSugestao(null);
        }
      } catch {
        // sugestão é best-effort; silencia falhas
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [descricao]);

  function handleCategoria(e) {
    const id = e.target.value;
    categoriaManual.current = true;
    setSugestao(null);
    setCategoriaId(id);
    if (!essencialManual.current) {
      const cat = categorias.find((c) => c.id === id);
      setEssencial(essencialidadePadrao(cat?.nome) || "");
    }
  }

  function handleEssencial(e) {
    essencialManual.current = true;
    setEssencial(e.target.value);
  }

  const sujo =
    descricao !== (transacaoEditando?.descricao || "") ||
    valor !== (transacaoEditando ? String(Math.abs(transacaoEditando.valor)).replace(".", ",") : "");

  function handleCancelar() {
    if (sujo && !window.confirm("Descartar as alterações não salvas?")) return;
    onCancel();
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const { erros: errosValidacao, valido, avisoDataFutura: aviso } = validarTransacao({
      descricao,
      valor,
      categoriaId,
      data,
      tipo,
    });

    setErros(errosValidacao);
    setAvisoDataFutura(aviso);
    if (!valido) return;

    const valorNum = parseValorMonetario(valor);
    const participantesValidos = participantes
      .filter((p) => p.nome.trim())
      .map((p) => ({
        nome: p.nome.trim(),
        valor: p.valor ? Math.abs(parseValorMonetario(p.valor)) : undefined,
      }));

    setSalvando(true);
    try {
      const payload = {
        descricao: descricao.trim(),
        valor: valorNum,
        tipo,
        categoriaId,
        data: new Date(data).toISOString(),
        recorrente,
        essencial: essencial || null,
        divisao:
          divisaoAtiva && participantesValidos.length > 0
            ? { numPessoas: participantesValidos.length + 1, participantes: participantesValidos }
            : null,
      };
      await onSave(payload);
      showToast(transacaoEditando ? "Transação atualizada" : "Transação adicionada", "success");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex rounded-lg border border-border bg-bg-hover p-1">
        <button
          type="button"
          onClick={() => { setTipo("DESPESA"); setCategoriaId(""); categoriaManual.current = false; setSugestao(null); }}
          className={`flex-1 rounded-md py-2 text-body-sm font-medium transition-colors ${
            tipo === "DESPESA" ? "bg-accent-red/15 text-accent-red" : "text-text-secondary"
          }`}
        >
          Despesa
        </button>
        <button
          type="button"
          onClick={() => { setTipo("RECEITA"); setCategoriaId(""); categoriaManual.current = false; setSugestao(null); }}
          className={`flex-1 rounded-md py-2 text-body-sm font-medium transition-colors ${
            tipo === "RECEITA" ? "bg-accent-green/15 text-accent-green" : "text-text-secondary"
          }`}
        >
          Receita
        </button>
      </div>

      <Input
        label="Descrição"
        required
        value={descricao}
        onChange={(e) => setDescricao(e.target.value)}
        placeholder="Ex: Supermercado"
        error={erros.descricao}
      />

      <Input
        label="Valor"
        required
        value={valor}
        onChange={(e) => setValor(e.target.value)}
        placeholder="0,00"
        inputMode="decimal"
        error={erros.valor}
      />

      <div>
        <Select label="Categoria" required value={categoriaId} onChange={handleCategoria} error={erros.categoria}>
          <option value="">Selecione uma categoria</option>
          {categorias
            .filter((c) => c.tipoCat === tipo || c.tipoCat === "AMBOS")
            .map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
        </Select>
        {sugestao && (
          <p className="mt-1.5 text-muted text-accent-green">
            Sugerido a partir do seu histórico: {sugestao.nome}. Você pode trocar.
          </p>
        )}
      </div>

      {tipo === "DESPESA" && (
        <Select label="Necessidade ou desejo?" value={essencial} onChange={handleEssencial}>
          {OPCOES_ESSENCIAL.map((o) => (
            <option key={o.valor} value={o.valor}>
              {o.label}
            </option>
          ))}
        </Select>
      )}

      <div>
        <Input
          label="Data"
          required
          type="date"
          value={data}
          onChange={(e) => setData(e.target.value)}
          error={erros.data}
        />
        {avisoDataFutura && <p className="mt-1.5 text-muted text-accent-yellow">{avisoDataFutura}</p>}
      </div>

      <label className="flex items-center gap-2 text-body-sm text-text-secondary">
        <input
          type="checkbox"
          checked={recorrente}
          onChange={(e) => setRecorrente(e.target.checked)}
          className="h-4 w-4 rounded border-border bg-bg-hover accent-accent-green"
        />
        Transação recorrente (mensal)
      </label>

      {tipo === "DESPESA" && (
        <DivisaoFields
          ativo={divisaoAtiva}
          onToggle={setDivisaoAtiva}
          participantes={participantes}
          onChange={setParticipantes}
          valorTotal={parseValorMonetario(valor) || 0}
        />
      )}

      <div className="flex justify-end gap-2 pt-2">
        <Button variant="ghost" type="button" onClick={handleCancelar}>
          Cancelar
        </Button>
        <Button variant="primary" type="submit" loading={salvando}>
          Salvar
        </Button>
      </div>
    </form>
  );
}
