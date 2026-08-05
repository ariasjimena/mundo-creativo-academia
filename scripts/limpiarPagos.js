require('dotenv').config()
const connectDB = require('../src/config/db')
const Pago = require('../src/models/Pago')

const run = async () => {
  await connectDB()
  const result = await Pago.deleteMany({})
  console.log(`✅ Todos los pagos eliminados: ${result.deletedCount}`)
  process.exit(0)
}

run().catch(err => { console.error(err); process.exit(1) })