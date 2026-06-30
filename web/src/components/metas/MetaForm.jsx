import { useState } from "react";
import Input from "../ui/Input";
import Button from "../ui/Button";
import { useToast } from "../../hooks/useToast";
import { validarMeta, parseValorMonetario } from "../../utils/validators";
import { dataParaInputValue } from "../../utils/formatters";

export default function MetaForm({ metaEditando, onSave, onCancel }) {
  const { showToast } = useToast();
  const [nome, setNome] = useState(metaEditando?.nome || "");
  const [valorAlvo, setValorAlvo] = useState(metaEditando ? String(metaEditando.valorAlvo).replace(".", ",") : "");
  const [prazo, setPrazo] = useState(metaEditando ? dataParaInputValue(metaEditando.prazo) : "");
  const [erros, setErros] = useState({});
  const [salvando, setSalvando] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    const { erros: errosValidacao, valido } = validarMeta({ nome, valorAlvo, prazo });
    setErros(errosValidacao);
    if (!valido) return;

    setSalvando(true);
    try {
      await onSave({
        nome: nome.trim(),
        valorAlvo: parseValorMonetario(valorAlvo),
        prazo: new Date(prazo).toISOString(),
      });
      showToast(metaEditando ? "Meta atualizada" : "Meta criada", "success");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Nome da meta" required value={nome} onChange={(e) => setNome(e.target.value)} error={erros.nome} placeholder="Ex: Notebook novo" />
      <Input
        label="Valor alvo"
        required
        value={valorAlvo}
        onChange={(e) => setValorAlvo(e.target.value)}
        placeholder="0,00"
        inputMode="decimal"
        error={erros.valorAlvo}
      />
      <Input
        label="Prazo"
        required
        type="date"
        value={prazo}
        onChange={(e) => setPrazo(e.target.value)}
        error={erros.prazo}
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
