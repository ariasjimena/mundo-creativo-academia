require('dotenv').config()
const connectDB = require('../src/config/db')
const Clase = require('../src/models/Clase')

const diasValidos = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado']

const run = async () => {
  await connectDB()

  const clases = await Clase.find()
  let corregidas = 0

  for (const clase of clases) {
    let necesitaCorrecion = false

    const horariosCorregidos = clase.horarios.map(h => {
      if (!diasValidos.includes(h.dia)) {
        necesitaCorrecion = true
        // Intentar extraer día del grupo
        const grupo = clase.grupo || ''
        const grupoLower = grupo.toLowerCase()
        let diaCorregido = 'lunes'
        if (grupoLower.includes('lunes')) diaCorregido = 'lunes'
        else if (grupoLower.includes('martes')) diaCorregido = 'martes'
        else if (grupoLower.includes('miércoles') || grupoLower.includes('miercoles')) diaCorregido = 'miercoles'
        else if (grupoLower.includes('jueves')) diaCorregido = 'jueves'
        else if (grupoLower.includes('viernes')) diaCorregido = 'viernes'
        else if (grupoLower.includes('sábado') || grupoLower.includes('sabado')) diaCorregido = 'sabado'

        // Extraer hora del grupo
        const horaMatch = grupo.match(/(\d{1,2}):(\d{2})/)
        const horaInicio = horaMatch ? `${horaMatch[1].padStart(2,'0')}:${horaMatch[2]}` : h.horaInicio

        console.log(`  Corrigiendo ${clase.nombre} · ${clase.grupo}: ${h.dia} → ${diaCorregido} ${horaInicio}`)
        return { ...h.toObject(), dia: diaCorregido, horaInicio }
      }
      return h
    })

    if (necesitaCorrecion) {
      await Clase.findByIdAndUpdate(clase._id, { horarios: horariosCorregidos })
      corregidas++
    }
  }

  console.log(`\n✅ Clases corregidas: ${corregidas}`)
  process.exit(0)
}

run().catch(err => { console.error(err); process.exit(1) })