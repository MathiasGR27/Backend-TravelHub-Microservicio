require("dotenv").config();

const app = require("./app");
const { sequelize } = require("./models/database");

const PORT = process.env.PORT || 4004;

(async () => {
  try {
    await sequelize.authenticate();
    console.log("Pagos Service conectado a PostgreSQL");

    await sequelize.sync({ alter: true });
    console.log("Modelos sincronizados");

    app.listen(PORT, () => {
      console.log(`Pagos Service ejecutándose en puerto ${PORT}`);
    });

  } catch (error) {
    console.error("Error DB:", error);
  }
})();