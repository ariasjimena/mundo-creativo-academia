require('dotenv').config()
const connectDB = require('../src/config/db')
const Estudiante = require('../src/models/Estudiante')

const run = async () => {
  await connectDB()

  // Cambia este número por tu número real con código de país
  const tuCelular = '8292059098' // ← pon tu número aquí sin +1

  const resultado = await Estudiante.findOneAndUpdate(
    { matricula: 'AMC 0001' },
    {
      'tutor.celular': tuCelular,
      'tutor.nombre': 'Teresa'
    },
    { new: true }
  )

  console.log('✅ Tutor actualizado:')
  console.log('   Estudiante:', resultado.nombre, resultado.apellido)
  console.log('   Celular tutor:', resultado.tutor.celular)
  process.exit(0)
}

run().catch(err => { console.error(err); process.exit(1) })