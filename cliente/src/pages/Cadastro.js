import React, { useState } from 'react';
import api from '../api'; // Usando nossa configuração correta de API
import { useNavigate, Link } from 'react-router-dom';

const Cadastro = () => {
  const [formData, setFormData] = useState({ nome: '', email: '', telefone: '', senha: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Usando 'api' em vez de axios direto para funcionar na Vercel
      const res = await api.post('/auth/register', formData);
      alert("✅ Sucesso! " + res.data.msg);
      navigate('/login'); // Redireciona para o login correto
    } catch (err) {
      console.error(err);
      alert("❌ Erro ao cadastrar: " + (err.response?.data?.error || "Erro de conexão"));
    }
  };

  // Cores da Bandeira (Guiné-Bissau) fixas para garantir que apareça
  const colors = {
    red: '#CE1126',
    yellow: '#FCD116',
    green: '#009E49',
    black: '#000000',
    white: '#FFFFFF'
  };

  return (
    <div style={{ backgroundColor: colors.red, minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ background: colors.white, padding: '2rem', borderRadius: '10px', borderTop: `10px solid ${colors.yellow}`, width: '100%', maxWidth: '350px', boxShadow: '0 4px 10px rgba(0,0,0,0.3)' }}>

        <h2 style={{ color: colors.green, textAlign: 'center', marginBottom: '20px' }}>SESOFA - Criar Conta</h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>

          <input
            type="text"
            placeholder="Nome Completo"
            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
            style={{ padding: '12px', border: '1px solid #ccc', borderRadius: '5px', fontSize: '16px' }}
            required
          />

          <input
            type="email"
            placeholder="Seu Gmail"
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            style={{ padding: '12px', border: '1px solid #ccc', borderRadius: '5px', fontSize: '16px' }}
            required
          />

          <input
            type="text"
            placeholder="Número de Celular"
            onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
            style={{ padding: '12px', border: '1px solid #ccc', borderRadius: '5px', fontSize: '16px' }}
            required
          />

          <input
            type="password"
            placeholder="Crie uma Senha"
            onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
            style={{ padding: '12px', border: '1px solid #ccc', borderRadius: '5px', fontSize: '16px' }}
            required
          />

          <button
            type="submit"
            style={{ backgroundColor: colors.black, color: colors.white, padding: '15px', border: 'none', borderRadius: '5px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', transition: '0.3s' }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#333'}
            onMouseOut={(e) => e.target.style.backgroundColor = colors.black}
          >
            CADASTRAR
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', color: '#666' }}>
          Já tem conta? <Link to="/login" style={{ color: colors.green, fontWeight: 'bold', textDecoration: 'none' }}>Faça Login</Link>
        </p>

        <div style={{ textAlign: 'center', marginTop: '10px' }}>
          <Link to="/" style={{ color: '#999', fontSize: '14px', textDecoration: 'none' }}>Voltar ao Início</Link>
        </div>

      </div>
    </div>
  );
};

export default Cadastro;