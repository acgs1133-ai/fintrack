const express = require("express");
const { z } = require("zod");
const controller = require("../controllers/metasController");
const { validate } = require("../middlewares/validate");

const router = express.Router();

const metaSchema = z.object({
  nome: z.string().min(2, "deve ter ao menos 2 caracteres"),
  valorAlvo: z.number().positive("deve ser maior que zero"),
  valorAtual: z.number().nonnegative().optional(),
  prazo: z.coerce.date(),
});

const metaUpdateSchema = metaSchema.partial();

const depositoSchema = z.object({
  valor: z.number().positive("deve ser maior que zero"),
});

router.get("/", controller.listar);
router.get("/:id/projecao", controller.projecao);
router.post("/", validate(metaSchema), controller.criar);
router.put("/:id", validate(metaUpdateSchema), controller.atualizar);
router.patch("/:id/depositar", validate(depositoSchema), controller.depositar);
router.delete("/:id", controller.excluir);

module.exports = router;
