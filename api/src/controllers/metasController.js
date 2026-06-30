const prisma = require("../lib/prisma");
const { ApiError } = require("../middlewares/errorHandler");
const { mesesRestantes } = require("../lib/financas");

async function listar(req, res, next) {
  try {
    const metas = await prisma.meta.findMany({ orderBy: [{ concluida: "asc" }, { prazo: "asc" }] });
    res.json({ data: metas });
  } catch (err) {
    next(err);
  }
}

async function criar(req, res, next) {
  try {
    const { valorAtual, ...resto } = req.body;
    const meta = await prisma.meta.create({
      data: { ...resto, valorAtual: valorAtual || 0 },
    });
    // Registra aporte inicial no histórico para projeções futuras.
    if (valorAtual && valorAtual > 0) {
      await prisma.metaDeposito.create({ data: { metaId: meta.id, valor: valorAtual } });
    }
    res.status(201).json({ data: meta, message: "Meta criada com sucesso." });
  } catch (err) {
    next(err);
  }
}

async function atualizar(req, res, next) {
  try {
    const { id } = req.params;
    const meta = await prisma.meta.update({ where: { id }, data: req.body });
    res.json({ data: meta, message: "Meta atualizada com sucesso." });
  } catch (err) {
    next(err);
  }
}

async function depositar(req, res, next) {
  try {
    const { id } = req.params;
    const { valor } = req.body;

    if (typeof valor !== "number" || valor <= 0) {
      throw new ApiError(400, "Valor de depósito deve ser maior que zero.");
    }

    const metaAtual = await prisma.meta.findUnique({ where: { id } });
    if (!metaAtual) {
      throw new ApiError(404, "Meta não encontrada.");
    }

    const novoValor = metaAtual.valorAtual + valor;
    const [meta] = await prisma.$transaction([
      prisma.meta.update({
        where: { id },
        data: { valorAtual: novoValor, concluida: novoValor >= metaAtual.valorAlvo },
      }),
      prisma.metaDeposito.create({ data: { metaId: id, valor } }),
    ]);

    res.json({ data: meta, message: "Depósito realizado com sucesso." });
  } catch (err) {
    next(err);
  }
}

// Projeção realista: usa a média mensal real de aportes para estimar quando a
// meta será atingida e, se o ritmo for insuficiente para o prazo, sugere o
// valor mensal necessário.
async function projecao(req, res, next) {
  try {
    const { id } = req.params;
    const meta = await prisma.meta.findUnique({
      where: { id },
      include: { depositos: { orderBy: { data: "asc" } } },
    });
    if (!meta) throw new ApiError(404, "Meta não encontrada.");

    const faltam = Math.max(0, meta.valorAlvo - meta.valorAtual);
    const meses = mesesRestantes(meta.prazo);
    const valorMensalNecessario = faltam > 0 ? faltam / meses : 0;

    // Média mensal real: total aportado / nº de meses distintos com aporte.
    const depositos = meta.depositos;
    const totalAportado = depositos.reduce((acc, d) => acc + d.valor, 0);
    const mesesComAporte = new Set(
      depositos.map((d) => {
        const dt = new Date(d.data);
        return `${dt.getFullYear()}-${dt.getMonth()}`;
      })
    ).size;
    const mediaMensal = mesesComAporte > 0 ? totalAportado / mesesComAporte : 0;

    const temHistorico = depositos.length > 0 && mediaMensal > 0;
    const mesesNoRitmo = temHistorico && faltam > 0 ? Math.ceil(faltam / mediaMensal) : null;
    const noRitmo = meta.concluida || (mesesNoRitmo != null && mesesNoRitmo <= meses);

    res.json({
      data: {
        concluida: meta.concluida,
        faltam,
        prazoMeses: meses,
        prazo: meta.prazo,
        temHistorico,
        mediaMensal,
        mesesNoRitmo,
        noRitmo,
        valorMensalNecessario,
        totalAportes: depositos.length,
      },
    });
  } catch (err) {
    next(err);
  }
}

async function excluir(req, res, next) {
  try {
    const { id } = req.params;
    await prisma.meta.delete({ where: { id } });
    res.json({ data: null, message: "Meta excluída com sucesso." });
  } catch (err) {
    next(err);
  }
}

module.exports = { listar, criar, atualizar, depositar, projecao, excluir };
