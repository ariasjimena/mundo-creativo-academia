require('dotenv').config()
const connectDB = require('../src/config/db')
const Usuario = require('../src/models/Usuario')
const Estudiante = require('../src/models/Estudiante')
const Clase = require('../src/models/Clase')

const seed = async () => {
  await connectDB()
  console.log('Limpiando base de datos...')
  await Promise.all([
    Usuario.deleteMany(),
    Estudiante.deleteMany(),
    Clase.deleteMany()
  ])

  console.log('Creando usuarios...')
  const [admin, recepcion, profe1, profe2, profe3] = await Usuario.create([
    { nombre: 'Admin', apellido: 'Sistema', email: 'admin@academia.com', password: 'Admin123!', rol: 'admin' },
    { nombre: 'Laura', apellido: 'Recepción', email: 'recepcion@academia.com', password: 'Admin123!', rol: 'recepcion' },
    { nombre: 'Profesora', apellido: 'Danza', email: 'profesor@academia.com', password: 'Profe123!', rol: 'profesor' },
    { nombre: 'Profesor', apellido: 'Música', email: 'musica@academia.com', password: 'Profe123!', rol: 'profesor' },
    { nombre: 'Profesora', apellido: 'Arte', email: 'arte@academia.com', password: 'Profe123!', rol: 'profesor' },
  ])

  console.log('Creando clases con horarios reales...')
  await Clase.create([
    // BALLET
    { nombre: 'Ballet', grupo: 'Lunes 3:00-4:30PM', nivel: 'basico', instrumento: 'Danza', profesor: profe1._id, cuposMaximos: 12, cuposOcupados: 0, mensualidad: 1800, horarios: [{ dia: 'lunes', horaInicio: '15:00', horaFin: '16:30' }] },
    { nombre: 'Ballet', grupo: 'Miércoles 3:00-4:30PM', nivel: 'basico', instrumento: 'Danza', profesor: profe1._id, cuposMaximos: 12, cuposOcupados: 0, mensualidad: 1800, horarios: [{ dia: 'miercoles', horaInicio: '15:00', horaFin: '16:30' }] },
    { nombre: 'Ballet', grupo: 'Viernes 3:00-4:30PM', nivel: 'basico', instrumento: 'Danza', profesor: profe1._id, cuposMaximos: 12, cuposOcupados: 0, mensualidad: 1800, horarios: [{ dia: 'viernes', horaInicio: '15:00', horaFin: '16:30' }] },
    { nombre: 'Ballet', grupo: 'Viernes 4:30-6:00PM', nivel: 'basico', instrumento: 'Danza', profesor: profe1._id, cuposMaximos: 12, cuposOcupados: 0, mensualidad: 1800, horarios: [{ dia: 'viernes', horaInicio: '16:30', horaFin: '18:00' }] },
    { nombre: 'Ballet', grupo: 'Sábado 9:00-10:30AM', nivel: 'basico', instrumento: 'Danza', profesor: profe1._id, cuposMaximos: 15, cuposOcupados: 0, mensualidad: 1800, horarios: [{ dia: 'sabado', horaInicio: '09:00', horaFin: '10:30' }] },
    { nombre: 'Ballet', grupo: 'Sábado 10:30-12:00PM', nivel: 'basico', instrumento: 'Danza', profesor: profe1._id, cuposMaximos: 15, cuposOcupados: 0, mensualidad: 1800, horarios: [{ dia: 'sabado', horaInicio: '10:30', horaFin: '12:00' }] },
    { nombre: 'Ballet', grupo: 'Sábado 12:00-1:00PM', nivel: 'basico', instrumento: 'Danza', profesor: profe1._id, cuposMaximos: 15, cuposOcupados: 0, mensualidad: 1800, horarios: [{ dia: 'sabado', horaInicio: '12:00', horaFin: '13:00' }] },
    { nombre: 'Ballet', grupo: 'Sábado 3:00-4:30PM', nivel: 'basico', instrumento: 'Danza', profesor: profe1._id, cuposMaximos: 15, cuposOcupados: 0, mensualidad: 1800, horarios: [{ dia: 'sabado', horaInicio: '15:00', horaFin: '16:30' }] },
    // BALLET ADULTO
    { nombre: 'Ballet Adulto', grupo: 'Viernes 9:00-10:00AM', nivel: 'basico', instrumento: 'Danza', profesor: profe1._id, cuposMaximos: 12, cuposOcupados: 0, mensualidad: 1800, horarios: [{ dia: 'viernes', horaInicio: '09:00', horaFin: '10:00' }] },
    // BABY BALLET
    { nombre: 'Baby Ballet', grupo: 'Sábado 9:00-10:30AM', nivel: 'iniciacion', instrumento: 'Danza', profesor: profe1._id, cuposMaximos: 10, cuposOcupados: 0, mensualidad: 1800, horarios: [{ dia: 'sabado', horaInicio: '09:00', horaFin: '10:30' }] },
    // HIP HOP
    { nombre: 'Hip Hop', grupo: 'Martes 3:00-4:30PM', nivel: 'basico', instrumento: 'Danza', profesor: profe1._id, cuposMaximos: 15, cuposOcupados: 0, mensualidad: 1800, horarios: [{ dia: 'martes', horaInicio: '15:00', horaFin: '16:30' }] },
    { nombre: 'Hip Hop', grupo: 'Miércoles 7:00-8:00PM', nivel: 'basico', instrumento: 'Danza', profesor: profe1._id, cuposMaximos: 15, cuposOcupados: 0, mensualidad: 1800, horarios: [{ dia: 'miercoles', horaInicio: '19:00', horaFin: '20:00' }] },
    { nombre: 'Hip Hop', grupo: 'Sábado 12:00-1:00PM', nivel: 'basico', instrumento: 'Danza', profesor: profe1._id, cuposMaximos: 15, cuposOcupados: 0, mensualidad: 1800, horarios: [{ dia: 'sabado', horaInicio: '12:00', horaFin: '13:00' }] },
    { nombre: 'Hip Hop', grupo: 'Sábado 1:00-2:00PM', nivel: 'basico', instrumento: 'Danza', profesor: profe1._id, cuposMaximos: 15, cuposOcupados: 0, mensualidad: 1800, horarios: [{ dia: 'sabado', horaInicio: '13:00', horaFin: '14:00' }] },
    { nombre: 'Hip Hop', grupo: 'Sábado 2:00-3:00PM', nivel: 'basico', instrumento: 'Danza', profesor: profe1._id, cuposMaximos: 15, cuposOcupados: 0, mensualidad: 1800, horarios: [{ dia: 'sabado', horaInicio: '14:00', horaFin: '15:00' }] },
    // CONTEMPORÁNEO
    { nombre: 'Contemporáneo', grupo: 'Jueves 7:00-8:00PM', nivel: 'basico', instrumento: 'Danza', profesor: profe1._id, cuposMaximos: 12, cuposOcupados: 0, mensualidad: 1800, horarios: [{ dia: 'jueves', horaInicio: '19:00', horaFin: '20:00' }] },
    // DANZA AÉREA
    { nombre: 'Danza Aérea', grupo: 'Martes 9:00-10:00AM', nivel: 'basico', instrumento: 'Danza', profesor: profe1._id, cuposMaximos: 8, cuposOcupados: 0, mensualidad: 2000, horarios: [{ dia: 'martes', horaInicio: '09:00', horaFin: '10:00' }] },
    { nombre: 'Danza Aérea', grupo: 'Martes 4:30-6:00PM', nivel: 'basico', instrumento: 'Danza', profesor: profe1._id, cuposMaximos: 8, cuposOcupados: 0, mensualidad: 2000, horarios: [{ dia: 'martes', horaInicio: '16:30', horaFin: '18:00' }] },
    { nombre: 'Danza Aérea', grupo: 'Martes 6:00-7:00PM', nivel: 'basico', instrumento: 'Danza', profesor: profe1._id, cuposMaximos: 8, cuposOcupados: 0, mensualidad: 2000, horarios: [{ dia: 'martes', horaInicio: '18:00', horaFin: '19:00' }] },
    { nombre: 'Danza Aérea', grupo: 'Miércoles 6:00-7:00PM', nivel: 'basico', instrumento: 'Danza', profesor: profe1._id, cuposMaximos: 8, cuposOcupados: 0, mensualidad: 2000, horarios: [{ dia: 'miercoles', horaInicio: '18:00', horaFin: '19:00' }] },
    { nombre: 'Danza Aérea', grupo: 'Jueves 7:00-8:00PM', nivel: 'basico', instrumento: 'Danza', profesor: profe1._id, cuposMaximos: 8, cuposOcupados: 0, mensualidad: 2000, horarios: [{ dia: 'jueves', horaInicio: '19:00', horaFin: '20:00' }] },
    { nombre: 'Danza Aérea', grupo: 'Viernes 7:00-8:00PM', nivel: 'basico', instrumento: 'Danza', profesor: profe1._id, cuposMaximos: 8, cuposOcupados: 0, mensualidad: 2000, horarios: [{ dia: 'viernes', horaInicio: '19:00', horaFin: '20:00' }] },
    // DANZA AÉREA KIDS
    { nombre: 'Danza Aérea Kids', grupo: 'Martes 4:30-6:00PM', nivel: 'iniciacion', instrumento: 'Danza', profesor: profe1._id, cuposMaximos: 8, cuposOcupados: 0, mensualidad: 2000, horarios: [{ dia: 'martes', horaInicio: '16:30', horaFin: '18:00' }] },
    // FLEXIBILIDAD
    { nombre: 'Flexibilidad', grupo: 'Jueves 9:00-10:00AM', nivel: 'basico', instrumento: 'Danza', profesor: profe1._id, cuposMaximos: 12, cuposOcupados: 0, mensualidad: 1500, horarios: [{ dia: 'jueves', horaInicio: '09:00', horaFin: '10:00' }] },
    { nombre: 'Flexibilidad', grupo: 'Jueves 10:00-11:00AM', nivel: 'basico', instrumento: 'Danza', profesor: profe1._id, cuposMaximos: 12, cuposOcupados: 0, mensualidad: 1500, horarios: [{ dia: 'jueves', horaInicio: '10:00', horaFin: '11:00' }] },
    { nombre: 'Flexibilidad', grupo: 'Jueves 6:00-7:00PM', nivel: 'basico', instrumento: 'Danza', profesor: profe1._id, cuposMaximos: 12, cuposOcupados: 0, mensualidad: 1500, horarios: [{ dia: 'jueves', horaInicio: '18:00', horaFin: '19:00' }] },
    { nombre: 'Flexibilidad', grupo: 'Sábado 8:00-9:00AM', nivel: 'basico', instrumento: 'Danza', profesor: profe1._id, cuposMaximos: 12, cuposOcupados: 0, mensualidad: 1500, horarios: [{ dia: 'sabado', horaInicio: '08:00', horaFin: '09:00' }] },
    // YOGA
    { nombre: 'Yoga', grupo: 'Lunes 7:00-8:00PM', nivel: 'basico', instrumento: 'Bienestar', profesor: profe1._id, cuposMaximos: 15, cuposOcupados: 0, mensualidad: 1500, horarios: [{ dia: 'lunes', horaInicio: '19:00', horaFin: '20:00' }] },
    { nombre: 'Yoga', grupo: 'Martes 7:00-8:00PM', nivel: 'basico', instrumento: 'Bienestar', profesor: profe1._id, cuposMaximos: 15, cuposOcupados: 0, mensualidad: 1500, horarios: [{ dia: 'martes', horaInicio: '19:00', horaFin: '20:00' }] },
    { nombre: 'Yoga', grupo: 'Miércoles 8:00-9:00AM', nivel: 'basico', instrumento: 'Bienestar', profesor: profe1._id, cuposMaximos: 15, cuposOcupados: 0, mensualidad: 1500, horarios: [{ dia: 'miercoles', horaInicio: '08:00', horaFin: '09:00' }] },
    // MODELAJE
    { nombre: 'Modelaje', grupo: 'Lunes 6:00-7:00PM', nivel: 'basico', instrumento: 'Arte', profesor: profe3._id, cuposMaximos: 10, cuposOcupados: 0, mensualidad: 1800, horarios: [{ dia: 'lunes', horaInicio: '18:00', horaFin: '19:00' }] },
    // PINTURA KIDS
    { nombre: 'Pintura Kids', grupo: 'Jueves 4:30-6:00PM', nivel: 'iniciacion', instrumento: 'Arte', profesor: profe3._id, cuposMaximos: 12, cuposOcupados: 0, mensualidad: 1500, horarios: [{ dia: 'jueves', horaInicio: '16:30', horaFin: '18:00' }] },
    { nombre: 'Pintura Kids', grupo: 'Sábado 3:00-4:30PM', nivel: 'iniciacion', instrumento: 'Arte', profesor: profe3._id, cuposMaximos: 12, cuposOcupados: 0, mensualidad: 1500, horarios: [{ dia: 'sabado', horaInicio: '15:00', horaFin: '16:30' }] },
    // PIANO
    { nombre: 'Piano', grupo: 'Lunes 5:00-6:00PM', nivel: 'basico', instrumento: 'Música', profesor: profe2._id, cuposMaximos: 8, cuposOcupados: 0, mensualidad: 2000, horarios: [{ dia: 'lunes', horaInicio: '17:00', horaFin: '18:00' }] },
    { nombre: 'Piano', grupo: 'Jueves 6:00-7:00PM', nivel: 'basico', instrumento: 'Música', profesor: profe2._id, cuposMaximos: 8, cuposOcupados: 0, mensualidad: 2000, horarios: [{ dia: 'jueves', horaInicio: '18:00', horaFin: '19:00' }] },
    { nombre: 'Piano', grupo: 'Sábado 4:30-5:30PM', nivel: 'basico', instrumento: 'Música', profesor: profe2._id, cuposMaximos: 8, cuposOcupados: 0, mensualidad: 2000, horarios: [{ dia: 'sabado', horaInicio: '16:30', horaFin: '17:30' }] },
    // GUITARRA
    { nombre: 'Guitarra', grupo: 'Sábado 5:30-6:30PM', nivel: 'basico', instrumento: 'Música', profesor: profe2._id, cuposMaximos: 8, cuposOcupados: 0, mensualidad: 2000, horarios: [{ dia: 'sabado', horaInicio: '17:30', horaFin: '18:30' }] },
    // BACHATA
    { nombre: 'Bachata', grupo: 'Martes 8:00-9:00PM', nivel: 'basico', instrumento: 'Danza', profesor: profe1._id, cuposMaximos: 15, cuposOcupados: 0, mensualidad: 1800, horarios: [{ dia: 'martes', horaInicio: '20:00', horaFin: '21:00' }] },
  ])

  console.log('\n✅ Seed completado. Credenciales:')
  console.log('   Admin:     admin@academia.com     / Admin123!')
  console.log('   Recepción: recepcion@academia.com / Admin123!')
  console.log('   Profesor:  profesor@academia.com  / Profe123!')
  process.exit(0)
}

seed().catch(err => { console.error(err); process.exit(1) })
