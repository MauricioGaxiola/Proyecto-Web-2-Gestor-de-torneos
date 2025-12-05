// backend/middlewares/auth.middleware.js
const jwt = require('jsonwebtoken');

// Función que verifica si el usuario es válido
const verificarToken = (req, res, next) => {
    // 1. Obtener el token del Header 'Authorization'
    // El formato esperado es: Bearer <token_aqui>
    const authHeader = req.headers['authorization'] || req.headers['x-access-token'];

    // ****** AÑADE ESTA LÍNEA TEMPORALMENTE ******
    console.log('Header de Autorización Recibido:', authHeader); 
    // **********************************************
    
    // Si no hay token en el header
    if (!authHeader) {
        return res.status(401).json({ error: 'Acceso denegado. No se proporcionó token.' });
    }

    // Dividimos el header para quedarnos solo con el token
    const token = authHeader.split(' ')[1]; 

    if (!token) {
        return res.status(401).json({ error: 'Acceso denegado. Token mal formado.' });
    }

    try {
        // 2. Verificar y decodificar el token usando la clave secreta del .env
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // 3. Adjuntar la información decodificada del usuario (id, rol, nombre) a la solicitud (req)
        req.user = decoded; 
        
        // 4. Continuar con la ruta original (el GET o POST del CRUD)
        next(); 
        
    } catch (err) {
        // Si el token expiró o es inválido
        return res.status(403).json({ error: 'Token inválido o expirado.' });
    }
};

module.exports = {
    verificarToken
};