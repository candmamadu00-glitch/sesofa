const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  telefone: { type: String, required: true },
  senha: { type: String, required: true },
  role: { type: String, default: 'cliente' } // 'admin' ou 'cliente'
});

// Esta linha abaixo é a mais importante!
module.exports = mongoose.model('User', UserSchema);