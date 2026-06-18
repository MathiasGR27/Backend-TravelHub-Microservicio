const { sequelize, DataTypes } = require("./database");

const Reserva = sequelize.define("Reserva", {
  id_reserva: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  fecha_reserva: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  total: DataTypes.DECIMAL(10,2),
  id_usuario: DataTypes.INTEGER,
  id_vuelo: DataTypes.INTEGER,
  estado: {
    type: DataTypes.STRING,
    defaultValue: "PENDIENTE"
  },
  codigo_qr: DataTypes.STRING
}, {
  tableName: "reservas",
  timestamps: false
});

module.exports = Reserva;