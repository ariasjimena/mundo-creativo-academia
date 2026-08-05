require('dotenv').config()
const connectDB = require('../src/config/db')
const Clase = require('../src/models/Clase')

const run = async () => {
  await connectDB()

  // Clases que son de Tropical
  const nombresTropical = ['Salsa', 'Bachata', 'Salsa & Bachata']

  // Asignar 'tropical' a clases de Tropical
  const tropical = await Clase.updateMany(
    { nombre: { $in: nombresTropical }, academia: { $exists: false } },
    { $set: { academia: 'tropical' } }
  )

  // Asignar 'mca' a todas las demás
  const mca = await Clase.updateMany(
    { academia: { $exists: false } },
    { $set: { academia: 'mca' } }
  )

  console.log(`✅ Clases actualizadas:`)
  console.log(`   MCA:      ${mca.modifiedCount}`)
  console.log(`   Tropical: ${tropical.modifiedCount}`)
  process.exit(0)
}

run().catch(err => { console.error(err); process.exit(1) })