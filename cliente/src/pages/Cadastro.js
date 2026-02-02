import React, { useState } from 'react';
import api from '../api';
import { useNavigate, Link } from 'react-router-dom';

const Cadastro = () => {
  const [formData, setFormData] = useState({ nome: '', email: '', telefone: '', senha: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // CORREÇÃO AQUI: "/register" em vez de "/auth/register"
      const res = await api.post('/register', formData);
      alert("✅ Sucesso! " + res.data.msg);
      navigate('/login', { state: { portal: 'cliente' } });
    } catch (err) {
      console.error(err);
      alert("❌ Erro ao cadastrar: " + (err.response?.data?.error || "Erro de conexão"));
    }
  };

  const colors = {
    red: '#CE1126',
    yellow: '#FCD116',
    green: '#009E49',
    black: '#000000',
    white: '#FFFFFF'
  };

  return (
    <div style={{ backgroundColor: colors.red, minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ backgroundColor: colors.white, padding: '40px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.2)', maxWidth: '400px', width: '100%', textAlign: 'center', borderTop: `10px solid ${colors.green}` }}>

        <h2 style={{ color: colors.black, marginBottom: '20px' }}>Crie sua Conta SESOFA</h2>
        <p style={{ color: '#666', marginBottom: '30px', fontSize: '14px' }}>Junte-se a nós para gerenciar seus negócios com facilidade.</p>

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
            placeholder="Seu Melhor E-mail"
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            style={{ padding: '12px', border: '1px solid #ccc', borderRadius: '5px', fontSize: '16px' }}
            required
          />
          <input
            type="text"
            placeholder="Telefone / WhatsApp"
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
      </div>
    </div>
  );
};

export default Cadastro;