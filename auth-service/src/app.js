const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());

app.use(express.json());

app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);

const authRoutes = require("./routes/auth.routes");
const usuarioRoutes = require("./routes/usuario.routes");

app.use("/api/auth", authRoutes);
app.use("/api/usuarios", usuarioRoutes);

app.get("/", (req, res) => {
  res.json({
    service: "AUTH SERVICE",
    status: "OK",
  });
});

module.exports = app;