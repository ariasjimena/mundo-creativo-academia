require('dotenv').config()
const connectDB = require('../src/config/db')
const Clase = require('../src/models/Clase')
const Usuario = require('../src/models/Usuario')

const run = async () => {
  await connectDB()
  let profe = await Usuario.findOne({ email: 'profesor@academia.com' })
  await Clase.deleteMany({ academia: 'tropical' })
  await Clase.create([
    { nombre: 'Salsa', grupo: 'Lunes 8:00-9:00PM', nivel: 'basico', instrumento: 'Danza Urbana', profesor: profe._id, cuposMaximos: 20, cuposOcupados: 0, mensualidad: 1500, academia: 'tropical', horarios: [{ dia: 'lunes', horaInicio: '20:00', horaFin: '21:00' }] },
    { nombre: 'Salsa', grupo: 'Martes 8:00-9:00PM', nivel: 'basico', instrumento: 'Danza Urbana', profesor: profe._id, cuposMaximos: 20, cuposOcupados: 0, mensualidad: 1500, academia: 'tropical', horarios: [{ dia: 'martes', horaInicio: '20:00', horaFin: '21:00' }] },
    { nombre: 'Salsa', grupo: 'Martes 9:00-10:00PM', nivel: 'basico', instrumento: 'Danza Urbana', profesor: profe._id, cuposMaximos: 20, cuposOcupados: 0, mensualidad: 1500, academia: 'tropical', horarios: [{ dia: 'martes', horaInicio: '21:00', horaFin: '22:00' }] },
    { nombre: 'Salsa', grupo: 'Miércoles 8:00-9:00PM', nivel: 'basico', instrumento: 'Danza Urbana', profesor: profe._id, cuposMaximos: 20, cuposOcupados: 0, mensualidad: 1500, academia: 'tropical', horarios: [{ dia: 'miercoles', horaInicio: '20:00', horaFin: '21:00' }] },
    { nombre: 'Salsa', grupo: 'Jueves 8:00-9:00PM', nivel: 'basico', instrumento: 'Danza Urbana', profesor: profe._id, cuposMaximos: 20, cuposOcupados: 0, mensualidad: 1500, academia: 'tropical', horarios: [{ dia: 'jueves', horaInicio: '20:00', horaFin: '21:00' }] },
    { nombre: 'Salsa', grupo: 'Viernes 8:00-9:00PM', nivel: 'basico', instrumento: 'Danza Urbana', profesor: profe._id, cuposMaximos: 20, cuposOcupados: 0, mensualidad: 1500, academia: 'tropical', horarios: [{ dia: 'viernes', horaInicio: '20:00', horaFin: '21:00' }] },
    { nombre: 'Salsa', grupo: 'Sábados 10:00-11:00AM', nivel: 'basico', instrumento: 'Danza Urbana', profesor: profe._id, cuposMaximos: 20, cuposOcupados: 0, mensualidad: 1500, academia: 'tropical', horarios: [{ dia: 'sabado', horaInicio: '10:00', horaFin: '11:00' }] },
    { nombre: 'Bachata', grupo: 'Lunes 8:00-9:00PM', nivel: 'basico', instrumento: 'Danza Urbana', profesor: profe._id, cuposMaximos: 20, cuposOcupados: 0, mensualidad: 1500, academia: 'tropical', horarios: [{ dia: 'lunes', horaInicio: '20:00', horaFin: '21:00' }] },
    { nombre: 'Bachata', grupo: 'Martes 8:00-9:00PM', nivel: 'basico', instrumento: 'Danza Urbana', profesor: profe._id, cuposMaximos: 20, cuposOcupados: 0, mensualidad: 1500, academia: 'tropical', horarios: [{ dia: 'martes', horaInicio: '20:00', horaFin: '21:00' }] },
    { nombre: 'Bachata', grupo: 'Miércoles 8:00-9:00PM', nivel: 'basico', instrumento: 'Danza Urbana', profesor: profe._id, cuposMaximos: 20, cuposOcupados: 0, mensualidad: 1500, academia: 'tropical', horarios: [{ dia: 'miercoles', horaInicio: '20:00', horaFin: '21:00' }] },
    { nombre: 'Bachata', grupo: 'Jueves 8:00-9:00PM', nivel: 'basico', instrumento: 'Danza Urbana', profesor: profe._id, cuposMaximos: 20, cuposOcupados: 0, mensualidad: 1500, academia: 'tropical', horarios: [{ dia: 'jueves', horaInicio: '20:00', horaFin: '21:00' }] },
    { nombre: 'Bachata', grupo: 'Viernes 8:00-9:00PM', nivel: 'basico', instrumento: 'Danza Urbana', profesor: profe._id, cuposMaximos: 20, cuposOcupados: 0, mensualidad: 1500, academia: 'tropical', horarios: [{ dia: 'viernes', horaInicio: '20:00', horaFin: '21:00' }] },
    { nombre: 'Salsa & Bachata', grupo: 'Lunes y Martes 8:00-9:00PM', nivel: 'basico', instrumento: 'Danza Urbana', profesor: profe._id, cuposMaximos: 20, cuposOcupados: 0, mensualidad: 2500, academia: 'tropical', horarios: [{ dia: 'lunes', horaInicio: '20:00', horaFin: '21:00' }, { dia: 'martes', horaInicio: '20:00', horaFin: '21:00' }] },
  ])
  console.log('✅ 13 clases de Mundo Tropical creadas')
  process.exit(0)
}
run().catch(err => { console.error(err); process.exit(1) })
