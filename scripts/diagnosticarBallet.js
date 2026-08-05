require('dotenv').config()
const connectDB = require('../src/config/db')
const Clase = require('../src/models/Clase')
const Estudiante = require('../src/models/Estudiante')

const run = async () => {
  await connectDB()

  const balletSabado = await Clase.findOne({ nombre: 'Ballet', grupo: 'Sábado 9:00-10:30AM' })
  console.log('Ballet Sábado 9:00-10:30AM ID:', balletSabado._id)

  const estudiantes = await Estudiante.find({ clases: balletSabado._id }).select('matricula nombre apellido')
  console.log(`Estudiantes inscritos: ${estudiantes.length}`)
  estudiantes.slice(0, 10).forEach(e => console.log(` - ${e.matricula} ${e.nombre} ${e.apellido}`))

  process.exit(0)
}

run().catch(err => { console.error(err); process.exit(1) })