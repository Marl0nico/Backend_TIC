// Middleware para verificar si el usuario es administrador
const verificarAdmin = (req, res, next) => {
  // Verificar si el usuario autenticado es administrador
  if (!req.adminBDD) {
    return res.status(403).json({ msg: "Acceso denegado: solo los administradores pueden realizar esta acción" });
  }

  // Continuar con el proceso
  next();
};

export { verificarAdmin };