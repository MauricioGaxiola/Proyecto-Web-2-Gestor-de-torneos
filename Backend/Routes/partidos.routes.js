// backend/routes/partidos.routes.js
const { Router } = require('express');
const router = Router();
const { verificarToken } = require('../Middlewares/outh.middleware'); 

// 1. OBTENER TODOS LOS PARTIDOS (GET /api/v1/partidos)
router.get('/', verificarToken, async (req, res) => {
    const idUsuario = req.user.id;
    
    try {
        // CORRECCIÓN: Tablas en minúsculas (partidos, equipos, torneos)
        const query = `
            SELECT 
                p.id_partido, 
                p.id_equipo_local, 
                e_local.nombre AS nombre_local,
                p.id_equipo_visitante,
                e_visitante.nombre AS nombre_visitante,
                p.fecha_hora,
                p.resultado_local, 
                p.resultado_visitante 
            FROM 
                partidos p
            JOIN 
                equipos e_local ON p.id_equipo_local = e_local.id_equipo
            JOIN 
                equipos e_visitante ON p.id_equipo_visitante = e_visitante.id_equipo
            JOIN
                torneos t ON e_local.id_torneo = t.id_torneo
            WHERE
                t.id_usuario_organizador = ?
            ORDER BY 
                p.fecha_hora DESC;
        `;
        
        const [rows] = await req.db.query(query, [idUsuario]);
        
        res.status(200).json(rows); 

    } catch (error) {
        console.error('Error al obtener partidos:', error);
        res.status(500).json({ error: 'Error interno del servidor al obtener partidos.' });
    }
});

// 2. OBTENER DETALLE DE UN PARTIDO (GET /api/v1/partidos/:id)
router.get('/:id', verificarToken, async (req, res) => {
    const idPartido = req.params.id;
    const idUsuario = req.user.id;

    try {
        // CORRECCIÓN: Tablas en minúsculas
        const query = `
            SELECT 
                p.id_partido, 
                p.id_equipo_local, 
                e_local.nombre AS nombre_local,
                p.id_equipo_visitante,
                e_visitante.nombre AS nombre_visitante,
                p.resultado_local, 
                p.resultado_visitante
            FROM 
                partidos p
            JOIN 
                equipos e_local ON p.id_equipo_local = e_local.id_equipo
            JOIN 
                equipos e_visitante ON p.id_equipo_visitante = e_visitante.id_equipo
            JOIN
                torneos t ON e_local.id_torneo = t.id_torneo
            WHERE 
                p.id_partido = ? AND t.id_usuario_organizador = ?;
        `;
        
        const [rows] = await req.db.query(query, [idPartido, idUsuario]);
        
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Partido no encontrado o no te pertenece.' });
        }
        
        res.status(200).json(rows[0]); 

    } catch (error) {
        console.error('Error al obtener detalle de partido:', error);
        res.status(500).json({ error: 'Error interno del servidor al obtener el detalle.' });
    }
});

// 3. CREAR PARTIDO (POST /api/v1/partidos)
router.post('/', verificarToken, async (req, res) => {
    const { id_equipo_local, id_equipo_visitante, fecha_hora } = req.body; 
    const idUsuario = req.user.id; 

    if (!id_equipo_local || !id_equipo_visitante || !fecha_hora) {
        return res.status(400).json({ error: 'Faltan campos obligatorios para programar el partido.' });
    }

    try {
        // CORRECCIÓN: Tablas en minúsculas
        const [equiposTorneo] = await req.db.query(
            `SELECT E.id_torneo FROM equipos E 
             INNER JOIN torneos T ON E.id_torneo = T.id_torneo 
             WHERE E.id_equipo IN (?, ?) AND T.id_usuario_organizador = ?`, 
            [id_equipo_local, id_equipo_visitante, idUsuario]
        );
        
        if (equiposTorneo.length !== 2) {
             return res.status(403).json({ error: 'Acceso denegado. Uno o ambos equipos no existen o no te pertenecen.' });
        }

        // B. Insertar el nuevo partido
        // CORRECCIÓN: Tabla en minúsculas
        const insertQuery = `
            INSERT INTO partidos 
                (id_equipo_local, id_equipo_visitante, fecha_hora) 
            VALUES 
                (?, ?, ?)
        `;
        const [result] = await req.db.query(insertQuery, [id_equipo_local, id_equipo_visitante, fecha_hora]); 

        res.status(201).json({ 
            message: 'Partido programado con éxito.', 
            id_partido: result.insertId 
        });

    } catch (error) {
        console.error('Error al programar partido (SQL):', error);

        if (error.code === 'ER_NO_REFERENCED_ROW_2') {
             return res.status(400).json({ error: 'Uno o ambos equipos seleccionados no existen.' });
        }
        
        res.status(500).json({ error: 'Error interno del servidor al programar partido.' });
    }      
});

// 4. ACTUALIZAR RESULTADO (PUT /api/v1/partidos/resultado/:idPartido)
router.put('/resultado/:idPartido', verificarToken, async (req, res) => {
    const idPartido = req.params.idPartido;
    const { resultado_local, resultado_visitante } = req.body;
    const idUsuario = req.user.id;

    if (resultado_local === undefined || resultado_visitante === undefined) {
        return res.status(400).json({ error: 'Faltan los resultados.' });
    }

    try {
        // CORRECCIÓN: Tablas en minúsculas
        const [partido] = await req.db.query(`
            SELECT p.id_partido FROM partidos p
            JOIN equipos el ON p.id_equipo_local = el.id_equipo
            JOIN torneos t ON el.id_torneo = t.id_torneo
            WHERE p.id_partido = ? AND t.id_usuario_organizador = ?
        `, [idPartido, idUsuario]);

        if (partido.length === 0) {
            return res.status(403).json({ error: 'Acceso denegado o partido no encontrado.' });
        }
        
        // B. Actualizar los resultados y marcar el partido como jugado (si es necesario)
        // CORRECCIÓN: Tabla en minúsculas
        const updateQuery = `
            UPDATE partidos 
            SET resultado_local = ?, resultado_visitante = ?
            WHERE id_partido = ?
        `;
        await req.db.query(updateQuery, [resultado_local, resultado_visitante, idPartido]);

        res.status(200).json({ message: 'Resultado registrado con éxito.' });

    } catch (error) {
        console.error('Error al actualizar resultado:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

// 5. GENERAR TABLA DE POSICIONES (GET /api/v1/partidos/tabla/:idTorneo)
router.get('/tabla/:idTorneo', verificarToken, async (req, res) => {
    const idTorneo = req.params.idTorneo;

    try {
        // CORRECCIÓN: Tablas en minúsculas (equipos, partidos)
        const query = `
            SELECT 
                E.id_equipo,
                E.nombre AS equipo_nombre,
                SUM(CASE WHEN P.id_equipo_local = E.id_equipo THEN 1 ELSE 0 END) AS PJ_Local,
                SUM(CASE WHEN P.id_equipo_visitante = E.id_equipo THEN 1 ELSE 0 END) AS PJ_Visitante,
                
                SUM(CASE 
                    WHEN P.resultado_local IS NOT NULL AND P.id_equipo_local = E.id_equipo AND P.resultado_local > P.resultado_visitante THEN 3 
                    WHEN P.resultado_visitante IS NOT NULL AND P.id_equipo_visitante = E.id_equipo AND P.resultado_visitante > P.resultado_local THEN 3
                    WHEN P.resultado_local = P.resultado_visitante AND P.resultado_local IS NOT NULL THEN 1 
                    ELSE 0 
                END) AS Pts,
                
                SUM(CASE WHEN P.id_equipo_local = E.id_equipo THEN P.resultado_local ELSE P.resultado_visitante END) AS GF,
                SUM(CASE WHEN P.id_equipo_local = E.id_equipo THEN P.resultado_visitante ELSE P.resultado_local END) AS GA
            FROM 
                equipos E
            LEFT JOIN 
                partidos P ON P.id_equipo_local = E.id_equipo OR P.id_equipo_visitante = E.id_equipo
            WHERE
                E.id_torneo = ? AND P.resultado_local IS NOT NULL 
            GROUP BY 
                E.id_equipo, E.nombre
            ORDER BY 
                Pts DESC, (GF - GA) DESC, GF DESC;
        `;
        
        const [rows] = await req.db.query(query, [idTorneo]);
        
        res.status(200).json(rows);

    } catch (error) {
        console.error('Error al obtener la tabla de posiciones:', error);
        res.status(500).json({ error: 'Error interno del servidor al obtener la tabla.' });
    }
});

// 6. OBTENER TABLA DE GOLEADORES (GET /api/v1/partidos/goleadores/:idTorneo)
router.get('/goleadores/:idTorneo', verificarToken, async (req, res) => {
    const idTorneo = req.params.idTorneo;

    try {
        // CORRECCIÓN: Tablas en minúsculas (jugadores, equipos) y estadísticas_detalle
        const query = `
            SELECT 
                J.id_jugador,
                J.nombre AS jugador_nombre,
                E.nombre AS equipo_nombre,
                COUNT(D.id_detalle) AS Goles
            FROM 
                estadisticas_detalle D 
            JOIN 
                jugadores J ON D.id_jugador = J.id_jugador
            JOIN 
                equipos E ON J.id_equipo = E.id_equipo
            WHERE 
                E.id_torneo = ? AND D.tipo_evento = 'gol'
            GROUP BY 
                J.id_jugador, J.nombre, E.nombre
            ORDER BY 
                Goles DESC;
        `;
        
        const [rows] = await req.db.query(query, [idTorneo]);
        
        res.status(200).json(rows);

    } catch (error) {
        console.error('Error al obtener goleadores:', error);
        res.status(500).json({ error: 'Error interno del servidor al obtener goleadores.' });
    }
});

module.exports = router;