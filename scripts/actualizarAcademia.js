require('dotenv').config()
const connectDB = require('../src/config/db')
const Estudiante = require('../src/models/Estudiante')

const run = async () => {
  await connectDB()

  // Asignar 'mca' a todos los que tienen matrícula AMC
  const mca = await Estudiante.updateMany(
    { matricula: { $regex: /^AMC/ }, academia: { $exists: false } },
    { $set: { academia: 'mca' } }
  )

  // Asignar 'tropical' a todos los que tienen matrícula MT
  const tropical = await Estudiante.updateMany(
    { matricula: { $regex: /^MT/ }, academia: { $exists: false } },
    { $set: { academia: 'tropical' } }
  )

  console.log(`✅ Actualizados:`)
  console.log(`   MCA:      ${mca.modifiedCount}`)
  console.log(`   Tropical: ${tropical.modifiedCount}`)
  process.exit(0)
}

run().catch(err => { console.error(err); process.exit(1) })