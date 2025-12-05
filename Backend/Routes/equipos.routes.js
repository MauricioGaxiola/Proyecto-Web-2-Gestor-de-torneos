// backend/routes/equipos.routes.js
const { Router } = require('express');
const router = Router();
const { verificarToken } = require('../Middlewares/outh.middleware'); 

// 1. OBTENER TODOS LOS EQUIPOS DEL USUARIO (GET /api/v1/equipos/torneo/:idTorneo)
router.get('/torneo/:idTorneo', verificarToken, async (req, res) => {
    // Capturamos el ID del Torneo de la URL
    const idTorneo = req.params.idTorneo;
    // El ID del usuario se obtiene del token JWT
    const idUsuario = req.user.id; 

    try {
        // 🟢 CORRECCIÓN CLAVE: Agregamos el filtro E.id_torneo = ?
        const query = `
            SELECT E.* FROM Equipos E
            INNER JOIN Torneos T ON E.id_torneo = T.id_torneo
            WHERE E.id_torneo = ? AND T.id_usuario_organizador = ?
        `;
        // Pasamos idTorneo y idUsuario a la consulta
        const [rows] = await req.db.query(query, [idTorneo, idUsuario]); 
        
        res.status(200).json(rows); 
    } catch (error) {
        console.error('Error al obtener equipos:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

// 2. CREAR UN NUEVO EQUIPO (POST /api/v1/equipos)
router.post('/', verificarToken, async (req, res) => {
    // Obtenemos los datos del formulario de Angular (req.body)
    const { id_torneo, nombre, contacto_capitan, telefono_capitan, pagado } = req.body;
    // Obtenemos el ID del organizador del token JWT (seguridad)
    const idUsuario = req.user.id; 

    if (!id_torneo || !nombre || !contacto_capitan) {
        return res.status(400).json({ error: 'Faltan campos obligatorios (Torneo, Nombre, Capitán).' });
    }

    try {
        // A. Verificamos que el torneo pertenezca al usuario logueado (Seguridad)
        const [torneo] = await req.db.query('SELECT id_torneo FROM Torneos WHERE id_torneo = ? AND id_usuario_organizador = ?', [id_torneo, idUsuario]);
        
        if (torneo.length === 0) {
            return res.status(403).json({ error: 'Acceso denegado. El torneo no te pertenece.' });
        }

        // B. Insertar el nuevo equipo
        const query = `
            INSERT INTO Equipos (id_torneo, nombre, contacto_capitan, telefono_capitan, pagado)
            VALUES (?, ?, ?, ?, ?)
        `;
        const [result] = await req.db.query(query, [id_torneo, nombre, contacto_capitan, telefono_capitan, pagado]);

        res.status(201).json({ 
            message: 'Equipo creado exitosamente', 
            id: result.insertId,
            equipo: { id_equipo: result.insertId, ...req.body }
        });
    } catch (error) {
        console.error('Error al crear equipo:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

// 3. ELIMINAR UN EQUIPO (DELETE /api/v1/equipos/:idEquipo)
router.delete('/:idEquipo', verificarToken, async (req, res) => {
    const idEquipo = req.params.idEquipo;
    const idUsuario = req.user.id;

    try {
        // A. Seguridad: Verificar la propiedad antes de eliminar
        const [equipo] = await req.db.query(`
            SELECT E.id_equipo 
            FROM Equipos E 
            JOIN Torneos T ON E.id_torneo = T.id_torneo 
            WHERE E.id_equipo = ? AND T.id_usuario_organizador = ?
        `, [idEquipo, idUsuario]);
        
        if (equipo.length === 0) {
            return res.status(403).json({ error: 'Acceso denegado. El equipo no te pertenece.' });
        }

        // B. Ejecutar la eliminación
        const [result] = await req.db.query('DELETE FROM Equipos WHERE id_equipo = ?', [idEquipo]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Equipo no encontrado.' });
        }

        res.status(200).json({ message: 'Equipo eliminado con éxito.' });

    } catch (error) {
        console.error('Error al eliminar equipo:', error);
        // Error común: Falla por clave foránea si hay jugadores en el equipo
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
             return res.status(400).json({ error: 'No se puede eliminar el equipo; tiene jugadores registrados.' });
        }
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

// 4. ACTUALIZAR UN EQUIPO (PUT /api/v1/equipos/:idEquipo)
router.put('/:idEquipo', verificarToken, async (req, res) => {
    const idEquipo = req.params.idEquipo;
    const { nombre, contacto_capitan, telefono_capitan, pagado } = req.body;
    const idUsuario = req.user.id;

    try {
        // A. Seguridad: Verificar la propiedad antes de actualizar
        const [equipo] = await req.db.query(`
            SELECT E.id_equipo 
            FROM Equipos E 
            JOIN Torneos T ON E.id_torneo = T.id_torneo 
            WHERE E.id_equipo = ? AND T.id_usuario_organizador = ?
        `, [idEquipo, idUsuario]);
        
        if (equipo.length === 0) {
            return res.status(403).json({ error: 'Acceso denegado. El equipo no te pertenece.' });
        }

        // B. Ejecutar la actualización
        const updateQuery = `
            UPDATE Equipos 
            SET nombre = ?, contacto_capitan = ?, telefono_capitan = ?, pagado = ?
            WHERE id_equipo = ?
        `;
        const [result] = await req.db.query(updateQuery, [nombre, contacto_capitan, telefono_capitan, pagado, idEquipo]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Equipo no encontrado para actualizar.' });
        }

        res.status(200).json({ message: 'Equipo actualizado con éxito.' });

    } catch (error) {
        console.error('Error al actualizar equipo:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

module.exports = router;