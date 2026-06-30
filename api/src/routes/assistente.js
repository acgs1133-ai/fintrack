const express = require("express");
const controller = require("../controllers/assistenteController");

const router = express.Router();

router.post("/chat", controller.chat);

module.exports = router;
