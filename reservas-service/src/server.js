require("dotenv").config();

const app = require("./app");
const conectarDB = require("./models");

const PORT = process.env.PORT || 4003;

(async () => {
  await conectarDB();

  app.listen(PORT, () => {
    console.log(`Reservas Service ejecutandose en puerto ${PORT}`);
  });
})();