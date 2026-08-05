const twilio = require('twilio')

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)

const formatearCelular = (celular) => {
  if (!celular) return null
  // Limpiar el número y agregar código de país RD
  let numero = String(celular).replace(/[^\d+]/g, '')
  if (!numero.startsWith('+')) {
    if (numero.startsWith('1')) numero = '+' + numero
    else numero = '+1' + numero
  }
  return `whatsapp:${numero}`
}

exports.enviarMensaje = async (celular, mensaje) => {
  const to = formatearCelular(celular)
  if (!to) throw new Error('Número de celular inválido')

  const result = await client.messages.create({
    from: process.env.TWILIO_WHATSAPP_FROM,
    to,
    body: mensaje
  })

  return result.sid
}

exports.enviarRecordatorioPago = async (tutor, estudiante, clase, diasRestantes) => {
  const mensaje = diasRestantes > 0
    ? `Hola ${tutor.nombre}, le recordamos que el pago de la mensualidad de *${estudiante.nombre} ${estudiante.apellido}* para la clase de *${clase.nombre}* vence en *${diasRestantes} días*. Monto: RD$${clase.mensualidad.toLocaleString('es-DO')}. Por favor realice su pago a tiempo. — Mundo Creativo Academia 🎵`
    : `Hola ${tutor.nombre}, el pago de la mensualidad de *${estudiante.nombre} ${estudiante.apellido}* para la clase de *${clase.nombre}* está *vencido*. Monto: RD$${clase.mensualidad.toLocaleString('es-DO')}. Por favor contáctenos para regularizar su situación. — Mundo Creativo Academia 🎵`

  return await exports.enviarMensaje(tutor.celular || tutor.telefono, mensaje)
}