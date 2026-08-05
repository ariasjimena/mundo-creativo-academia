require("dotenv").config();
const connectDB = require("../src/config/db");
const Clase = require("../src/models/Clase");

const run = async () => {
  await connectDB();

  const clases = await Clase.find();
  let ajustadas = 0;

  for (const clase of clases) {
    if (clase.cuposOcupados > clase.cuposMaximos) {
      await Clase.findByIdAndUpdate(clase._id, {
        cuposMaximos: clase.cuposOcupados,
        estado: "llena",
      });
      console.log(
        `Ajustado: ${clase.nombre} · ${clase.grupo} → ${clase.cuposOcupados} cupos`,
      );
      ajustadas++;
    }
  }

  console.log(`\n✅ ${ajustadas} clases ajustadas`);
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
