import { Schema, model } from "mongoose";
// Definición del esquema para los comentarios
const comentarioSchema = new Schema({
  // Referencia a la publicación sobre la que se hace el comentario
  publicacion: {
    type: Schema.Types.ObjectId,
    ref: 'Publicacion', // Relación con el modelo Publicacion
    required: true
  },
  // Comunidad a la que pertenece el comentario (misma que la publicación)
  comunidad: {
    type: Schema.Types.ObjectId,
    ref: 'Comunidad', // Se usa para verificar si el estudiante pertenece a esta comunidad
    required: true
  },
  // Usuario (estudiante) que hizo el comentario
  usuario: {
    type: Schema.Types.ObjectId,
    ref: 'Estudiante', // Relación con el modelo Estudiante
    required: true
  },
  // Contenido del comentario (texto)
  contenido: {
    type: String,
    required: true
  },
  // Fecha de creación del comentario
  fecha_creacion: {
    type: Date,
    default: Date.now // Se asigna automáticamente la fecha actual
  }
});
// Exportar el modelo con el nombre "Comentario"
export default model("Comentario", comentarioSchema);
