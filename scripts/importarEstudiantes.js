require('dotenv').config()
const XLSX = require('xlsx')
const connectDB = require('../src/config/db')
const Estudiante = require('../src/models/Estudiante')
const Clase = require('../src/models/Clase')

const normalizeClase = (nombre) => {
  if (!nombre) return null
  const n = nombre.trim().toLowerCase()
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

const normalizeDia = (texto) => {
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

const run = async () => {
  await connectDB()

 const wb = XLSX.readFile('./REGISTRO DE ESTUDIANTES MCA.xlsx')
  const ws = wb.Sheets[wb.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json(ws)

  const todasLasClases = await Clase.find()
  const estudiantesMap = {}

  for (const row of rows) {
    const nombre = (row['ESTUDIANTES'] || '').trim()
    const matricula = (row['Matricula'] || '').trim()
    if (!nombre || !matricula) continue

    const retirada = String(row['RETIRADA'] || row['Columna 2'] || '')
    if (retirada.toUpperCase().includes('RETIR')) continue

    const claseNombre = normalizeClase(row['Clases'])
    const horarioTexto = String(row['HORARIOS'] || '')
    const dia = normalizeDia(horarioTexto)

    const baseMatricula = matricula.replace(/\s*(II+|I)\s*$/i, '').trim()

    if (!estudiantesMap[baseMatricula]) {
      const nombreParts = nombre.split(' ')
      estudiantesMap[baseMatricula] = {
        matricula: baseMatricula,
        nombre: nombreParts[0] || nombre,
        apellido: nombreParts.slice(1).join(' ') || '.',
        fechaNacimiento: new Date('2000-01-01'),
        email: (row['Correo electrónico'] || '').trim() || undefined,
        telefono: String(row['Telefono / Celular'] || '').replace(/[^\d\-+\s]/g, '').trim() || undefined,
        direccion: (row['Dirección'] || '').trim() || undefined,
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
        clasesRaw: [],
        estado: 'activo',
        origenInscripcion: 'online'
      }
    }

    if (claseNombre && dia) {
      estudiantesMap[baseMatricula].clasesRaw.push({ nombre: claseNombre, dia, horarioTexto })
    }
  }

  let creados = 0
  let errores = 0

  for (const est of Object.values(estudiantesMap)) {
    try {
      const clasesIds = []
      for (const { nombre, dia } of est.clasesRaw) {
        const claseEncontrada = todasLasClases.find(c =>
          c.nombre === nombre &&
          c.horarios?.some(h => h.dia === dia)
        ) || todasLasClases.find(c => c.nombre === nombre)

        if (claseEncontrada) {
          const idStr = String(claseEncontrada._id)
          if (!clasesIds.map(String).includes(idStr)) {
            clasesIds.push(claseEncontrada._id)
            await Clase.findByIdAndUpdate(claseEncontrada._id, { $inc: { cuposOcupados: 1 } })
          }
        }
      }

      const tutorData = est.tutor.nombre ? est.tutor : undefined

      await Estudiante.create({
        matricula: est.matricula,
        nombre: est.nombre,
        apellido: est.apellido,
        fechaNacimiento: est.fechaNacimiento,
        email: est.email,
        telefono: est.telefono,
        direccion: est.direccion,
        atencionEspecial: est.atencionEspecial,
        tutor: tutorData,
        clases: clasesIds,
        estado: est.estado,
        origenInscripcion: est.origenInscripcion
      })
      creados++
    } catch (err) {
      errores++
      console.log(`❌ Error con ${est.matricula} - ${est.nombre}: ${err.message}`)
    }
  }

  console.log(`\n✅ Importación completada`)
  console.log(`   Creados: ${creados}`)
  console.log(`   Errores: ${errores}`)
  process.exit(0)
}

run().catch(err => { console.error(err); process.exit(1) })