import { Scale } from "lucide-react";
import { fmtMoeda } from "../../utils/formatters";

// Proporção necessidade vs desejo das despesas do período.
export default function EssencialidadeResumo({ dados }) {
  const necessidade = dados?.necessidade || 0;
  const desejo = dados?.desejo || 0;
  const naoClassificado = dados?.naoClassificado || 0;
  const classificado = necessidade + desejo;

  return (
    <div className="rounded-xl border border-border bg-bg-card p-5">
      <div className="flex items-center gap-2">
        <Scale size={16} className="text-accent-purple" />
        <p className="text-body-sm font-medium text-text-secondary">Necessidade vs desejo</p>
      </div>

      {classificado === 0 ? (
        <p className="py-6 text-center text-body-sm text-text-muted">
          Classifique suas despesas como necessidade ou desejo para ver a proporção aqui.
        </p>
      ) : (
        <>
          <p className="mt-3 text-subtitle font-semibold text-text-primary">
            {dados.percentNecessidade}% necessidade{" "}
            <span className="text-text-muted">/</span> {dados.percentDesejo}% desejo
          </p>

          <div className="mt-3 flex h-2.5 w-full overflow-hidden rounded-full bg-bg-hover">
            <div className="h-full bg-accent-green" style={{ width: `${dados.percentNecessidade}%` }} />
            <div className="h-full bg-accent-yellow" style={{ width: `${dados.percentDesejo}%` }} />
          </div>

          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-body-sm">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-accent-green" />
              <span className="text-text-secondary">Necessidade</span>
              <span className="tabular-nums text-text-primary">{fmtMoeda(necessidade)}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-accent-yellow" />
              <span className="text-text-secondary">Desejo</span>
              <span className="tabular-nums text-text-primary">{fmtMoeda(desejo)}</span>
            </span>
          </div>

          {naoClassificado > 0 && (
            <p className="mt-2 text-muted text-text-muted">
              {fmtMoeda(naoClassificado)} ainda sem classificação.
            </p>
          )}
        </>
      )}
    </div>
  );
}
