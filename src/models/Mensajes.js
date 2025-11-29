import { Schema, model } from "mongoose";

const mensajeSchema = new Schema(
  {
    receptor: {
      type: Schema.Types.ObjectId,
      ref: "Estudiante",
      required: true,
    },
    emisor: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Estudiante",
    },
    texto: {
      type: String,
    },
    imagen: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export default model("Mensajes", mensajeSchema);
