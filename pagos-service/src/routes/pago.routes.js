const express = require("express");
const router = express.Router();

const {
  confirmarPago,
  misPagos
} = require("../controllers/pago.controller");

const authMiddleware = require("../middlewares/auth.middleware");
const { esAdmin } = require("../middlewares/rol.middleware");

// USER
router.post("/confirmar", authMiddleware, confirmarPago);
router.get("/mis-pagos", authMiddleware, misPagos);

module.exports = router;