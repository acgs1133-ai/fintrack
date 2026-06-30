const express = require("express");
const controller = require("../controllers/relatoriosController");

const router = express.Router();

router.get("/resumo", controller.resumo);
router.get("/por-categoria", controller.porCategoria);
router.get("/historico", controller.historico);
router.get("/seguro-para-gastar", controller.seguroParaGastar);
router.get("/essencialidade", controller.essencialidade);
router.get("/comparativo", controller.comparativo);

module.exports = router;
