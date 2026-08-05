const cron = require('node-cron')
const Estudiante = require('../models/Estudiante')
const Clase = require('../models/Clase')
const Pago = require('../models/Pago')
const { enviarRecordatorioPago } = require('./whatsappService')

const obtenerDiaVencimiento = () => {
  // La academia cobra los primeros 5 días del mes
  return 5
}

const ejecutarNotificaciones = async () => {
  const hoy = new Date()
  const mesActual = hoy.getMonth() + 1
  const anioActual = hoy.getFullYear()
  const diaActual = hoy.getDate()
  const diaVencimiento = obtenerDiaVencimiento()
  const diasRestantes = diaVencimiento - diaActual

  console.log(`[Notificaciones] Ejecutando... Día ${diaActual}, días para vencer: ${diasRestantes}`)

  // Solo enviar recordatorios 3 días antes, 1 día antes, el día de vencimiento y cuando está vencido
  const diasNotificar = [3, 2, 1, 0, -1, -2, -3, -5, -7, -10, -15, -20, -25, -30]
  if (!diasNotificar.includes(diasRestantes)) return

  const estudiantes = await Estudiante.find({ estado: 'activo' })
    .populate('clases', 'nombre mensualidad grupo')

  let enviados = 0
  let errores = 0

  for (const estudiante of estudiantes) {
    const celularTutor = estudiante.tutor?.celular || estudiante.tutor?.telefono
    if (!celularTutor || !estudiante.tutor?.nombre) continue

    for (const clase of estudiante.clases) {
      // Verificar si ya tiene pago aprobado o comprobante enviado
      const pago = await Pago.findOne({
        estudiante: estudiante._id,
        clase: clase._id,
        mes: mesActual,
        anio: anioActual,
        estado: { $in: ['aprobado', 'comprobante_enviado'] }
      })

      if (pago) continue // Ya pagó, no notificar

      try {
        await enviarRecordatorioPago(
          estudiante.tutor,
          estudiante,
          clase,
          diasRestantes
        )
        enviados++
        console.log(`✅ Notificación enviada: ${estudiante.nombre} ${estudiante.apellido} - ${clase.nombre}`)

        // Pausa de 1 segundo entre mensajes para no saturar la API
        await new Promise(resolve => setTimeout(resolve, 1000))
      } catch (err) {
        errores++
        console.log(`❌ Error enviando a ${estudiante.nombre}: ${err.message}`)
      }
    }
  }

  console.log(`[Notificaciones] Completado. Enviados: ${enviados}, Errores: ${errores}`)
}

const iniciarCron = () => {
  // Ejecutar todos los días a las 9:00 AM
  cron.schedule('0 9 * * *', async () => {
    console.log('[Cron] Iniciando notificaciones de pago...')
    await ejecutarNotificaciones()
  }, {
    timezone: 'America/Santo_Domingo'
  })

  console.log('[Cron] Notificaciones automáticas activadas — 9:00 AM diario')
}

module.exports = { iniciarCron, ejecutarNotificaciones }