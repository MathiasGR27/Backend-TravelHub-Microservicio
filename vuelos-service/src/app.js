const express = require("express");
const cors = require("cors");

const vueloRoutes = require("./routes/vuelo.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/vuelos", vueloRoutes);

app.get("/", (req, res) => {
  res.json({
    service: "VUELOS SERVICE",
    status: "OK",
  });
});

module.exports = app;