require("dotenv").config();
const connectDB = require("../src/config/db");
const Clase = require("../src/models/Clase");

const run = async () => {
  await connectDB();

  const todasLasClases = await Clase.find().select("nombre grupo horarios");
  const sinGrupo = todasLasClases.filter(
    (c) => !c.grupo || c.grupo.trim() === "",
  );

  console.log(`Total clases: ${todasLasClases.length}`);
  console.log(`Sin grupo: ${sinGrupo.length}`);
  sinGrupo.forEach((c) => {
    const h = c.horarios?.[0];
    console.log(` - ${c.nombre} | ${h?.dia} ${h?.horaInicio}-${h?.horaFin}`);
  });

  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
