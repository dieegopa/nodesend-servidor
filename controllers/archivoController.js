const multer = require("multer");
const shortid = require("shortid");
const fs = require("fs");
const Enlace = require("../models/Enlace");

exports.subirArchivo = async (req, res, next) => {
  const configuracionMulter = {
    limits: {
      fileSize: req.usuario ? 1024 * 1024 * 10 : 1024 * 1024,
    },
    storage: (fileStorage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, __dirname + "/../uploads");
      },
      filename: (req, file, cb) => {
        const extension = file.originalname.substring(
          file.originalname.lastIndexOf("."),
          file.originalname.length
        );
        cb(null, `${shortid.generate()}${extension}`);
      },
    })),
  };

  const upload = multer(configuracionMulter).single("archivo");
  upload(req, res, async (error) => {
    //console.log(req.file);

    if (!error) {
      res.status(200).json({ archivo: req.file.filename });
    } else {
      console.log(error);
      return next();
    }
  });
};

exports.eliminarArchivo = async (req, res) => {
  try {
    fs.unlinkSync(__dirname + `/../uploads/${req.archivo}`);
    console.log("archivo eliminado");
  } catch (error) {
    console.log(error);
  }
};

//descarga un archivo
exports.descargar = async (req, res, next) => {
  //obtiene el enlace
  const enlace = await Enlace.findOne({ nombre: req.params.archivo });

  const archivo = __dirname + "/../uploads/" + req.params.archivo;
  res.download(archivo);

  //si las descargas son iguales a 1, necesitamos borrar la entrada y borrar el archivo
  const { descargas, nombre } = enlace;

  if (descargas === 1) {
    //eliminar el archivo
    req.archivo = nombre;

    //eliminar la entrada de la base de datos
    await Enlace.findOneAndRemove(enlace.id);
    next();
  } else {
    //si las descargas son mayores que 1, necesitamos restar las descargas
    enlace.descargas--;
    await enlace.save();
  }
};
