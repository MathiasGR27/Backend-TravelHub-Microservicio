const Pago = require("../models/pago");
const axios = require("axios");

const RESERVAS_URL = process.env.RESERVAS_SERVICE_URL;
const AUTH_URL = process.env.AUTH_SERVICE_URL;

// =========================
// DESCUENTOS POR PUNTOS
// =========================
const obtenerDescuento = (puntos) => {
  if (puntos >= 3000) return 0.30;
  if (puntos >= 2500) return 0.25;
  if (puntos >= 2000) return 0.20;
  if (puntos >= 1500) return 0.15;
  if (puntos >= 900) return 0.10;
  if (puntos >= 450) return 0.05;
  return 0;
};

// =========================
// CONFIRMAR PAGO
// =========================
const confirmarPago = async (req, res) => {
  try {
    const { id_reserva, metodo, usar_puntos, puntos_usar } = req.body;
    const id_usuario = req.usuario.id;

    // 🔥 1. RESERVA
    const { data: reserva } = await axios.get(
      `${RESERVAS_URL}/api/reservas/${id_reserva}`,
      {
        headers: {
          Authorization: req.headers.authorization
        }
      }
    );

    if (!reserva) {
      return res.status(404).json({ message: "Reserva no encontrada" });
    }

    // 🔥 2. USUARIO
    const { data: usuario } = await axios.get(
      `${AUTH_URL}/api/usuarios/${id_usuario}`,
      {
        headers: {
          Authorization: req.headers.authorization
        }
      }
    );

    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // 🔥 3. DESCUENTOS
    let descuento = 0;
    let puntosUsados = 0;

    if (usar_puntos) {
      if (puntos_usar <= 0) {
        return res.status(400).json({ message: "Puntos inválidos" });
      }

      if (puntos_usar > usuario.puntos) {
        return res.status(400).json({ message: "Puntos insuficientes" });
      }

      descuento = obtenerDescuento(puntos_usar);

      if (descuento === 0) {
        return res.status(400).json({
          message: "Puntos no suficientes para descuento"
        });
      }

      puntosUsados = puntos_usar;
    }

    // 🔥 4. TOTAL FINAL
    const totalFinal =
      Number(reserva.total) - (Number(reserva.total) * descuento);

    const codigoQR = `QR-RES-${id_reserva}-${Date.now()}`;

    // 🔥 5. CREAR PAGO
    await Pago.create({
      id_reserva,
      monto: totalFinal,
      metodo
    });

    // 🔥 6. ACTUALIZAR RESERVA
    await axios.put(
      `${RESERVAS_URL}/api/reservas/${id_reserva}/pagar`,
      {
        estado: "PAGADA",
        codigo_qr: codigoQR,
        total: totalFinal
      },
      {
        headers: {
          Authorization: req.headers.authorization
        }
      }
    );

    // 🔥 7. ACTUALIZAR PUNTOS
    const nuevosPuntos =
      usuario.puntos - puntosUsados + Math.floor(totalFinal);

    await axios.put(
      `${AUTH_URL}/api/usuarios/${id_usuario}/puntos`,
      {
        puntos: nuevosPuntos
      },
      {
        headers: {
          Authorization: req.headers.authorization
        }
      }
    );

    // 🔥 8. RESPUESTA FINAL
    return res.json({
      message: "Pago exitoso",
      codigo_qr: codigoQR,
      total_pagado: totalFinal,
      puntos_actuales: nuevosPuntos
    });

  } catch (error) {
    console.error("ERROR PAGO:", error);

    return res.status(500).json({
      message: "Error en pago",
      error: error.message
    });
  }
};

// =========================
// MIS PAGOS
// =========================
const misPagos = async (req, res) => {
  try {
    const pagos = await Pago.findAll({
      where: { id_usuario: req.usuario.id }
    });

    res.json(pagos);
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener pagos",
      error: error.message
    });
  }
};

module.exports = {
  confirmarPago,
  misPagos
};