require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

const app = express();

connectDB().then(() => {
  const { iniciarCron } = require('./services/notificacionesService')
  iniciarCron()
})


app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.use('/api/auth', require('./routes/auth'));

app.get('/api/health', (req, res) => {
  res.json({ success: true, mensaje: 'Academia Creativa API funcionando', version: '1.0.0' });
});

app.use('/api', require('./routes/index'));

app.use((req, res) => {
  res.status(404).json({ success: false, mensaje: `Ruta no encontrada: ${req.originalUrl}` });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    mensaje: err.message || 'Error interno del servidor'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT} [${process.env.NODE_ENV || 'development'}]`);
});

module.exports = app;
