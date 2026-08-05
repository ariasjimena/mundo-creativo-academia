const express = require("express");
const { proteger, autorizar } = require("../middleware/auth");
const upload = require("../middleware/upload");

const {
  obtenerEstudiantes,
  obtenerEstudiante,
  crearEstudiante,
  actualizarEstudiante,
  inscribirEnClase,
  eliminarEstudiante,
} = require("../controllers/estudiantesController");

const {
  obtenerClases,
  obtenerClase,
  crearClase,
  actualizarClase,
  registrarAsistencia,
  obtenerAsistencia,
} = require("../controllers/clasesController");

const {
  obtenerPagos,
  crearPago,
  subirComprobante,
  validarPago,
  obtenerMensualidades,
} = require("../controllers/pagosController");

const {
  dashboardStats,
  reporteFinanciero,
  reporteAsistencia,
  reporteMorosidad,
} = require("../controllers/reportesController");

const {
  obtenerClasesPublicas,
  inscripcionPublica,
} = require("../controllers/inscripcionController");
const { misDatos } = require("../controllers/portalController");
const { ejecutarNotificaciones } = require("../services/notificacionesService");
const { enviarRecordatorioPago } = require("../services/whatsappService");
const Estudiante = require("../models/Estudiante");

const router = express.Router();

// ── Rutas públicas (sin autenticación) ──────────────────────────
router.get("/publico/clases", obtenerClasesPublicas);
router.post("/publico/inscripcion", inscripcionPublica);

// ── Rutas protegidas ─────────────────────────────────────────────
router.use(proteger);

// Portal tutor
router.get("/portal/mis-datos", autorizar("tutor"), misDatos);

// Estudiantes
router.get("/estudiantes", obtenerEstudiantes);
router.post("/estudiantes", autorizar("admin", "recepcion"), crearEstudiante);
router.get("/estudiantes/:id", obtenerEstudiante);
router.put(
  "/estudiantes/:id",
  autorizar("admin", "recepcion"),
  actualizarEstudiante,
);
router.post(
  "/estudiantes/:id/inscribir",
  autorizar("admin", "recepcion"),
  inscribirEnClase,
);
router.delete("/estudiantes/:id", autorizar("admin"), eliminarEstudiante);

// Clases
router.get("/clases", obtenerClases);
router.post("/clases", autorizar("admin"), crearClase);
router.get("/clases/:id", obtenerClase);
router.put("/clases/:id", autorizar("admin", "recepcion"), actualizarClase);
router.post(
  "/clases/:id/asistencia",
  autorizar("admin", "recepcion", "profesor"),
  registrarAsistencia,
);
router.get("/clases/:id/asistencia", obtenerAsistencia);

// Pagos
router.get("/pagos", obtenerPagos);
router.post("/pagos", autorizar("admin", "recepcion"), crearPago);
router.post(
  "/pagos/:id/comprobante",
  upload.single("comprobante"),
  subirComprobante,
);
router.put("/pagos/:id/validar", autorizar("admin", "recepcion"), validarPago);
router.get(
  "/mensualidades",
  autorizar("admin", "recepcion"),
  obtenerMensualidades,
);

// Reportes
router.get(
  "/reportes/dashboard",
  autorizar("admin", "recepcion"),
  dashboardStats,
);
router.get("/reportes/financiero", autorizar("admin"), reporteFinanciero);
router.get(
  "/reportes/asistencia",
  autorizar("admin", "recepcion", "profesor"),
  reporteAsistencia,
);
router.get(
  "/reportes/morosidad",
  autorizar("admin", "recepcion"),
  reporteMorosidad,
);

// Notificaciones WhatsApp
router.post(
  "/notificaciones/recordatorio/:estudianteId",
  autorizar("admin", "recepcion"),
  async (req, res) => {
    try {
      const estudiante = await Estudiante.findById(
        req.params.estudianteId,
      ).populate("clases", "nombre mensualidad grupo");

      if (!estudiante) {
        return res
          .status(404)
          .json({ success: false, mensaje: "Estudiante no encontrado" });
      }

      const celular = estudiante.tutor?.celular || estudiante.tutor?.telefono;
      if (!celular) {
        return res.status(400).json({
          success: false,
          mensaje: "El estudiante no tiene número de contacto registrado",
        });
      }

      let enviados = 0;
      for (const clase of estudiante.clases) {
        await enviarRecordatorioPago(estudiante.tutor, estudiante, clase, 0);
        enviados++;
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      res.json({
        success: true,
        mensaje: `Recordatorio enviado a ${estudiante.tutor.nombre}`,
        enviados,
      });
    } catch (err) {
      res.status(500).json({ success: false, mensaje: err.message });
    }
  },
);

router.post(
  "/notificaciones/ejecutar",
  autorizar("admin"),
  async (req, res) => {
    try {
      await ejecutarNotificaciones();
      res.json({
        success: true,
        mensaje: "Notificaciones ejecutadas correctamente",
      });
    } catch (err) {
      res.status(500).json({ success: false, mensaje: err.message });
    }
  },
);

module.exports = router;
