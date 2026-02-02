const mongoose = require('mongoose');

const ServicoSchema = new mongoose.Schema({
  clienteId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  titulo: { type: String, required: true }, // Ex: "Consultoria Contábil Mensal"
  descricao: { type: String, required: true }, // Ex: "Fechamento de balanço e impostos"
  custo: { type: Number, required: true },
  dataRealizacao: { type: Date, default: Date.now },
  statusPagamento: { type: String, enum: ['Pendente', 'Pago'], default: 'Pendente' }
});

module.exports = mongoose.model('Servico', ServicoSchema);