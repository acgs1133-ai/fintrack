import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import Select from "../ui/Select";
import { useCategorias } from "../../hooks/useCategorias";

const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

export default function FiltroTransacoes({ filtros, onChange }) {
  const { categorias } = useCategorias();
  const [busca, setBusca] = useState(filtros.q || "");

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (busca !== filtros.q) onChange({ ...filtros, q: busca });
    }, 300);
    return () => clearTimeout(timeout);
  }, [busca]);

  const anoAtual = new Date().getFullYear();
  const anos = [anoAtual - 1, anoAtual, anoAtual + 1];

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
      <Select
        label="Mês"
        value={filtros.mes}
        onChange={(e) => onChange({ ...filtros, mes: Number(e.target.value) })}
        className="sm:w-40"
      >
        {MESES.map((m, i) => (
          <option key={m} value={i + 1}>
            {m}
          </option>
        ))}
      </Select>

      <Select
        label="Ano"
        value={filtros.ano}
        onChange={(e) => onChange({ ...filtros, ano: Number(e.target.value) })}
        className="sm:w-28"
      >
        {anos.map((a) => (
          <option key={a} value={a}>
            {a}
          </option>
        ))}
      </Select>

      <Select
        label="Tipo"
        value={filtros.tipo}
        onChange={(e) => onChange({ ...filtros, tipo: e.target.value })}
        className="sm:w-36"
      >
        <option value="">Todos</option>
        <option value="RECEITA">Receita</option>
        <option value="DESPESA">Despesa</option>
      </Select>

      <Select
        label="Categoria"
        value={filtros.categoriaId}
        onChange={(e) => onChange({ ...filtros, categoriaId: e.target.value })}
        className="sm:w-44"
      >
        <option value="">Todas</option>
        {categorias.map((c) => (
          <option key={c.id} value={c.id}>
            {c.nome}
          </option>
        ))}
      </Select>

      <div className="flex-1 sm:min-w-[180px]">
        <label className="mb-1.5 block text-body-sm font-medium text-text-secondary">Buscar</label>
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Descrição..."
            className="w-full rounded-lg border border-border bg-bg-hover py-2 pl-9 pr-3 text-body text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent-green"
          />
        </div>
      </div>
    </div>
  );
}
