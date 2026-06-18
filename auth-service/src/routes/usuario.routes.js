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
    cb(null, path.join(__dirname, "../uploads"));
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

      console.log("PARAMS:", req.params);
      console.log("BODY:", req.body);
      console.log("FILE:", req.file);

      const { id } = req.params;

      if (!req.file) {
        return res.status(400).json({
          message: "No se subió ninguna imagen",
        });
      }

      const urlFoto = `http://192.168.5.45:4000/uploads/${req.file.filename}`;

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
      console.error("ERROR COMPLETO:", error);

      res.status(500).json({
        message: "Error interno del servidor",
        error: error.message
      });
    }
  }
);

router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { cedula } = req.body;

    const usuario = await Usuario.findByPk(id);

    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    await usuario.update({
      cedula: cedula || usuario.cedula
    });

    res.json({
      message: "Usuario actualizado correctamente",
      usuario
    });

  } catch (error) {
    res.status(500).json({
      message: "Error al actualizar usuario",
      error: error.message
    });
  }
});

router.put("/:id/puntos", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { puntos } = req.body;

    const usuario = await Usuario.findByPk(id);

    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    usuario.puntos = puntos;
    await usuario.save();

    res.json({
      message: "Puntos actualizados correctamente",
      puntos: usuario.puntos
    });

  } catch (error) {
    res.status(500).json({
      message: "Error al actualizar puntos",
      error: error.message
    });
  }
});

module.exports = router;