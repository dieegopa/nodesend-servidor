const express = require("express");
const router = express.Router();
const enlacesController = require("../controllers/enlacesController");
const archivoController = require("../controllers/archivoController");
const { check } = require("express-validator");
const auth = require("../middleware/auth");

router.post(
  "/",
  [
    check("nombre", "Sube un archivo").notEmpty(),
    check("nombre_original", "Sube un archivo").notEmpty(),
  ],
  auth,
  enlacesController.nuevoEnlace
);

router.get("/", enlacesController.todosEnlaces);

router.get(
  "/:url",
  enlacesController.tienePassword,
  enlacesController.obtenerEnlace
);

router.post(
  "/:url",
  enlacesController.verficarPassword,
  enlacesController.obtenerEnlace
);

module.exports = router;
