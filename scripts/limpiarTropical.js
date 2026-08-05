require('dotenv').config()
const connectDB = require('../src/config/db')
const Estudiante = require('../src/models/Estudiante')
const Clase = require('../src/models/Clase')

const run = async () => {
  await connectDB()

  const estResult = await Estudiante.deleteMany({ academia: 'tropical' })
  const claseResult = await Clase.updateMany({ academia: 'tropical' }, { cuposOcupados: 0 })

  console.log(`✅ Tropical limpiado:`)
  console.log(`   Estudiantes eliminados: ${estResult.deletedCount}`)
  console.log(`   Clases reseteadas: ${claseResult.modifiedCount}`)
  process.exit(0)
}

run().catch(err => { console.error(err); process.exit(1) })