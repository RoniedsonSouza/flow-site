const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret || !String(secret).trim()) {
    const error = new Error('JWT_SECRET não configurado');
    error.code = 'JWT_SECRET_MISSING';
    throw error;
  }
  return secret;
}

// Middleware para verificar token JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Token de acesso requerido' });
  }

  let secret;
  try {
    secret = getJwtSecret();
  } catch (error) {
    console.error('JWT_SECRET ausente');
    return res.status(500).json({ error: 'Autenticação indisponível: defina JWT_SECRET' });
  }

  jwt.verify(token, secret, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido ou expirado' });
    }
    req.user = user;
    next();
  });
};

// Gerar hash de senha
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

// Comparar senha
const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

// Gerar token JWT
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, username: user.username },
    getJwtSecret(),
    { expiresIn: '24h' }
  );
};

module.exports = {
  authenticateToken,
  hashPassword,
  comparePassword,
  generateToken
};

