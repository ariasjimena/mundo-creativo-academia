require('dotenv').config()
const XLSX = require('xlsx')
const path = require('path')
const connectDB = require('../src/config/db')
const Estudiante = require('../src/models/Estudiante')
const Clase = require('../src/models/Clase')
const Pago = require('../src/models/Pago')

const MESES = [
  { colFecha: 9,  colEstado: 10, colForma: 11, mes: 4,  anio: 2025 }, // ABR
  { colFecha: 12, colEstado: 13, colForma: 14, mes: 5,  anio: 2025 }, // MAY
  { colFecha: 15, colEstado: 16, colForma: 17, mes: 6,  anio: 2025 }, // JUN
  { colFecha: 18, colEstado: 19, colForma: 20, mes: 7,  anio: 2025 }, // JUL
  { colFecha: 21, colEstado: 22, colForma: 23, mes: 8,  anio: 2025 }, // AGO
  { colFecha: 24, colEstado: 25, colForma: 26, mes: 9,  anio: 2025 }, // SEP
  { colFecha: 27, colEstado: 28, colForma: 29, mes: 10, anio: 2025 }, // OCT
  { colFecha: 30, colEstado: 31, colForma: 32, mes: 11, anio: 2025 }, // NOV
]

const normalizarBanco = (forma) => {
  if (!forma) return { metodo: 'efectivo', banco: '' }
  const v = String(forma).toUpperCase().trim()
  if (v.includes('POPULAR') && !v.includes('ASOC')) return { metodo: 'transferencia', banco: 'popular' }
  if (v.includes('ASOC')) return { metodo: 'transferencia', banco: 'asociacion_popular' }
  if (v.includes('BHD')) return { metodo: 'transferencia', banco: 'bhd' }
  if (v.includes('BANRESERVAS') || v.includes('RESERVA')) return { metodo: 'transferencia', banco: 'banreservas' }
  return { metodo: 'efectivo', banco: '' }
}

const esPago = (val) => {
  if (!val) return false
  const v = String(val).trim().toUpperCase()
  return ['P', 'PAQUETE', 'PROMO', 'R'].includes(v)
}

const parsearFecha = (val, fallback) => {
  if (!val) return fallback
  const s = String(val).trim().toUpperCase()
  if (['PAUSA','RETIRADA','RETIRADO','RET','NAN','','-'].includes(s)) return fallback
  const f = new Date(val)
  return !isNaN(f) && f.getFullYear() > 1970 ? f : fallback
}

const run = async () => {
  await connectDB()

  const archivoPath = path.join(__dirname, '..', 'REGISTRO_DE_PAGO_MTROPICAL_.xlsx')
  const wb = XLSX.readFile(archivoPath)
  const ws = wb.Sheets[wb.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1 })

  // Eliminar pagos de estudiantes Tropical
  const estudiantesTropical = await Estudiante.find({ academia: 'tropical' }).select('_id')
  const idsTropical = estudiantesTropical.map(e => e._id)
  const deleted = await Pago.deleteMany({ estudiante: { $in: idsTropical } })
  console.log(`Pagos Tropical eliminados: ${deleted.deletedCount}`)

  let creados = 0, omitidos = 0, errores = 0

  for (let i = 3; i < rows.length; i++) {
    const row = rows[i]
    if (!row || !row[0]) continue
    const matricula = String(row[0]).trim()
    if (!matricula.startsWith('MT')) continue

    const estudiante = await Estudiante.findOne({ matricula, academia: 'tropical' })
    if (!estudiante) { omitidos++; continue }

    const claseNombre = String(row[3] || '').trim().toLowerCase()
    let clase = null
    if (claseNombre) {
      const nombreNorm = claseNombre.includes('bachata') ? 'Bachata' : 'Salsa'
      clase = await Clase.findOne({ nombre: nombreNorm, academia: 'tropical' })
    }
    if (!clase && estudiante.clases.length > 0) clase = await Clase.findById(estudiante.clases[0])
    if (!clase) { omitidos++; continue }

    // ── INSCRIPCIÓN ──
    const montoInsc = Number(row[5]) || 0
    const formaInsc = String(row[6] || '').trim()
    const fechaInsc = parsearFecha(row[4], new Date('2025-03-15'))
    const skipFormas = ['METODO', '', '-', 'INSCRIPCION', 'ATRASO', 'NAN']

    if (montoInsc > 0 && formaInsc && !skipFormas.includes(formaInsc.toUpperCase())) {
      const { metodo, banco } = normalizarBanco(formaInsc)
      try {
        await Pago.create({
          estudiante: estudiante._id, clase: clase._id,
          mes: 3, anio: 2025, monto: montoInsc,
          metodoPago: metodo, banco, estado: 'aprobado',
          academia: 'tropical', fechaPago: fechaInsc, notas: 'Inscripción'
        })
        creados++
      } catch { errores++ }
    }

    // ── MENSUALIDADES ──
    const montoMensual = Number(row[7]) > 0 ? Number(row[7]) : clase.mensualidad

    for (const { colFecha, colEstado, colForma, mes, anio } of MESES) {
      if (!esPago(row[colEstado])) continue
      const forma = String(row[colForma] || '').trim()
      if (!forma || ['-', '', 'PAUSA', 'RETIRADA', 'RETIRADO', 'RETIRADOS'].includes(forma.toUpperCase())) continue

      const { metodo, banco } = normalizarBanco(forma)
      const fechaDefault = new Date(`${anio}-${String(mes).padStart(2,'0')}-15`)
      const fechaPago = parsearFecha(row[colFecha], fechaDefault)

      try {
        await Pago.create({
          estudiante: estudiante._id, clase: clase._id,
          mes, anio, monto: montoMensual,
          metodoPago: metodo, banco, estado: 'aprobado',
          academia: 'tropical', fechaPago
        })
        creados++
      } catch { errores++ }
    }
  }

  console.log(`\n✅ Pagos Tropical importados`)
  console.log(`   Creados:  ${creados}`)
  console.log(`   Omitidos: ${omitidos}`)
  console.log(`   Errores:  ${errores}`)
  process.exit(0)
}

run().catch(err => { console.error(err); process.exit(1) })


