const Reserva = require("../models/reserva");
const Pasajero = require("../models/pasajero");
const axios = require("axios");

const AUTH_URL = process.env.AUTH_SERVICE_URL;
const VUELOS_URL = process.env.VUELOS_SERVICE_URL;

// ------------------------------
// ASIENTOS OCUPADOS
// ------------------------------
const obtenerAsientosOcupados = async (req, res) => {
  try {
    const { id_vuelo } = req.params;

    const reservas = await Reserva.findAll({
      where: { id_vuelo }
    });

    const ids = reservas.map(r => r.id_reserva);

    const pasajeros = await Pasajero.findAll({
      where: {
        id_reserva: ids
      },
      attributes: ["asiento"]
    });

    const ocupados = pasajeros.map(p => p.asiento);

    res.json(ocupados);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error al obtener asientos",
      error: error.message
    });
  }
};

// ------------------------------
// CREAR RESERVA
// ------------------------------
const crearReserva = async (req, res) => {
  try {
    const { id_vuelo, listaPasajeros } = req.body;
    const id_usuario = req.usuario.id;

    if (!listaPasajeros || listaPasajeros.length === 0) {
      return res.status(400).json({
        message: "Lista de pasajeros vacía"
      });
    }

    // 1. USUARIO (AUTH SERVICE)
    const { data: usuarioDB } = await axios.get(
      `${AUTH_URL}/api/usuarios/${id_usuario}`
    );

    if (!usuarioDB) {
      return res.status(404).json({
        message: "Usuario no encontrado"
      });
    }

    // 2. VUELO (VUELOS SERVICE)
    const { data: vuelo } = await axios.get(
      `${VUELOS_URL}/api/vuelos/${id_vuelo}`
    );

    if (!vuelo) {
      return res.status(404).json({
        message: "Vuelo no encontrado"
      });
    }

    // 3. ACTUALIZAR CÉDULA (opcional)
    const principal = listaPasajeros[0];

    if (principal.cedula && usuarioDB.cedula !== principal.cedula) {
      await axios.put(
        `${AUTH_URL}/api/usuarios/${id_usuario}`,
        { cedula: principal.cedula },
        {
          headers: {
            Authorization: req.headers.authorization
          }
        }
      );
    }

    // 4. VALIDAR ASIENTOS OCUPADOS
    const todosLosAsientos = listaPasajeros.map(p => p.asiento);

    const reservas = await Reserva.findAll({
      where: { id_vuelo }
    });

    const ids = reservas.map(r => r.id_reserva);

    const ocupados = await Pasajero.findAll({
      where: {
        id_reserva: ids
      },
      attributes: ["asiento"]
    });

    const ocupadosList = ocupados.map(o => o.asiento);

    const conflicto = todosLosAsientos.filter(a =>
      ocupadosList.includes(a)
    );

    if (conflicto.length > 0) {
      return res.status(400).json({
        message: "Asientos ya ocupados",
        ocupados: conflicto
      });
    }

    // 5. CREAR RESERVA
    const reserva = await Reserva.create({
      id_usuario,
      id_vuelo,
      total: Number(vuelo.precio) * listaPasajeros.length,
      estado: "PENDIENTE"
    });

    // 6. CREAR PASAJEROS
    const pasajerosFinal = listaPasajeros.map(p => ({
      nombre_completo: p.nombre,
      documento: p.cedula,
      asiento: p.asiento,
      id_reserva: reserva.id_reserva
    }));

    await Pasajero.bulkCreate(pasajerosFinal);

    res.status(201).json({
      message: "Reserva creada correctamente",
      id_reserva: reserva.id_reserva,
      total: reserva.total
    });

  } catch (error) {
    console.error("ERROR CREAR RESERVA:", error);

    res.status(500).json({
      message: "Error interno",
      error: error.message
    });
  }
};

// ------------------------------
// MIS RESERVAS
// ------------------------------
const misReservas = async (req, res) => {
  try {
    const reservas = await Reserva.findAll({
      where: { id_usuario: req.usuario.id },
      include: [
        {
          association: "pasajeros",
          attributes: ["nombre_completo", "asiento"]
        }
      ],
      order: [["id_reserva", "DESC"]]
    });

    // 🔥 traer vuelos por microservicio (NO Sequelize)
    const resultado = await Promise.all(
      reservas.map(async (r) => {
        let vuelo = null;

        try {
          const response = await axios.get(
            `${VUELOS_URL}/api/vuelos/${r.id_vuelo}`
          );
          vuelo = response.data;
        } catch (err) {
          vuelo = null;
        }

        return {
          id_reserva: r.id_reserva,
          fecha_reserva: r.fecha_reserva,
          estado: r.estado,
          total: r.total,
          vuelo,
          pasajeros: r.pasajeros || []
        };
      })
    );

    res.json(resultado);

  } catch (error) {
    res.status(500).json({
      message: "Error al obtener reservas",
      error: error.message
    });
  }
};

// ------------------------------
// ADMIN
// ------------------------------
const verTodasLasReservas = async (req, res) => {
  try {
    const reservas = await Reserva.findAll({
      include: [
        {
          association: "pasajeros"
        }
      ]
    });

    res.json(reservas);

  } catch (error) {
    res.status(500).json({
      message: "Error al obtener reservas"
    });
  }
};

module.exports = {
  crearReserva,
  misReservas,
  verTodasLasReservas,
  obtenerAsientosOcupados
};