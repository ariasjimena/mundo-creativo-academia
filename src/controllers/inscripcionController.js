const Estudiante = require('../models/Estudiante');
const Clase = require('../models/Clase');
const generarMatricula = require('../utils/generarMatricula');

exports.obtenerClasesPublicas = async (req, res) => {
  try {
    const { academia } = req.query;
    const filtro = { estado: { $ne: 'inactiva' } };
    if (academia) filtro.academia = academia;

    const clases = await Clase.find(filtro)
      .select('nombre grupo instrumento nivel cuposMaximos cuposOcupados horarios mensualidad academia')
      .sort({ nombre: 1, grupo: 1 });

    res.json({ success: true, clases });
  } catch (error) {
    res.status(500).json({ success: false, mensaje: error.message });
  }
};

exports.inscripcionPublica = async (req, res) => {
  try {
    const {
      nombre, apellido, fechaNacimiento, edad, direccion,
      telefono, email, atencionEspecial, tutor, clases, academia
    } = req.body;

    if (!nombre || !apellido || !fechaNacimiento) {
      return res.status(400).json({
        success: false,
        mensaje: 'Nombre, apellido y fecha de nacimiento son requeridos.'
      });
    }

    if (clases && clases.length > 0) {
      for (const claseId of clases) {
        const clase = await Clase.findById(claseId);
        if (!clase) continue;
        if (clase.cuposOcupados >= clase.cuposMaximos) {
          return res.status(400).json({
            success: false,
            mensaje: `La clase "${clase.nombre} - ${clase.grupo}" no tiene cupos disponibles.`
          });
        }
      }
    }

    const academiaFinal = academia || 'mca';
    const prefijo = academiaFinal === 'tropical' ? 'MT' : 'AMC';
    const matricula = await generarMatricula(prefijo);

    const estudiante = await Estudiante.create({
      nombre, apellido, fechaNacimiento, edad,
      direccion, telefono, email,
      atencionEspecial: atencionEspecial || { requiere: false },
      tutor: tutor || { requerido: false },
      clases: clases || [],
      estado: 'pendiente',
      origenInscripcion: 'online',
      academia: academiaFinal,
      matricula
    });

    if (clases && clases.length > 0) {
      await Clase.updateMany({ _id: { $in: clases } }, { $inc: { cuposOcupados: 1 } });
    }

    res.status(201).json({
      success: true,
      mensaje: 'Inscripción recibida. La academia se pondrá en contacto contigo pronto.',
      inscripcionId: estudiante._id,
      matricula
    });
  } catch (error) {
    res.status(500).json({ success: false, mensaje: error.message });
  }
};
