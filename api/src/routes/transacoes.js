const express = require("express");
const { z } = require("zod");
const controller = require("../controllers/transacoesController");
const sugestoes = require("../controllers/sugestoesController");
const { validate } = require("../middlewares/validate");

const router = express.Router();

const participanteSchema = z.object({
  nome: z.string().min(1, "informe o nome"),
  valor: z.number().nonnegative().optional(),
  quitado: z.boolean().optional(),
});

const divisaoSchema = z
  .object({
    numPessoas: z.number().int().positive().optional(),
    participantes: z.array(participanteSchema).min(1, "informe ao menos um participante"),
  })
  .nullable()
  .optional();

const transacaoSchema = z.object({
  descricao: z.string().min(2, "deve ter ao menos 2 caracteres"),
  valor: z.number().positive("deve ser maior que zero"),
  data: z.coerce.date(),
  tipo: z.enum(["RECEITA", "DESPESA"]).default("DESPESA"),
  categoriaId: z.string().min(1, "categoria é obrigatória"),
  recorrente: z.boolean().optional().default(false),
  essencial: z.enum(["NECESSIDADE", "DESEJO"]).nullable().optional(),
  divisao: divisaoSchema,
});

const transacaoUpdateSchema = transacaoSchema.partial();

const importarSchema = z.object({
  transacoes: z.array(
    z.object({
      descricao: z.string(),
      valor: z.number(),
      data: z.coerce.date(),
      categoriaDetectada: z.string().optional(),
    })
  ),
});

const sugerirSchema = z.object({ texto: z.string().optional().default("") });

router.get("/", controller.listar);
router.post("/sugerir-categoria", validate(sugerirSchema), sugestoes.sugerir);
router.post("/importar", validate(importarSchema), controller.importar);
router.post("/", validate(transacaoSchema), controller.criar);
router.put("/:id", validate(transacaoUpdateSchema), controller.atualizar);
router.delete("/:id", controller.excluir);

module.exports = router;
