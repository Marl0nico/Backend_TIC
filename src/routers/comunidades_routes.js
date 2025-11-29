
import {Router} from 'express'
import { verificarAdmin } from '../middlewares/verificarAdmin.js';
import verificarAutenticacion from '../middlewares/autenticacion.js';
import { actualizarComunidad, crearComunidad, eliminarComunidad, obtenerComunidades, subirLogo, unirseComunidad, verComunidad } from '../controllers/comunidades_controller.js';
const router = Router()

// Ruta para crear una comunidad (solo administradores)
router.post('/comunidades', verificarAutenticacion, verificarAdmin,subirLogo, crearComunidad);

// Ruta para obtener todas las comunidades (accesible para estudiantes y administradores)
router.get('/comunidades', verificarAutenticacion, obtenerComunidades);

// Ruta para obtener una comunidad específica por ID (accesible para estudiantes y administradores)
router.get('/comunidades/:id', verificarAutenticacion, verComunidad);

// Ruta para actualizar una comunidad (solo administradores)
router.put('/comunidades/:id', verificarAutenticacion, verificarAdmin,subirLogo, actualizarComunidad);

// Ruta para eliminar una comunidad (solo administradores)
router.delete('/comunidades/:id', verificarAutenticacion, verificarAdmin, eliminarComunidad);

// Ruta para unirse a una comunidad (solo estudiantes)
router.post('/comunidades/:id/unirse', verificarAutenticacion, unirseComunidad);

export default router;