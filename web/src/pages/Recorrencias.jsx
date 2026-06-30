import { useEffect, useMemo, useState } from "react";
import { Repeat, AlertTriangle } from "lucide-react";
import EmptyState from "../components/ui/EmptyState";
import { SkeletonList } from "../components/ui/Skeleton";
import RecorrenciaItem from "../components/recorrencias/RecorrenciaItem";
import api from "../services/api";
import { useAppStore } from "../store/useAppStore";
import { useToast } from "../hooks/useToast";
import { fmtMoeda } from "../utils/formatters";

export default function Recorrencias() {
  const setRecorrenciaStatus = useAppStore((s) => s.setRecorrenciaStatus);
  const { showToast } = useToast();

  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  async function carregar() {
    setLoading(true);
    setErro(null);
    try {
      const data = await api.get("/api/recorrencias");
      setSeries(data);
    } catch (err) {
      setErro(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  async function handleToggle(serie, ativa) {
    try {
      await setRecorrenciaStatus({ chave: serie.chave, descricao: serie.descricao, ativa });
      showToast(ativa ? "Recorrência reativada" : "Recorrência cancelada", "success");
      await carregar();
    } catch (err) {
      showToast(err.message, "error");
    }
  }

  const ativas = useMemo(() => series.filter((s) => s.ativa), [series]);
  const inativas = useMemo(() => series.filter((s) => !s.ativa), [series]);

  const totalDespesasMes = useMemo(
    () => ativas.filter((s) => s.tipo === "DESPESA").reduce((acc, s) => acc + s.valorAtual, 0),
    [ativas]
  );
  const alteradas = useMemo(() => ativas.filter((s) => s.mudou), [ativas]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-title font-semibold text-text-primary">Recorrências e assinaturas</h1>
        <p className="text-body-sm text-text-secondary">
          Contas fixas e assinaturas detectadas nas suas transações recorrentes.
        </p>
      </div>

      {erro && !loading && (
        <div className="rounded-xl border border-accent-red/30 bg-accent-red/5 p-4 text-body-sm text-accent-red">
          {erro}
        </div>
      )}

      {loading ? (
        <SkeletonList rows={4} />
      ) : series.length === 0 ? (
        <EmptyState
          icon={Repeat}
          title="Nenhuma recorrência cadastrada"
          description="Marque uma transação como recorrente (mensal) ao criá-la para acompanhar suas assinaturas e contas fixas aqui."
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-bg-card p-4">
              <p className="text-body-sm text-text-secondary">Despesas fixas ativas / mês</p>
              <p className="mt-1 text-subtitle font-semibold tabular-nums text-text-primary">
                {fmtMoeda(totalDespesasMes)}
              </p>
            </div>
            <div className="rounded-xl border border-border bg-bg-card p-4">
              <p className="text-body-sm text-text-secondary">Assinaturas ativas</p>
              <p className="mt-1 text-subtitle font-semibold tabular-nums text-text-primary">{ativas.length}</p>
            </div>
          </div>

          {alteradas.length > 0 && (
            <div className="flex items-start gap-2 rounded-xl border border-accent-yellow/30 bg-accent-yellow/5 p-4 text-body-sm text-accent-yellow">
              <AlertTriangle size={16} className="mt-0.5 shrink-0" />
              <span>
                {alteradas.length} recorrência(s) tiveram o valor alterado em relação ao mês anterior. Confira abaixo.
              </span>
            </div>
          )}

          {ativas.length > 0 && (
            <div className="space-y-3">
              {ativas.map((s) => (
                <RecorrenciaItem key={s.chave} serie={s} onToggleStatus={handleToggle} />
              ))}
            </div>
          )}

          {inativas.length > 0 && (
            <div className="space-y-3">
              <p className="text-body-sm font-medium text-text-secondary">Canceladas / inativas</p>
              {inativas.map((s) => (
                <RecorrenciaItem key={s.chave} serie={s} onToggleStatus={handleToggle} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
