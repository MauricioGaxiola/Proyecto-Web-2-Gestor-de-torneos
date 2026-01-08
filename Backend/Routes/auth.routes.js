// backend/routes/auth.routes.js
const { Router } = require('express');
const router = Router();
const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken'); 

// ------------------------------------------------------------------
// 1. RUTA DE REGISTRO (POST /api/v1/auth/registro)
// ------------------------------------------------------------------
router.post('/registro', async (req, res) => {
    //  CAMPOS DINÁMICOS: Capturar todos los campos posibles
    const { 
        nombre, 
        email, 
        password, 
        rol, 
        telefono_contacto, 
        ubicacion_ciudad, 
        codigo_seguridad, // Usado solo para validación en Frontend
        fecha_nacimiento 
    } = req.body; 

    // 1. VALIDACIÓN BÁSICA
    if (!nombre || !email || !password || !rol) {
        return res.status(400).json({ error: 'Faltan campos obligatorios base (Nombre, Email, Contraseña, Rol).' });
    }

    if (rol !== 'organizador' && rol !== 'jugador') {
        return res.status(400).json({ error: 'Rol no válido.' });
    }
    
    //  VALIDACIÓN DE COHERENCIA DEL ROL
    if (rol === 'organizador' && (!telefono_contacto || !ubicacion_ciudad || !codigo_seguridad)) {
        return res.status(400).json({ error: 'Faltan datos de contacto/ubicación/seguridad para el rol de organizador.' });
    }
    if (rol === 'jugador' && !fecha_nacimiento) {
        return res.status(400).json({ error: 'Falta la fecha de nacimiento para el rol de jugador.' });
    }

    try {
        // 2. Verificar si el usuario ya existe
        const [existingUser] = await req.db.query('SELECT id_usuario FROM Usuarios WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            return res.status(409).json({ error: 'El email ya está registrado.' });
        }

        // 3. Cifrar la contraseña
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        // 4. Insertar el nuevo usuario, incluyendo el rol y los campos dinámicos
        //  INSERCIÓN COMPLETA DE CAMPOS DINÁMICOS
        const query = `
            INSERT INTO Usuarios 
                (nombre, email, password_hash, rol, telefono_contacto, ubicacion_ciudad, fecha_nacimiento) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        const [result] = await req.db.query(query, [
            nombre, 
            email, 
            password_hash, 
            rol, 
            // Los campos se insertarán vacíos (NULL) si no son provistos por el rol, o con el valor si lo son.
            telefono_contacto || null, 
            ubicacion_ciudad || null, 
            fecha_nacimiento || null
        ]); 

        res.status(201).json({ 
            message: 'Usuario registrado exitosamente.',
            id_usuario: result.insertId,
            rol: rol 
        });

    } catch (error) {
        console.error('Error durante el registro:', error);
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
        // Se recomienda SELECT * para obtener todos los campos, incluyendo los nuevos dinámicos.
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
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' }); 
        
        // D. Devolver el token y datos básicos del usuario
        res.json({ token, user: { id: user.id_usuario, nombre: user.nombre, rol: user.rol } });

    } catch (error) {
        console.error('Error durante el login:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

module.exports = router;