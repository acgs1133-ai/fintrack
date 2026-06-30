const express = require("express");
const controller = require("../controllers/recorrenciasController");

const router = express.Router();

router.get("/", controller.listar);
router.patch("/status", controller.definirStatus);

module.exports = router;
