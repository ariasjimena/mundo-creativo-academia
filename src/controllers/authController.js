const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

const generarToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, mensaje: 'Email y contraseña requeridos.' });
    }

    const usuario = await Usuario.findOne({ email }).select('+password');

    if (!usuario || !(await usuario.compararPassword(password))) {
      return res.status(401).json({ success: false, mensaje: 'Credenciales incorrectas.' });
    }

    if (!usuario.activo) {
      return res.status(401).json({ success: false, mensaje: 'Cuenta inactiva. Contacta al administrador.' });
    }

    usuario.ultimoAcceso = new Date();
    await usuario.save({ validateBeforeSave: false });

    const token = generarToken(usuario._id);

    res.json({
      success: true,
      token,
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        rol: usuario.rol
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, mensaje: 'Error del servidor.', error: error.message });
  }
};

exports.obtenerPerfil = async (req, res) => {
  res.json({ success: true, usuario: req.usuario });
};

exports.crearUsuario = async (req, res) => {
  try {
    const { nombre, apellido, email, password, rol, telefono } = req.body;

    const existe = await Usuario.findOne({ email });
    if (existe) {
      return res.status(400).json({ success: false, mensaje: 'El email ya está registrado.' });
    }

    const usuario = await Usuario.create({ nombre, apellido, email, password, rol, telefono });
    const token = generarToken(usuario._id);

    res.status(201).json({ success: true, token, usuario: { id: usuario._id, nombre, apellido, email, rol } });
  } catch (error) {
    res.status(500).json({ success: false, mensaje: 'Error al crear usuario.', error: error.message });
  }
};

exports.cambiarPassword = async (req, res) => {
  try {
    const { passwordActual, passwordNueva } = req.body;
    const usuario = await Usuario.findById(req.usuario._id).select('+password');

    if (!(await usuario.compararPassword(passwordActual))) {
      return res.status(400).json({ success: false, mensaje: 'Contraseña actual incorrecta.' });
    }

    usuario.password = passwordNueva;
    await usuario.save();

    res.json({ success: true, mensaje: 'Contraseña actualizada correctamente.' });
  } catch (error) {
    res.status(500).json({ success: false, mensaje: 'Error al cambiar contraseña.', error: error.message });
  }
};
