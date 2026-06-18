const esAdmin = (req, res, next) => {
  if (req.usuario.rol !== "ADMIN") {
    return res.status(403).json({ message: "Solo admin" });
  }
  next();
};

module.exports = { esAdmin };