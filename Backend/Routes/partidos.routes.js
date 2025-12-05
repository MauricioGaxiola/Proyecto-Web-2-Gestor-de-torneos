// backend/routes/partidos.routes.js
const { Router } = require('express');
const router = Router();
const { verificarToken } = require('../Middlewares/outh.middleware'); 

// 1. OBTENER TODOS LOS PARTIDOS (GET /api/v1/partidos)
router.get('/', verificarToken, async (req, res) => {
    // El ID del usuario se obtiene del token JWT
    const idUsuario = req.user.id;
    // Se eliminó el console.log('Datos recibidos:', req.body) para evitar confusión en los GET.
    
    try {
        // Consulta simplificada para obtener los partidos y nombres de equipos
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
                Partidos p
            JOIN 
                Equipos e_local ON p.id_equipo_local = e_local.id_equipo
            JOIN 
                Equipos e_visitante ON p.id_equipo_visitante = e_visitante.id_equipo
            JOIN
                Torneos t ON e_local.id_torneo = t.id_torneo
            WHERE
                t.id_usuario_organizador = ?
            ORDER BY 
                p.fecha_hora DESC;
        `;
        
        // Ejecutamos la consulta filtrando por el ID del usuario organizador
        const [rows] = await req.db.query(query, [idUsuario]);
        
        res.status(200).json(rows); 

    } catch (error) {
        console.error('Error al obtener partidos:', error);
        res.status(500).json({ error: 'Error interno del servidor al obtener partidos.' });
    }
});

// backend/routes/partidos.routes.js

// 3. OBTENER DETALLE DE UN PARTIDO (GET /api/v1/partidos/:id)
router.get('/:id', verificarToken, async (req, res) => {
    const idPartido = req.params.id;
    const idUsuario = req.user.id;

    try {
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
                Partidos p
            JOIN 
                Equipos e_local ON p.id_equipo_local = e_local.id_equipo
            JOIN 
                Equipos e_visitante ON p.id_equipo_visitante = e_visitante.id_equipo
            JOIN
                Torneos t ON e_local.id_torneo = t.id_torneo
            WHERE 
                p.id_partido = ? AND t.id_usuario_organizador = ?;
        `;
        
        const [rows] = await req.db.query(query, [idPartido, idUsuario]);
        
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Partido no encontrado o no te pertenece.' });
        }
        
        res.status(200).json(rows[0]); // Devolvemos el primer (y único) resultado

    } catch (error) {
        console.error('Error al obtener detalle de partido:', error);
        res.status(500).json({ error: 'Error interno del servidor al obtener el detalle.' });
    }
});

// 2. CREAR PARTIDO (POST /api/v1/partidos) - Implementación FINAL
router.post('/', verificarToken, async (req, res) => {
    // El Frontend envía id_equipo_local, id_equipo_visitante y fecha_hora (ej: 2025-11-25 15:30)
    const { id_equipo_local, id_equipo_visitante, fecha_hora } = req.body; 
    const idUsuario = req.user.id; 

    // console.log('JSON recibido para insertar:', req.body); // Si quieres debuggear el POST

    if (!id_equipo_local || !id_equipo_visitante || !fecha_hora) {
        return res.status(400).json({ error: 'Faltan campos obligatorios para programar el partido.' });
    }

    try {
        // A. Verificamos que los equipos pertenezcan al mismo torneo y que el torneo sea del usuario (Seguridad)
        const [equiposTorneo] = await req.db.query(
            `SELECT E.id_torneo FROM Equipos E 
             INNER JOIN Torneos T ON E.id_torneo = T.id_torneo 
             WHERE E.id_equipo IN (?, ?) AND T.id_usuario_organizador = ?`, 
            [id_equipo_local, id_equipo_visitante, idUsuario]
        );
        
        // Si no se encuentran 2 equipos que pertenezcan a los torneos del usuario, hay un error
        if (equiposTorneo.length !== 2) {
             return res.status(403).json({ error: 'Acceso denegado. Uno o ambos equipos no existen o no te pertenecen.' });
        }

        // B. Insertar el nuevo partido
        // La columna fecha_hora es DATETIME, acepta el formato YYYY-MM-DD HH:MM:SS (o sin el :SS si Angular lo omite)
        const insertQuery = `
            INSERT INTO Partidos 
                (id_equipo_local, id_equipo_visitante, fecha_hora) 
            VALUES 
                (?, ?, ?)
        `;
        // Usamos req.db para acceder al pool de conexiones
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
// backend/routes/partidos.routes.js

// 3. ACTUALIZAR RESULTADO (PUT /api/v1/partidos/resultado/:idPartido)
router.put('/resultado/:idPartido', verificarToken, async (req, res) => {
    const idPartido = req.params.idPartido;
    const { resultado_local, resultado_visitante } = req.body;
    const idUsuario = req.user.id;

    if (resultado_local === undefined || resultado_visitante === undefined) {
        return res.status(400).json({ error: 'Faltan los resultados.' });
    }

    try {
        // A. Seguridad: Verificar que el partido exista y pertenezca al organizador
        const [partido] = await req.db.query(`
            SELECT p.id_partido FROM Partidos p
            JOIN Equipos el ON p.id_equipo_local = el.id_equipo
            JOIN Torneos t ON el.id_torneo = t.id_torneo
            WHERE p.id_partido = ? AND t.id_usuario_organizador = ?
        `, [idPartido, idUsuario]);

        if (partido.length === 0) {
            return res.status(403).json({ error: 'Acceso denegado o partido no encontrado.' });
        }
        
        // B. Actualizar los resultados y marcar el partido como jugado (si es necesario)
        const updateQuery = `
            UPDATE Partidos 
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

// backend/routes/partidos.routes.js

// 4. GENERAR TABLA DE POSICIONES (GET /api/v1/partidos/tabla/1)
router.get('/tabla/:idTorneo', verificarToken, async (req, res) => {
    const idTorneo = req.params.idTorneo;
    // const idUsuario = req.user.id; // Podríamos usarlo, pero lo simplificaremos para el cálculo

    try {
        // La consulta clave: Calcula Puntos, Goles a favor, Goles en contra, y Diferencia
        // Esta es una consulta avanzada que procesa la lógica del fútbol (victoria=3, empate=1)
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
                Equipos E
            LEFT JOIN 
                Partidos P ON P.id_equipo_local = E.id_equipo OR P.id_equipo_visitante = E.id_equipo
            WHERE
                E.id_torneo = ? AND P.resultado_local IS NOT NULL /* Solo partidos jugados */
            GROUP BY 
                E.id_equipo, E.nombre
            ORDER BY 
                Pts DESC, (GF - GA) DESC, GF DESC; /* Ordenar por Puntos, Diferencia de Goles, Goles a Favor */
        `;
        
        const [rows] = await req.db.query(query, [idTorneo]);
        
        res.status(200).json(rows);

    } catch (error) {
        console.error('Error al obtener la tabla de posiciones:', error);
        res.status(500).json({ error: 'Error interno del servidor al obtener la tabla.' });
    }
});

// backend/routes/partidos.routes.js

// 5. OBTENER TABLA DE GOLEADORES (GET /api/v1/partidos/goleadores/:idTorneo)
router.get('/goleadores/:idTorneo', verificarToken, async (req, res) => {
    const idTorneo = req.params.idTorneo;

    try {
        // Consultamos las estadísticas detalladas (goles) por jugador y sumamos
        const query = `
            SELECT 
                J.id_jugador,
                J.nombre AS jugador_nombre,
                E.nombre AS equipo_nombre,
                COUNT(D.id_detalle) AS Goles
            FROM 
                Estadisticas_Detalle D
            JOIN 
                Jugadores J ON D.id_jugador = J.id_jugador
            JOIN 
                Equipos E ON J.id_equipo = E.id_equipo
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