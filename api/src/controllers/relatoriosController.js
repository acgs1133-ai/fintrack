const prisma = require("../lib/prisma");
const { montarSeries } = require("../lib/recorrencias");
const { economiaMensalMeta } = require("../lib/financas");

function mesAnoAtual() {
  const now = new Date();
  return { mes: now.getMonth() + 1, ano: now.getFullYear() };
}

function rangeDoMes(mes, ano) {
  const inicio = new Date(Number(ano), Number(mes) - 1, 1);
  const fim = new Date(Number(ano), Number(mes), 1);
  return { gte: inicio, lt: fim };
}

async function resumo(req, res, next) {
  try {
    const { mes = mesAnoAtual().mes, ano = mesAnoAtual().ano } = req.query;
    const range = rangeDoMes(mes, ano);

    const transacoes = await prisma.transacao.findMany({ where: { data: range } });

    const receitas = transacoes.filter((t) => t.valor > 0).reduce((acc, t) => acc + t.valor, 0);
    const despesas = Math.abs(transacoes.filter((t) => t.valor < 0).reduce((acc, t) => acc + t.valor, 0));
    const saldo = receitas - despesas;

    const mesAnteriorDate = new Date(Number(ano), Number(mes) - 2, 1);
    const rangeAnterior = rangeDoMes(mesAnteriorDate.getMonth() + 1, mesAnteriorDate.getFullYear());
    const transacoesAnterior = await prisma.transacao.findMany({ where: { data: rangeAnterior } });
    const receitasAnterior = transacoesAnterior.filter((t) => t.valor > 0).reduce((acc, t) => acc + t.valor, 0);
    const despesasAnterior = Math.abs(
      transacoesAnterior.filter((t) => t.valor < 0).reduce((acc, t) => acc + t.valor, 0)
    );
    const saldoAnterior = receitasAnterior - despesasAnterior;

    const variacaoPercentual =
      saldoAnterior === 0 ? 0 : Math.round(((saldo - saldoAnterior) / Math.abs(saldoAnterior)) * 100);

    const categorias = await prisma.categoria.findMany();
    const orcamentoTotal = categorias.reduce((acc, c) => acc + (c.orcamento || 0), 0);

    res.json({
      data: {
        mes: Number(mes),
        ano: Number(ano),
        receitas,
        despesas,
        saldo,
        variacaoPercentual,
        orcamentoTotal,
      },
    });
  } catch (err) {
    next(err);
  }
}

async function porCategoria(req, res, next) {
  try {
    const { mes = mesAnoAtual().mes, ano = mesAnoAtual().ano } = req.query;
    const range = rangeDoMes(mes, ano);

    const categorias = await prisma.categoria.findMany({
      include: { transacoes: { where: { data: range } } },
    });

    const resultado = categorias.map((c) => {
      const despesas = Math.abs(
        c.transacoes.filter((t) => t.valor < 0).reduce((acc, t) => acc + t.valor, 0)
      );
      return {
        id: c.id,
        nome: c.nome,
        cor: c.cor,
        orcamento: c.orcamento,
        gasto: despesas,
        totalTransacoes: c.transacoes.length,
      };
    });

    res.json({ data: resultado.filter((r) => r.gasto > 0 || r.totalTransacoes > 0) });
  } catch (err) {
    next(err);
  }
}

async function historico(req, res, next) {
  try {
    const { meses = 6 } = req.query;
    const n = Number(meses);
    const now = new Date();
    const resultado = [];

    for (let i = n - 1; i >= 0; i--) {
      const ref = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mes = ref.getMonth() + 1;
      const ano = ref.getFullYear();
      const range = rangeDoMes(mes, ano);

      const transacoes = await prisma.transacao.findMany({ where: { data: range } });
      const receitas = transacoes.filter((t) => t.valor > 0).reduce((acc, t) => acc + t.valor, 0);
      const despesas = Math.abs(transacoes.filter((t) => t.valor < 0).reduce((acc, t) => acc + t.valor, 0));

      resultado.push({
        mes,
        ano,
        label: new Intl.DateTimeFormat("pt-BR", { month: "short" }).format(ref),
        receitas,
        despesas,
        saldo: receitas - despesas,
      });
    }

    res.json({ data: resultado });
  } catch (err) {
    next(err);
  }
}

// Saldo "seguro para gastar": saldo atual − recorrências previstas até o fim do
// período − reserva mensal das metas ativas.
async function seguroParaGastar(req, res, next) {
  try {
    const todas = await prisma.transacao.findMany();
    const saldoAtual = todas.reduce((acc, t) => acc + t.valor, 0);

    const series = await montarSeries();
    const pendentes = series.filter((s) => s.ativa && s.tipo === "DESPESA" && !s.lancadaEsteMs);
    const recorrenciasPrevistas = pendentes.reduce((acc, s) => acc + s.valorAtual, 0);

    const metasAtivas = await prisma.meta.findMany({ where: { concluida: false } });
    const reservaMetas = metasAtivas.reduce((acc, m) => acc + economiaMensalMeta(m), 0);

    const seguro = saldoAtual - recorrenciasPrevistas - reservaMetas;

    res.json({
      data: {
        saldoAtual,
        recorrenciasPrevistas,
        reservaMetas,
        seguro,
        qtdRecorrenciasPendentes: pendentes.length,
        qtdMetasAtivas: metasAtivas.length,
      },
    });
  } catch (err) {
    next(err);
  }
}

// Proporção necessidade vs desejo das despesas do período.
async function essencialidade(req, res, next) {
  try {
    const { mes = mesAnoAtual().mes, ano = mesAnoAtual().ano } = req.query;
    const range = rangeDoMes(mes, ano);

    const despesas = await prisma.transacao.findMany({ where: { data: range, tipo: "DESPESA" } });

    let necessidade = 0;
    let desejo = 0;
    let naoClassificado = 0;
    for (const t of despesas) {
      const v = Math.abs(t.valor);
      if (t.essencial === "NECESSIDADE") necessidade += v;
      else if (t.essencial === "DESEJO") desejo += v;
      else naoClassificado += v;
    }

    const classificado = necessidade + desejo;
    res.json({
      data: {
        necessidade,
        desejo,
        naoClassificado,
        total: necessidade + desejo + naoClassificado,
        percentNecessidade: classificado ? Math.round((necessidade / classificado) * 100) : 0,
        percentDesejo: classificado ? Math.round((desejo / classificado) * 100) : 0,
      },
    });
  } catch (err) {
    next(err);
  }
}

// Comparação contextual: gasto do mês atual vs média dos últimos 3 meses por categoria.
async function comparativo(req, res, next) {
  try {
    const { mes = mesAnoAtual().mes, ano = mesAnoAtual().ano } = req.query;
    const m = Number(mes);
    const a = Number(ano);
    const rangeAtual = rangeDoMes(m, a);

    const inicioPrev = new Date(a, m - 1 - 3, 1);
    const fimPrev = rangeAtual.gte;

    const [categorias, transAtual, transPrev] = await Promise.all([
      prisma.categoria.findMany(),
      prisma.transacao.findMany({ where: { data: rangeAtual, tipo: "DESPESA" } }),
      prisma.transacao.findMany({ where: { data: { gte: inicioPrev, lt: fimPrev }, tipo: "DESPESA" } }),
    ]);

    const somaCat = (lista, id) =>
      Math.abs(lista.filter((t) => t.categoriaId === id).reduce((acc, t) => acc + t.valor, 0));

    const resultado = categorias
      .map((c) => {
        const atual = somaCat(transAtual, c.id);
        const media = somaCat(transPrev, c.id) / 3;
        const variacao = media > 0 ? Math.round(((atual - media) / media) * 100) : null;
        return {
          id: c.id,
          nome: c.nome,
          cor: c.cor,
          atual,
          media,
          variacao,
          alerta: media > 0 && atual > media && variacao >= 20,
        };
      })
      .filter((r) => r.atual > 0 || r.media > 0)
      .sort((x, y) => (y.variacao ?? -999) - (x.variacao ?? -999));

    res.json({ data: resultado });
  } catch (err) {
    next(err);
  }
}

module.exports = { resumo, porCategoria, historico, seguroParaGastar, essencialidade, comparativo };
