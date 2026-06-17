const { sequelize } = require("./database");

require("./usuario");

const conectarDB = async () => {
  try {
    await sequelize.authenticate();

    console.log("Auth Service conectado a PostgreSQL");

    await sequelize.sync();

    console.log("Modelos sincronizados");
  } catch (error) {
    console.error("Error BD:", error);
  }
};

module.exports = conectarDB;