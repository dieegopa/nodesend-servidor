const Enlace = require("../models/Enlace");
const shortid = require("shortid");
const bcrypt = require("bcrypt");
const { validationResult } = require("express-validator");
const e = require("express");

exports.nuevoEnlace = async (req, res, next) => {
  //mostrar los mensajes de error de express validator
  const errores = validationResult(req);

  if (!errores.isEmpty()) {
    return res.status(400).json({ errores: errores.array() });
  }

  //almacenar el enlace en la bd
  const { nombre_original, nombre } = req.body;
  const enlace = new Enlace();
  enlace.url = shortid.generate();
  enlace.nombre = nombre;
  enlace.nombre_original = nombre_original;

  //si el usuario esta autenticado
  if (req.usuario) {
    const { password, descargas } = req.body;
    if (descargas) {
      enlace.descargas = descargas;
    }

    if (password) {
      const salt = await bcrypt.genSalt(10);
      enlace.password = await bcrypt.hash(password, salt);
    }

    //asignar el autor
    enlace.autor = req.usuario.id;
  }

  try {
    await enlace.save();
    res.status(200).json({ msg: `${enlace.url}` });
    return next();
  } catch (error) {
    console.log(error);
  }
};

//retorna si el enlace tiene pass

exports.tienePassword = async (req, res, next) => {
  const { url } = req.params;
  //verificar si existe el enlace
  const enlace = await Enlace.findOne({ url });
  if (!enlace) {
    res.status(404).json({ msg: "El enlace no existe" });
    return next();
  }

  if (enlace.password) {
    return res.status(200).json({ password: true, enlace: enlace.url });
  }

  next();
};

//obtener el enlace
exports.obtenerEnlace = async (req, res, next) => {
  const { url } = req.params;
  //verificar si existe el enlace
  const enlace = await Enlace.findOne({ url });
  if (!enlace) {
    res.status(404).json({ msg: "El enlace no existe" });
    return next();
  }

  res.status(200).json({ archivo: enlace.nombre, password: false });

  next();
};

//obtiene un listado de todos los enlaces
exports.todosEnlaces = async (req, res) => {
  try {
    const enlaces = await Enlace.find({}).select("url -_id");
    res.status(200).json({ enlaces });
  } catch (error) {
    console.log(error);
  }
};

exports.verficarPassword = async (req, res, next) => {
  const { url } = req.params;

  const enlace = await Enlace.findOne({ url });

  const { password } = req.body;

  if (bcrypt.compareSync(password, enlace.password)) {
    next();
  } else {
    return res.status(401).json({ msg: "Password Incorrecto" });
  }
};
