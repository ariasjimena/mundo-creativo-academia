require('dotenv').config()
const connectDB = require('../src/config/db')
const Clase = require('../src/models/Clase')

const run = async () => {
  await connectDB()

  // Todas las clases a RD$2,000 por defecto
  const todas = await Clase.updateMany({}, { $set: { mensualidad: 2000 } })
  console.log(`Todas actualizadas a RD$2,000: ${todas.modifiedCount}`)

  // Excepciones con montos diferentes
  const excepciones = [
    { nombre: 'Flexibilidad',    mensualidad: 1500 },
    { nombre: 'Yoga',            mensualidad: 1500 },
    { nombre: 'Pintura Kids',    mensualidad: 1500 },
    { nombre: 'Salsa',           mensualidad: 1500 },
    { nombre: 'Salsa & Bachata', mensualidad: 2500 },
  ]

  for (const { nombre, mensualidad } of excepciones) {
    const r = await Clase.updateMany({ nombre }, { $set: { mensualidad } })
    console.log(`✅ ${nombre}: RD$${mensualidad} (${r.modifiedCount} grupos)`)
  }

  console.log('\n✅ Mensualidades actualizadas correctamente')
  process.exit(0)
}

run().catch(err => { console.error(err); process.exit(1) })
