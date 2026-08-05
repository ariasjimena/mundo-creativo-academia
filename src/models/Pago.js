const mongoose = require('mongoose');

const pagoSchema = new mongoose.Schema({
  estudiante: { type: mongoose.Schema.Types.ObjectId, ref: 'Estudiante', required: true },
  clase: { type: mongoose.Schema.Types.ObjectId, ref: 'Clase', required: true },
  mes: { type: Number, required: true, min: 1, max: 12 },
  anio: { type: Number, required: true },
  monto: { type: Number, required: true },
  metodoPago: {
    type: String,
    enum: ['efectivo', 'transferencia'],
    required: true
  },
  banco: {
    type: String,
    enum: ['popular', 'banreservas', 'bhd', 'asociacion_popular', ''],
    default: ''
  },
  estado: {
    type: String,
    enum: ['pendiente', 'comprobante_enviado', 'aprobado', 'rechazado'],
    default: 'pendiente'
  },
  academia: {
    type: String,
    enum: ['mca', 'tropical'],
    default: 'mca'
  },
  comprobante: {
    nombreArchivo: { type: String },
    urlArchivo: { type: String },
    fechaSubida: { type: Date }
  },
  notas: { type: String },
  fechaPago: { type: Date },
  validadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
  fechaValidacion: { type: Date },
  creadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' }
}, { timestamps: true });

pagoSchema.index({ estudiante: 1, mes: 1, anio: 1, clase: 1 }, { unique: true });

module.exports = mongoose.model('Pago', pagoSchema);

