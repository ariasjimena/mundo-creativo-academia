const mongoose = require('mongoose');

const estudianteSchema = new mongoose.Schema({
  matricula: { type: String, unique: true, sparse: true, trim: true },
  nombre: { type: String, required: true, trim: true },
  apellido: { type: String, required: true, trim: true },
  fechaNacimiento: { type: Date, required: true },
  edad: { type: Number },
  sexo: { type: String, enum: ['M', 'F', ''], default: '' },
  direccion: { type: String, trim: true },
  telefono: { type: String, trim: true },
  email: { type: String, lowercase: true, trim: true },
  atencionEspecial: {
    requiere: { type: Boolean, default: false },
    descripcion: { type: String, trim: true }
  },
  tutor: {
    requerido: { type: Boolean, default: true },
    parentesco: { type: String, trim: true },
    nombre: { type: String, trim: true },
    email: { type: String, lowercase: true, trim: true },
    celular: { type: String, trim: true },
    usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' }
  },
  clases: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Clase' }],
  estado: {
    type: String,
    enum: ['pendiente', 'activo', 'inactivo', 'suspendido'],
    default: 'pendiente'
  },
  origenInscripcion: {
    type: String,
    enum: ['admin', 'online'],
    default: 'admin'
  },
  academia: {
    type: String,
    enum: ['mca', 'tropical'],
    default: 'mca'
  },
  fechaInscripcion: { type: Date, default: Date.now },
  notas: { type: String },
  usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' }
}, { timestamps: true });

estudianteSchema.virtual('nombreCompleto').get(function () {
  return `${this.nombre} ${this.apellido}`;
});

module.exports = mongoose.model('Estudiante', estudianteSchema);
