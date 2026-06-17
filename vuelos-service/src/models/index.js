const { sequelize } = require("./database");

require("./vueloOferta");

const conectarDB = async () => {
  try {
    await sequelize.authenticate();

    console.log("Vuelos Service conectado");

    await sequelize.sync();

    console.log("Modelos sincronizados");
  } catch (error) {
    console.error(error);
  }
};

module.exports = conectarDB;