const mongoose = require('mongoose');

const SolicitacaoSchema = new mongoose.Schema({
  clienteId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  servicoDesejado: { type: String, required: true },
  detalhes: { type: String },
  status: { type: String, default: 'Pendente' }, // Pendente, Em Análise, Aprovado
  dataSolicitacao: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Solicitacao', SolicitacaoSchema);