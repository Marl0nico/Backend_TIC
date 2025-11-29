import Estudiante from "../models/Estudiante.js";
import Message from "../models/Mensajes.js";
import fs from "fs-extra";
import path from "path";
import multer from "multer";
import cloudinary from "../config/cloudinary.js";
import { getReceiverSocketId, io } from "../config/socket.js";
import { dirname } from "path";

import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const uploadDir = path.join(__dirname, "temp_uploads");

// ✅ Crear la carpeta automáticamente si no existe
fs.ensureDirSync(uploadDir);

export const usuarioSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.usuario._id;
    const filteredUsers = await Estudiante.find(loggedInUserId).select("amigos").populate("amigos", "_id nombre usuario fotoPerfil");;

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error in getUsersForSidebar: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
export const obtenerMensajes = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.usuario._id;

    const messages = await Message.find({
      $or: [
        { emisor: myId, receptor: userToChatId },
        { emisor: userToChatId, receptor: myId },
      ],
    });

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
// Configuración de multer para manejar la carga de archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    fs.ensureDirSync(uploadDir); // Asegurar que la carpeta existe antes de guardar
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // Genera un nombre único para la imagen
  },
});
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Formato de archivo no válido. Solo se permiten imágenes (JPEG, PNG)."
      ),
      false
    );
  }
};
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Tamaño máximo: 5MB
  fileFilter,
}).single("imagen");
export const subirImagen = upload;
export const enviarMensaje = async (req, res) => {
  try {

    const { texto } = req.body;
    const { id: receptor } = req.params;
    const emisor = req.usuario._id;

    let imageUrl;
    if (req.file) {
      const uploadResponse = await cloudinary.uploader.upload(req.file.path,{
        folder: "mensajes",
          quality: "auto", 
          fetch_format: "auto",
          width: 1024,
          height: 1024, 
          crop: "limit"
      });
      imageUrl = uploadResponse.secure_url;
      await fs.remove(uploadDir);
        }

    const newMessage = new Message({
      emisor,
      receptor,
      texto,
      imagen: imageUrl,
    });

    await newMessage.save();

    const receiverSocketId = getReceiverSocketId(receptor);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    if (req.file) await fs.remove(uploadDir);
    if (error.status === 413) {
      return res.status(413).json({ error: "Payload Too Large" });
    }
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};