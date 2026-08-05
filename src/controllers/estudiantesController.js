const Estudiante = require('../models/Estudiante');
const Clase = require('../models/Clase');
const Pago = require('../models/Pago');
const generarMatricula = require('../utils/generarMatricula');

exports.obtenerEstudiantes = async (req, res) => {
  try {
    const { estado, buscar, clase, academia, pagina = 1, limite = 50 } = req.query;
    const filtro = {};
    if (estado) filtro.estado = estado;
    if (clase) filtro.clases = clase;
    if (academia) filtro.academia = academia;
    if (buscar) {
      filtro.$or = [
        { nombre: { $regex: buscar, $options: 'i' } },
        { apellido: { $regex: buscar, $options: 'i' } },
        { email: { $regex: buscar, $options: 'i' } },
        { matricula: { $regex: buscar, $options: 'i' } },
        { 'tutor.nombre': { $regex: buscar, $options: 'i' } }
      ];
    }
    const skip = (pagina - 1) * limite;
    const [estudiantes, total] = await Promise.all([
      Estudiante.find(filtro)
        .populate('clases', 'nombre mensualidad grupo academia')
        .sort({ matricula: 1 })
        .skip(skip)
        .limit(Number(limite)),
      Estudiante.countDocuments(filtro)
    ]);
    res.json({ success: true, total, paginas: Math.ceil(total / limite), paginaActual: Number(pagina), estudiantes });
  } catch (error) {
    res.status(500).json({ success: false, mensaje: 'Error al obtener estudiantes.', error: error.message });
  }
};

exports.obtenerEstudiante = async (req, res) => {
  try {
    const estudiante = await Estudiante.findById(req.params.id)
      .populate('clases', 'nombre mensualidad horarios grupo profesor academia');
    if (!estudiante) return res.status(404).json({ success: false, mensaje: 'Estudiante no encontrado.' });
    const pagos = await Pago.find({ estudiante: req.params.id })
      .populate('clase', 'nombre')
      .sort({ anio: -1, mes: -1 })
      .limit(12);
    res.json({ success: true, estudiante, pagos });
  } catch (error) {
    res.status(500).json({ success: false, mensaje: 'Error al obtener estudiante.', error: error.message });
  }
};

exports.crearEstudiante = async (req, res) => {
  try {
    const academia = req.body.academia || 'mca';
    const prefijo = academia === 'tropical' ? 'MT' : 'AMC';
    const matricula = await generarMatricula(prefijo);
    const estudiante = await Estudiante.create({ ...req.body, matricula, estado: 'activo', academia });
    res.status(201).json({ success: true, estudiante });
  } catch (error) {
    if (error.code === 11000) return res.status(400).json({ success: false, mensaje: 'El email ya está registrado.' });
    res.status(500).json({ success: false, mensaje: 'Error al crear estudiante.', error: error.message });
  }
};

exports.actualizarEstudiante = async (req, res) => {
  try {
    const estudiante = await Estudiante.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('clases', 'nombre mensualidad grupo');
    if (!estudiante) return res.status(404).json({ success: false, mensaje: 'Estudiante no encontrado.' });
    res.json({ success: true, estudiante });
  } catch (error) {
    res.status(500).json({ success: false, mensaje: 'Error al actualizar.', error: error.message });
  }
};

exports.inscribirEnClase = async (req, res) => {
  try {
    const { claseId } = req.body;
    const clase = await Clase.findById(claseId);
    if (!clase) return res.status(404).json({ success: false, mensaje: 'Clase no encontrada.' });
    if (clase.cuposOcupados >= clase.cuposMaximos)
      return res.status(400).json({ success: false, mensaje: 'La clase no tiene cupos disponibles.' });
    const estudiante = await Estudiante.findById(req.params.id);
    if (!estudiante) return res.status(404).json({ success: false, mensaje: 'Estudiante no encontrado.' });
    if (estudiante.clases.includes(claseId))
      return res.status(400).json({ success: false, mensaje: 'El estudiante ya está inscrito en esta clase.' });
    await Promise.all([
      Estudiante.findByIdAndUpdate(req.params.id, { $push: { clases: claseId } }),
      Clase.findByIdAndUpdate(claseId, { $push: { estudiantes: req.params.id }, $inc: { cuposOcupados: 1 } })
    ]);
    res.json({ success: true, mensaje: 'Estudiante inscrito correctamente.' });
  } catch (error) {
    res.status(500).json({ success: false, mensaje: 'Error al inscribir.', error: error.message });
  }
};

exports.eliminarEstudiante = async (req, res) => {
  try {
    const estudiante = await Estudiante.findByIdAndUpdate(req.params.id, { estado: 'inactivo' }, { new: true });
    if (!estudiante) return res.status(404).json({ success: false, mensaje: 'Estudiante no encontrado.' });
    res.json({ success: true, mensaje: 'Estudiante desactivado.' });
  } catch (error) {
    res.status(500).json({ success: false, mensaje: 'Error al eliminar.', error: error.message });
  }
};
