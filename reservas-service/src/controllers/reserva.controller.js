const Reserva = require("../models/reserva");
const Pasajero = require("../models/pasajero");
const axios = require("axios");
const { Op } = require("sequelize");

const AUTH_URL = process.env.AUTH_SERVICE_URL;
const VUELOS_URL = process.env.VUELOS_SERVICE_URL;

// ===============================
// ASIENTOS OCUPADOS
// ===============================
const obtenerAsientosOcupados = async (req, res) => {
  try {
    const { id_vuelo } = req.params;

    const reservas = await Reserva.findAll({
      where: { id_vuelo }
    });

    const ids = reservas.map(r => r.id_reserva);

    const pasajeros = await Pasajero.findAll({
      where: {
        id_reserva: {
          [Op.in]: ids
        }
      },
      attributes: ["asiento"]
    });

    res.json(pasajeros.map(p => p.asiento));

  } catch (error) {
    res.status(500).json({
      message: "Error asientos",
      error: error.message
    });
  }
};

// ===============================
// CREAR RESERVA
// ===============================
const crearReserva = async (req, res) => {
  try {
    const { id_vuelo, listaPasajeros } = req.body;
    const id_usuario = req.usuario.id;

    if (!listaPasajeros?.length) {
      return res.status(400).json({ message: "Pasajeros vacíos" });
    }

    const { data: usuario } = await axios.get(
      `${AUTH_URL}/api/usuarios/${id_usuario}`
    );

    const { data: vuelo } = await axios.get(
      `${VUELOS_URL}/api/vuelos/${id_vuelo}`
    );

    const reservas = await Reserva.findAll({ where: { id_vuelo } });

    const ids = reservas.map(r => r.id_reserva);

    const ocupados = await Pasajero.findAll({
      where: {
        id_reserva: {
          [Op.in]: ids
        }
      }
    });

    const ocupadosList = ocupados.map(o => o.asiento);

    const conflicto = listaPasajeros
      .map(p => p.asiento)
      .filter(a => ocupadosList.includes(a));

    if (conflicto.length > 0) {
      return res.status(400).json({
        message: "Asientos ocupados",
        ocupados: conflicto
      });
    }

    const reserva = await Reserva.create({
      id_usuario,
      id_vuelo,
      total: vuelo.precio * listaPasajeros.length,
      estado: "PENDIENTE"
    });

    await Pasajero.bulkCreate(
      listaPasajeros.map(p => ({
        nombre_completo: p.nombre,
        documento: p.cedula,
        asiento: p.asiento,
        id_reserva: reserva.id_reserva
      }))
    );

    res.json({
      message: "Reserva creada",
      id_reserva: reserva.id_reserva
    });

  } catch (error) {
    res.status(500).json({
      message: "Error al crear reserva",
      error: error.message
    });
  }
};

// ===============================
// MIS RESERVAS
// ===============================
const misReservas = async (req, res) => {
  try {
    const reservas = await Reserva.findAll({
      where: { id_usuario: req.usuario.id },
      include: [{ association: "pasajeros" }]
    });

    const resultado = await Promise.all(
      reservas.map(async (r) => {
        let vuelo = null;

        try {
          const { data } = await axios.get(
            `${VUELOS_URL}/api/vuelos/${r.id_vuelo}`
          );
          vuelo = data;
        } catch (e) {}

        return {
          ...r.toJSON(),
          vuelo
        };
      })
    );

    res.json(resultado);

  } catch (error) {
    res.status(500).json({
      message: "Error mis reservas",
      error: error.message
    });
  }
};

// ===============================
// ADMIN: TODAS LAS RESERVAS (CORREGIDO)
// ===============================
const verTodasLasReservas = async (req, res) => {
  try {
    const reservas = await Reserva.findAll({
      include: [{ association: "pasajeros" }]
    });

    const resultado = await Promise.all(
      reservas.map(async (r) => {
        let vuelo = null;
        let usuario = null;

        try {
          const [v, u] = await Promise.all([
            axios.get(`${VUELOS_URL}/api/vuelos/${r.id_vuelo}`),
            axios.get(`${AUTH_URL}/api/usuarios/${r.id_usuario}`)
          ]);

          vuelo = v.data;
          usuario = u.data;

        } catch (e) {}

        return {
          ...r.toJSON(),
          vuelo,
          usuario
        };
      })
    );

    res.json(resultado);

  } catch (error) {
    res.status(500).json({
      message: "Error admin reservas",
      error: error.message
    });
  }
};

module.exports = {
  crearReserva,
  misReservas,
  verTodasLasReservas,
  obtenerAsientosOcupados
};