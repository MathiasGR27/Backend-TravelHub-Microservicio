const Pasajero = require("../models/pasajero");
const Reserva = require("../models/reserva");

const crearPasajero = async (req, res) => {
  try {
    const { id_reserva } = req.params;
    const { nombre, documento, asiento } = req.body;

    // SOLO validar reserva (sin usuario directo si no es necesario)
    const reserva = await Reserva.findByPk(id_reserva);

    if (!reserva) {
      return res.status(404).json({ message: "Reserva no existe" });
    }

    const pasajero = await Pasajero.create({
      nombre_completo: nombre,
      documento,
      asiento,
      id_reserva
    });

    res.status(201).json(pasajero);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al crear pasajero" });
  }
};

const verPasajerosPorReserva = async (req, res) => {
  try {
    const { id_reserva } = req.params;

    const pasajeros = await Pasajero.findAll({
      where: { id_reserva }
    });

    res.json(pasajeros);

  } catch (error) {
    res.status(500).json({ message: "Error al obtener pasajeros" });
  }
};

module.exports = {
  crearPasajero,
  verPasajerosPorReserva
};