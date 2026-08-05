require("dotenv").config();
const XLSX = require("xlsx");
const connectDB = require("../src/config/db");
const Estudiante = require("../src/models/Estudiante");
const Clase = require("../src/models/Clase");

const normalizeClase = (nombre) => {
  if (!nombre) return null;
  const n = nombre.trim().toLowerCase();
  if (n.includes("baby ballet")) return "Baby Ballet";
  if (n.includes("ballet adulto")) return "Ballet Adulto";
  if (n.includes("ballet")) return "Ballet";
  if (n.includes("hip hop") || n.includes("hiphop")) return "Hip Hop";
  if (n.includes("danza aerea kids") || n.includes("danza aérea kids"))
    return "Danza Aérea Kids";
  if (n.includes("danza aerea") || n.includes("danza aérea"))
    return "Danza Aérea";
  if (n.includes("contemporaneo") || n.includes("contemporáneo"))
    return "Contemporáneo";
  if (n.includes("flexibilidad")) return "Flexibilidad";
  if (n.includes("yoga")) return "Yoga";
  if (n.includes("modelaje")) return "Modelaje";
  if (n.includes("pintura")) return "Pintura Kids";
  if (n.includes("piano")) return "Piano";
  if (n.includes("guitarra")) return "Guitarra";
  if (n.includes("bachata")) return "Bachata";
  return null;
};

const normalizeDia = (texto) => {
  if (!texto) return null;
  const t = texto.toLowerCase();
  if (t.includes("lunes")) return "lunes";
  if (t.includes("martes")) return "martes";
  if (t.includes("miércoles") || t.includes("miercoles")) return "miercoles";
  if (t.includes("jueves")) return "jueves";
  if (t.includes("viernes")) return "viernes";
  if (t.includes("sábado") || t.includes("sabado")) return "sabado";
  return null;
};

const extraerHora = (texto) => {
  if (!texto) return null;
  const match = texto.match(/(\d{1,2}):(\d{2})/);
  if (match) return `${match[1].padStart(2, "0")}:${match[2]}`;
  return null;
};

const run = async () => {
  await connectDB();

  const wb = XLSX.readFile("./REGISTRO DE ESTUDIANTES MCA.xlsx");
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(ws);

  const todasLasClases = await Clase.find();

  // Limpiar todas las clases de estudiantes primero
  await Clase.updateMany({}, { cuposOcupados: 0 });
  await Estudiante.updateMany({}, { clases: [] });
  console.log("Clases y estudiantes limpiados");

  let actualizados = 0;
  let errores = 0;
  const procesados = new Set();

  for (const row of rows) {
    const matriculaRaw = String(row["Matricula"] || "").trim();
    if (!matriculaRaw) continue;

    const baseMatricula = matriculaRaw.replace(/\s*(II+|I)\s*$/i, "").trim();

    const claseNombre = normalizeClase(row["Clases"]);
    const horarioTexto = String(row["HORARIOS"] || "");
    const dia = normalizeDia(horarioTexto);
    const hora = extraerHora(horarioTexto);

    if (!claseNombre || !dia) continue;

    const estudiante = await Estudiante.findOne({ matricula: baseMatricula });
    if (!estudiante) continue;

    // Buscar la clase más específica posible
    let claseEncontrada = null;

    if (hora) {
      claseEncontrada = todasLasClases.find(
        (c) =>
          c.nombre === claseNombre &&
          c.horarios?.some((h) => h.dia === dia && h.horaInicio === hora),
      );
    }

    if (!claseEncontrada) {
      claseEncontrada = todasLasClases.find(
        (c) =>
          c.nombre === claseNombre && c.horarios?.some((h) => h.dia === dia),
      );
    }

    if (!claseEncontrada) {
      claseEncontrada = todasLasClases.find((c) => c.nombre === claseNombre);
    }

    if (!claseEncontrada) continue;

    const claseId = String(claseEncontrada._id);
    const key = `${baseMatricula}_${claseId}`;

    if (procesados.has(key)) continue;
    procesados.add(key);

    try {
      await Estudiante.findOneAndUpdate(
        { matricula: baseMatricula },
        { $addToSet: { clases: claseEncontrada._id } },
      );
      await Clase.findByIdAndUpdate(claseEncontrada._id, {
        $inc: { cuposOcupados: 1 },
      });
      actualizados++;
    } catch (err) {
      errores++;
      console.log(`Error ${baseMatricula}: ${err.message}`);
    }
  }

  console.log(`\n✅ Reasignación completada`);
  console.log(`   Inscripciones creadas: ${actualizados}`);
  console.log(`   Errores: ${errores}`);

  // Mostrar resumen de Ballet
  const ballets = await Clase.find({ nombre: "Ballet" }).select(
    "grupo cuposOcupados",
  );
  console.log("\nResumen Ballet:");
  ballets.forEach((b) =>
    console.log(`  ${b.grupo}: ${b.cuposOcupados} estudiantes`),
  );

  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
