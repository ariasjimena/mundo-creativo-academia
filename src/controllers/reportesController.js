const Pago = require('../models/Pago');
const Estudiante = require('../models/Estudiante');
const Clase = require('../models/Clase');
const Asistencia = require('../models/Asistencia');

exports.dashboardStats = async (req, res) => {
  try {
    const hoy = new Date();
    const mesActual = hoy.getMonth() + 1;
    const anioActual = hoy.getFullYear();
    const inicioMes = new Date(anioActual, hoy.getMonth(), 1);

    const [
      totalEstudiantes,
      estudiantesActivos,
      nuevosEsteMes,
      clases,
      pagosDelMes,
      pagosPendientes
    ] = await Promise.all([
      Estudiante.countDocuments(),
      Estudiante.countDocuments({ estado: 'activo' }),
      Estudiante.countDocuments({ createdAt: { $gte: inicioMes } }),
      Clase.find({ estado: { $ne: 'inactiva' } }).select('nombre cuposMaximos cuposOcupados mensualidad'),
      Pago.find({ mes: mesActual, anio: anioActual, estado: 'aprobado' }),
      Pago.countDocuments({ estado: { $in: ['pendiente', 'comprobante_enviado'] } })
    ]);

    const ingresosMes = pagosDelMes.reduce((sum, p) => sum + p.monto, 0);

    res.json({
      success: true,
      stats: {
        totalEstudiantes,
        estudiantesActivos,
        nuevosEsteMes,
        totalClases: clases.length,
        ingresosMes,
        pagosPendientes,
        clases: clases.map(c => ({
          id: c._id,
          nombre: c.nombre,
          inscritos: c.cuposOcupados,
          cupos: c.cuposMaximos,
          ocupacion: Math.round((c.cuposOcupados / c.cuposMaximos) * 100)
        }))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, mensaje: 'Error al generar reporte.', error: error.message });
  }
};

exports.reporteFinanciero = async (req, res) => {
  try {
    const { anio = new Date().getFullYear() } = req.query;

    const pagos = await Pago.aggregate([
      { $match: { anio: Number(anio), estado: 'aprobado' } },
      {
        $group: {
          _id: { mes: '$mes', metodoPago: '$metodoPago' },
          total: { $sum: '$monto' },
          cantidad: { $sum: 1 }
        }
      },
      { $sort: { '_id.mes': 1 } }
    ]);

    const resumenMensual = Array.from({ length: 12 }, (_, i) => {
      const mes = i + 1;
      const transferencia = pagos.find(p => p._id.mes === mes && p._id.metodoPago === 'transferencia');
      const efectivo = pagos.find(p => p._id.mes === mes && p._id.metodoPago === 'efectivo');
      return {
        mes,
        transferencia: transferencia?.total || 0,
        efectivo: efectivo?.total || 0,
        total: (transferencia?.total || 0) + (efectivo?.total || 0)
      };
    });

    const totalAnual = resumenMensual.reduce((sum, m) => sum + m.total, 0);

    res.json({ success: true, anio: Number(anio), totalAnual, resumenMensual });
  } catch (error) {
    res.status(500).json({ success: false, mensaje: 'Error al generar reporte financiero.', error: error.message });
  }
};

exports.reporteAsistencia = async (req, res) => {
  try {
    const { mes, anio, claseId } = req.query;
    const mesNum = Number(mes) || new Date().getMonth() + 1;
    const anioNum = Number(anio) || new Date().getFullYear();
    const inicio = new Date(anioNum, mesNum - 1, 1);
    const fin = new Date(anioNum, mesNum, 0, 23, 59, 59);

    const filtro = { fecha: { $gte: inicio, $lte: fin } };
    if (claseId) filtro.clase = claseId;

    const asistencias = await Asistencia.find(filtro)
      .populate('clase', 'nombre cuposOcupados')
      .populate('registros.estudiante', 'nombre apellido');

    const porClase = {};
    for (const a of asistencias) {
      const cid = a.clase._id.toString();
      if (!porClase[cid]) {
        porClase[cid] = {
          clase: a.clase.nombre,
          sesiones: 0,
          totalPresencias: 0,
          totalRegistros: 0
        };
      }
      porClase[cid].sesiones++;
      porClase[cid].totalRegistros += a.registros.length;
      porClase[cid].totalPresencias += a.registros.filter(r => r.presente).length;
    }

    const reporte = Object.values(porClase).map(c => ({
      ...c,
      tasaAsistencia: c.totalRegistros > 0
        ? Math.round((c.totalPresencias / c.totalRegistros) * 100)
        : 0
    }));

    res.json({ success: true, mes: mesNum, anio: anioNum, reporte });
  } catch (error) {
    res.status(500).json({ success: false, mensaje: 'Error al generar reporte de asistencia.', error: error.message });
  }
};

exports.reporteMorosidad = async (req, res) => {
  try {
    const hoy = new Date();
    const mesActual = hoy.getMonth() + 1;
    const anioActual = hoy.getFullYear();

    const estudiantes = await Estudiante.find({ estado: 'activo' })
      .populate('clases', 'nombre mensualidad');

    const pagos = await Pago.find({ mes: mesActual, anio: anioActual });
    const pagosMap = new Set(pagos.map(p => `${p.estudiante}_${p.clase}`));

    const morosos = [];
    for (const est of estudiantes) {
      for (const clase of est.clases) {
        const key = `${est._id}_${clase._id}`;
        if (!pagosMap.has(key)) {
          morosos.push({
            estudiante: `${est.nombre} ${est.apellido}`,
            tutorTelefono: est.tutor?.telefono,
            clase: clase.nombre,
            monto: clase.mensualidad
          });
        }
      }
    }

    const totalPorCobrar = morosos.reduce((sum, m) => sum + m.monto, 0);
    res.json({ success: true, totalMorosos: morosos.length, totalPorCobrar, morosos });
  } catch (error) {
    res.status(500).json({ success: false, mensaje: 'Error al generar reporte de morosidad.', error: error.message });
  }
};
