require('dotenv').config()
const XLSX = require('xlsx')
const connectDB = require('../src/config/db')
const Estudiante = require('../src/models/Estudiante')
const Clase = require('../src/models/Clase')

// ---------- Utilidades de normalización ----------

const normalizarDia = (texto) => {
  if (!texto) return null
  const t = texto.toLowerCase()
  if (t.includes('lunes')) return 'lunes'
  if (t.includes('martes')) return 'martes'
  if (t.includes('miércoles') || t.includes('miercoles')) return 'miercoles'
  if (t.includes('jueves')) return 'jueves'
  if (t.includes('viernes')) return 'viernes'
  if (t.includes('sábado') || t.includes('sabado')) return 'sabado'
  return null
}

// Extrae { dia, horaInicio, horaFin } en formato 24h de un texto tipo "Sabado 10:30- 12:00AM"
// Devuelve null si el texto es ambiguo o no se puede parsear con confianza.
const parsearHorario = (texto) => {
  if (!texto) return null
  const t = String(texto).trim()
  const dia = normalizarDia(t)
  if (!dia) return null

  const m = t.replace(/\s+/g, '').match(/(\d{1,2}):(\d{2})-(\d{1,2}):(\d{2})(AM|PM|am|pm)/)
  if (!m) return null

  let [, h1, m1, h2, m2, ampm] = m
  h1 = parseInt(h1); m1 = parseInt(m1); h2 = parseInt(h2); m2 = parseInt(m2)
  ampm = ampm.toUpperCase()

  const to24 = (h, mnt, ap) => {
    let hh = h % 12
    if (ap === 'PM') hh += 12
    return hh * 60 + mnt
  }
  const inicioMin = to24(h1, m1, ampm)
  const finMin = to24(h2, m2, ampm)

  if (finMin <= inicioMin) return null // rango inválido / ambiguo (ej. 12:00AM sospechoso) -> se descarta

  const fmt = (min) => `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`
  return { dia, horaInicio: fmt(inicioMin), horaFin: fmt(finMin) }
}

const normalizeClaseMCA = (nombre) => {
  if (!nombre) return null
  const n = String(nombre).trim().toLowerCase()
  if (n.includes('baby ballet')) return 'Baby Ballet'
  if (n.includes('ballet adulto')) return 'Ballet Adulto'
  if (n.includes('ballet')) return 'Ballet'
  if (n.includes('hip hop') || n.includes('hiphop')) return 'Hip Hop'
  if (n.includes('danza aerea kids') || n.includes('danza aérea kids')) return 'Danza Aérea Kids'
  if (n.includes('danza aerea') || n.includes('danza aérea')) return 'Danza Aérea'
  if (n.includes('contemporaneo') || n.includes('contemporáneo')) return 'Contemporáneo'
  if (n.includes('flexibilidad')) return 'Flexibilidad'
  if (n.includes('yoga')) return 'Yoga'
  if (n.includes('modelaje')) return 'Modelaje'
  if (n.includes('pintura')) return 'Pintura Kids'
  if (n.includes('piano')) return 'Piano'
  if (n.includes('guitarra')) return 'Guitarra'
  if (n.includes('bachata')) return 'Bachata'
  return null
}

// Tropical: puede haber varias clases en la misma celda (ej. "Salsa, Bachata")
const normalizeClasesTropical = (nombre) => {
  if (!nombre) return []
  const n = String(nombre).trim().toLowerCase()
  const out = []
  if (n.includes('salsa')) out.push('Salsa')
  if (n.includes('bachata')) out.push('Bachata')
  return out
}

const limpiarBaseMatricula = (matricula) => String(matricula).trim().replace(/\s*(II+|I)\s*$/i, '').trim()

const buscarClaseExacta = (todasLasClases, nombre, academia, dia, horaInicio) => {
  return todasLasClases.find(c =>
    c.nombre === nombre &&
    c.academia === academia &&
    c.horarios?.some(h => h.dia === dia && h.horaInicio === horaInicio)
  ) || null
}

// ---------- Import principal ----------

const run = async () => {
  await connectDB()

  console.log('Eliminando estudiantes de prueba anteriores...')
  await Estudiante.deleteMany()

  const todasLasClases = await Clase.find()

  const stats = {
    mca: { procesados: 0, creados: 0, sinMatricula: 0, retirados: 0, sinClaseVinculada: 0, errores: 0 },
    tropical: { procesados: 0, creados: 0, sinMatricula: 0, retirados: 0, sinClaseVinculada: 0, errores: 0 }
  }

  // ===================== MCA =====================
  console.log('\nLeyendo Excel de MCA...')
  const wbMCA = XLSX.readFile('./REGISTRO_DE_ESTUDIANTES_MCA.xlsx')
  const wsMCA = wbMCA.Sheets[wbMCA.SheetNames[0]]
  const rowsMCA = XLSX.utils.sheet_to_json(wsMCA)

  const mapaMCA = {}

  for (const row of rowsMCA) {
    const nombre = String(row['ESTUDIANTES'] || '').trim()
    const matriculaRaw = String(row['Matricula'] || '').trim()
    if (!nombre || !matriculaRaw) { stats.mca.sinMatricula++; continue }

    const retirada = String(row['RETIRADA'] || row['Columna 2'] || '')
    if (retirada.toUpperCase().includes('RETIR')) { stats.mca.retirados++; continue }

    stats.mca.procesados++

    const baseMatricula = limpiarBaseMatricula(matriculaRaw)
    const claseNombre = normalizeClaseMCA(row['Clases'])
    const horarioParsed = parsearHorario(row['HORARIOS'])

    if (!mapaMCA[baseMatricula]) {
      const nombreParts = nombre.split(' ')
      mapaMCA[baseMatricula] = {
        matricula: baseMatricula,
        nombre: nombreParts[0] || nombre,
        apellido: nombreParts.slice(1).join(' ') || '.',
        fechaNacimiento: row['Fecha de nacimiento'] ? new Date(row['Fecha de nacimiento']) : new Date('2015-01-01'),
        sexo: String(row['Sexo'] || '').trim().toUpperCase() === 'M' ? 'M' : (String(row['Sexo'] || '').trim().toUpperCase() === 'F' ? 'F' : ''),
        email: String(row['Correo electrónico'] || '').trim() || undefined,
        telefono: String(row['Telefono / Celular'] || '').replace(/[^\d\-+\s]/g, '').trim() || undefined,
        direccion: String(row['Dirección'] || '').trim() || undefined,
        atencionEspecial: {
          requiere: !!(row['¿Requiere atención especial?'] &&
            String(row['¿Requiere atención especial?']).toLowerCase() !== 'no' &&
            String(row['¿Requiere atención especial?']).trim() !== ''),
          descripcion: String(row['¿Requiere atención especial?'] || '')
        },
        tutor: {
          parentesco: String(row['¿Qué es del estudiante?'] || '').trim(),
          nombre: String(row['Nombre completo'] || '').trim(),
          email: String(row['Email'] || '').trim(),
          celular: String(row['Celular'] || '').trim()
        },
        clasesIds: [],
        academia: 'mca',
        estado: 'activo',
        origenInscripcion: 'online'
      }
    }

    if (claseNombre && horarioParsed) {
      const clase = buscarClaseExacta(todasLasClases, claseNombre, 'mca', horarioParsed.dia, horarioParsed.horaInicio)
      if (clase) {
        const idStr = String(clase._id)
        if (!mapaMCA[baseMatricula].clasesIds.map(String).includes(idStr)) {
          mapaMCA[baseMatricula].clasesIds.push(clase._id)
        }
      } else {
        stats.mca.sinClaseVinculada++
      }
    } else if (claseNombre || row['HORARIOS']) {
      stats.mca.sinClaseVinculada++
    }
  }

  for (const est of Object.values(mapaMCA)) {
    try {
      for (const claseId of est.clasesIds) {
        await Clase.findByIdAndUpdate(claseId, { $inc: { cuposOcupados: 1 } })
      }
      await Estudiante.create({
        matricula: est.matricula,
        nombre: est.nombre,
        apellido: est.apellido,
        fechaNacimiento: est.fechaNacimiento,
        sexo: est.sexo,
        email: est.email,
        telefono: est.telefono,
        direccion: est.direccion,
        atencionEspecial: est.atencionEspecial,
        tutor: est.tutor.nombre ? est.tutor : undefined,
        clases: est.clasesIds,
        academia: 'mca',
        estado: est.estado,
        origenInscripcion: est.origenInscripcion
      })
      stats.mca.creados++
    } catch (err) {
      stats.mca.errores++
      console.log(`  ❌ MCA ${est.matricula} - ${est.nombre}: ${err.message}`)
    }
  }

  // ===================== TROPICAL =====================
  console.log('Leyendo Excel de Tropical...')
  const wbTrop = XLSX.readFile('./_REGISTRO_DE_ESTUDIANTES_MTROPICAL_.xlsx')
  const wsTrop = wbTrop.Sheets[wbTrop.SheetNames[0]]
  const rowsTrop = XLSX.utils.sheet_to_json(wsTrop)

  const mapaTrop = {}

  for (const row of rowsTrop) {
    const nombre = String(row['Nombre completo'] || '').trim()
    const matriculaRaw = String(row['Matricula'] || '').trim()
    if (!nombre || !matriculaRaw) { stats.tropical.sinMatricula++; continue }

    const promo = String(row['PROMO'] || '')
    if (promo.toUpperCase().includes('RETIR')) { stats.tropical.retirados++; continue }

    stats.tropical.procesados++

    const baseMatricula = limpiarBaseMatricula(matriculaRaw)
    const clasesNombres = normalizeClasesTropical(row['Danza'])
    const horarioParsed = parsearHorario(row['Especifique : Dia - Hora'])

    if (!mapaTrop[baseMatricula]) {
      const nombreParts = nombre.split(' ')
      mapaTrop[baseMatricula] = {
        matricula: baseMatricula,
        nombre: nombreParts[0] || nombre,
        apellido: nombreParts.slice(1).join(' ') || '.',
        fechaNacimiento: row['Fecha de nacimiento'] ? new Date(row['Fecha de nacimiento']) : new Date('2000-01-01'),
        email: String(row['Email'] || '').trim() || undefined,
        telefono: String(row['Celular'] || '').replace(/[^\d\-+\s]/g, '').trim() || undefined,
        direccion: String(row['Dirección'] || '').trim() || undefined,
        clasesIds: [],
        academia: 'tropical',
        estado: 'activo',
        origenInscripcion: 'online'
      }
    }

    if (clasesNombres.length && horarioParsed) {
      for (const claseNombre of clasesNombres) {
        const clase = buscarClaseExacta(todasLasClases, claseNombre, 'tropical', horarioParsed.dia, horarioParsed.horaInicio)
        if (clase) {
          const idStr = String(clase._id)
          if (!mapaTrop[baseMatricula].clasesIds.map(String).includes(idStr)) {
            mapaTrop[baseMatricula].clasesIds.push(clase._id)
          }
        } else {
          stats.tropical.sinClaseVinculada++
        }
      }
    } else if (clasesNombres.length || row['Especifique : Dia - Hora']) {
      stats.tropical.sinClaseVinculada++
    }
  }

  for (const est of Object.values(mapaTrop)) {
    try {
      for (const claseId of est.clasesIds) {
        await Clase.findByIdAndUpdate(claseId, { $inc: { cuposOcupados: 1 } })
      }
      await Estudiante.create({
        matricula: est.matricula,
        nombre: est.nombre,
        apellido: est.apellido,
        fechaNacimiento: est.fechaNacimiento,
        email: est.email,
        telefono: est.telefono,
        direccion: est.direccion,
        clases: est.clasesIds,
        academia: 'tropical',
        estado: est.estado,
        origenInscripcion: est.origenInscripcion
      })
      stats.tropical.creados++
    } catch (err) {
      stats.tropical.errores++
      console.log(`  ❌ Tropical ${est.matricula} - ${est.nombre}: ${err.message}`)
    }
  }

  // ===================== RESUMEN =====================
  console.log('\n✅ Importación completada\n')
  console.log('MCA:')
  console.log(`   Filas procesadas:        ${stats.mca.procesados}`)
  console.log(`   Estudiantes creados:     ${stats.mca.creados}`)
  console.log(`   Excluidos (sin matríc.): ${stats.mca.sinMatricula}`)
  console.log(`   Excluidos (retirados):   ${stats.mca.retirados}`)
  console.log(`   Clases sin vincular:     ${stats.mca.sinClaseVinculada} (Piano/Guitarra/horarios ambiguos que dejamos fuera)`)
  console.log(`   Errores:                 ${stats.mca.errores}`)
  console.log('\nTropical:')
  console.log(`   Filas procesadas:        ${stats.tropical.procesados}`)
  console.log(`   Estudiantes creados:     ${stats.tropical.creados}`)
  console.log(`   Excluidos (sin matríc.): ${stats.tropical.sinMatricula}`)
  console.log(`   Excluidos (retirados):   ${stats.tropical.retirados}`)
  console.log(`   Clases sin vincular:     ${stats.tropical.sinClaseVinculada}`)
  console.log(`   Errores:                 ${stats.tropical.errores}`)

  process.exit(0)
}

run().catch(err => { console.error(err); process.exit(1) })