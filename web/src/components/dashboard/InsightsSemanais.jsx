import { useEffect, useState } from "react";
import { Lightbulb, RefreshCw, AlertTriangle, Target, Info } from "lucide-react";
import api from "../../services/api";

const ICONE = { alerta: AlertTriangle, meta: Target };
const COR = { alerta: "text-accent-yellow", meta: "text-accent-blue" };

// Insights acionáveis baseados em regras (variação de categoria, recorrência que subiu, ritmo de meta).
export default function InsightsSemanais() {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  async function carregar() {
    setLoading(true);
    setErro(null);
    try {
      const data = await api.get("/api/insights");
      setInsights(data);
    } catch (err) {
      setErro(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  return (
    <div className="rounded-xl border border-accent-blue/20 bg-accent-blue/5 p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Lightbulb size={16} className="text-accent-blue" />
          <p className="text-body-sm font-medium text-text-primary">Insights da semana</p>
        </div>
        <button
          onClick={carregar}
          disabled={loading}
          aria-label="Atualizar insights"
          className="rounded-lg p-1.5 text-text-secondary hover:bg-bg-hover hover:text-text-primary disabled:opacity-50"
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {erro ? (
        <p className="mt-3 text-body-sm text-accent-red">{erro}</p>
      ) : loading ? (
        <p className="mt-3 text-body-sm text-text-muted">Analisando seus dados...</p>
      ) : insights.length === 0 ? (
        <p className="mt-3 flex items-center gap-2 text-body-sm text-text-secondary">
          <Info size={15} className="text-text-muted" />
          Tudo sob controle por aqui — nenhum alerta no período.
        </p>
      ) : (
        <ul className="mt-3 space-y-2.5">
          {insights.map((i, idx) => {
            const Icon = ICONE[i.tipo] || Info;
            return (
              <li key={idx} className="flex items-start gap-2.5 text-body-sm text-text-secondary">
                <Icon size={15} className={`mt-0.5 shrink-0 ${COR[i.tipo] || "text-text-muted"}`} />
                <span>{i.texto}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
