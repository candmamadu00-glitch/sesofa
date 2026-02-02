const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Importação dos Modelos
const User = require('../models/User');
const Financeiro = require('../models/Financeiro');
const Consultoria = require('../models/Consultoria');
const Documento = require('../models/Documento');
const Servico = require('../models/Servico');
const Solicitacao = require('../models/Solicitacao');

// Middleware de Proteção (Verifica se está logado)
const authMiddleware = require('../middleware/authMiddleware');

// ==========================================
// --- ROTAS PÚBLICAS (Login e Cadastro) ---
// ==========================================

// Cadastro de Usuário
router.post('/register', async (req, res) => {
  try {
    const { nome, email, telefone, senha } = req.body;
    
    // Verifica se já existe
    const existe = await User.findOne({ email });
    if (existe) return res.status(400).json({ error: "E-mail já cadastrado." });

    // Criptografa a senha
    const salt = await bcrypt.genSalt(10);
    const hashedSenha = await bcrypt.hash(senha, salt);

    const novoUsuario = new User({ nome, email, telefone, senha: hashedSenha });
    await novoUsuario.save();
    
    res.status(201).json({ msg: "Usuário criado com sucesso!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body;
    
    // Busca usuário
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "E-mail não encontrado." });

    // Compara senha
    const isMatch = await bcrypt.compare(senha, user.senha);
    if (!isMatch) return res.status(400).json({ error: "Senha incorreta." });

    // Gera o Token de Acesso
    // ATENÇÃO: No .env, crie uma variável JWT_SECRET com uma senha longa e aleatória
    const secret = process.env.JWT_SECRET || "SEGREDO_PADRAO_PROVISORIO";
    
    const token = jwt.sign(
      { id: user._id, role: user.role }, 
      secret, 
      { expiresIn: '1d' }
    );

    res.json({
      token,
      user: { id: user._id, nome: user.nome, role: user.role }
    });
  } catch (err) {
    console.error("Erro no login:", err);
    res.status(500).json({ error: "Erro no servidor" });
  }
});

// Recuperação de senha (Simples)
router.post('/forgot-password', async (req, res) => {
  const { contato } = req.body;
  try {
    const user = await User.findOne({ $or: [{ email: contato }, { telefone: contato }] });
    if (!user) return res.status(404).json({ error: "Usuário não encontrado." });
    
    // Aqui futuramente você pode integrar um serviço de envio de E-mail/SMS
    res.json({ msg: "Se os dados estiverem corretos, entraremos em contato." });
  } catch (err) {
    res.status(500).json({ error: "Erro no servidor" });
  }
});

// ==========================================
// --- ROTAS DO ADMINISTRADOR (Protegidas) ---
// ==========================================

// Listar clientes
router.get('/clientes', authMiddleware, async (req, res) => {
  try {
    const usuarios = await User.find({ role: 'cliente' }).select('-senha');
    res.json(usuarios);
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar clientes" });
  }
});

// Listar todos os documentos
router.get('/documentos-geral', authMiddleware, async (req, res) => {
  try {
    const documentos = await Documento.find().populate('clienteId', 'nome').sort({ dataEnvio: -1 });
    res.json(documentos);
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar documentos" });
  }
});

// Atualizar status do documento
router.put('/documentos/:id', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    await Documento.findByIdAndUpdate(req.params.id, { status });
    res.json({ msg: "Estado do documento atualizado!" });
  } catch (err) {
    res.status(500).json({ error: "Erro ao atualizar estado" });
  }
});

// Enviar consultoria
router.post('/enviar-consultoria', authMiddleware, async (req, res) => {
  try {
    const { clienteId, titulo, mensagem } = req.body;
    const novaDica = new Consultoria({ clienteId, titulo, mensagem });
    await novaDica.save();
    res.json({ msg: "Orientação enviada com sucesso!" });
  } catch (err) {
    res.status(500).json({ error: "Erro ao enviar consultoria" });
  }
});

// Registrar serviço no histórico
router.post('/registrar-servico', authMiddleware, async (req, res) => {
  try {
    const { clienteId, titulo, descricao, custo } = req.body;
    const novoServico = new Servico({ 
      clienteId, 
      titulo, 
      descricao, 
      custo: Number(custo),
      dataRealizacao: new Date(),
      data: new Date() 
    });
    await novoServico.save();
    res.json({ msg: "✅ Serviço registrado no histórico do cliente!" });
  } catch (err) {
    res.status(500).json({ error: "Erro ao registrar serviço" });
  }
});

// Ver solicitações
router.get('/solicitacoes-geral', authMiddleware, async (req, res) => {
  try {
    const solicitacoes = await Solicitacao.find().populate('clienteId', 'nome').sort({ dataSolicitacao: -1 });
    res.json(solicitacoes);
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar solicitações" });
  }
});

// ==========================================
// --- ROTAS DO CLIENTE (Protegidas) ---
// ==========================================

// Lançamento Financeiro
router.post('/lancamento', authMiddleware, async (req, res) => {
  try {
    const { clienteId, tipo, descricao, valor } = req.body;
    const novoLancamento = new Financeiro({ clienteId, tipo, descricao, valor });
    await novoLancamento.save();
    res.status(201).json({ msg: "Lançamento realizado!" });
  } catch (err) {
    res.status(500).json({ error: "Erro ao salvar lançamento" });
  }
});

// Dashboard (Estatísticas)
router.get('/estatisticas/:clienteId', authMiddleware, async (req, res) => {
  try {
    const lancamentos = await Financeiro.find({ clienteId: req.params.clienteId });
    const receitas = lancamentos.filter(l => l.tipo === 'receita').reduce((acc, cur) => acc + cur.valor, 0);
    const despesas = lancamentos.filter(l => l.tipo === 'despesa').reduce((acc, cur) => acc + cur.valor, 0);
    
    res.json({ 
      receitas, 
      despesas, 
      saldo: receitas - despesas, 
      dadosGrafico: [{ name: 'Receitas', valor: receitas }, { name: 'Despesas', valor: despesas }] 
    });
  } catch (err) {
    res.status(500).json({ error: "Erro ao gerar estatísticas" });
  }
});

// Minhas Consultorias
router.get('/minha-consultoria/:clienteId', authMiddleware, async (req, res) => {
  try {
    const dicas = await Consultoria.find({ clienteId: req.params.clienteId }).sort({ data: -1 });
    res.json(dicas);
  } catch (err) {
    res.status(500).json({ error: "Erro ao procurar orientações" });
  }
});

// Meus Serviços
router.get('/meus-servicos/:clienteId', authMiddleware, async (req, res) => {
  try {
    const historico = await Servico.find({ clienteId: req.params.clienteId }).sort({ dataRealizacao: -1 });
    res.json(historico);
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar histórico" });
  }
});

// Meus Documentos
router.get('/meus-documentos/:clienteId', authMiddleware, async (req, res) => {
  try {
    const docs = await Documento.find({ clienteId: req.params.clienteId }).sort({ dataEnvio: -1 });
    res.json(docs);
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar documentos." });
  }
});

// Solicitar Serviço
router.post('/solicitar-servico', authMiddleware, async (req, res) => {
  try {
    const { clienteId, servicoDesejado, detalhes } = req.body;
    const novaSolicitacao = new Solicitacao({ clienteId, servicoDesejado, detalhes });
    await novaSolicitacao.save();
    res.json({ msg: "✅ Solicitação enviada!" });
  } catch (err) {
    res.status(500).json({ error: "Erro ao enviar solicitação" });
  }
});

// ==========================================
// --- ROTAS DE EXCLUSÃO (Admin) ---
// ==========================================

// Deletar Documento
router.delete('/documentos/:id', authMiddleware, async (req, res) => {
  try {
    await Documento.findByIdAndDelete(req.params.id);
    res.json({ msg: "Documento deletado!" });
  } catch (err) {
    res.status(500).json({ error: "Erro ao deletar documento." });
  }
});

// Deletar Cliente
router.delete('/clientes/:id', authMiddleware, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    // Limpa dados órfãos para não ocupar espaço no banco
    await Documento.deleteMany({ clienteId: req.params.id });
    await Financeiro.deleteMany({ clienteId: req.params.id });
    await Consultoria.deleteMany({ clienteId: req.params.id });
    await Servico.deleteMany({ clienteId: req.params.id });
    await Solicitacao.deleteMany({ clienteId: req.params.id });
    
    res.json({ msg: "Cliente e todos os seus dados removidos!" });
  } catch (err) {
    res.status(500).json({ error: "Erro ao deletar cliente." });
  }
});

module.exports = router;