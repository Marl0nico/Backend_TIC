import mongoose, { Schema, model } from "mongoose";
import bcrypt from "bcryptjs";

const estudianteSchema = new Schema(
  {
    nombre: {
      type: String,
      required: true,
      trim: true,
    },
    usuario: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    fotoPerfil: {
      url: String,
      public_id: String,
    },
    celular: {
      type: String,
      required: true,
      trim: true,
    },
    universidad: {
      type: String,
      required: true,
      trim: true,
    },
    carrera: {
      type: String,
      required: true,
      trim: true,
    },
    bio: {
      type: String,
      trim: true,
    },
    intereses: {
      type: [String], // Lista de intereses o actividades extracurriculares
      default: [],
    },
    comunidades: [
      {
        type: Schema.Types.ObjectId, // Comunidad o grupo de estudiantes al que pertenece
        ref: "Comunidad"
      }
    ],    
    estado: {
      type: Boolean,
      default: true, // Indica si la cuenta está activa
    },
    token: {
      type: String,
      default: null,
    },
    rol: {
      type: String,
      default: "Estudiante",
    },
    confirmado: {
      type: Boolean,
      default: false, // Account not confirmed until email link is clicked
    },
    tokenConfirmacion: {
      type: String,
      default: null, // Token sent in email confirmation link
    },
    amigos: [
      {
        type: Schema.Types.ObjectId,
        ref: "Estudiante",
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Método para cifrar el password del estudiante
estudianteSchema.methods.encrypPassword = async function (password) {
  const salt = await bcrypt.genSalt(10);
  const passwordEncryp = await bcrypt.hash(password, salt);
  return passwordEncryp;
};

// Método para verificar si el password ingresado es el mismo de la BDD
estudianteSchema.methods.matchPassword = async function (password) {
  const response = await bcrypt.compare(password, this.password);
  return response;
};
estudianteSchema.methods.crearToken = function () {
  const tokenGenerado = this.token = Math.random().toString(36).slice(2);
  return tokenGenerado;
};

export default model("Estudiante", estudianteSchema);
