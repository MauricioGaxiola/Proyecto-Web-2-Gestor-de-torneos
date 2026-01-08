// backend/routes/torneos.routes.js
const { Router } = require('express');
const router = Router();
// Importamos la función de verificación
const { verificarToken } = require('../Middlewares/outh.middleware'); 


// 1. OBTENER TODOS LOS TORNEOS (GET /api/v1/torneos)
router.get('/', verificarToken, async (req, res) => { 
    try {
        // Opcional: Ahora puedes saber quién hace la petición usando req.user.id
        // Nota: Asumimos que la tabla se llama Torneos (con T mayúscula)
        const [rows] = await req.db.query('SELECT * FROM Torneos WHERE id_usuario_organizador = ?', [req.user.id]);
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error al obtener torneos:', error);
        res.status(500).json({ error: 'Error interno del servidor al obtener torneos.' });
    }
});

// 2. CREAR UN NUEVO TORNEO (POST /api/v1/torneos)
router.post('/', verificarToken, async (req, res) => {
    // Tomamos el id_usuario_organizador del token, ¡no del cuerpo (body)!
    const id_usuario_organizador = req.user.id; 
    const { nombre, categoria, fecha_inicio, fecha_fin, estado } = req.body;
    
    if (!nombre) {
        return res.status(400).json({ error: 'Faltan campos obligatorios.' });
    }

    try {
        const query = `
            INSERT INTO Torneos (id_usuario_organizador, nombre, categoria, fecha_inicio, fecha_fin, estado)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        const [result] = await req.db.query(query, [id_usuario_organizador, nombre, categoria, fecha_inicio, fecha_fin, estado]);

        //   Devolvemos el nombre del torneo en la respuesta para el Frontend
        res.status(201).json({ 
            message: 'Torneo creado exitosamente', 
            id: result.insertId,
            nombre: nombre 
        });
    } catch (error) {
        console.error('Error al crear torneo:', error);
        res.status(500).json({ error: 'Error interno del servidor al crear el torneo.' });
    }
});

// 3. OBTENER TORNEO POR ID (GET /api/v1/torneos/:idTorneo) <--- RUTA AÑADIDA
router.get('/:idTorneo', verificarToken, async (req, res) => {
    const idTorneo = req.params.idTorneo;
    const idUsuario = req.user.id;

    try {
        // Consultamos el torneo verificando que pertenezca al usuario logueado (seguridad)
        const query = 'SELECT * FROM Torneos WHERE id_torneo = ? AND id_usuario_organizador = ?';
        const [rows] = await req.db.query(query, [idTorneo, idUsuario]);
        
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Torneo no encontrado o no te pertenece.' });
        }
        
        // Devolvemos el objeto del torneo (la primera fila)
        res.status(200).json(rows[0]); 

    } catch (error) {
        console.error('Error al obtener torneo:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});


module.exports = router;