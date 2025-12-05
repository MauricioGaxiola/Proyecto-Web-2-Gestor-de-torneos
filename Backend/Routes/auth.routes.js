// backend/routes/auth.routes.js
const { Router } = require('express');
const router = Router();
const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken'); 

// ------------------------------------------------------------------
// 1. RUTA DE REGISTRO (POST /api/v1/auth/registro)
// ------------------------------------------------------------------
router.post('/registro', async (req, res) => {
    const { nombre, email, password } = req.body;

    if (!nombre || !email || !password) {
        return res.status(400).json({ error: 'Faltan campos obligatorios.' });
    }

    try {
        // A. Verificar si el email ya existe
        const [existingUser] = await req.db.query('SELECT * FROM Usuarios WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            return res.status(409).json({ error: 'El email ya está registrado.' });
        }

        // B. Encriptar la contraseña (usamos 10 'salt rounds')
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt); 

        // C. Insertar el nuevo usuario en la DB
        const query = `
            INSERT INTO Usuarios (nombre, email, password_hash, rol)
            VALUES (?, ?, ?, 'organizador')
        `;
        const [result] = await req.db.query(query, [nombre, email, password_hash]);

        res.status(201).json({ 
            message: 'Usuario registrado exitosamente', 
            id: result.insertId 
        });

    } catch (error) {
        console.error('Error al registrar usuario:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});


// ------------------------------------------------------------------
// 2. RUTA DE LOGIN (POST /api/v1/auth/login)
// ------------------------------------------------------------------
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Faltan credenciales.' });
    }

    try {
        // A. Buscar el usuario
        const [users] = await req.db.query('SELECT * FROM Usuarios WHERE email = ?', [email]);
        const user = users[0];

        if (!user) {
            return res.status(401).json({ error: 'Credenciales inválidas.' });
        }

        // B. Comparar la contraseña (Bcrypt la verifica contra el hash)
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({ error: 'Credenciales inválidas.' });
        }

        // C. Generar el JSON Web Token (JWT)
        const payload = { 
            id: user.id_usuario, 
            rol: user.rol, 
            nombre: user.nombre 
        };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' }); // El token expira en 1 día
        
        // D. Devolver el token y datos básicos del usuario
        res.json({ token, user: { id: user.id_usuario, nombre: user.nombre, rol: user.rol } });

    } catch (error) {
        console.error('Error durante el login:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

module.exports = router;