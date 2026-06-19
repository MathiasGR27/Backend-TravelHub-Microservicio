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
app.use(
  "/uploads",
  createProxyMiddleware({
    target: "http://localhost:4001",
    changeOrigin: true,
    pathRewrite: {
      "^/uploads": "/uploads"},
    ws: true,
    logLevel: "debug"
  })
);
app.use(
  "/api/reservas",
  createProxyMiddleware({
    target: "http://localhost:4003",
    changeOrigin: true,
    pathRewrite: (path) => {
      return `/api/reservas${path}`;
    }
  })
);
app.use(
  "/api/pagos",
  createProxyMiddleware({
    target: "http://localhost:4004",
    changeOrigin: true,
    pathRewrite: (path) => {
      return `/api/pagos${path}`;
    }
  })
);
app.use(
  "/api/admin",
  createProxyMiddleware({
    target: "http://localhost:4005",
    changeOrigin: true,
    pathRewrite: (path) => {
      return `/api/admin${path}`;
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