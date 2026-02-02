const mongoose = require('mongoose');

const ConsultoriaSchema = new mongoose.Schema({
  clienteId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  titulo: { type: String, required: true },
  mensagem: { type: String, required: true },
  data: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Consultoria', ConsultoriaSchema);