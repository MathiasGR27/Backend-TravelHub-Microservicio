const express = require("express");
const cors = require("cors");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();

app.use(cors());

app.use(
  "/api/auth",
  createProxyMiddleware({
    target: "http://localhost:4001",
    changeOrigin: true,

    pathRewrite: (path, req) => {
      return `/api/auth${path}`;
    }
  })
);

app.use(
  "/api/vuelos",
  createProxyMiddleware({
    target: "http://localhost:4002",
    changeOrigin: true,

    pathRewrite: (path) => {
      return `/api/vuelos${path}`;
    }
  })
);

app.use(
  "/api/usuarios",
  createProxyMiddleware({
    target: "http://localhost:4001",
    changeOrigin: true,

    pathRewrite: (path) => {
      return `/api/usuarios${path}`;
    }
  })
);

app.get("/", (req, res) => {
  res.json({
    service: "API GATEWAY",
    status: "OK",
  });
});

module.exports = app;