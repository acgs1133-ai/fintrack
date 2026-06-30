import { Plus, Trash2, Users } from "lucide-react";
import Input from "../ui/Input";
import { fmtMoeda } from "../../utils/formatters";

// Campos de "dividir conta" usados dentro do TransacaoForm.
// `participantes` são as outras pessoas (além do usuário). A divisão padrão é
// igualitária entre todos (usuário + participantes), com valor editável por pessoa.
export default function DivisaoFields({ ativo, onToggle, participantes, onChange, valorTotal }) {
  const numPessoas = participantes.length + 1;
  const parteIgual = numPessoas > 0 ? valorTotal / numPessoas : 0;
  const suaParte = valorTotal - participantes.reduce((acc, p) => acc + (parseFloat(String(p.valor).replace(",", ".")) || 0), 0);

  function atualizarParticipante(idx, campo, valor) {
    onChange(participantes.map((p, i) => (i === idx ? { ...p, [campo]: valor } : p)));
  }

  function adicionar() {
    onChange([...participantes, { nome: "", valor: parteIgual ? parteIgual.toFixed(2).replace(".", ",") : "" }]);
  }

  function remover(idx) {
    onChange(participantes.filter((_, i) => i !== idx));
  }

  return (
    <div className="rounded-lg border border-border bg-bg-hover/40 p-3">
      <label className="flex items-center gap-2 text-body-sm text-text-secondary">
        <input
          type="checkbox"
          checked={ativo}
          onChange={(e) => {
            onToggle(e.target.checked);
            if (e.target.checked && participantes.length === 0) adicionar();
          }}
          className="h-4 w-4 rounded border-border bg-bg-hover accent-accent-green"
        />
        <Users size={15} className="text-accent-green" />
        Dividir esta conta
      </label>

      {ativo && (
        <div className="mt-3 space-y-3">
          {participantes.length === 0 ? (
            <p className="text-muted text-text-muted">Adicione ao menos uma pessoa para dividir.</p>
          ) : (
            participantes.map((p, idx) => (
              <div key={idx} className="flex items-end gap-2">
                <Input
                  label={idx === 0 ? "Pessoa" : undefined}
                  value={p.nome}
                  onChange={(e) => atualizarParticipante(idx, "nome", e.target.value)}
                  placeholder="Nome"
                  className="flex-1"
                />
                <Input
                  label={idx === 0 ? "Deve" : undefined}
                  value={p.valor}
                  onChange={(e) => atualizarParticipante(idx, "valor", e.target.value)}
                  placeholder="0,00"
                  inputMode="decimal"
                  className="w-28"
                />
                <button
                  type="button"
                  onClick={() => remover(idx)}
                  aria-label="Remover pessoa"
                  className="mb-1.5 rounded-lg p-2 text-text-secondary hover:bg-bg-base hover:text-accent-red"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))
          )}

          <button
            type="button"
            onClick={adicionar}
            className="inline-flex items-center gap-1.5 text-body-sm font-medium text-accent-green hover:underline"
          >
            <Plus size={14} />
            Adicionar pessoa
          </button>

          <div className="flex items-center justify-between rounded-lg bg-bg-base px-3 py-2 text-body-sm">
            <span className="text-text-secondary">
              Dividido entre {numPessoas} {numPessoas === 1 ? "pessoa" : "pessoas"}
            </span>
            <span className="tabular-nums font-medium text-text-primary">Sua parte: {fmtMoeda(suaParte)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
