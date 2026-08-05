require('dotenv').config()
const XLSX = require('xlsx')
const connectDB = require('../src/config/db')
const Estudiante = require('../src/models/Estudiante')
const Clase = require('../src/models/Clase')
const Pago = require('../src/models/Pago')

const normalizarBanco = (valor) => {
  if (!valor) return { metodo: 'efectivo', banco: '' }
  const v = String(valor).toUpperCase().trim()
  if (v === 'EFECTIVO') return { metodo: 'efectivo', banco: '' }
  if (v.includes('POPULAR') && !v.includes('ASOC')) return { metodo: 'transferencia', banco: 'popular' }
  if (v.includes('ASOC') || v === 'ASOCIACION POPULAR') return { metodo: 'transferencia', banco: 'asociacion_popular' }
  if (v === 'BHD') return { metodo: 'transferencia', banco: 'bhd' }
  if (v.includes('BANRESERVAS') || v === 'RESERVA') return { metodo: 'transferencia', banco: 'banreservas' }
  return { metodo: 'efectivo', banco: '' }
}

const normalizarEstado = (confirmar) => {
  if (!confirmar) return { estado: 'pendiente', notas: '' }
  const v = String(confirmar).toUpperCase().trim()
  if (v === 'SI' || v === 'S') return { estado: 'aprobado', notas: '' }
  if (v === 'RETIRADA') return { estado: 'aprobado', notas: 'Estudiante retirada' }
  if (v.startsWith('PROMO')) return { estado: 'aprobado', notas: `Promoción: ${confirmar}` }
  if (v === 'INSCRIPCION' || v === 'INSCRIP') return { estado: 'aprobado', notas: 'Solo inscripción' }
  if (!isNaN(Number(v))) return { estado: 'aprobado', notas: `Monto especial: RD$${v}` }
  return { estado: 'pendiente', notas: '' }
}

const run = async () => {
  await connectDB()

  const wb = XLSX.readFile('./REGISTRO DE ESTUDIANTES MCA.xlsx')
  const ws = wb.Sheets[wb.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json(ws)

  let creados = 0
  let omitidos = 0
  let errores = 0

  for (const row of rows) {
    const matriculaRaw = String(row['Matricula'] || '').trim()
    if (!matriculaRaw) continue

    // Ignorar filas de clases adicionales (II, III, etc.) — el pago es por estudiante
    if (/\s+(II+|I)\s*$/i.test(matriculaRaw)) {
      omitidos++
      continue
    }

    const matricula = matriculaRaw.trim()
    const comprobante = row['COMPROBANTE ']
    if (!comprobante || String(comprobante).trim() === '' || String(comprobante).trim() === ' ') {
      omitidos++
      continue
    }

    // Buscar estudiante por matrícula
    const estudiante = await Estudiante.findOne({ matricula })
    if (!estudiante) {
      console.log(`⚠ Estudiante no encontrado: ${matricula}`)
      errores++
      continue
    }

    // Obtener primera clase del estudiante
    if (!estudiante.clases || estudiante.clases.length === 0) {
      omitidos++
      continue
    }
    const claseId = estudiante.clases[0]

    // Obtener fecha de inscripción para el mes/año del pago
 const fechaRaw = row['Marca temporal']
let mes = 3  // marzo — mes de inicio de la academia
let anio = 2025
let fechaPagoFinal = new Date('2025-03-01')
if (fechaRaw) {
  const fecha = new Date(fechaRaw)
  if (!isNaN(fecha) && fecha.getFullYear() > 1970) {
    mes = fecha.getMonth() + 1
    anio = fecha.getFullYear()
    fechaPagoFinal = fecha
  }
}


    // Obtener clase para el monto
    const clase = await Clase.findById(claseId)
    if (!clase) { omitidos++; continue }

    const { metodo, banco } = normalizarBanco(comprobante)
    const { estado, notas } = normalizarEstado(row['CONFIRMAR ENTRADA'])

    // Verificar si ya existe un pago para este período
    const existe = await Pago.findOne({
      estudiante: estudiante._id,
      clase: claseId,
      mes,
      anio
    })

    if (existe) {
      omitidos++
      continue
    }

    try {
      await Pago.create({
        estudiante: estudiante._id,
        clase: claseId,
        mes,
        anio,
        monto: clase.mensualidad,
        metodoPago: metodo,
        banco,
        estado,
        notas: notas || undefined,
        fechaPago: estado === 'aprobado' ? fechaPagoFinal : undefined
      })
      creados++
    } catch (err) {
      console.log(`❌ Error con ${matricula}: ${err.message}`)
      errores++
    }
  }

  console.log(`\n✅ Importación de pagos completada`)
  console.log(`   Creados:  ${creados}`)
  console.log(`   Omitidos: ${omitidos}`)
  console.log(`   Errores:  ${errores}`)
  process.exit(0)
}

run().catch(err => { console.error(err); process.exit(1) })