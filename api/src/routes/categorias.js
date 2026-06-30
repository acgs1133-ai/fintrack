const express = require("express");
const { z } = require("zod");
const controller = require("../controllers/categoriasController");
const { validate } = require("../middlewares/validate");

const router = express.Router();

const categoriaSchema = z.object({
  nome: z.string().min(2, "deve ter ao menos 2 caracteres"),
  cor: z.string().optional(),
  icone: z.string().optional(),
  orcamento: z.number().positive().nullable().optional(),
});

const categoriaUpdateSchema = categoriaSchema.partial();

router.get("/", controller.listar);
router.post("/", validate(categoriaSchema), controller.criar);
router.put("/:id", validate(categoriaUpdateSchema), controller.atualizar);
router.delete("/:id", controller.excluir);

module.exports = router;
