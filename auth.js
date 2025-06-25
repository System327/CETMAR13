const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const pool = require('./ConexionBD');  // mysql2 pool

// Ruta para iniciar sesión
router.post('/login', async (req, res) => {
  const { correo, contraseña } = req.body;

  if (!correo || !contraseña) {
    return res.status(400).json({ ok: false, mensaje: 'Faltan datos' });
  }

  try {
    const [rows] = await pool.query(
      'SELECT * FROM Usuarios WHERE Correo = ? AND Estado = "Activo"',
      [correo]
    );

    if (rows.length === 0) {
      return res.status(401).json({ ok: false, mensaje: 'Usuario no encontrado o inactivo' });
    }

    const usuario = rows[0];

   const coincide = contraseña === usuario.Contraseña;

    if (!coincide) {
      return res.status(401).json({ ok: false, mensaje: 'Contraseña incorrecta' });
    }

    // Guardar el usuario en sesión
    req.session.usuario = {
      id: usuario.Id,
      nombre: usuario.Nombre,
      rol: usuario.Rol
    };

    res.json({
      ok: true,
      usuario: req.session.usuario
    });

  } catch (error) {
    console.error('Error en /auth/login:', error);
    res.status(500).json({ ok: false, mensaje: 'Error del servidor' });
  }
});

// Ruta para registrar un nuevo usuario
router.post('/register', async (req, res) => {
  const { nombre, apellidos, correo, contraseña, celular, rol } = req.body;

  if (!nombre || !apellidos || !correo || !contraseña) {
    return res.status(400).json({ ok: false, mensaje: 'Faltan datos obligatorios' });
  }

  try {
    const hashedPassword = await bcrypt.hash(contraseña, 10);

    await pool.query(
      `INSERT INTO Usuarios (Nombre, Apellidos, Correo, Contraseña, Celular, Rol)
        VALUES (?, ?, ?, ?, ?, ?)`,
      [nombre, apellidos, correo, hashedPassword, celular, rol || 'Profesor']
    );

    res.json({ ok: true, mensaje: 'Usuario registrado correctamente' });

  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ ok: false, mensaje: 'El correo ya está registrado' });
    }
    console.error('Error en /auth/register:', error);
    res.status(500).json({ ok: false, mensaje: 'Error al registrar usuario' });
  }
});

module.exports = router;
