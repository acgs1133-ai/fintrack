const prisma = require("../lib/prisma");
const { ApiError } = require("../middlewares/errorHandler");
const { montarSeries } = require("../lib/recorrencias");

async function listar(req, res, next) {
  try {
    const series = await montarSeries();
    res.json({ data: series });
  } catch (err) {
    next(err);
  }
}

// Marca uma série de recorrência como ativa ou cancelada/inativa, sem apagar
// o histórico de transações. Upsert pelo identificador (chave) da série.
async function definirStatus(req, res, next) {
  try {
    const { chave, descricao, ativa } = req.body;
    if (!chave) throw new ApiError(400, "Identificador da recorrência é obrigatório.");
    if (typeof ativa !== "boolean") throw new ApiError(400, "Informe se a recorrência está ativa.");

    const recorrencia = await prisma.recorrencia.upsert({
      where: { chave },
      update: { ativa, ...(descricao ? { descricao } : {}) },
      create: { chave, descricao: descricao || chave, ativa },
    });

    res.json({
      data: recorrencia,
      message: ativa ? "Recorrência reativada." : "Recorrência marcada como cancelada.",
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { listar, definirStatus };
