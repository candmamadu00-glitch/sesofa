const mongoose = require('mongoose');

const DocumentoSchema = new mongoose.Schema({
  clienteId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  nomeArquivo: { type: String, required: true },
  caminho: { type: String, required: true },
  tipoDoc: { type: String, default: 'Recibo/Fatura' }, // Ex: Imposto, Recibo, Contrato
  status: { type: String, default: 'Pendente' }, // Pendente, Lido, Arquivado
  dataEnvio: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Documento', DocumentoSchema);