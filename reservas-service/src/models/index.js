const Reserva = require("./reserva");
const Pasajero = require("./pasajero");
const { sequelize } = require("./database");

Reserva.hasMany(Pasajero, {
  foreignKey: "id_reserva",
  as: "pasajeros"
});

Pasajero.belongsTo(Reserva, {
  foreignKey: "id_reserva",
  as: "reserva"
});

const conectarDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("Reservas Service conectado a PostgreSQL");

    await sequelize.sync({ alter: true });

    console.log("Modelos sincronizados");
  } catch (error) {
    console.error("Error DB:", error);
  }
};

module.exports = conectarDB;