require('dotenv').config()
const connectDB = require('../src/config/db')
const Clase = require('../src/models/Clase')
const Estudiante = require('../src/models/Estudiante')

const run = async () => {
  await connectDB()

  const clases = await Clase.find()
  let actualizadas = 0

  for (const clase of clases) {
    const count = await Estudiante.countDocuments({
      clases: clase._id,
      estado: { $in: ['activo', 'pendiente'] }
    })
    await Clase.findByIdAndUpdate(clase._id, { cuposOcupados: count })
    actualizadas++
  }

  console.log(`✅ Cupos recalculados: ${actualizadas} clases actualizadas`)
  process.exit(0)
}

run().catch(err => { console.error(err); process.exit(1) })