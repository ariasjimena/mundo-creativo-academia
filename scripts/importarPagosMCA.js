require('dotenv').config()
const XLSX = require('xlsx')
const path = require('path')
const connectDB = require('../src/config/db')
const Estudiante = require('../src/models/Estudiante')
const Clase = require('../src/models/Clase')
const Pago = require('../src/models/Pago')

// Mapeo correcto columnas MCA
// col[fecha], col[estado], col[forma], mes, anio
const MESES = [
  { colFecha: 8,  colEstado: 9,  colForma: 10, mes: 4,  anio: 2025 }, // ABR
  { colFecha: 11, colEstado: 12, colForma: 13, mes: 5,  anio: 2025 }, // MAY
  { colFecha: 14, colEstado: 15, colForma: 16, mes: 6,  anio: 2025 }, // JUN
  { colFecha: 17, colEstado: 18, colForma: 19, mes: 7,  anio: 2025 }, // JUL
  { colFecha: 20, colEstado: 21, colForma: 22, mes: 8,  anio: 2025 }, // AGO
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
  return ['P', 'PAQUETE', 'PROMO', 'INSC+MEN'].includes(v)
}

const parsearFecha = (val, fallback) => {
  if (!val) return fallback
  const s = String(val).trim().toUpperCase()
  if (['PAUSA','RETIRADA','RETIRO','NAN','','VERANO','-'].includes(s)) return fallback
  const f = new Date(val)
  return !isNaN(f) && f.getFullYear() > 1970 ? f : fallback
}

const run = async () => {
  await connectDB()

  const archivoPath = path.join(__dirname, '..', '_REGISTRO_DE_PAGO_MCA_.xlsx')
  const wb = XLSX.readFile(archivoPath)
  const ws = wb.Sheets[wb.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1 })

  // Eliminar TODOS los pagos de estudiantes MCA
  const estudiantesMCA = await Estudiante.find({ academia: 'mca' }).select('_id')
  const idsMCA = estudiantesMCA.map(e => e._id)
  const deleted = await Pago.deleteMany({ estudiante: { $in: idsMCA } })
  console.log(`Pagos MCA eliminados: ${deleted.deletedCount}`)

  let creados = 0, omitidos = 0, errores = 0

  // Datos empiezan en fila índice 3
  for (let i = 3; i < rows.length; i++) {
    const row = rows[i]
    if (!row || !row[0]) continue
    const matricula = String(row[0]).trim()
    if (!matricula.startsWith('AMC')) continue

    const estudiante = await Estudiante.findOne({ matricula, academia: 'mca' })
    if (!estudiante) { omitidos++; continue }

    // Buscar clase por nombre en col 2
    const claseNombre = String(row[2] || '').trim()
    let clase = null
    if (claseNombre && claseNombre !== '-') {
      // Buscar por nombre parcial
      const nombreBuscar = claseNombre.split(' ')[0].replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ]/g, '')
      clase = await Clase.findOne({
        nombre: { $regex: new RegExp(nombreBuscar, 'i') },
        academia: 'mca'
      })
    }
    if (!clase && estudiante.clases.length > 0) {
      clase = await Clase.findById(estudiante.clases[0])
    }
    if (!clase) { omitidos++; continue }

    // ── INSCRIPCIÓN (marzo 2025) ──
    const montoInsc = Number(row[4]) || 0
    const formaInsc = String(row[5] || '').trim()
    const fechaInsc = parsearFecha(row[3], new Date('2025-03-15'))
    const skipFormas = ['ATRASO', 'METODO', '', '-', ' ', 'NAN']

    if (montoInsc > 0 && formaInsc && !skipFormas.includes(formaInsc.toUpperCase())) {
      const { metodo, banco } = normalizarBanco(formaInsc)
      try {
        await Pago.create({
          estudiante: estudiante._id, clase: clase._id,
          mes: 3, anio: 2025, monto: montoInsc,
          metodoPago: metodo, banco, estado: 'aprobado',
          academia: 'mca', fechaPago: fechaInsc, notas: 'Inscripción'
        })
        creados++
      } catch { errores++ }
    }

    // ── MENSUALIDADES ──
    // Col 7 = monto mensual REAL del estudiante
    const montoMensual = Number(row[7]) > 0 ? Number(row[7]) : clase.mensualidad

    for (const { colFecha, colEstado, colForma, mes, anio } of MESES) {
      if (!esPago(row[colEstado])) continue
      const forma = String(row[colForma] || '').trim()
      if (!forma || ['-', '', 'PAUSA', 'RETIRADA', 'RETIRO', 'VERANO', 'DEVOLUCION'].includes(forma.toUpperCase())) continue

      const { metodo, banco } = normalizarBanco(forma)
      const fechaDefault = new Date(`${anio}-${String(mes).padStart(2,'0')}-15`)
      const fechaPago = parsearFecha(row[colFecha], fechaDefault)
      const notaVal = String(row[colEstado]).toUpperCase().trim()

      try {
        await Pago.create({
          estudiante: estudiante._id, clase: clase._id,
          mes, anio, monto: montoMensual,
          metodoPago: metodo, banco, estado: 'aprobado',
          academia: 'mca', fechaPago,
          notas: notaVal === 'PROMO' ? 'Promoción' : notaVal === 'PAQUETE' ? 'Paquete' : undefined
        })
        creados++
      } catch { errores++ }
    }
  }

  console.log(`\n✅ Pagos MCA importados`)
  console.log(`   Creados:  ${creados}`)
  console.log(`   Omitidos: ${omitidos}`)
  console.log(`   Errores:  ${errores}`)
  process.exit(0)
}

run().catch(err => { console.error(err); process.exit(1) })
