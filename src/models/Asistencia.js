const mongoose = require('mongoose');

const asistenciaSchema = new mongoose.Schema({
  clase: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Clase',
    required: true
  },
  fecha: { type: Date, required: true },
  registradoPor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario'
  },
  registros: [
    {
      estudiante: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Estudiante',
        required: true
      },
      presente: { type: Boolean, default: false },
      justificado: { type: Boolean, default: false },
      nota: { type: String }
    }
  ]
}, { timestamps: true });

asistenciaSchema.index({ clase: 1, fecha: 1 }, { unique: true });

module.exports = mongoose.model('Asistencia', asistenciaSchema);
