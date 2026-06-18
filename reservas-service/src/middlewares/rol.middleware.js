const esAdmin = (req, res, next) => {
  if (!req.usuario || req.usuario.rol !== "ADMIN") {
    return res.status(403).json({
      message: "Acceso denegado: se requiere rol administrador"
    });
  }
  next();
};

module.exports = { esAdmin };