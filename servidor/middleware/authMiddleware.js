const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  // Pega o token do cabeçalho
  const token = req.header('x-auth-token');

  // Se não houver token, bloqueia na hora
  if (!token) {
    return res.status(401).json({ msg: 'Acesso negado. Faça login novamente.' });
  }

  try {
    // Tenta validar usando APENAS a chave do arquivo .env
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    // Se o token for falso ou expirado
    res.status(401).json({ msg: 'Sessão inválida ou expirada.' });
  }
};