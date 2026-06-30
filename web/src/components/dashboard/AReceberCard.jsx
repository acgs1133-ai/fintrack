import { useEffect, useState } from "react";
import { HandCoins, Check, Undo2 } from "lucide-react";
import api from "../../services/api";
import { useAppStore } from "../../store/useAppStore";
import { useToast } from "../../hooks/useToast";
import { fmtMoeda, fmtData } from "../../utils/formatters";

// Histórico de "a receber" por pessoa (contas divididas), com opção de quitar.
export default function AReceberCard() {
  const toggleParticipante = useAppStore((s) => s.toggleParticipante);
  const { showToast } = useToast();
  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processando, setProcessando] = useState(null);

  async function carregar() {
    try {
      const data = await api.get("/api/divisoes/a-receber");
      setDados(data);
    } catch {
      setDados({ pessoas: [], totalAberto: 0 });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  async function alternar(item) {
    setProcessando(item.participanteId);
    try {
      await toggleParticipante(item.participanteId, !item.quitado);
      await carregar();
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setProcessando(null);
    }
  }

  // Sem nenhuma conta dividida ainda: não polui o dashboard.
  if (loading || !dados || dados.pessoas.length === 0) return null;

  return (
    <div className="rounded-xl border border-border bg-bg-card p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HandCoins size={16} className="text-accent-cyan" />
          <p className="text-body-sm font-medium text-text-secondary">A receber (contas divididas)</p>
        </div>
        <span className="text-body-sm font-semibold tabular-nums text-accent-cyan">
          {fmtMoeda(dados.totalAberto)}
        </span>
      </div>

      <div className="mt-3 space-y-4">
        {dados.pessoas.map((pessoa) => (
          <div key={pessoa.nome}>
            <div className="flex items-center justify-between">
              <span className="text-body-sm font-medium text-text-primary">{pessoa.nome}</span>
              <span className="text-body-sm tabular-nums text-text-secondary">
                {pessoa.aberto > 0 ? `${fmtMoeda(pessoa.aberto)} em aberto` : "tudo quitado"}
              </span>
            </div>
            <div className="mt-1.5 divide-y divide-border">
              {pessoa.itens.map((item) => (
                <div key={item.participanteId} className="flex items-center gap-2 py-1.5">
                  <div className="min-w-0 flex-1">
                    <p className={`truncate text-body-sm ${item.quitado ? "text-text-muted line-through" : "text-text-primary"}`}>
                      {item.descricao}
                    </p>
                    {item.data && <p className="text-muted text-text-muted">{fmtData(item.data)}</p>}
                  </div>
                  <span className={`shrink-0 text-body-sm tabular-nums ${item.quitado ? "text-text-muted" : "text-text-primary"}`}>
                    {fmtMoeda(item.valor)}
                  </span>
                  <button
                    onClick={() => alternar(item)}
                    disabled={processando === item.participanteId}
                    className={`shrink-0 rounded-lg p-2 transition-colors disabled:opacity-50 ${
                      item.quitado
                        ? "text-text-muted hover:bg-bg-hover"
                        : "text-accent-green hover:bg-accent-green/10"
                    }`}
                    aria-label={item.quitado ? "Reabrir" : "Marcar como quitado"}
                    title={item.quitado ? "Reabrir" : "Marcar como quitado"}
                  >
                    {item.quitado ? <Undo2 size={15} /> : <Check size={15} />}
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
