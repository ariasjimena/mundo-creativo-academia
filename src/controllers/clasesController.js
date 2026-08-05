const Clase = require('../models/Clase');
const Asistencia = require('../models/Asistencia');

exports.obtenerClases = async (req, res) => {
  try {
    const { estado, profesorId, academia } = req.query;
    const filtro = {};
    if (estado) filtro.estado = estado;
    if (academia) filtro.academia = academia;
    if (profesorId) filtro.profesor = profesorId;
    if (req.usuario.rol === 'profesor') filtro.profesor = req.usuario._id;

    const clases = await Clase.find(filtro)
      .populate('profesor', 'nombre apellido email')
      .populate('estudiantes', 'nombre apellido')
      .sort({ nombre: 1 });

    res.json({ success: true, total: clases.length, clases });
  } catch (error) {
    res.status(500).json({ success: false, mensaje: 'Error al obtener clases.', error: error.message });
  }
};

exports.obtenerClase = async (req, res) => {
  try {
    const clase = await Clase.findById(req.params.id)
      .populate('profesor', 'nombre apellido email telefono')
      .populate('estudiantes', 'nombre apellido email tutor');
    if (!clase) return res.status(404).json({ success: false, mensaje: 'Clase no encontrada.' });
    res.json({ success: true, clase });
  } catch (error) {
    res.status(500).json({ success: false, mensaje: 'Error al obtener clase.', error: error.message });
  }
};

exports.crearClase = async (req, res) => {
  try {
    const clase = await Clase.create(req.body);
    await clase.populate('profesor', 'nombre apellido');
    res.status(201).json({ success: true, clase });
  } catch (error) {
    res.status(500).json({ success: false, mensaje: 'Error al crear clase.', error: error.message });
  }
};

exports.actualizarClase = async (req, res) => {
  try {
    const clase = await Clase.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('profesor', 'nombre apellido');
    if (!clase) return res.status(404).json({ success: false, mensaje: 'Clase no encontrada.' });
    res.json({ success: true, clase });
  } catch (error) {
    res.status(500).json({ success: false, mensaje: 'Error al actualizar clase.', error: error.message });
  }
};

exports.registrarAsistencia = async (req, res) => {
  try {
    const { fecha, registros } = req.body;
    const claseId = req.params.id;
    const asistencia = await Asistencia.findOneAndUpdate(
      { clase: claseId, fecha: new Date(fecha) },
      { clase: claseId, fecha: new Date(fecha), registros, registradoPor: req.usuario._id },
      { upsert: true, new: true, runValidators: true }
    ).populate('registros.estudiante', 'nombre apellido');
    res.json({ success: true, asistencia });
  } catch (error) {
    res.status(500).json({ success: false, mensaje: 'Error al registrar asistencia.', error: error.message });
  }
};

exports.obtenerAsistencia = async (req, res) => {
  try {
    const { desde, hasta } = req.query;
    const filtro = { clase: req.params.id };
    if (desde || hasta) {
      filtro.fecha = {};
      if (desde) filtro.fecha.$gte = new Date(desde);
      if (hasta) filtro.fecha.$lte = new Date(hasta);
    }
    const asistencias = await Asistencia.find(filtro)
      .populate('registros.estudiante', 'nombre apellido')
      .sort({ fecha: -1 });
    res.json({ success: true, asistencias });
  } catch (error) {
    res.status(500).json({ success: false, mensaje: 'Error al obtener asistencia.', error: error.message });
  }
};
