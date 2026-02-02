import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Cadastro = () => {
  const [formData, setFormData] = useState({ nome: '', email: '', telefone: '', senha: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Chamada para o nosso servidor
      const res = await axios.post('http://localhost:5000/api/auth/register', formData);
      alert("Sucesso! " + res.data.msg);
      navigate('/'); // Redireciona para o login
    } catch (err) {
      alert("Erro ao cadastrar: " + (err.response?.data?.error || "Servidor offline"));
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--gb-red)', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ background: 'white', padding: '2rem', borderRadius: '10px', borderTop: '10px solid var(--gb-yellow)', width: '350px' }}>
        <h2 style={{ color: 'var(--gb-green)', textAlign: 'center' }}>SESOFA - Criar Conta</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input type="text" placeholder="Nome Completo" onChange={(e) => setFormData({...formData, nome: e.target.value})} style={{padding: '10px'}} required />
          <input type="email" placeholder="Seu Gmail" onChange={(e) => setFormData({...formData, email: e.target.value})} style={{padding: '10px'}} required />
          <input type="text" placeholder="Número de Celular" onChange={(e) => setFormData({...formData, telefone: e.target.value})} style={{padding: '10px'}} required />
          <input type="password" placeholder="Crie uma Senha" onChange={(e) => setFormData({...formData, senha: e.target.value})} style={{padding: '10px'}} required />
          <button type="submit" className="btn-gb">CADASTRAR</button>
        </form>
        <p style={{textAlign: 'center', marginTop: '10px'}}>Já tem conta? <a href="/">Faça Login</a></p>
      </div>
    </div>
  );
};

export default Cadastro;