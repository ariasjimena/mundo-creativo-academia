const mongoose = require('mongoose');

const horarioSchema = new mongoose.Schema({
  dia: {
    type: String,
    enum: ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'],
    required: true
  },
  horaInicio: { type: String, required: true },
  horaFin: { type: String, required: true }
}, { _id: false });

const claseSchema = new mongoose.Schema({
  nombre: { type: String, required: true, trim: true },
  grupo: { type: String, trim: true },
  descripcion: { type: String, trim: true },
  nivel: {
    type: String,
    enum: ['iniciacion', 'basico', 'intermedio', 'avanzado'],
    default: 'basico'
  },
  instrumento: { type: String, trim: true },
  profesor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  horarios: [horarioSchema],
  cuposMaximos: { type: Number, required: true, min: 1 },
  cuposOcupados: { type: Number, default: 0 },
  mensualidad: { type: Number, required: true },
  estado: {
    type: String,
    enum: ['activa', 'inactiva', 'llena'],
    default: 'activa'
  },
  academia: {
    type: String,
    enum: ['mca', 'tropical'],
    default: 'mca'
  },
  estudiantes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Estudiante' }],
  color: { type: String, default: '#185FA5' }
}, { timestamps: true });

claseSchema.pre('save', function (next) {
  if (this.cuposOcupados >= this.cuposMaximos) this.estado = 'llena';
  else if (this.estado === 'llena') this.estado = 'activa';
  next();
});

module.exports = mongoose.model('Clase', claseSchema);



