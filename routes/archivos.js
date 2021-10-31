const express = require("express");
const router = express.Router();
const archivoController = require("../controllers/archivoController");
const auth = require("../middleware/auth");

router.post("/", auth, archivoController.subirArchivo);
router.get(
  "/:archivo",
  archivoController.descargar,
  archivoController.eliminarArchivo
);

module.exports = router;
