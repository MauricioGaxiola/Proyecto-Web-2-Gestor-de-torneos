// backend/index.js
// Carga las variables de entorno al inicio
require('dotenv').config();

const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors'); 
const app = express();
const port = process.env.PORT || 3000;

// Configuración de la Base de Datos
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
};

// Crear el Pool de Conexiones
let pool;
try {
    pool = mysql.createPool(dbConfig);
    console.log('Pool de conexión a MySQL creado exitosamente.');
} catch (error) {
    console.error('Error al crear el pool de conexión a MySQL:', error);
}

// =========================================================
// 1. MIDDLEWARES DE LECTURA DE DATOS (CRUCIAL)
// =========================================================

app.use(cors()); // 1. Permite la comunicación (Frontend/Backend)
app.use(express.json()); // 2. PARSEA EL JSON ENTRANTE (¡ESTA ES LA LÍNEA QUE FALTABA ARRIBA!)

// 3. MIDDLEWARE para exponer el pool (Hacemos que 'req.db' sea el pool)
app.use((req, res, next) => {
    req.db = pool; 
    next();
});

// =========================================================
// 2. IMPORTACIONES DE RUTAS
// =========================================================

// Usamos el casing que reporta tu sistema ('Routes' mayúscula)
const torneoRoutes = require('./Routes/torneos.routes');
const authRoutes = require('./Routes/auth.routes');
const equiposRoutes = require('./Routes/equipos.routes');
const partidosRoutes = require('./Routes/partidos.routes'); // <-- Asegúrate que esta línea exista
const jugadoresRoutes = require('./Routes/jugadores.routes');
// =========================================================
// 3. DEFINICIÓN DE RUTAS (Debe ir después de los middlewares)
// =========================================================

// Ruta de prueba
app.get('/api/test-db', async (req, res) => {
    try {
        const [rows] = await req.db.query('SELECT "Conexión exitosa" AS message, NOW() AS now');
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Error al conectar a la base de datos.', details: err.message });
    }
});

app.use('/api/v1/torneos', torneoRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/equipos', equiposRoutes);
app.use('/api/v1/partidos', partidosRoutes); // <-- Ruta de Partidos
app.use('/api/v1/jugadores', jugadoresRoutes);

// 4. INICIAR EL SERVIDOR
app.listen(port, () => {
    console.log(`Servidor de la API corriendo en http://localhost:${port}`);
});