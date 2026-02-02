const mongoose = require('mongoose');

const FinanceiroSchema = new mongoose.Schema({
  clienteId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tipo: { type: String, enum: ['receita', 'despesa'], required: true },
  descricao: { type: String, required: true },
  valor: { type: Number, required: true },
  data: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Financeiro', FinanceiroSchema);