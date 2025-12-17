import Publicacion from '../models/Publicaciones.js';
import cloudinary from '../config/cloudinary.js';
import Estudiante from '../models/Estudiante.js';
import { io } from '../config/socket.js';

export const crearPublicacion = async (req, res) => {
  try {
    const { texto, comunidad } = req.body;
    const autor = req.usuario.idToken;

    if (!comunidad) {
      return res.status(400).json({ mensaje: 'La publicación debe estar asociada a una comunidad.' });
    }

    const estudiante = await Estudiante.findById(autor);
    const pertenece = estudiante.comunidades?.some(c => c.toString() === comunidad);

    if (!pertenece) {
      return res.status(403).json({ mensaje: 'No puedes publicar en esta comunidad.' });
    }

    let imagen = { public_id: '', url: '' };
    if (req.file) {
      const resultado = await cloudinary.uploader.upload(req.file.path, {
        folder: 'publicaciones'
      });
      imagen.public_id = resultado.public_id;
      imagen.url = resultado.secure_url;
    }

    if (!texto && !req.file) {
      return res.status(400).json({ mensaje: 'La publicación debe contener al menos texto o una imagen.' });
    }

    const nuevaPublicacion = new Publicacion({ texto, imagen, autor, comunidad });
    await nuevaPublicacion.save();

    const publicacionConAutor = await Publicacion.findById(nuevaPublicacion._id)
      .populate("autor", "usuario fotoPerfil");

    // 🔥 Emitir evento WebSocket a todos los clientes conectados en esta comunidad
    io.emit(`newPublicacion_${comunidad}`, publicacionConAutor);

    res.status(201).json(publicacionConAutor);

  } catch (error) {
    console.error('Error al crear la publicación:', error);
    res.status(500).json({
      mensaje: 'Error al crear la publicación',
      error: error.message || error.toString()
    });
  }
};

export const obtenerPublicaciones = async (req, res) => {
  try {
    const { comunidadId } = req.params; 

    const publicaciones = await Publicacion.find({ comunidad: comunidadId })
      .populate("autor", "usuario nombre fotoPerfil email")
      .sort({ fechaCreacion: -1 });

    res.status(200).json(publicaciones);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error al obtener publicaciones", error });
  }
};

export const eliminarPublicacion = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioAutenticado = req.usuario.idToken;

    // Buscar la publicación
    const publicacion = await Publicacion.findById(id);

    // Validar que exista
    if (!publicacion) {
      return res.status(404).json({ mensaje: 'Publicación no encontrada' });
    }

    // Verificar que el usuario autenticado sea el autor de la publicación
    if (publicacion.autor.toString() !== usuarioAutenticado) {
      return res.status(403).json({ mensaje: 'No estás autorizado para eliminar esta publicación' });
    }

    // Eliminar imagen de Cloudinary si existe
    if (publicacion.imagen.public_id) {
      await cloudinary.uploader.destroy(publicacion.imagen.public_id);
    }

    // Eliminar la publicación
    await Publicacion.findByIdAndDelete(id);

    // 🔥 Emitir evento WebSocket a todos los clientes conectados en esta comunidad
    io.emit(`deletePublicacion_${publicacion.comunidad}`, { publicacionId: id });

    res.status(200).json({ mensaje: 'Publicación eliminada correctamente' });

  } catch (error) {
    console.error('Error al eliminar publicación:', error);
    res.status(500).json({
      mensaje: 'Error interno al eliminar publicación',
      error: error.message || error.toString()
    });
  }
};
