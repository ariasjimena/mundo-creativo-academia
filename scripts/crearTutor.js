require('dotenv').config()
const connectDB = require('../src/config/db')
const Usuario = require('../src/models/Usuario')
const Estudiante = require('../src/models/Estudiante')

const run = async () => {
  await connectDB()

  // Eliminar tutor anterior si existe
  await Usuario.deleteOne({ email: 'tutor@academia.com' })

  const tutor = await Usuario.create({
    nombre: 'Teresa',
    apellido: 'Cuevas',
    email: 'tutor@academia.com',
    password: 'Tutor123!',
    rol: 'tutor'
  })

  await Estudiante.findOneAndUpdate(
    { matricula: 'AMC 0001' },
    { 'tutor.usuarioId': tutor._id }
  )

  const est = await Estudiante.findOne({ matricula: 'AMC 0001' })
  console.log('✅ Tutor creado y vinculado a:', est.nombre, est.apellido)
  console.log('   Email:    tutor@academia.com')
  console.log('   Password: Tutor123!')
  process.exit(0)
}

run().catch(err => { console.error(err); process.exit(1) })