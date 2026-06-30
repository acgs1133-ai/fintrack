const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const CATEGORIAS = [
  { nome: "Alimentação", cor: "#22C55E", icone: "utensils", orcamento: 1200, sistema: true },
  { nome: "Transporte", cor: "#3B82F6", icone: "car", orcamento: 500, sistema: true },
  { nome: "Moradia", cor: "#A855F7", icone: "home", orcamento: 1800, sistema: true },
  { nome: "Saúde", cor: "#F97316", icone: "heart-pulse", orcamento: 400, sistema: true },
  { nome: "Educação", cor: "#06B6D4", icone: "graduation-cap", orcamento: 350, sistema: true },
  { nome: "Lazer", cor: "#EAB308", icone: "popcorn", orcamento: 300, sistema: true },
  { nome: "Outros", cor: "#71717A", icone: "circle", orcamento: null, sistema: true },
];

function diaAleatorio(mesOffset, dia) {
  const ref = new Date();
  return new Date(ref.getFullYear(), ref.getMonth() - mesOffset, dia);
}

async function main() {
  console.log("Limpando dados existentes...");
  await prisma.transacao.deleteMany();
  await prisma.meta.deleteMany();
  await prisma.categoria.deleteMany();

  console.log("Criando categorias...");
  const categoriasCriadas = {};
  for (const c of CATEGORIAS) {
    const categoria = await prisma.categoria.create({ data: c });
    categoriasCriadas[c.nome] = categoria.id;
  }

  console.log("Criando transações...");
  const transacoesPorMes = [
    // receitas mensais fixas (3 meses)
    ...[0, 1, 2].map((mesOffset) => ({
      descricao: "Salário",
      valor: 6500,
      data: diaAleatorio(mesOffset, 5),
      tipo: "RECEITA",
      categoriaId: categoriasCriadas["Outros"],
      recorrente: true,
    })),
    ...[0, 1, 2].map((mesOffset) => ({
      descricao: "Freelance design",
      valor: 850,
      data: diaAleatorio(mesOffset, 18),
      tipo: "RECEITA",
      categoriaId: categoriasCriadas["Outros"],
    })),
    // Alimentação
    ...[0, 1, 2].flatMap((mesOffset) => [
      { descricao: "Supermercado Pão de Açúcar", valor: -385.4, data: diaAleatorio(mesOffset, 3), tipo: "DESPESA", categoriaId: categoriasCriadas["Alimentação"] },
      { descricao: "iFood", valor: -68.9, data: diaAleatorio(mesOffset, 8), tipo: "DESPESA", categoriaId: categoriasCriadas["Alimentação"] },
      { descricao: "Padaria do bairro", valor: -32.5, data: diaAleatorio(mesOffset, 12), tipo: "DESPESA", categoriaId: categoriasCriadas["Alimentação"] },
      { descricao: "Restaurante japonês", valor: -145.0, data: diaAleatorio(mesOffset, 20), tipo: "DESPESA", categoriaId: categoriasCriadas["Alimentação"] },
    ]),
    // Transporte
    ...[0, 1, 2].flatMap((mesOffset) => [
      { descricao: "Uber", valor: -42.3, data: diaAleatorio(mesOffset, 4), tipo: "DESPESA", categoriaId: categoriasCriadas["Transporte"] },
      { descricao: "Combustível posto Shell", valor: -180.0, data: diaAleatorio(mesOffset, 10), tipo: "DESPESA", categoriaId: categoriasCriadas["Transporte"] },
      { descricao: "Estacionamento shopping", valor: -25.0, data: diaAleatorio(mesOffset, 15), tipo: "DESPESA", categoriaId: categoriasCriadas["Transporte"] },
    ]),
    // Moradia
    ...[0, 1, 2].map((mesOffset) => ({
      descricao: "Aluguel apartamento",
      valor: -1650.0,
      data: diaAleatorio(mesOffset, 1),
      tipo: "DESPESA",
      categoriaId: categoriasCriadas["Moradia"],
      recorrente: true,
    })),
    ...[0, 1, 2].map((mesOffset) => ({
      descricao: "Conta de luz",
      valor: -145.6,
      data: diaAleatorio(mesOffset, 7),
      tipo: "DESPESA",
      categoriaId: categoriasCriadas["Moradia"],
    })),
    ...[0, 1, 2].map((mesOffset) => ({
      descricao: "Internet Vivo Fibra",
      valor: -99.9,
      data: diaAleatorio(mesOffset, 9),
      tipo: "DESPESA",
      categoriaId: categoriasCriadas["Moradia"],
      recorrente: true,
    })),
    // Saúde
    ...[0, 1].map((mesOffset) => ({
      descricao: "Farmácia Drogasil",
      valor: -78.4,
      data: diaAleatorio(mesOffset, 14),
      tipo: "DESPESA",
      categoriaId: categoriasCriadas["Saúde"],
    })),
    { descricao: "Consulta dentista", valor: -250.0, data: diaAleatorio(1, 22), tipo: "DESPESA", categoriaId: categoriasCriadas["Saúde"] },
    // Educação
    ...[0, 1, 2].map((mesOffset) => ({
      descricao: "Curso Alura",
      valor: -69.9,
      data: diaAleatorio(mesOffset, 6),
      tipo: "DESPESA",
      categoriaId: categoriasCriadas["Educação"],
      recorrente: true,
    })),
    // Lazer
    ...[0, 1, 2].map((mesOffset) => ({
      descricao: "Netflix",
      valor: -39.9,
      data: diaAleatorio(mesOffset, 2),
      tipo: "DESPESA",
      categoriaId: categoriasCriadas["Lazer"],
      recorrente: true,
    })),
    ...[0, 1].map((mesOffset) => ({
      descricao: "Cinema",
      valor: -56.0,
      data: diaAleatorio(mesOffset, 25),
      tipo: "DESPESA",
      categoriaId: categoriasCriadas["Lazer"],
    })),
    { descricao: "Spotify Premium", valor: -21.9, data: diaAleatorio(0, 11), tipo: "DESPESA", categoriaId: categoriasCriadas["Lazer"], recorrente: true },
  ];

  for (const t of transacoesPorMes) {
    await prisma.transacao.create({ data: t });
  }

  console.log(`${transacoesPorMes.length} transações criadas.`);

  console.log("Criando metas...");
  const hoje = new Date();
  await prisma.meta.create({
    data: {
      nome: "Notebook novo",
      valorAlvo: 3000,
      valorAtual: 900,
      prazo: new Date(hoje.getFullYear(), hoje.getMonth() + 4, 1),
    },
  });
  await prisma.meta.create({
    data: {
      nome: "Viagem Natal",
      valorAlvo: 2000,
      valorAtual: 400,
      prazo: new Date(hoje.getFullYear(), 11, 20),
    },
  });

  console.log("Seed concluído com sucesso!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
