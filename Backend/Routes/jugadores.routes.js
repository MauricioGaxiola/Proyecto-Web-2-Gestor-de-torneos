// backend/routes/jugadores.routes.js
const { Router } = require('express');
const router = Router();
// Mantenemos el casing que funciona en tu entorno:
const { verificarToken } = require('../Middlewares/outh.middleware'); // <--- USAR 'outh' (con M mayúscula, si esa fue la que funcionó)
// 1. OBTENER JUGADORES POR EQUIPO (GET /api/v1/jugadores/equipo/:idEquipo)
router.get('/equipo/:idEquipo', verificarToken, async (req, res) => {
    const idEquipo = req.params.idEquipo;
    
    try {
        // CORRECCIÓN FINAL: Seleccionamos solo las columnas más seguras para evitar el error.
        const query = `
            SELECT 
                id_jugador, 
                id_equipo,
                nombre, 
                posicion, 
                fecha_nacimiento
            FROM 
                jugadores  
            WHERE id_equipo = ?
        `;
        
        const [rows] = await req.db.query(query, [idEquipo]);
        
        // Si no hay jugadores, devuelve un array vacío (200 OK)
        res.status(200).json(rows);
        
    } catch (error) {
        // En caso de que el error persista (lo cual es muy raro), el log nos dará el diagnóstico final.
        console.error('Error FATAL SQL (Jugadores):', error.sqlMessage || error.message); 
        res.status(500).json({ error: 'Error interno del servidor al obtener jugadores.' });
    }
});

// 2. CREAR UN NUEVO JUGADOR (POST /api/v1/jugadores) - Mantiene la Seguridad
router.post('/', verificarToken, async (req, res) => {
    const { id_equipo, nombre, posicion, fecha_nacimiento } = req.body;
    const idUsuario = req.user.id; 

    if (!id_equipo || !nombre) {
        return res.status(400).json({ error: 'Faltan campos obligatorios (Equipo, Nombre).' });
    }

    try {
        // A. Seguridad: Verificamos que el equipo realmente pertenezca al usuario logueado (CRUCIAL)
        const [equipo] = await req.db.query('SELECT E.id_equipo FROM equipos E INNER JOIN torneos T ON E.id_torneo = T.id_torneo WHERE E.id_equipo = ? AND T.id_usuario_organizador = ?', [id_equipo, idUsuario]);
        
        if (equipo.length === 0) {
            return res.status(403).json({ error: 'Acceso denegado. El equipo no te pertenece.' });
        }

        // B. Insertar el nuevo jugador (USANDO TODAS LAS COLUMNAS, ya que el POST funciona)
        const query = `
            INSERT INTO jugadores (id_equipo, nombre, posicion, fecha_nacimiento) 
            VALUES (?, ?, ?, ?)
        `;
        const [result] = await req.db.query(query, [id_equipo, nombre, posicion, fecha_nacimiento]);

        res.status(201).json({ 
            message: 'Jugador creado exitosamente', 
            id: result.insertId 
        });
    } catch (error) {
        console.error('Error al crear jugador:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

module.exports = router;