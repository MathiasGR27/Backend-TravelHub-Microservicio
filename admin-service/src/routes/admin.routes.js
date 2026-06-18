const express = require("express");
const router = express.Router();

const { validarReservaQR } = require("../controllers/admin.controller");

router.get("/validar-qr/:codigo", validarReservaQR);

module.exports = router;