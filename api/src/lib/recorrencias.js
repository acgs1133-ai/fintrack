const prisma = require("./prisma");
const { chaveRecorrencia } = require("./texto");

// Monta as séries de recorrências/assinaturas a partir das transações marcadas
// como recorrentes, agrupando por descrição normalizada. Detecta mudança de valor
// em relação ao lançamento anterior e cruza com o estado ativa/cancelada.
async function montarSeries() {
  const transacoes = await prisma.transacao.findMany({
    where: { recorrente: true },
    include: { categoria: true },
    orderBy: { data: "desc" },
  });

  const grupos = new Map();
  for (const t of transacoes) {
    const chave = chaveRecorrencia(t.descricao);
    if (!grupos.has(chave)) grupos.set(chave, []);
    grupos.get(chave).push(t);
  }

  const statuses = await prisma.recorrencia.findMany();
  const statusMap = new Map(statuses.map((s) => [s.chave, s]));

  const now = new Date();
  const mesAtual = now.getMonth();
  const anoAtual = now.getFullYear();

  const series = [];
  for (const [chave, lista] of grupos) {
    const ultima = lista[0];
    const anterior = lista[1] || null;
    const valorAtual = Math.abs(ultima.valor);
    const valorAnterior = anterior ? Math.abs(anterior.valor) : null;
    const mudou = valorAnterior != null && Math.abs(valorAtual - valorAnterior) > 0.001;
    const lancadaEsteMs = lista.some((t) => {
      const d = new Date(t.data);
      return d.getMonth() === mesAtual && d.getFullYear() === anoAtual;
    });
    const status = statusMap.get(chave);

    series.push({
      chave,
      descricao: ultima.descricao,
      categoria: ultima.categoria,
      tipo: ultima.tipo,
      valorAtual,
      valorAnterior,
      mudou,
      diferenca: mudou ? Number((valorAtual - valorAnterior).toFixed(2)) : 0,
      ocorrencias: lista.length,
      ultimaData: ultima.data,
      lancadaEsteMs,
      ativa: status ? status.ativa : true,
    });
  }

  // Ativas primeiro, depois por maior valor.
  series.sort((a, b) => Number(b.ativa) - Number(a.ativa) || b.valorAtual - a.valorAtual);
  return series;
}

module.exports = { montarSeries };
