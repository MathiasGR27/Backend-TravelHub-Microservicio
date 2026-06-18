const express = require("express");
const cors = require("cors");
require("dotenv").config();

const adminRoutes = require("./routes/admin.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/admin", adminRoutes);

app.get("/", (req, res) => {
  res.json({ service: "ADMIN SERVICE", status: "OK" });
});

module.exports = app;