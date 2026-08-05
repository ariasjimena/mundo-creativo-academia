require('dotenv').config()
const XLSX = require('xlsx')
const path = require('path')
const connectDB = require('../src/config/db')
const Estudiante = require('../src/models/Estudiante')
const Clase = require('../src/models/Clase')

const normalizeClase = (nombre) => {
  if (!nombre) return []
  const n = String(nombre).toLowerCase()
  if (n.includes('salsa') && n.includes('bachata')) return ['Salsa & Bachata']
  const clases = []
  if (n.includes('salsa') || n.includes('merengue')) clases.push('Salsa')
  if (n.includes('bachata')) clases.push('Bachata')
  return clases
}

const normalizeDia = (texto) => {
  if (!texto) return null
  const t = String(texto).toLowerCase()
  if (t.includes('lunes')) return 'lunes'
  if (t.includes('martes')) return 'martes'
  if (t.includes('miércoles') || t.includes('miercoles')) return 'miercoles'
  if (t.includes('jueves')) return 'jueves'
  if (t.includes('viernes')) return 'viernes'
  if (t.includes('sábado') || t.includes('sabado')) return 'sabado'
  return null
}

const run = async () => {
  await connectDB()

  const archivoPath = path.join(__dirname, '..', '_REGISTRO_DE_ESTUDIANTES_MTROPICAL_.xlsx')
  console.log('Leyendo archivo:', archivoPath)

  const wb = XLSX.readFile(archivoPath)
  console.log('Hojas disponibles:', wb.SheetNames)

  const ws = wb.Sheets[wb.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json(ws)

  console.log('Total filas leídas:', rows.length)
  if (rows.length > 0) {
    console.log('Columnas encontradas:', Object.keys(rows[0]))
    console.log('Primera fila:', JSON.stringify(rows[0]))
  }

  const todasLasClases = await Clase.find({ academia: 'tropical' })
  console.log('Clases Tropical disponibles:', todasLasClases.length)

  await Estudiante.deleteMany({ academia: 'tropical' })
  console.log('Estudiantes Tropical anteriores eliminados')

  let creados = 0, errores = 0
  const procesados = new Set()

  for (const row of rows) {
    const matriculaRaw = String(row['Matricula'] || '').trim()

    if (!matriculaRaw) continue

    // Log primeras 3 filas para diagnóstico
    if (procesados.size < 3) {
      console.log(`Procesando: matricula='${matriculaRaw}' nombre='${row['Nombre completo']}'`)
    }

    if (!matriculaRaw.startsWith('MT')) continue

    const baseMatricula = matriculaRaw.replace(/\s*(II+|I)\s*$/i, '').trim()
    if (procesados.has(baseMatricula)) continue
    procesados.add(baseMatricula)

    const nombreCompleto = String(row['Nombre completo'] || '').trim()
    if (!nombreCompleto) continue

    const partes = nombreCompleto.split(' ')
    const nombre = partes[0] || nombreCompleto
    const apellido = partes.slice(1).join(' ') || '.'

    const clasesNombres = normalizeClase(row['Danza'])
    const horarioTexto = String(row['Especifique : Dia - Hora'] || '')
    const dia = normalizeDia(horarioTexto)

    const clasesIds = []
    for (const nombreClase of clasesNombres) {
      const claseEncontrada = dia
        ? todasLasClases.find(c => c.nombre === nombreClase && c.horarios?.some(h => h.dia === dia))
          || todasLasClases.find(c => c.nombre === nombreClase)
        : todasLasClases.find(c => c.nombre === nombreClase)

      if (claseEncontrada && !clasesIds.map(String).includes(String(claseEncontrada._id))) {
        clasesIds.push(claseEncontrada._id)
        await Clase.findByIdAndUpdate(claseEncontrada._id, { $inc: { cuposOcupados: 1 } })
      }
    }

    const fechaNacRaw = row['Fecha de nacimiento']
    let fechaNac = new Date('2000-01-01')
    if (fechaNacRaw) {
      const f = new Date(fechaNacRaw)
      if (!isNaN(f)) fechaNac = f
    }

    try {
      await Estudiante.create({
        matricula: baseMatricula,
        nombre,
        apellido,
        fechaNacimiento: fechaNac,
        email: (row['Email'] || '').trim() || undefined,
        telefono: String(row['Celular'] || '').replace(/[^\d\-+\s]/g, '').trim() || undefined,
        direccion: (row['Dirección'] || '').trim() || undefined,
        clases: clasesIds,
        estado: 'activo',
        origenInscripcion: 'online',
        academia: 'tropical',
        tutor: { requerido: false }
      })
      creados++
    } catch (err) {
      errores++
      console.log(`❌ ${baseMatricula}: ${err.message}`)
    }
  }

  console.log(`\n✅ Tropical: ${creados} creados, ${errores} errores`)
  process.exit(0)
}

run().catch(err => { console.error(err); process.exit(1) })