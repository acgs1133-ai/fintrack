const prisma = require("../lib/prisma");
const { ApiError } = require("../middlewares/errorHandler");
const { aprenderKeywords } = require("../lib/keywords");

const INCLUDE = { categoria: true, divisao: { include: { participantes: true } } };

function buildDateRange(mes, ano) {
  if (!mes || !ano) return null;
  const inicio = new Date(Number(ano), Number(mes) - 1, 1);
  const fim = new Date(Number(ano), Number(mes), 1);
  return { gte: inicio, lt: fim };
}

// Normaliza o payload de divisão vindo do cliente para o formato de nested write.
function montarDivisaoCreate(divisao, valorAbsoluto) {
  if (!divisao || !Array.isArray(divisao.participantes) || divisao.participantes.length === 0) {
    return undefined;
  }
  const numPessoas = Number(divisao.numPessoas) || divisao.participantes.length + 1;
  return {
    create: {
      numPessoas,
      participantes: {
        create: divisao.participantes.map((p) => ({
          nome: String(p.nome).trim(),
          // Valor que cabe a cada participante; default = divisão igualitária.
          valor:
            p.valor != null && !Number.isNaN(Number(p.valor))
              ? Math.abs(Number(p.valor))
              : Number((valorAbsoluto / numPessoas).toFixed(2)),
          quitado: Boolean(p.quitado),
        })),
      },
    },
  };
}

async function listar(req, res, next) {
  try {
    const { mes, ano, categoriaId, tipo, q, limit, essencial, recorrente } = req.query;

    const where = {};
    const dataRange = buildDateRange(mes, ano);
    if (dataRange) where.data = dataRange;
    if (categoriaId) where.categoriaId = categoriaId;
    if (tipo) where.tipo = tipo;
    if (essencial) where.essencial = essencial;
    if (recorrente !== undefined) where.recorrente = recorrente === "true";
    if (q) where.descricao = { contains: q, mode: "insensitive" };

    const transacoes = await prisma.transacao.findMany({
      where,
      include: INCLUDE,
      orderBy: { data: "desc" },
      ...(limit ? { take: Number(limit) } : {}),
    });

    res.json({ data: transacoes });
  } catch (err) {
    next(err);
  }
}

async function criar(req, res, next) {
  try {
    const { tipo, valor, divisao, ...resto } = req.body;
    const valorAbs = Math.abs(valor);
    const valorFinal = tipo === "RECEITA" ? valorAbs : -valorAbs;

    const transacao = await prisma.transacao.create({
      data: {
        ...resto,
        tipo,
        valor: valorFinal,
        divisao: montarDivisaoCreate(divisao, valorAbs),
      },
      include: INCLUDE,
    });

    // Aprende a associação palavra-chave -> categoria escolhida.
    await aprenderKeywords(transacao.descricao, transacao.categoriaId);

    res.status(201).json({ data: transacao, message: "Transação adicionada com sucesso." });
  } catch (err) {
    next(err);
  }
}

async function atualizar(req, res, next) {
  try {
    const { id } = req.params;
    const { tipo, valor, divisao, ...resto } = req.body;

    const data = { ...resto };
    if (valor != null && tipo) {
      const valorAbs = Math.abs(valor);
      data.valor = tipo === "RECEITA" ? valorAbs : -valorAbs;
      data.tipo = tipo;
    } else if (tipo) {
      data.tipo = tipo;
    }

    // Substitui a divisão (se enviada): remove a antiga e recria.
    if (divisao !== undefined) {
      await prisma.divisao.deleteMany({ where: { transacaoId: id } });
      const atual = data.valor != null ? Math.abs(data.valor) : Math.abs(valor || 0);
      if (atual) data.divisao = montarDivisaoCreate(divisao, atual);
    }

    const transacao = await prisma.transacao.update({
      where: { id },
      data,
      include: INCLUDE,
    });

    if (transacao.descricao && transacao.categoriaId) {
      await aprenderKeywords(transacao.descricao, transacao.categoriaId);
    }

    res.json({ data: transacao, message: "Transação atualizada com sucesso." });
  } catch (err) {
    next(err);
  }
}

async function excluir(req, res, next) {
  try {
    const { id } = req.params;
    await prisma.transacao.delete({ where: { id } });
    res.json({ data: null, message: "Transação excluída com sucesso." });
  } catch (err) {
    next(err);
  }
}

async function importar(req, res, next) {
  try {
    const { transacoes } = req.body;
    if (!Array.isArray(transacoes) || transacoes.length === 0) {
      throw new ApiError(400, "Nenhuma transação para importar.");
    }

    const categorias = await prisma.categoria.findMany();
    const categoriaPorNome = new Map(categorias.map((c) => [c.nome, c.id]));
    const categoriaOutros = categorias.find((c) => c.nome === "Outros");

    const data = transacoes.map((t) => {
      const valorAbs = Math.abs(Number(t.valor));
      const tipo = Number(t.valor) >= 0 ? "RECEITA" : "DESPESA";
      const categoriaId =
        categoriaPorNome.get(t.categoriaDetectada) || categoriaOutros?.id || categorias[0]?.id;

      return {
        descricao: t.descricao,
        valor: tipo === "RECEITA" ? valorAbs : -valorAbs,
        data: new Date(t.data),
        tipo,
        categoriaId,
        importada: true,
      };
    });

    const created = await prisma.$transaction(
      data.map((d) => prisma.transacao.create({ data: d, include: { categoria: true } }))
    );

    res.status(201).json({ data: created, message: `${created.length} transações importadas com sucesso.` });
  } catch (err) {
    next(err);
  }
}

module.exports = { listar, criar, atualizar, excluir, importar };
