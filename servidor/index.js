const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const Documento = require('./models/Documento');
const authRoutes = require('./routes/auth');

const app = express();

// 1. AUMENTO DE LIMITE
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// 2. SEGURANÇA CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'x-auth-token']
}));

// 3. CONFIGURAÇÃO DO CLOUDINARY
const cloudName = process.env.CLOUDINARY_CLOUD_NAME ? process.env.CLOUDINARY_CLOUD_NAME.trim() : "";
const apiKey = process.env.CLOUDINARY_API_KEY ? process.env.CLOUDINARY_API_KEY.trim() : "";
const apiSecret = process.env.CLOUDINARY_API_SECRET ? process.env.CLOUDINARY_API_SECRET.trim() : "";

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret
});

// 4. STORAGE INTELIGENTE (CORRIGIDO PARA NOMES LIMPOS)
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // --- AQUI ESTÁ A CORREÇÃO MÁGICA ---
    // Removemos espaços, parênteses e acentos. Deixamos apenas letras e números.
    // Exemplo: "Fatura (1).pdf" vira "Fatura_1"
    const nomeLimpo = file.originalname.split('.')[0].replace(/[^a-zA-Z0-9]/g, '_');

    const isPdf = file.mimetype === 'application/pdf';

    return {
      folder: 'sesofa_documentos',
      resource_type: isPdf ? 'raw' : 'image', // PDFs como 'raw' evitam corrupção
      public_id: nomeLimpo + '-' + Date.now(), // Nome limpo + data para não repetir
      format: isPdf ? 'pdf' : 'png',
    };
  },
});

const uploadMiddleware = multer({ storage: storage }).single('arquivo');

// 5. ROTA DE UPLOAD
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
        nomeArquivo: req.file.originalname, // Mantemos o nome original VISUALMENTE para o usuário
        caminho: req.file.path, // Mas o link salvo será o "limpo" do Cloudinary
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

// 6. ROTAS
app.use('/api/auth', authRoutes);

// 7. INICIALIZAÇÃO
const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Conectado");
    app.listen(PORT, () => console.log(`🚀 Servidor online na porta ${PORT}`));
  })
  .catch(err => {
    console.error("❌ Erro fatal no Banco:", err);
  });