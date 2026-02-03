const mongoose = require('mongoose');

const AccessLogSchema = new mongoose.Schema({
  usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  nome: String,
  email: String,
  data: { type: Date, default: Date.now },
  dispositivo: String // Ex: 'Android', 'Windows', 'iPhone'
});

module.exports = mongoose.model('AccessLog', AccessLogSchema);