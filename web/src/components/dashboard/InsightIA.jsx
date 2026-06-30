import { Sparkles } from "lucide-react";
import { fmtMoeda } from "../../utils/formatters";

function gerarInsight({ receitas, despesas, saldo, categorias }) {
  if (receitas === 0 && despesas === 0) {
    return "Nenhuma transação registrada neste mês. Adicione suas receitas e despesas para receber insights personalizados.";
  }

  const categoriaTop = [...categorias].sort((a, b) => b.gasto - a.gasto)[0];

  const partes = [];

  if (categoriaTop && categoriaTop.gasto > 0) {
    const percentualDoTotal = despesas ? Math.round((categoriaTop.gasto / despesas) * 100) : 0;
    partes.push(
      `Sua maior categoria de gastos este mês é ${categoriaTop.nome}, representando ${percentualDoTotal}% das despesas (${fmtMoeda(
        categoriaTop.gasto
      )}).`
    );
  }

  if (saldo >= 0) {
    const taxaEconomia = receitas ? Math.round((saldo / receitas) * 100) : 0;
    partes.push(`Você está economizando ${taxaEconomia}% da sua renda este mês. Continue assim!`);
  } else {
    partes.push(`Seus gastos superaram suas receitas em ${fmtMoeda(Math.abs(saldo))}. Vale revisar o orçamento.`);
  }

  const categoriaPerto = categorias.find((c) => c.orcamento && c.gasto / c.orcamento >= 0.9 && c.gasto / c.orcamento < 1);
  if (categoriaPerto) {
    partes.push(`Atenção: ${categoriaPerto.nome} já está em ${Math.round((categoriaPerto.gasto / categoriaPerto.orcamento) * 100)}% do orçamento mensal.`);
  }

  return partes.join(" ");
}

export default function InsightIA({ resumo, categorias }) {
  const texto = gerarInsight({
    receitas: resumo?.receitas || 0,
    despesas: resumo?.despesas || 0,
    saldo: resumo?.saldo || 0,
    categorias: categorias || [],
  });

  return (
    <div className="rounded-xl border border-accent-blue/20 bg-accent-blue/5 p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-blue/15">
          <Sparkles size={16} className="text-accent-blue" />
        </div>
        <div>
          <p className="text-body-sm font-medium text-text-primary">Insight do mês</p>
          <p className="mt-1 text-body-sm text-text-secondary">{texto}</p>
        </div>
      </div>
    </div>
  );
}
