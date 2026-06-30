const prisma = require("../lib/prisma");
const { ApiError } = require("../middlewares/errorHandler");

// Histórico de "a receber" por pessoa, agregando todos os participantes em aberto.
async function aReceber(req, res, next) {
  try {
    const participantes = await prisma.participante.findMany({
      include: { divisao: { include: { transacao: { include: { categoria: true } } } } },
      orderBy: { id: "desc" },
    });

    const porPessoa = new Map();
    for (const p of participantes) {
      const chave = p.nome.trim().toLowerCase();
      if (!porPessoa.has(chave)) {
        porPessoa.set(chave, { nome: p.nome.trim(), aberto: 0, quitado: 0, itens: [] });
      }
      const reg = porPessoa.get(chave);
      if (p.quitado) reg.quitado += p.valor;
      else reg.aberto += p.valor;
      reg.itens.push({
        participanteId: p.id,
        valor: p.valor,
        quitado: p.quitado,
        descricao: p.divisao?.transacao?.descricao || "—",
        data: p.divisao?.transacao?.data || null,
        categoria: p.divisao?.transacao?.categoria?.nome || null,
      });
    }

    const pessoas = [...porPessoa.values()].sort((a, b) => b.aberto - a.aberto);
    const totalAberto = pessoas.reduce((acc, p) => acc + p.aberto, 0);

    res.json({ data: { pessoas, totalAberto } });
  } catch (err) {
    next(err);
  }
}

// Marca um participante como quitado / em aberto.
async function toggleParticipante(req, res, next) {
  try {
    const { id } = req.params;
    const { quitado } = req.body;
    if (typeof quitado !== "boolean") throw new ApiError(400, "Informe o estado de quitação.");

    const participante = await prisma.participante.update({
      where: { id },
      data: { quitado },
    });

    res.json({
      data: participante,
      message: quitado ? "Marcado como quitado." : "Marcado como em aberto.",
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { aReceber, toggleParticipante };
