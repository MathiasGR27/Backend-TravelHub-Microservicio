require("dotenv").config();

const app = require("./app");
const conectarDB = require("./models");

const PORT = process.env.PORT || 4001;

(async () => {
  await conectarDB();

  app.listen(PORT, () => {
    console.log(`Auth Service ejecutandose en puerto ${PORT}`);
  });
})();