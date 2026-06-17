const express = require("express");
const router = express.Router();

const {crearVuelo,listarVuelos,buscarVuelos,editarVuelo,eliminarVuelo,obtenerVueloPorId} = require("../controllers/vuelo.controller");

const authMiddleware = require("../middlewares/auth.middleware");
const { esAdmin } = require("../middlewares/rol.middleware");

// Público
router.get("/", listarVuelos);
router.get("/buscar", buscarVuelos);
router.get("/:id", obtenerVueloPorId);

// ADMIN
router.post("/", authMiddleware, esAdmin, crearVuelo);
router.put("/:id", authMiddleware, esAdmin, editarVuelo);
router.delete("/:id", authMiddleware, esAdmin, eliminarVuelo);

module.exports = router;
