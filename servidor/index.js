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

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'x-auth-token']
}));

const cloudName = process.env.CLOUDINARY_CLOUD_NAME ? process.env.CLOUDINARY_CLOUD_NAME.trim() : "";
const apiKey = process.env.CLOUDINARY_API_KEY ? process.env.CLOUDINARY_API_KEY.trim() : "";
const apiSecret = process.env.CLOUDINARY_API_SECRET ? process.env.CLOUDINARY_API_SECRET.trim() : "";

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // --- CORREÇÃO IMPORTANTE AQUI ---
    // Remove espaços e parênteses do nome do arquivo
    const nomeLimpo = file.originalname.split('.')[0].replace(/[^a-zA-Z0-9]/g, '_');

    const isPdf = file.mimetype === 'application/pdf';

    return {
      folder: 'sesofa_documentos',
      resource_type: isPdf ? 'raw' : 'image',
      public_id: nomeLimpo + '-' + Date.now(),
      format: isPdf ? 'pdf' : 'png',
    };
  },
});

const uploadMiddleware = multer({ storage: storage }).single('arquivo');

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

app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB Conectado!');
    app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));
  })
  .catch(err => console.error('❌ Erro no MongoDB:', err));