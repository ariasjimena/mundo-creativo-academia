const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

const proteger = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, mensaje: 'No autorizado. Token requerido.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const usuario = await Usuario.findById(decoded.id).select('-password');

    if (!usuario || !usuario.activo) {
      return res.status(401).json({ success: false, mensaje: 'Usuario no encontrado o inactivo.' });
    }

    req.usuario = usuario;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, mensaje: 'Token inválido o expirado.' });
  }
};

const autorizar = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.usuario.rol)) {
      return res.status(403).json({
        success: false,
        mensaje: `El rol '${req.usuario.rol}' no tiene permiso para esta acción.`
      });
    }
    next();
  };
};

module.exports = { proteger, autorizar };
