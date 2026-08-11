require("dotenv").config();
const connectDB = require("../src/config/db");
const Usuario = require("../src/models/Usuario");
const Clase = require("../src/models/Clase");

const run = async () => {
  await connectDB();

  console.log("Creando/actualizando profesores reales...");

  const profesoresData = [
    {
      nombre: "Angélica",
      apellido: "Farías",
      email: "angelica.farias@academia.com",
    },
    {
      nombre: "Mariano",
      apellido: "Álvarez",
      email: "mariano.alvarez@academia.com",
    },
    {
      nombre: "Yeniffer",
      apellido: "Canelo",
      email: "yeniffer.canelo@academia.com",
    },
    {
      nombre: "Wilma",
      apellido: "Antoniazzi",
      email: "wilma.antoniazzi@academia.com",
    },
    {
      nombre: "Glennys",
      apellido: "Sánchez",
      email: "glennys.sanchez@academia.com",
    },
    {
      nombre: "Odymeli",
      apellido: "Ramírez",
      email: "odymeli.ramirez@academia.com",
    },
    { nombre: "Jimena", apellido: "Arias", email: "jimena.arias@academia.com" },
  ];

  const profesores = {};
  for (const p of profesoresData) {
    let usuario = await Usuario.findOne({ email: p.email });
    if (!usuario) {
      usuario = await Usuario.create({
        nombre: p.nombre,
        apellido: p.apellido,
        email: p.email,
        password: "Profe123!",
        rol: "profesor",
      });
      console.log(`  + Creado: ${p.nombre} ${p.apellido} (${p.email})`);
    } else {
      console.log(`  = Ya existía: ${p.nombre} ${p.apellido} (${p.email})`);
    }
    profesores[p.email] = usuario._id;
  }

  const angelica = profesores["angelica.farias@academia.com"];
  const mariano = profesores["mariano.alvarez@academia.com"];
  const yeniffer = profesores["yeniffer.canelo@academia.com"];
  const wilma = profesores["wilma.antoniazzi@academia.com"];
  const glennys = profesores["glennys.sanchez@academia.com"];
  const odymeli = profesores["odymeli.ramirez@academia.com"];
  const jimena = profesores["jimena.arias@academia.com"];

  console.log("Eliminando clases de prueba anteriores...");
  await Clase.deleteMany();

  console.log("Creando clases reales — MCA...");
  await Clase.create([
    // BALLET
    {
      nombre: "Ballet",
      grupo: "Lunes 3:00-4:30PM",
      nivel: "basico",
      instrumento: "Danza",
      profesor: angelica,
      academia: "mca",
      cuposMaximos: 12,
      mensualidad: 1800,
      horarios: [{ dia: "lunes", horaInicio: "15:00", horaFin: "16:30" }],
    },
    {
      nombre: "Ballet",
      grupo: "Miércoles 3:00-4:30PM",
      nivel: "basico",
      instrumento: "Danza",
      profesor: angelica,
      academia: "mca",
      cuposMaximos: 12,
      mensualidad: 1800,
      horarios: [{ dia: "miercoles", horaInicio: "15:00", horaFin: "16:30" }],
    },
    {
      nombre: "Ballet",
      grupo: "Viernes 3:00-4:30PM",
      nivel: "basico",
      instrumento: "Danza",
      profesor: angelica,
      academia: "mca",
      cuposMaximos: 12,
      mensualidad: 1800,
      horarios: [{ dia: "viernes", horaInicio: "15:00", horaFin: "16:30" }],
    },
    {
      nombre: "Ballet",
      grupo: "Viernes 4:30-6:00PM",
      nivel: "basico",
      instrumento: "Danza",
      profesor: angelica,
      academia: "mca",
      cuposMaximos: 12,
      mensualidad: 1800,
      horarios: [{ dia: "viernes", horaInicio: "16:30", horaFin: "18:00" }],
    },
    {
      nombre: "Ballet",
      grupo: "Viernes 6:00-7:00PM",
      nivel: "basico",
      instrumento: "Danza",
      profesor: angelica,
      academia: "mca",
      cuposMaximos: 12,
      mensualidad: 1800,
      horarios: [{ dia: "viernes", horaInicio: "18:00", horaFin: "19:00" }],
    },
    {
      nombre: "Ballet",
      grupo: "Sábado 9:00-10:30AM",
      nivel: "basico",
      instrumento: "Danza",
      profesor: angelica,
      academia: "mca",
      cuposMaximos: 15,
      mensualidad: 1800,
      horarios: [{ dia: "sabado", horaInicio: "09:00", horaFin: "10:30" }],
    },
    {
      nombre: "Ballet",
      grupo: "Sábado 12:00-1:00PM",
      nivel: "basico",
      instrumento: "Danza",
      profesor: angelica,
      academia: "mca",
      cuposMaximos: 15,
      mensualidad: 1800,
      horarios: [{ dia: "sabado", horaInicio: "12:00", horaFin: "13:00" }],
    },
    {
      nombre: "Ballet",
      grupo: "Sábado 3:00-4:30PM",
      nivel: "basico",
      instrumento: "Danza",
      profesor: angelica,
      academia: "mca",
      cuposMaximos: 15,
      mensualidad: 1800,
      horarios: [{ dia: "sabado", horaInicio: "15:00", horaFin: "16:30" }],
    },
    // BALLET ADULTO
    {
      nombre: "Ballet Adulto",
      grupo: "Viernes 9:00-10:00AM",
      nivel: "basico",
      instrumento: "Danza",
      profesor: angelica,
      academia: "mca",
      cuposMaximos: 12,
      mensualidad: 1800,
      horarios: [{ dia: "viernes", horaInicio: "09:00", horaFin: "10:00" }],
    },
    // BABY BALLET
    {
      nombre: "Baby Ballet",
      grupo: "Sábado 9:00-10:30AM",
      nivel: "iniciacion",
      instrumento: "Danza",
      profesor: angelica,
      academia: "mca",
      cuposMaximos: 10,
      mensualidad: 1800,
      horarios: [{ dia: "sabado", horaInicio: "09:00", horaFin: "10:30" }],
    },
    // HIP HOP
    {
      nombre: "Hip Hop",
      grupo: "Martes 3:00-4:30PM",
      nivel: "basico",
      instrumento: "Danza",
      profesor: mariano,
      academia: "mca",
      cuposMaximos: 15,
      mensualidad: 1800,
      horarios: [{ dia: "martes", horaInicio: "15:00", horaFin: "16:30" }],
    },
    {
      nombre: "Hip Hop",
      grupo: "Miércoles 7:00-8:00PM",
      nivel: "basico",
      instrumento: "Danza",
      profesor: mariano,
      academia: "mca",
      cuposMaximos: 15,
      mensualidad: 1800,
      horarios: [{ dia: "miercoles", horaInicio: "19:00", horaFin: "20:00" }],
    },
    {
      nombre: "Hip Hop",
      grupo: "Sábado 12:00-1:00PM",
      nivel: "basico",
      instrumento: "Danza",
      profesor: mariano,
      academia: "mca",
      cuposMaximos: 15,
      mensualidad: 1800,
      horarios: [{ dia: "sabado", horaInicio: "12:00", horaFin: "13:00" }],
    },
    {
      nombre: "Hip Hop",
      grupo: "Sábado 1:00-2:00PM",
      nivel: "basico",
      instrumento: "Danza",
      profesor: mariano,
      academia: "mca",
      cuposMaximos: 15,
      mensualidad: 1800,
      horarios: [{ dia: "sabado", horaInicio: "13:00", horaFin: "14:00" }],
    },
    {
      nombre: "Hip Hop",
      grupo: "Sábado 2:00-3:00PM",
      nivel: "basico",
      instrumento: "Danza",
      profesor: mariano,
      academia: "mca",
      cuposMaximos: 15,
      mensualidad: 1800,
      horarios: [{ dia: "sabado", horaInicio: "14:00", horaFin: "15:00" }],
    },
    // CONTEMPORÁNEO
    {
      nombre: "Contemporáneo",
      grupo: "Jueves 7:00-8:00PM",
      nivel: "basico",
      instrumento: "Danza",
      profesor: angelica,
      academia: "mca",
      cuposMaximos: 12,
      mensualidad: 1800,
      horarios: [{ dia: "jueves", horaInicio: "19:00", horaFin: "20:00" }],
    },
    // DANZA AÉREA
    {
      nombre: "Danza Aérea",
      grupo: "Martes 9:00-10:00AM",
      nivel: "basico",
      instrumento: "Danza",
      profesor: angelica,
      academia: "mca",
      cuposMaximos: 8,
      mensualidad: 2000,
      horarios: [{ dia: "martes", horaInicio: "09:00", horaFin: "10:00" }],
    },
    {
      nombre: "Danza Aérea",
      grupo: "Martes 4:30-6:00PM",
      nivel: "basico",
      instrumento: "Danza",
      profesor: angelica,
      academia: "mca",
      cuposMaximos: 8,
      mensualidad: 2000,
      horarios: [{ dia: "martes", horaInicio: "16:30", horaFin: "18:00" }],
    },
    {
      nombre: "Danza Aérea",
      grupo: "Martes 6:00-7:00PM",
      nivel: "basico",
      instrumento: "Danza",
      profesor: angelica,
      academia: "mca",
      cuposMaximos: 8,
      mensualidad: 2000,
      horarios: [{ dia: "martes", horaInicio: "18:00", horaFin: "19:00" }],
    },
    {
      nombre: "Danza Aérea",
      grupo: "Miércoles 6:00-7:00PM",
      nivel: "basico",
      instrumento: "Danza",
      profesor: angelica,
      academia: "mca",
      cuposMaximos: 8,
      mensualidad: 2000,
      horarios: [{ dia: "miercoles", horaInicio: "18:00", horaFin: "19:00" }],
    },
    {
      nombre: "Danza Aérea",
      grupo: "Jueves 10:00-11:00AM",
      nivel: "basico",
      instrumento: "Danza",
      profesor: angelica,
      academia: "mca",
      cuposMaximos: 8,
      mensualidad: 2000,
      horarios: [{ dia: "jueves", horaInicio: "10:00", horaFin: "11:00" }],
    },
    {
      nombre: "Danza Aérea",
      grupo: "Jueves 7:00-8:00PM",
      nivel: "basico",
      instrumento: "Danza",
      profesor: angelica,
      academia: "mca",
      cuposMaximos: 8,
      mensualidad: 2000,
      horarios: [{ dia: "jueves", horaInicio: "19:00", horaFin: "20:00" }],
    },
    {
      nombre: "Danza Aérea",
      grupo: "Viernes 7:00-8:00PM",
      nivel: "basico",
      instrumento: "Danza",
      profesor: angelica,
      academia: "mca",
      cuposMaximos: 8,
      mensualidad: 2000,
      horarios: [{ dia: "viernes", horaInicio: "19:00", horaFin: "20:00" }],
    },
    // DANZA AÉREA KIDS
    {
      nombre: "Danza Aérea Kids",
      grupo: "Martes 4:30-6:00PM",
      nivel: "iniciacion",
      instrumento: "Danza",
      profesor: angelica,
      academia: "mca",
      cuposMaximos: 8,
      mensualidad: 2000,
      horarios: [{ dia: "martes", horaInicio: "16:30", horaFin: "18:00" }],
    },
    // FLEXIBILIDAD
    {
      nombre: "Flexibilidad",
      grupo: "Jueves 9:00-10:00AM",
      nivel: "basico",
      instrumento: "Danza",
      profesor: angelica,
      academia: "mca",
      cuposMaximos: 12,
      mensualidad: 1500,
      horarios: [{ dia: "jueves", horaInicio: "09:00", horaFin: "10:00" }],
    },
    {
      nombre: "Flexibilidad",
      grupo: "Jueves 6:00-7:00PM",
      nivel: "basico",
      instrumento: "Danza",
      profesor: angelica,
      academia: "mca",
      cuposMaximos: 12,
      mensualidad: 1500,
      horarios: [{ dia: "jueves", horaInicio: "18:00", horaFin: "19:00" }],
    },
    {
      nombre: "Flexibilidad",
      grupo: "Sábado 8:00-9:00AM",
      nivel: "basico",
      instrumento: "Danza",
      profesor: angelica,
      academia: "mca",
      cuposMaximos: 12,
      mensualidad: 1500,
      horarios: [{ dia: "sabado", horaInicio: "08:00", horaFin: "09:00" }],
    },
    // YOGA
    {
      nombre: "Yoga",
      grupo: "Lunes 7:00-8:00PM",
      nivel: "basico",
      instrumento: "Bienestar",
      profesor: yeniffer,
      academia: "mca",
      cuposMaximos: 15,
      mensualidad: 1500,
      horarios: [{ dia: "lunes", horaInicio: "19:00", horaFin: "20:00" }],
    },
    {
      nombre: "Yoga",
      grupo: "Martes 7:00-8:00PM",
      nivel: "basico",
      instrumento: "Bienestar",
      profesor: yeniffer,
      academia: "mca",
      cuposMaximos: 15,
      mensualidad: 1500,
      horarios: [{ dia: "martes", horaInicio: "19:00", horaFin: "20:00" }],
    },
    {
      nombre: "Yoga",
      grupo: "Miércoles 8:00-9:00AM",
      nivel: "basico",
      instrumento: "Bienestar",
      profesor: yeniffer,
      academia: "mca",
      cuposMaximos: 15,
      mensualidad: 1500,
      horarios: [{ dia: "miercoles", horaInicio: "08:00", horaFin: "09:00" }],
    },
    // MODELAJE
    {
      nombre: "Modelaje",
      grupo: "Lunes 6:00-7:00PM",
      nivel: "basico",
      instrumento: "Arte",
      profesor: wilma,
      academia: "mca",
      cuposMaximos: 10,
      mensualidad: 1800,
      horarios: [{ dia: "lunes", horaInicio: "18:00", horaFin: "19:00" }],
    },
    // PINTURA KIDS
    {
      nombre: "Pintura Kids",
      grupo: "Jueves 4:30-6:00PM",
      nivel: "iniciacion",
      instrumento: "Arte",
      profesor: glennys,
      academia: "mca",
      cuposMaximos: 12,
      mensualidad: 1500,
      horarios: [{ dia: "jueves", horaInicio: "16:30", horaFin: "18:00" }],
    },
    {
      nombre: "Pintura Kids",
      grupo: "Sábado 3:00-4:30PM",
      nivel: "iniciacion",
      instrumento: "Arte",
      profesor: glennys,
      academia: "mca",
      cuposMaximos: 12,
      mensualidad: 1500,
      horarios: [{ dia: "sabado", horaInicio: "15:00", horaFin: "16:30" }],
    },
    // BACHATA (MCA)
    {
      nombre: "Bachata",
      grupo: "Martes 8:00-9:00PM",
      nivel: "basico",
      instrumento: "Danza",
      profesor: odymeli,
      academia: "mca",
      cuposMaximos: 15,
      mensualidad: 1800,
      horarios: [{ dia: "martes", horaInicio: "20:00", horaFin: "21:00" }],
    },
  ]);

  console.log("Creando clases reales — Tropical...");
  await Clase.create([
    // SALSA
    {
      nombre: "Salsa",
      grupo: "Lunes 8:00-9:00PM",
      nivel: "basico",
      instrumento: "Danza",
      profesor: jimena,
      academia: "tropical",
      cuposMaximos: 40,
      mensualidad: 1500,
      horarios: [{ dia: "lunes", horaInicio: "20:00", horaFin: "21:00" }],
    },
    {
      nombre: "Salsa",
      grupo: "Miércoles 8:00-9:00PM",
      nivel: "basico",
      instrumento: "Danza",
      profesor: jimena,
      academia: "tropical",
      cuposMaximos: 15,
      mensualidad: 1500,
      horarios: [{ dia: "miercoles", horaInicio: "20:00", horaFin: "21:00" }],
    },
    {
      nombre: "Salsa",
      grupo: "Jueves 8:00-9:00PM",
      nivel: "basico",
      instrumento: "Danza",
      profesor: jimena,
      academia: "tropical",
      cuposMaximos: 25,
      mensualidad: 1500,
      horarios: [{ dia: "jueves", horaInicio: "20:00", horaFin: "21:00" }],
    },
    {
      nombre: "Salsa",
      grupo: "Viernes 8:00-9:00PM",
      nivel: "basico",
      instrumento: "Danza",
      profesor: jimena,
      academia: "tropical",
      cuposMaximos: 15,
      mensualidad: 1500,
      horarios: [{ dia: "viernes", horaInicio: "20:00", horaFin: "21:00" }],
    },
    // BACHATA (Tropical)
    {
      nombre: "Bachata",
      grupo: "Martes 8:00-9:00PM",
      nivel: "basico",
      instrumento: "Danza",
      profesor: odymeli,
      academia: "tropical",
      cuposMaximos: 30,
      mensualidad: 1500,
      horarios: [{ dia: "martes", horaInicio: "20:00", horaFin: "21:00" }],
    },
    {
      nombre: "Bachata",
      grupo: "Martes 9:00-10:00PM",
      nivel: "basico",
      instrumento: "Danza",
      profesor: odymeli,
      academia: "tropical",
      cuposMaximos: 10,
      mensualidad: 1500,
      horarios: [{ dia: "martes", horaInicio: "21:00", horaFin: "22:00" }],
    },
    {
      nombre: "Bachata",
      grupo: "Miércoles 8:00-9:00PM",
      nivel: "basico",
      instrumento: "Danza",
      profesor: odymeli,
      academia: "tropical",
      cuposMaximos: 10,
      mensualidad: 1500,
      horarios: [{ dia: "miercoles", horaInicio: "20:00", horaFin: "21:00" }],
    },
  ]);

  console.log("\n✅ Clases reales creadas para MCA y Tropical.");
  console.log("\nProfesores (contraseña temporal para todos: Profe123!):");
  for (const p of profesoresData) {
    console.log(`   ${p.nombre} ${p.apellido.padEnd(12)} ${p.email}`);
  }
  console.log(
    "\n⚠️  Piano y Guitarra quedaron FUERA — no tenían profesor asignado.",
  );
  console.log(
    "⚠️  4 horarios de Ballet con conflicto AM/PM quedaron fuera — revisar manualmente.",
  );
  console.log(
    "⚠️  2 horarios de Tropical sin formato claro quedaron fuera — revisar manualmente.",
  );

  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
