const Estudiante = require('../models/Estudiante');

const generarMatricula = async (prefijo = 'AMC') => {
  const regex = prefijo === 'MT' ? /^MT \d{4}$/ : /^AMC \d{4}$/;
  const inicio = prefijo === 'MT' ? 86 : 211;

  const ultimo = await Estudiante.findOne(
    { matricula: { $regex: regex } },
    { matricula: 1 },
    { sort: { matricula: -1 } }
  );

  let siguiente = inicio;
  if (ultimo?.matricula) {
    const num = parseInt(ultimo.matricula.replace(`${prefijo} `, '').trim());
    if (!isNaN(num) && num >= siguiente) siguiente = num + 1;
  }

  return `${prefijo} ${String(siguiente).padStart(4, '0')}`;
};

module.exports = generarMatricula;