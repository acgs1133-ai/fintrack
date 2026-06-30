const express = require("express");
const controller = require("../controllers/divisoesController");

const router = express.Router();

router.get("/a-receber", controller.aReceber);
router.patch("/participantes/:id", controller.toggleParticipante);

module.exports = router;
