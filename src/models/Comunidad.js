import { Schema, model } from 'mongoose';

const comunidadSchema = new Schema(
  {
    nombre: {
      type: String,
      required: true,
      trim: true,
    },
    descripcion: {
      type: String,
      require: true,
      trim: true,
    },
    logo: {
        url: String,
        public_id: String,
    },
    tipo: {
      type: String,
      require: true,
      enum: ['Carrera', 'Intereses'],
    },
    carreraRelacionada: {
      type: String, // Si el tipo es "Carrera", se define la carrera
      trim: true,
      default: '',
    },
    interesesRelacionados: {
      type: [String], // Si el tipo es "Intereses", se definen los intereses
      default: [],
    },
    estudiantes: [{
      type: Schema.Types.ObjectId,
      ref: 'Estudiante', // Referencia a los estudiantes que forman parte de la comunidad
    }],
    administrador: {
      type: Schema.Types.ObjectId,
      ref: 'Administrador', // El administrador de la comunidad
    },
    estado: {
      type: Boolean,
      default: true, // Indica si la comunidad está activa o no
    },
  },
  {
    timestamps: true,
  }
);

// Crear el modelo
export default model('Comunidad', comunidadSchema);
