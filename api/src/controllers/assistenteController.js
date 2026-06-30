const prisma = require("../lib/prisma");
const { anthropic, ASSISTENTE_MODEL } = require("../lib/anthropic");
const { ApiError } = require("../middlewares/errorHandler");

function rangeDoMes(mes, ano) {
  const inicio = new Date(Number(ano), Number(mes) - 1, 1);
  const fim = new Date(Number(ano), Number(mes), 1);
  return { gte: inicio, lt: fim };
}

async function montarContextoFinanceiro() {
  const hoje = new Date();
  const mes = hoje.getMonth() + 1;
  const ano = hoje.getFullYear();
  const range = rangeDoMes(mes, ano);

  const [transacoes, categorias, metas] = await Promise.all([
    prisma.transacao.findMany({ where: { data: range }, include: { categoria: true } }),
    prisma.categoria.findMany(),
    prisma.meta.findMany(),
  ]);

  const receitas = transacoes.filter((t) => t.valor > 0).reduce((acc, t) => acc + t.valor, 0);
  const despesas = Math.abs(transacoes.filter((t) => t.valor < 0).reduce((acc, t) => acc + t.valor, 0));
  const saldo = receitas - despesas;

  const gastosPorCategoria = categorias
    .map((c) => {
      const gasto = Math.abs(
        transacoes
          .filter((t) => t.categoriaId === c.id && t.valor < 0)
          .reduce((acc, t) => acc + t.valor, 0)
      );
      return { nome: c.nome, gasto, orcamento: c.orcamento };
    })
    .filter((c) => c.gasto > 0);

  const metasResumo = metas.map((m) => ({
    nome: m.nome,
    valorAtual: m.valorAtual,
    valorAlvo: m.valorAlvo,
    prazo: m.prazo,
    concluida: m.concluida,
  }));

  const fmt = (v) => `R$ ${v.toFixed(2).replace(".", ",")}`;

  const linhasCategorias = gastosPorCategoria
    .map((c) => `- ${c.nome}: ${fmt(c.gasto)}${c.orcamento ? ` (orçamento: ${fmt(c.orcamento)})` : " (sem orçamento)"}`)
    .join("\n") || "Nenhum gasto registrado este mês.";

  const linhasMetas = metasResumo
    .map((m) => `- ${m.nome}: ${fmt(m.valorAtual)} de ${fmt(m.valorAlvo)}${m.concluida ? " (concluída)" : ""}`)
    .join("\n") || "Nenhuma meta cadastrada.";

  return `Dados financeiros do usuário no mês atual:
- Receitas: ${fmt(receitas)}
- Despesas: ${fmt(despesas)}
- Saldo: ${fmt(saldo)}
- Total de transações no mês: ${transacoes.length}

Gastos por categoria:
${linhasCategorias}

Metas financeiras:
${linhasMetas}`;
}

async function chat(req, res, next) {
  try {
    const { mensagens } = req.body;

    if (!Array.isArray(mensagens) || mensagens.length === 0) {
      throw new ApiError(400, "Envie ao menos uma mensagem.");
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      throw new ApiError(503, "Assistente de IA não configurado. Defina ANTHROPIC_API_KEY no servidor.");
    }

    const contexto = await montarContextoFinanceiro();

    const historico = mensagens.slice(-20).map((m) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: String(m.content || "").slice(0, 4000),
    }));

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    const stream = anthropic.messages.stream({
      model: ASSISTENTE_MODEL,
      max_tokens: 1024,
      output_config: { effort: "medium" },
      system: `Você é o assistente financeiro do FinTrack, um app de controle financeiro pessoal. Responda em português do Brasil, de forma direta, prática e amigável. Use os dados reais do usuário fornecidos abaixo para dar dicas e análises personalizadas. Não invente números — baseie-se apenas nos dados fornecidos. Seja conciso (poucos parágrafos curtos ou uma lista).\n\n${contexto}`,
      messages: historico,
    });

    stream.on("text", (textDelta) => {
      res.write(`data: ${JSON.stringify({ text: textDelta })}\n\n`);
    });

    stream.on("error", (err) => {
      res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
      res.end();
    });

    await stream.finalMessage();
    res.write("data: [DONE]\n\n");
    res.end();
  } catch (err) {
    if (res.headersSent) {
      res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
      res.end();
    } else {
      next(err);
    }
  }
}

module.exports = { chat };
