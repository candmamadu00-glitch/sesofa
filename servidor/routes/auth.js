const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// --- IMPORTAÇÃO DE TODOS OS MODELOS (ESSENCIAL) ---
const User = require('../models/User');
const Financeiro = require('../models/Financeiro');
const Consultoria = require('../models/Consultoria');
const Documento = require('../models/Documento');
const Servico = require('../models/Servico');
const Solicitacao = require('../models/Solicitacao');

// Middleware de Proteção
const authMiddleware = require('../middleware/authMiddleware');

// ==========================================
// --- ROTAS PÚBLICAS ---
// ==========================================

// Cadastro (Blindado: Cria apenas Clientes)
router.post('/register', async (req, res) => {
  try {
    const { nome, email, telefone, senha } = req.body;

    const existe = await User.findOne({ email });
    if (existe) return res.status(400).json({ error: "E-mail já cadastrado." });

    const salt = await bcrypt.genSalt(10);
    const hashedSenha = await bcrypt.hash(senha, salt);

    const novoUsuario = new User({
      nome,
      email,
      telefone,
      senha: hashedSenha,
      role: 'cliente' // Força ser cliente
    });

    await novoUsuario.save();

    res.status(201).json({ msg: "Usuário criado com sucesso! Faça login." });
  } catch (err) {
    console.error("Erro no registro:", err);
    res.status(500).json({ error: "Erro no servidor ao registrar." });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "Usuário não encontrado." });

    const senhaCorreta = await bcrypt.compare(senha, user.senha);
    if (!senhaCorreta) return res.status(400).json({ error: "Senha incorreta." });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'segredo_padrao',
      { expiresIn: '1d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        nome: user.nome,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error("Erro no login:", err);
    res.status(500).json({ error: "Erro no servidor." });
  }
});

// Recuperação de senha
router.post('/forgot-password', async (req, res) => {
  const { contato } = req.body;
  try {
    const user = await User.findOne({ $or: [{ email: contato }, { telefone: contato }] });
    if (!user) return res.status(404).json({ error: "Usuário não encontrado." });

    res.json({ msg: "Se os dados estiverem corretos, entraremos em contato." });
  } catch (err) {
    res.status(500).json({ error: "Erro no servidor" });
  }
});

// ==========================================
// --- ROTAS FINANCEIRAS ---
// ==========================================

router.post('/lancamento', authMiddleware, async (req, res) => {
  try {
    const { clienteId, tipo, descricao, valor } = req.body;
    const novoLancamento = new Financeiro({
      clienteId,
      tipo,
      descricao,
      valor,
      data: new Date()
    });
    await novoLancamento.save();
    res.status(201).json({ msg: "Lançamento realizado!" });
  } catch (err) {
    res.status(500).json({ error: "Erro ao salvar lançamento" });
  }
});

router.get('/financeiro/:clienteId', authMiddleware, async (req, res) => {
  try {
    const lancamentos = await Financeiro.find({ clienteId: req.params.clienteId }).sort({ data: -1 });
    res.json(lancamentos);
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar financeiro." });
  }
});

router.delete('/financeiro/:id', authMiddleware, async (req, res) => {
  try {
    await Financeiro.findByIdAndDelete(req.params.id);
    res.json({ msg: "Lançamento removido!" });
  } catch (err) {
    res.status(500).json({ error: "Erro ao deletar." });
  }
});

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

// ==========================================
// --- ROTAS DO ADMINISTRADOR ---
// ==========================================

router.get('/clientes', authMiddleware, async (req, res) => {
  try {
    const usuarios = await User.find({ role: 'cliente' }).select('-senha');
    res.json(usuarios);
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar clientes" });
  }
});

router.get('/documentos-geral', authMiddleware, async (req, res) => {
  try {
    const documentos = await Documento.find().populate('clienteId', 'nome').sort({ dataEnvio: -1 });
    res.json(documentos);
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar documentos" });
  }
});

router.put('/documentos/:id', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    await Documento.findByIdAndUpdate(req.params.id, { status });
    res.json({ msg: "Estado do documento atualizado!" });
  } catch (err) {
    res.status(500).json({ error: "Erro ao atualizar estado" });
  }
});

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

router.get('/solicitacoes-geral', authMiddleware, async (req, res) => {
  try {
    const solicitacoes = await Solicitacao.find().populate('clienteId', 'nome').sort({ dataSolicitacao: -1 });
    res.json(solicitacoes);
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar solicitações" });
  }
});

// ==========================================
// --- ROTAS DO CLIENTE ---
// ==========================================

router.get('/minha-consultoria/:clienteId', authMiddleware, async (req, res) => {
  try {
    const dicas = await Consultoria.find({ clienteId: req.params.clienteId }).sort({ data: -1 });
    res.json(dicas);
  } catch (err) {
    res.status(500).json({ error: "Erro ao procurar orientações" });
  }
});

router.get('/meus-servicos/:clienteId', authMiddleware, async (req, res) => {
  try {
    const historico = await Servico.find({ clienteId: req.params.clienteId }).sort({ dataRealizacao: -1 });
    res.json(historico);
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar histórico" });
  }
});

router.get('/meus-documentos/:clienteId', authMiddleware, async (req, res) => {
  try {
    const docs = await Documento.find({ clienteId: req.params.clienteId }).sort({ dataEnvio: -1 });
    res.json(docs);
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar documentos." });
  }
});

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

router.delete('/documentos/:id', authMiddleware, async (req, res) => {
  try {
    await Documento.findByIdAndDelete(req.params.id);
    res.json({ msg: "Documento deletado!" });
  } catch (err) {
    res.status(500).json({ error: "Erro ao deletar documento." });
  }
});

router.delete('/clientes/:id', authMiddleware, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
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

// ==========================================
// --- NOVAS ROTAS DE GESTÃO ---
// ==========================================

router.get('/servicos-geral', authMiddleware, async (req, res) => {
  try {
    const servicos = await Servico.find().populate('clienteId', 'nome').sort({ data: -1 });
    res.json(servicos);
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar histórico de serviços" });
  }
});

router.delete('/servicos/:id', authMiddleware, async (req, res) => {
  try {
    await Servico.findByIdAndDelete(req.params.id);
    res.json({ msg: "Serviço removido do histórico!" });
  } catch (err) {
    res.status(500).json({ error: "Erro ao deletar serviço." });
  }
});

router.get('/consultorias-geral', authMiddleware, async (req, res) => {
  try {
    const consultorias = await Consultoria.find().populate('clienteId', 'nome').sort({ data: -1 });
    res.json(consultorias);
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar histórico de consultorias" });
  }
});

router.delete('/consultorias/:id', authMiddleware, async (req, res) => {
  try {
    await Consultoria.findByIdAndDelete(req.params.id);
    res.json({ msg: "Consultoria removida!" });
  } catch (err) {
    res.status(500).json({ error: "Erro ao deletar consultoria." });
  }
});

// ==========================================
// --- ROTAS DE PERFIL ---
// ==========================================

router.get('/perfil', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-senha');
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar perfil." });
  }
});

router.put('/perfil', authMiddleware, async (req, res) => {
  try {
    const { telefone, novaSenha } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) return res.status(404).json({ error: "Usuário não encontrado" });

    if (telefone) user.telefone = telefone;

    if (novaSenha && novaSenha.length >= 6) {
      const salt = await bcrypt.genSalt(10);
      user.senha = await bcrypt.hash(novaSenha, salt);
    }

    await user.save();
    res.json({ msg: "✅ Perfil atualizado com sucesso!" });
  } catch (err) {
    res.status(500).json({ error: "Erro ao atualizar perfil." });
  }
});

router.put('/admin/reset-senha/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const salt = await bcrypt.genSalt(10);
    const novaSenhaHash = await bcrypt.hash("123456", salt);
    await User.findByIdAndUpdate(id, { senha: novaSenhaHash });
    res.json({ msg: "✅ Senha resetada para '123456' com sucesso!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao resetar senha." });
  }
});

module.exports = router;