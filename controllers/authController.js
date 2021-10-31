const Usuario = require("../models/Usuario");
const bcrypt = require("bcrypt");
const { restart } = require("nodemon");
const jwt = require("jsonwebtoken");
require("dotenv").config({ path: "variables.env" });
const { validationResult } = require("express-validator");

exports.autenticarUsuario = async (req, res, next) => {
  //mostrar los mensajes de error de express validator
  const errores = validationResult(req);

  if (!errores.isEmpty()) {
    return res.status(400).json({ errores: errores.array() });
  }

  //buscar el usuario
  const { email, password } = req.body;
  const usuario = await Usuario.findOne({ email });

  if (!usuario) {
    res.status(401).json({ msg: "El usuario no existe" });
    return next();
  }

  //verificar el password y autenticar al usuario
  if (bcrypt.compareSync(password, usuario.password)) {
    const token = jwt.sign(
      {
        id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email,
      },
      process.env.SECRETA,
      {
        expiresIn: "8h",
      }
    );

    res.status(200).json({ token });
  } else {
    res.status(401).json({ msg: "La contraseña es incorrecta" });
    return next();
  }
};

exports.usuarioAutenticado = (req, res, next) => {
  res.status(200).json({ usuario: req.usuario });
};
