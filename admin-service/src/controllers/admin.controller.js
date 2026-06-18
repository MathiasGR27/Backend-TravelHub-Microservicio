const axios = require("axios");

const RESERVAS_URL = process.env.RESERVAS_SERVICE_URL;
const VUELOS_URL = process.env.VUELOS_SERVICE_URL;

// ===============================
// VALIDAR QR (MICROSERVICIOS)
// ===============================
const validarReservaQR = async (req, res) => {
  try {
    const { codigo } = req.params;

    // 🔥 1. TRAER RESERVAS (CON TOKEN)
    const { data: reservas } = await axios.get(
      `${RESERVAS_URL}/api/reservas`,
      {
        headers: {
          Authorization: req.headers.authorization
        }
      }
    );

    if (!reservas || reservas.length === 0) {
      return res.status(404).json({
        valido: false,
        message: "No hay reservas disponibles"
      });
    }

    // 🔥 2. BUSCAR QR
    const reserva = reservas.find(r => r.codigo_qr === codigo);

    if (!reserva) {
      return res.status(404).json({
        valido: false,
        message: "QR no encontrado"
      });
    }

    // 🔥 3. VALIDAR ESTADO
    if (reserva.estado !== "PAGADA") {
      return res.status(400).json({
        valido: false,
        message: "Reserva no pagada",
        estado: reserva.estado
      });
    }

    // 🔥 4. VUELO (MICROSERVICIO)
    const { data: vuelo } = await axios.get(
      `${VUELOS_URL}/api/vuelos/${reserva.id_vuelo}`
    );

    // 🔥 5. DETALLE RESERVA
    const { data: detalle } = await axios.get(
      `${RESERVAS_URL}/api/reservas/${reserva.id_reserva}`,
      {
        headers: {
          Authorization: req.headers.authorization
        }
      }
    );

    // 🔥 6. RESPUESTA FINAL
    return res.json({
      valido: true,
      detalles: {
        id_reserva: reserva.id_reserva,
        itinerario: `${vuelo.origen} - ${vuelo.destino}`,
        fecha: vuelo.fecha_salida,
        hora: vuelo.hora_salida
      },
      conteo: {
        total_pasajeros: detalle.pasajeros.length
      },
      lista_pasajeros: detalle.pasajeros.map(p => ({
        nombre: p.nombre_completo,
        asiento: p.asiento,
        documento: p.documento
      }))
    });

  } catch (error) {
    console.error("ERROR QR:", error);

    return res.status(500).json({
      message: "Error interno QR",
      error: error.message
    });
  }
};

module.exports = { validarReservaQR };