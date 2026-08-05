const Estudiante = require('../models/Estudiante');
const Pago = require('../models/Pago');

exports.misDatos = async (req, res) => {
  try {
    const estudiantes = await Estudiante.find({
      'tutor.usuarioId': req.usuario._id
    }).populate('clases', 'nombre mensualidad horarios instrumento nivel grupo');

    if (estudiantes.length === 0) {
      return res.json({ success: true, estudiantes: [], pagos: [], resumen: {} });
    }

    const ids = estudiantes.map((e) => e._id);

    const pagos = await Pago.find({ estudiante: { $in: ids } })
      .populate('clase', 'nombre grupo')
      .populate('estudiante', 'nombre apellido matricula')
      .sort({ anio: -1, mes: -1 });

    const hoy = new Date();
    const mesActual = hoy.getMonth() + 1;
    const anioActual = hoy.getFullYear();

    const pagosMes = pagos.filter(
      (p) => p.mes === mesActual && p.anio === anioActual
    );

    const resumen = {
  totalEstudiantes: estudiantes.length,
  totalPagos: pagos.length,
  pagosAprobados: pagos.filter((p) => p.estado === 'aprobado').length,
  pagosPendientes: pagos.filter(
    (p) => p.estado === 'pendiente' || p.estado === 'comprobante_enviado'
  ).length
}

    res.json({ success: true, estudiantes, pagos, resumen });
  } catch (error) {
    res.status(500).json({ success: false, mensaje: error.message });
  }
};
