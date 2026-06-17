const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth.middleware");
const Usuario = require("../models/usuario");
const path = require("path");
const multer = require("multer");

const { misPuntos, obtenerUsuarioPorId } = require("../controllers/usuario.controller");

// ============================
// CONFIGURACION MULTER LOCAL
// ============================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "src/uploads/");
  },
  filename: (req, file, cb) => {
    const nombreArchivo =
      Date.now() + path.extname(file.originalname);

    cb(null, nombreArchivo);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
});

// ============================
// RUTAS
// ============================

router.get("/mis-puntos", authMiddleware, misPuntos);
router.get("/:id", obtenerUsuarioPorId);

router.post(
  "/update-avatar/:id",
  authMiddleware,
  upload.single("foto"),
  async (req, res) => {
    try {
      const { id } = req.params;

      if (!req.file) {
        return res.status(400).json({
          message: "No se subió ninguna imagen",
        });
      }

      const urlFoto =
        `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;

      await Usuario.update(
        { foto: urlFoto },
        {
          where: {
            id_usuario: id,
          },
        }
      );

      res.json({
        message: "Foto actualizada correctamente",
        foto: urlFoto,
      });
    } catch (error) {
      console.error("Error al subir avatar:", error);

      res.status(500).json({
        message: "Error interno del servidor",
      });
    }
  }
);

module.exports = router;