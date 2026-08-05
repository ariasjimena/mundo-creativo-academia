const Pago = require('../models/Pago');
const Estudiante = require('../models/Estudiante');
const Clase = require('../models/Clase');

exports.obtenerPagos = async (req, res) => {
  try {
    const { estado, mes, anio, metodoPago, academia, pagina = 1, limite = 20 } = req.query;
    const filtro = {};
    if (estado) filtro.estado = estado;
    if (mes) filtro.mes = Number(mes);
    if (anio) filtro.anio = Number(anio);
    if (metodoPago) filtro.metodoPago = metodoPago;
    if (academia) filtro.academia = academia;
    if (req.usuario.rol === 'tutor') {
      const estudiantes = await Estudiante.find({ 'tutor.usuarioId': req.usuario._id }).select('_id');
      filtro.estudiante = { $in: estudiantes.map(e => e._id) };
    }
    const skip = (pagina - 1) * limite;
    const [pagos, total] = await Promise.all([
      Pago.find(filtro)
        .populate('estudiante', 'nombre apellido matricula academia')
        .populate('clase', 'nombre grupo academia')
        .populate('validadoPor', 'nombre apellido')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limite)),
      Pago.countDocuments(filtro)
    ]);
    res.json({ success: true, total, pagos });
  } catch (error) {
    res.status(500).json({ success: false, mensaje: error.message });
  }
};

exports.crearPago = async (req, res) => {
  try {
    const { estudianteId, claseId, mes, anio, monto, metodoPago, banco } = req.body;
    const existente = await Pago.findOne({ estudiante: estudianteId, clase: claseId, mes, anio });
    if (existente) return res.status(400).json({ success: false, mensaje: 'Ya existe un pago registrado para este período.' });
    const estudiante = await Estudiante.findById(estudianteId);
    const pago = await Pago.create({
      estudiante: estudianteId, clase: claseId, mes, anio, monto, metodoPago,
      banco: metodoPago === 'transferencia' ? (banco || '') : '',
      academia: estudiante?.academia || 'mca',
      estado: 'pendiente',
      creadoPor: req.usuario._id
    });
    await pago.populate(['estudiante', 'clase']);
    res.status(201).json({ success: true, pago });
  } catch (error) {
    res.status(500).json({ success: false, mensaje: error.message });
  }
};

exports.subirComprobante = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, mensaje: 'No se recibió archivo.' });
    const pago = await Pago.findById(req.params.id);
    if (!pago) return res.status(404).json({ success: false, mensaje: 'Pago no encontrado.' });
    pago.comprobante = {
      nombreArchivo: req.file.originalname,
      urlArchivo: `/uploads/comprobantes/${req.file.filename}`,
      fechaSubida: new Date()
    };
    pago.estado = 'comprobante_enviado';
    await pago.save();
    res.json({ success: true, mensaje: 'Comprobante subido. Pendiente de validación.', pago });
  } catch (error) {
    res.status(500).json({ success: false, mensaje: error.message });
  }
};

exports.validarPago = async (req, res) => {
  try {
    const { accion, notas } = req.body;
    if (!['aprobar', 'rechazar'].includes(accion))
      return res.status(400).json({ success: false, mensaje: 'Acción inválida.' });
    const pago = await Pago.findById(req.params.id);
    if (!pago) return res.status(404).json({ success: false, mensaje: 'Pago no encontrado.' });
    pago.estado = accion === 'aprobar' ? 'aprobado' : 'rechazado';
    pago.validadoPor = req.usuario._id;
    pago.fechaValidacion = new Date();
    if (notas) pago.notas = notas;
    if (accion === 'aprobar') pago.fechaPago = new Date();
    await pago.save();
    res.json({ success: true, mensaje: `Pago ${pago.estado} correctamente.`, pago });
  } catch (error) {
    res.status(500).json({ success: false, mensaje: error.message });
  }
};

exports.obtenerMensualidades = async (req, res) => {
  try {
    const { mes, anio, academia } = req.query;
    const mesActual = Number(mes) || new Date().getMonth() + 1;
    const anioActual = Number(anio) || new Date().getFullYear();
    const filtroEst = { estado: 'activo' };
    if (academia) filtroEst.academia = academia;
    const estudiantes = await Estudiante.find(filtroEst).populate('clases', 'nombre mensualidad grupo academia');
    const filtroP = { mes: mesActual, anio: anioActual };
    if (academia) filtroP.academia = academia;
    const pagosDelMes = await Pago.find(filtroP);
    const pagosMap = {};
    pagosDelMes.forEach(p => { pagosMap[`${p.estudiante}_${p.clase}`] = p; });
    const reporte = [];
    for (const est of estudiantes) {
      for (const clase of est.clases) {
        const key = `${est._id}_${clase._id}`;
        const pago = pagosMap[key];
        reporte.push({
          estudiante: { id: est._id, nombre: est.nombre, apellido: est.apellido, matricula: est.matricula },
          clase: { id: clase._id, nombre: clase.nombre, grupo: clase.grupo },
          monto: clase.mensualidad,
          estado: pago ? pago.estado : 'sin_pago',
          pago: pago || null
        });
      }
    }
    const resumen = {
      total: reporte.length,
      aprobados: reporte.filter(r => r.estado === 'aprobado').length,
      pendientes: reporte.filter(r => r.estado === 'pendiente' || r.estado === 'sin_pago').length,
      comprobanteEnviado: reporte.filter(r => r.estado === 'comprobante_enviado').length
    };
    res.json({ success: true, mes: mesActual, anio: anioActual, resumen, mensualidades: reporte });
  } catch (error) {
    res.status(500).json({ success: false, mensaje: error.message });
  }
};
