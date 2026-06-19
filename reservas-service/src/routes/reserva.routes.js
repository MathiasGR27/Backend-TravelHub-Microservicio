const express = require("express");
const router = express.Router();
const Reserva = require("../models/reserva"); 
const {crearReserva,misReservas,verTodasLasReservas,obtenerAsientosOcupados} = require("../controllers/reserva.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const { esAdmin } = require("../middlewares/rol.middleware");

// =======================
// USER ROUTES
// =======================
router.post("/", authMiddleware, crearReserva);
router.get("/mis-reservas", authMiddleware, misReservas);
router.get("/vuelo/:id_vuelo/asientos", authMiddleware, obtenerAsientosOcupados);

// =======================
// ADMIN ROUTES
// =======================
router.get("/", authMiddleware, esAdmin, verTodasLasReservas);

// =======================
// GET RESERVA BY ID (PAGOS)
// =======================
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    // SOLO SEQUELIZE (SIN VUELO)
    const reserva = await Reserva.findByPk(id, {
      include: [
        {
          association: "pasajeros"
        }
      ]
    });
    if (!reserva) {
      return res.status(404).json({
        message: "Reserva no encontrada"
      });
    }
    // VUELO VIENE DE OTRO MICROSERVICIO
    const axios = require("axios");
    let vuelo = null;
    try {
      const { data } = await axios.get(
        `${process.env.VUELOS_SERVICE_URL}/api/vuelos/${reserva.id_vuelo}`
      );
      vuelo = data;
    } catch (error) {
      console.log("Error consultando vuelo:", error.message);
    }
    res.json({
      ...reserva.toJSON(),
      vuelo
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener reserva",
      error: error.message
    });
  }
});
router.put("/:id/pagar", async (req, res) => {
  try {
    const { id } = req.params;
    const { estado, codigo_qr, total } = req.body;
    const reserva = await Reserva.findByPk(id);
    if (!reserva) {
      return res.status(404).json({
        message: "Reserva no encontrada"
      });
    }
    reserva.estado = estado || reserva.estado;
    reserva.codigo_qr = codigo_qr || reserva.codigo_qr;
    reserva.total = total || reserva.total;
    await reserva.save();
    res.json({
      message: "Reserva actualizada (pago confirmado)",
      reserva
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al actualizar pago",
      error: error.message
    });
  }
});
module.exports = router;