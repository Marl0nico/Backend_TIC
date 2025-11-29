// Importar JWT y los Modelos
import jwt from 'jsonwebtoken';
import Estudiante from '../models/Estudiante.js';
import Administrador from '../models/Administrador.js';

// Método para proteger rutas
const verificarAutenticacion = async (req, res, next) => {
  // Verificar si se envió el token en los headers
  if (!req.headers.authorization) {
    return res.status(401).json({ msg: "Lo sentimos, debes proporcionar un token" });
  }

  // Extraer el token de los headers
  const { authorization } = req.headers;

  try {
    // Verificar y decodificar el token
    const token = authorization.split(' ')[1]; // Extraer el token después de "Bearer"
    const { idToken, rol } = jwt.verify(token, process.env.JWT_SECRET); // Decodificar el token usando la clave secreta

    // Verificar el rol del usuario
    if (rol === "Administrador") {
      // Obtener los datos del administrador desde la base de datos
      const admin = await Administrador.findById(idToken).lean().select("-password");
      if (!admin) {
        return res.status(404).json({ msg: "Administrador no encontrado" });
      }
      req.usuario=admin;
      req.adminBDD=admin;
      req.rol=rol;
    } else if (rol === "Estudiante") {
      // Obtener los datos del estudiante desde la base de datos
      const estudiante = await Estudiante.findById(idToken).lean().select("-password");
      if (!estudiante) {
        return res.status(404).json({ msg: "Estudiante no encontrado" });
      }
      req.usuario=estudiante;
      req.rol=rol;
    } else {
      // Si el rol no es válido
      return res.status(403).json({ msg: "Rol no autorizado" });
    }

    // Continuar con el siguiente middleware o controlador
    next();
  } catch (error) {
    // Capturar errores del token y responder
    return res.status(401).json({ msg: "Formato del token no válido o ha expirado", error: error.message });
  }
};

// Exportar el middleware
export default verificarAutenticacion;