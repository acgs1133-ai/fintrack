const prisma = require("../lib/prisma");
const { montarSeries } = require("../lib/recorrencias");
const { rangeDoMes, economiaMensalMeta, mesesRestantes } = require("../lib/financas");

const fmt = (v) => `R$ ${Number(v || 0).toFixed(2).replace(".", ",")}`;

// Gera de 2 a 3 observações curtas e acionáveis com base em regras claras
// (variação de categoria, recorrência que subiu, ritmo de meta, orçamento).
async function listar(req, res, next) {
  try {
    const now = new Date();
    const mes = now.getMonth() + 1;
    const ano = now.getFullYear();
    const rangeAtual = rangeDoMes(mes, ano);

    const candidatos = [];

    // 1) Variação de categoria vs média dos últimos 3 meses.
    const inicioPrev = new Date(ano, mes - 1 - 3, 1);
    const [categorias, transAtual, transPrev, metas, series] = await Promise.all([
      prisma.categoria.findMany(),
      prisma.transacao.findMany({ where: { data: rangeAtual, tipo: "DESPESA" } }),
      prisma.transacao.findMany({ where: { data: { gte: inicioPrev, lt: rangeAtual.gte }, tipo: "DESPESA" } }),
      prisma.meta.findMany({ where: { concluida: false } }),
      montarSeries(),
    ]);

    const somaCat = (lista, id) =>
      Math.abs(lista.filter((t) => t.categoriaId === id).reduce((acc, t) => acc + t.valor, 0));

    let maiorVariacao = null;
    for (const c of categorias) {
      const atual = somaCat(transAtual, c.id);
      const media = somaCat(transPrev, c.id) / 3;
      if (media > 0 && atual > media) {
        const variacao = Math.round(((atual - media) / media) * 100);
        if (variacao >= 20 && (!maiorVariacao || variacao > maiorVariacao.variacao)) {
          maiorVariacao = { nome: c.nome, variacao, atual };
        }
      }
    }
    if (maiorVariacao) {
      candidatos.push({
        tipo: "alerta",
        prioridade: maiorVariacao.variacao,
        texto: `Gasto com ${maiorVariacao.nome} está ${maiorVariacao.variacao}% acima da sua média dos últimos meses.`,
      });
    }

    // 2) Recorrência ativa que subiu de valor.
    const subiu = series
      .filter((s) => s.ativa && s.mudou && s.diferenca > 0)
      .sort((a, b) => b.diferenca - a.diferenca)[0];
    if (subiu) {
      candidatos.push({
        tipo: "alerta",
        prioridade: 60,
        texto: `${subiu.descricao} subiu de ${fmt(subiu.valorAnterior)} para ${fmt(subiu.valorAtual)}.`,
      });
    }

    // 3) Ritmo de meta insuficiente para o prazo.
    for (const m of metas) {
      const faltam = Math.max(0, m.valorAlvo - m.valorAtual);
      if (faltam <= 0) continue;
      const meses = mesesRestantes(m.prazo);
      const necessario = economiaMensalMeta(m);
      candidatos.push({
        tipo: "meta",
        prioridade: 40,
        texto: `Para bater a meta "${m.nome}" no prazo, guarde ${fmt(necessario)}/mês nos próximos ${meses} ${
          meses === 1 ? "mês" : "meses"
        }.`,
      });
    }

    // 4) Categoria que estourou o orçamento.
    for (const c of categorias) {
      if (!c.orcamento) continue;
      const gasto = somaCat(transAtual, c.id);
      if (gasto > c.orcamento) {
        candidatos.push({
          tipo: "alerta",
          prioridade: 50 + Math.round(((gasto - c.orcamento) / c.orcamento) * 100),
          texto: `${c.nome} passou do orçamento: ${fmt(gasto)} de ${fmt(c.orcamento)}.`,
        });
      }
    }

    // Ordena por prioridade e devolve no máximo 3.
    candidatos.sort((a, b) => b.prioridade - a.prioridade);
    const insights = candidatos.slice(0, 3).map(({ tipo, texto }) => ({ tipo, texto }));

    res.json({ data: insights });
  } catch (err) {
    next(err);
  }
}

module.exports = { listar };
