// backend/routes/equipos.routes.js
const { Router } = require('express');
const router = Router();
const { verificarToken } = require('../Middlewares/outh.middleware'); 

// 1. OBTENER TODOS LOS EQUIPOS DEL USUARIO (GET /api/v1/equipos/torneo/:idTorneo)
router.get('/torneo/:idTorneo', verificarToken, async (req, res) => {
    const idTorneo = req.params.idTorneo;
    const idUsuario = req.user.id; 

    try {
        //  CORRECCIÓN CLAVE (MONOLÍNEA): Eliminamos saltos de línea y tabulaciones que causan el Error 1064
        const query = "SELECT E.* FROM equipos E INNER JOIN torneos T ON E.id_torneo = T.id_torneo WHERE E.id_torneo = ? AND T.id_usuario_organizador = ?";
        
        const [rows] = await req.db.query(query, [idTorneo, idUsuario]); 
        
        res.status(200).json(rows); 
    } catch (error) {
        console.error('Error al obtener equipos:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

// 2. CREAR UN NUEVO EQUIPO (POST /api/v1/equipos)
router.post('/', verificarToken, async (req, res) => {
    const { id_torneo, nombre, contacto_capitan, telefono_capitan, pagado } = req.body;
    const idUsuario = req.user.id; 

    if (!id_torneo || !nombre || !contacto_capitan) {
        return res.status(400).json({ error: 'Faltan campos obligatorios (Torneo, Nombre, Capitán).' });
    }

    try {
        // A. Verificamos que el torneo pertenezca al usuario logueado (Seguridad)
        const [torneo] = await req.db.query('SELECT id_torneo FROM torneos WHERE id_torneo = ? AND id_usuario_organizador = ?', [id_torneo, idUsuario]); 
        
        if (torneo.length === 0) {
            return res.status(403).json({ error: 'Acceso denegado. El torneo no te pertenece.' });
        }

        // B. Insertar el nuevo equipo (Consulta en una sola línea)
        const query = "INSERT INTO equipos (id_torneo, nombre, contacto_capitan, telefono_capitan, pagado) VALUES (?, ?, ?, ?, ?)";
        
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
        // A. Seguridad: Verificar la propiedad antes de eliminar (Consulta en una sola línea)
        const [equipo] = await req.db.query("SELECT E.id_equipo FROM equipos E JOIN torneos T ON E.id_torneo = T.id_torneo WHERE E.id_equipo = ? AND T.id_usuario_organizador = ?", [idEquipo, idUsuario]);
        
        if (equipo.length === 0) {
            return res.status(403).json({ error: 'Acceso denegado. El equipo no te pertenece.' });
        }

        // B. Implementación clave: Eliminación en cascada de jugadores
        await req.db.query('DELETE FROM jugadores WHERE id_equipo = ?', [idEquipo]);
        
        // C. Ejecutar la eliminación del equipo
        const [result] = await req.db.query('DELETE FROM Equipos WHERE id_equipo = ?', [idEquipo]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Equipo no encontrado.' });
        }

        res.status(200).json({ message: 'Equipo y jugadores asociados eliminados con éxito.' });

    } catch (error) {
        console.error('Error al eliminar equipo:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

// 4. ACTUALIZAR UN EQUIPO (PUT /api/v1/equipos/:idEquipo)
router.put('/:idEquipo', verificarToken, async (req, res) => {
    const idEquipo = req.params.idEquipo;
    const { nombre, contacto_capitan, telefono_capitan, pagado } = req.body;
    const idUsuario = req.user.id;

    try {
        // A. Seguridad: Verificar la propiedad antes de actualizar (Consulta en una sola línea)
        const [equipo] = await req.db.query("SELECT E.id_equipo FROM equipos E JOIN torneos T ON E.id_torneo = T.id_torneo WHERE E.id_equipo = ? AND T.id_usuario_organizador = ?", [idEquipo, idUsuario]);
        
        if (equipo.length === 0) {
            return res.status(403).json({ error: 'Acceso denegado. El equipo no te pertenece.' });
        }

        // B. Ejecutar la actualización (Consulta en una sola línea)
        const updateQuery = "UPDATE Equipos SET nombre = ?, contacto_capitan = ?, telefono_capitan = ?, pagado = ? WHERE id_equipo = ?";
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