import mongoose from 'mongoose';

const publicacionSchema = new mongoose.Schema({
  texto: {
    type: String,
    trim: true,
    default: ''
  },
  imagen: {
    public_id: {
      type: String,
      default: ''
    },
    url: {
      type: String,
      default: ''
    }
  },
  autor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Estudiante',
    required: true
  },
  comunidad: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comunidad',
    required: true
  },
  fechaCreacion: {
    type: Date,
    default: Date.now
  }
});

publicacionSchema.pre('validate', function (next) {
  if (!this.texto && (!this.imagen || !this.imagen.url)) {
    next(new Error('La publicación debe contener al menos texto o una imagen.'));
  } else {
    next();
  }
});

const Publicacion = mongoose.model('Publicacion', publicacionSchema);
export default Publicacion;
