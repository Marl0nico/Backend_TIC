import { Router } from "express";
const router = Router();

import {
  crearComentario,
  editarComentario,
  eliminarComentario,
  obtenerComentariosPorPublicacion
} from "../controllers/comentario_controller.js";

import verificarAutenticacion from "../middlewares/autenticacion.js";

// Crear comentario
router.post("/comentario", verificarAutenticacion, crearComentario);

// Eliminar comentario
router.delete("/comentario/:id", verificarAutenticacion, eliminarComentario);

// Obtener comentarios de una publicación
router.get("/publicacion/:publicacionId", verificarAutenticacion, obtenerComentariosPorPublicacion);

//Editar comentarios

router.put("/comentario/:id", editarComentario)

export default router;
