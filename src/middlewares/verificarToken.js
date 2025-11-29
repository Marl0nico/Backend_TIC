import jwt from 'jsonwebtoken';

const verificarToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ mensaje: 'Acceso denegado. Token no proporcionado.' });
  }

  try {
    const secreto = process.env.JWT_SECRET || 'tu_clave_secreta';
    const payload = jwt.verify(token, secreto);
    req.usuario = payload; 
    next();
  } catch (error) {
    res.status(401).json({ mensaje: 'Token inválido.' });
  }
};

export default verificarToken;
