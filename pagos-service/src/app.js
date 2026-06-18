const express = require("express");
const cors = require("cors");

const pagoRoutes = require("./routes/pago.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/pagos", pagoRoutes);

app.get("/", (req, res) => {
  res.json({
    service: "PAGOS SERVICE",
    status: "OK"
  });
});

module.exports = app;