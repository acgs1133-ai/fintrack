const prisma = require("./prisma");
const { extrairPalavras } = require("./texto");

// Registra a associação palavra-chave -> categoria escolhida pelo usuário.
// O último registro sempre vence ("o usuário pode sobrescrever").
async function aprenderKeywords(descricao, categoriaId) {
  const palavras = extrairPalavras(descricao);
  if (palavras.length === 0) return;
  await Promise.all(
    palavras.map((palavra) =>
      prisma.keywordCategoria.upsert({
        where: { palavra },
        update: { categoriaId, usos: { increment: 1 } },
        create: { palavra, categoriaId, usos: 1 },
      })
    )
  );
}

// Sugere uma categoria para um texto livre, com base no histórico do usuário.
// 1) associações palavra-chave aprendidas (maior número de usos vence);
// 2) fallback: varre descrições recentes procurando palavra em comum.
async function sugerirCategoria(texto) {
  const palavras = extrairPalavras(texto);
  if (palavras.length === 0) return null;

  const matches = await prisma.keywordCategoria.findMany({
    where: { palavra: { in: palavras } },
    include: { categoria: true },
    orderBy: { usos: "desc" },
  });
  if (matches.length > 0) {
    return { categoria: matches[0].categoria, fonte: "aprendizado" };
  }

  const recentes = await prisma.transacao.findMany({
    include: { categoria: true },
    orderBy: { data: "desc" },
    take: 200,
  });
  for (const t of recentes) {
    const palavrasT = extrairPalavras(t.descricao);
    if (palavrasT.some((p) => palavras.includes(p))) {
      return { categoria: t.categoria, fonte: "historico" };
    }
  }

  return null;
}

module.exports = { aprenderKeywords, sugerirCategoria };
