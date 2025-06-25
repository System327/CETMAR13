const express = require('express');
const router = express.Router();
const pool = require('./ConexionBD'); // mysql2 pool

// Middleware para usuarios autenticados
function soloAutenticados(req, res, next) {
  if (!req.session.usuario) {
    return res.status(401).json({ mensaje: 'No autorizado. Iniciá sesión.' });
  }
  next();
}

router.post('/subir', soloAutenticados, async (req, res) => {
  try {
    const { titulo, texto, imagen_url } = req.body;
    const idUsuario = req.session.usuario.id;

    if (!titulo || !texto) {
      return res.status(400).json({ mensaje: 'Faltan campos obligatorios.' });
    }

    // Insertar noticia
    const [resultNoticia] = await pool.query(
      `INSERT INTO Noticias (IdUsuario, Titulo, Texto, Estado)
        VALUES (?, ?, ?, 'Publicado')`,
      [idUsuario, titulo, texto]
    );

    const idNoticia = resultNoticia.insertId;

    if (!imagen_url || imagen_url.length === 0) {
      return res.json({ mensaje: 'Noticia guardada sin imágenes' });
    }

    const imagenes = Array.isArray(imagen_url) ? imagen_url : [imagen_url];

    // Insertar imágenes una a una
    for (let i = 0; i < imagenes.length; i++) {
      await pool.query(
        `INSERT INTO ImagenesNoticias (IdNoticia, UrlImagen, Orden)
          VALUES (?, ?, ?)`,
        [idNoticia, imagenes[i], i]
      );
    }

    res.json({ mensaje: 'Noticia y sus imágenes guardadas correctamente' });

  } catch (error) {
    console.error('Error al guardar noticia o imágenes:', error);
    res.status(500).json({ mensaje: 'Error al guardar la noticia o imágenes', error: error.message });
  }
});

router.get('/listar', async (req, res) => {
  try {
    // Obtener noticias con nombre y apellidos del autor
    const [noticias] = await pool.query(
      `SELECT N.Id, N.Titulo, N.Texto, N.FechaPublicacion, U.Nombre, U.Apellidos
        FROM Noticias N
        INNER JOIN Usuarios U ON N.IdUsuario = U.Id
        WHERE N.Estado = 'Publicado'
        ORDER BY N.FechaPublicacion DESC`
    );

    // Obtener imágenes para cada noticia
    for (const noticia of noticias) {
      const [imagenes] = await pool.query(
        `SELECT UrlImagen, Orden FROM ImagenesNoticias
          WHERE IdNoticia = ?
          ORDER BY Orden`,
        [noticia.Id]
      );
      noticia.imagenes = imagenes;
    }

    res.json(noticias);
  } catch (error) {
    console.error('Error al obtener noticias:', error);
    res.status(500).json({ mensaje: 'Error al obtener noticias', error: error.message });
  }
});

module.exports = router;