// backend/routes/jugadores.routes.js
const { Router } = require('express');
const router = Router();
// Mantenemos el casing que funciona en tu entorno:
const { verificarToken } = require('../Middlewares/outh.middleware'); 

// 1. OBTENER JUGADORES POR EQUIPO (GET /api/v1/jugadores/equipo/:idEquipo)
router.get('/equipo/:idEquipo', verificarToken, async (req, res) => {
    const idEquipo = req.params.idEquipo;
    const idUsuario = req.user.id; 

    try {
        // CORRECCIÓN FINAL: Usamos SELECT explícito y tablas en minúsculas.
        // Si el bug persiste, es que la columna id_equipo en la DB es el problema.
        const query = `
            SELECT 
                J.id_jugador, 
                J.id_equipo,
                J.nombre, 
                J.posicion, 
                J.fecha_nacimiento
            FROM jugadores J
            INNER JOIN equipos E ON J.id_equipo = E.id_equipo
            INNER JOIN torneos T ON E.id_torneo = T.id_torneo
            WHERE J.id_equipo = ? AND T.id_usuario_organizador = ?
        `;
        const [rows] = await req.db.query(query, [idEquipo, idUsuario]);
        
        res.status(200).json(rows);
    } catch (error) {
        // Logueamos el error exacto de SQL para el último diagnóstico
        console.error('Error FATAL SQL (Jugadores):', error.sqlMessage || error.message); 
        res.status(500).json({ error: 'Error interno del servidor al obtener jugadores.' });
    }
});

// 2. CREAR UN NUEVO JUGADOR (POST)
router.post('/', verificarToken, async (req, res) => {
    const { id_equipo, nombre, posicion, fecha_nacimiento } = req.body;
    const idUsuario = req.user.id;

    if (!id_equipo || !nombre) {
        return res.status(400).json({ error: 'Faltan campos obligatorios (Equipo, Nombre).' });
    }

    try {
        // A. Seguridad: Verificamos que el equipo pertenezca al usuario logueado (Seguridad)
        const [equipo] = await req.db.query(
            `SELECT E.id_equipo FROM equipos E
             INNER JOIN torneos T ON E.id_torneo = T.id_torneo
             WHERE E.id_equipo = ? AND T.id_usuario_organizador = ?`, 
            [id_equipo, idUsuario]
        );
        
        if (equipo.length === 0) {
            return res.status(403).json({ error: 'Acceso denegado. El equipo no te pertenece.' });
        }

        // B. Insertar el nuevo jugador
        const query = 'INSERT INTO jugadores (id_equipo, nombre, posicion, fecha_nacimiento) VALUES (?, ?, ?, ?)';
        const [result] = await req.db.query(query, [id_equipo, nombre, posicion, fecha_nacimiento]);

        res.status(201).json({ 
            message: 'Jugador creado exitosamente', 
            id: result.insertId,
            jugador: { id_jugador: result.insertId, ...req.body }
        });
    } catch (error) {
        console.error('Error al crear jugador:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

// 3. ELIMINAR UN JUGADOR (DELETE /api/v1/jugadores/:idJugador)
router.delete('/:idJugador', verificarToken, async (req, res) => {
    const idJugador = req.params.idJugador;
    const idUsuario = req.user.id; // Organizador

    try {
        // A. Seguridad: Verificar que el jugador pertenezca a un equipo del organizador
        const [jugador] = await req.db.query(`
            SELECT J.id_jugador
            FROM jugadores J
            JOIN equipos E ON J.id_equipo = E.id_equipo
            JOIN torneos T ON E.id_torneo = T.id_torneo
            WHERE J.id_jugador = ? AND T.id_usuario_organizador = ?
        `, [idJugador, idUsuario]);
        
        if (jugador.length === 0) {
            return res.status(403).json({ error: 'Acceso denegado. El jugador no existe o no te pertenece.' });
        }

        // B. Ejecutar la eliminación
        const [result] = await req.db.query('DELETE FROM jugadores WHERE id_jugador = ?', [idJugador]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Jugador no encontrado.' });
        }

        res.status(200).json({ message: 'Jugador eliminado con éxito.' });

    } catch (error) {
        console.error('Error al eliminar jugador:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

// 4. ACTUALIZAR UN JUGADOR (PUT)
router.put('/:idJugador', verificarToken, async (req, res) => {
    const idJugador = req.params.idJugador;
    const { nombre, posicion, fecha_nacimiento } = req.body;
    const idUsuario = req.user.id;

    try {
        // A. Seguridad: Verificar la propiedad antes de actualizar
        const [jugador] = await req.db.query(`
            SELECT J.id_jugador
            FROM jugadores J
            JOIN equipos E ON J.id_equipo = E.id_equipo
            JOIN torneos T ON E.id_torneo = T.id_torneo
            WHERE J.id_jugador = ? AND T.id_usuario_organizador = ?
        `, [idJugador, idUsuario]);
        
        if (jugador.length === 0) {
            return res.status(403).json({ error: 'Acceso denegado. El jugador no existe o no te pertenece.' });
        }

        // B. Ejecutar la actualización
        const updateQuery = `
            UPDATE jugadores 
            SET nombre = ?, posicion = ?, fecha_nacimiento = ?
            WHERE id_jugador = ?
        `;
        const [result] = await req.db.query(updateQuery, [nombre, posicion, fecha_nacimiento, idJugador]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Jugador no encontrado para actualizar.' });
        }

        res.status(200).json({ message: 'Jugador actualizado con éxito.' });

    } catch (error) {
        console.error('Error al actualizar jugador:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});


module.exports = router;