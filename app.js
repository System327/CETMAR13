const express = require('express');
const path = require('path');
const session = require('express-session');

const authRoutes = require('./auth');
const noticiasRoutes = require('./Noticias');

const app = express();

app.use(session({
  secret: 'una_clave_segura',
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, maxAge: 60 * 60 * 1000 }
}));

app.use(express.json());

// Sirve archivos estáticos solo una vez, con la carpeta correcta (revisa el nombre exacto)
app.use(express.static(path.join(__dirname, 'Servicio-social')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'Servicio-social', 'HTML', 'index.html'));
});

app.use('/auth', authRoutes);
app.use('/noticias', noticiasRoutes);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
