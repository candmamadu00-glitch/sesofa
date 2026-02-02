const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const Documento = require('./models/Documento');
const authRoutes = require('./routes/auth');
// O User não é mais necessário aqui, pois a deleção foi para o auth.js
// const User = require('./models/User'); 

const app = express();

// 1. AUMENTO DE LIMITE (Para arquivos grandes)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// 2. SEGURANÇA CORS (Preparo para Produção)
// Permite que o frontend acesse o backend, seja local ou na nuvem
app.use(cors({
  origin: process.env.FRONTEND_URL || '*', // Em produção, trocaremos '*' pelo link do site
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'x-auth-token']
}));

// 3. CONFIGURAÇÃO DO CLOUDINARY
const cloudName = process.env.CLOUDINARY_CLOUD_NAME ? process.env.CLOUDINARY_CLOUD_NAME.trim() : "";
const apiKey = process.env.CLOUDINARY_API_KEY ? process.env.CLOUDINARY_API_KEY.trim() : "";
const apiSecret = process.env.CLOUDINARY_API_SECRET ? process.env.CLOUDINARY_API_SECRET.trim() : "";

if (!cloudName || !apiKey || !apiSecret) {
  console.error("❌ ERRO CRÍTICO: Chaves do Cloudinary faltando no .env");
} else {
  console.log("✅ Cloudinary Configurado");
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret
});

// 4. STORAGE INTELIGENTE (PDFs Raw / Imagens Image)
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const isPdf = file.mimetype === 'application/pdf';
    return {
      folder: 'sesofa_documentos',
      resource_type: isPdf ? 'raw' : 'image', 
      public_id: file.originalname.split('.')[0] + '-' + Date.now() + (isPdf ? '.pdf' : ''),
      format: isPdf ? undefined : 'png',
    };
  },
});

const uploadMiddleware = multer({ storage: storage }).single('arquivo');

// 5. ROTA DE UPLOAD (Pública/Protegida pelo Frontend)
app.post('/api/auth/upload', (req, res) => {
  uploadMiddleware(req, res, async (err) => {
    if (err) {
      console.error("❌ Erro Upload:", err);
      return res.status(500).json({ error: "Falha no envio." });
    }
    if (!req.file) return res.status(400).json({ error: "Nenhum arquivo enviado." });

    try {
      const { clienteId, tipoDoc } = req.body;
      const novoDoc = new Documento({
        clienteId,
        nomeArquivo: req.file.originalname,
        caminho: req.file.path, 
        tipoDoc: tipoDoc || 'Recibo/Fatura',
        status: 'Pendente'
      });

      await novoDoc.save();
      res.json({ msg: "✅ Documento salvo com sucesso!" });
    } catch (saveErr) {
      console.error("❌ Erro Banco:", saveErr);
      res.status(500).json({ error: "Erro ao salvar no banco." });
    }
  });
});

// 6. CONEXÃO DE ROTAS
// As rotas de login, cadastro, exclusão e busca estão todas aqui dentro:
app.use('/api/auth', authRoutes);

// 7. INICIALIZAÇÃO DO SERVIDOR
const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Conectado");
    app.listen(PORT, () => console.log(`🚀 Servidor online na porta ${PORT}`));
  })
  .catch(err => {
    console.error("❌ Erro fatal no Banco:", err);
  });