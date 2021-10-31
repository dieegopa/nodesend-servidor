const Usuario = require("../models/Usuario");
const bcrypt = require("bcrypt");
const { validationResult } = require("express-validator");

exports.nuevoUsuario = async (req, res) => {
  //mostrar los mensajes de error de express validator
  const errores = validationResult(req);

  if (!errores.isEmpty()) {
    return res.status(400).json({ errores: errores.array() });
  }

  //verificar si el usuario ya esta registrado
  const { email, password } = req.body;

  let usuario = await Usuario.findOne({ email });

  if (usuario) {
    return res.status(400).json({ msg: "El usuario ya existe" });
  } else {
    try {
      usuario = new Usuario(req.body);

      //hashear el password
      const salt = await bcrypt.genSalt(10);
      usuario.password = await bcrypt.hash(password, salt);

      await usuario.save();

      res.status(200).json({ msg: "Usuario creado Correctamente" });
    } catch (error) {
      console.log(error);
    }
  }
};
