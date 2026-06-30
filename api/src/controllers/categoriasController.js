const prisma = require("../lib/prisma");
const { ApiError } = require("../middlewares/errorHandler");

async function listar(req, res, next) {
  try {
    const categorias = await prisma.categoria.findMany({
      orderBy: { nome: "asc" },
      include: { _count: { select: { transacoes: true } } },
    });
    res.json({ data: categorias });
  } catch (err) {
    next(err);
  }
}

async function criar(req, res, next) {
  try {
    const categoria = await prisma.categoria.create({ data: req.body });
    res.status(201).json({ data: categoria, message: "Categoria criada com sucesso." });
  } catch (err) {
    next(err);
  }
}

async function atualizar(req, res, next) {
  try {
    const { id } = req.params;
    const categoria = await prisma.categoria.update({ where: { id }, data: req.body });
    res.json({ data: categoria, message: "Categoria atualizada com sucesso." });
  } catch (err) {
    next(err);
  }
}

async function excluir(req, res, next) {
  try {
    const { id } = req.params;
    const categoria = await prisma.categoria.findUnique({
      where: { id },
      include: { _count: { select: { transacoes: true } } },
    });

    if (!categoria) {
      throw new ApiError(404, "Categoria não encontrada.");
    }

    if (categoria.sistema) {
      throw new ApiError(400, "Categorias padrão do sistema não podem ser excluídas.");
    }

    if (categoria._count.transacoes > 0) {
      throw new ApiError(
        400,
        `Não é possível excluir: ${categoria._count.transacoes} transações usam esta categoria. Reclassifique-as primeiro.`
      );
    }

    await prisma.categoria.delete({ where: { id } });
    res.json({ data: null, message: "Categoria excluída com sucesso." });
  } catch (err) {
    next(err);
  }
}

module.exports = { listar, criar, atualizar, excluir };
