import express from 'express';
import { crearPublicacion, obtenerPublicaciones, eliminarPublicacion } from '../controllers/publicacion_controller.js';
import upload from '../middlewares/multer.js';
import verificarToken from '../middlewares/verificarToken.js';

const router = express.Router();

router.post('/publicacion', verificarToken, upload.single('imagen'), crearPublicacion);
router.get('/obtener/:comunidadId', obtenerPublicaciones);
router.delete('/publicaciones/:id', verificarToken, eliminarPublicacion);

export default router;
