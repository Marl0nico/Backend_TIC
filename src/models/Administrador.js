// Importar el Schema y el modelo de mongoose
import { Schema, model } from 'mongoose';
// Importar bcrypt para cifrar las contraseñas
import bcrypt from "bcryptjs";

// Crear el Schema "atributos de la tabla de la BDD"
const administradorSchema = new Schema({
    nombre: {
        type: String,
        require: true,
        trim: true
    },
    apellido: {
        type: String,
        require: true,
        trim: true
    },
    email: {
        type: String,
        require: true,
        trim: true,
        unique: true
    },
    password: {
        type: String,
        require: true
    },
    telefono: {
      type: String,
      required: true,
      trim: true,
    },
    direccion: {
        type: String,
        required: true,
        default: ''
    },
    rol: {
        type: String,
        default: 'Administrador'
    },
    status: {
        type: Boolean,
        default: true
    },
    token: {
        type: String,
        default: null
    },
    confirmEmail: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Método para cifrar el password del administrador
administradorSchema.methods.encrypPassword = async function (password) {
    const salt = await bcrypt.genSalt(10);
    const passwordEncryp = await bcrypt.hash(password, salt);
    return passwordEncryp;
};

// Método para verificar si el password ingresado es el mismo de la BDD
administradorSchema.methods.matchPassword = async function (password) {
//   if (!password || !this.password) {
//     throw new Error('Parámetros inválidos en matchPassword');
//   }
//   return await bcrypt.compare(password, this.password);
    const response=await bcrypt.compare(password, this.password);
    return response;
};

// Método para crear un token 
administradorSchema.methods.crearToken = function () {
    const tokenGenerado = this.token = Math.random().toString(36).slice(2);
    return tokenGenerado;
};

// Crear el Modelo Administrador "Tabla BDD" en base al esquema llamado administradorSchema
// Luego exportar el modelo
export default model('Administrador', administradorSchema);