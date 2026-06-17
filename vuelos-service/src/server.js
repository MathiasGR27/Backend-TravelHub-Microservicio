require("dotenv").config();

const app = require("./app");
const conectarDB = require("./models");

const PORT = process.env.PORT || 4002;

(async () => {
  await conectarDB();

  app.listen(PORT, () => {
    console.log(`Vuelos Service ejecutandose en puerto ${PORT}`);
  });
})();