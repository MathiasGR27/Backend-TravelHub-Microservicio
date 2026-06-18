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

module.exports = async () => {
  await sequelize.authenticate();
  console.log("DB conectada reservas-service");

  await sequelize.sync({ alter: true });
  console.log("Modelos sincronizados");
};