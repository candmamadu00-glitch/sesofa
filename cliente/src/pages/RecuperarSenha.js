import React, { useState } from 'react';
import axios from 'axios';

const RecuperarSenha = () => {
  const [contato, setContato] = useState('');
  const [mensagem, setMensagem] = useState('');

  const handleRecuperar = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/forgot-password', { contato });
      setMensagem(res.data.msg);
    } catch (err) {
      setMensagem(err.response?.data?.error || "Erro ao processar.");
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--gb-black)' }}>
      <div style={{ margin: 'auto', background: 'white', padding: '30px', borderRadius: '15px', borderTop: '8px solid var(--gb-red)', width: '90%', maxWidth: '400px' }}>
        <h2 style={{ color: 'var(--gb-red)' }}>Recuperar Senha</h2>
        <p>Insira seu Gmail ou Telefone cadastrado para receber as instruções.</p>
        <form onSubmit={handleRecuperar}>
          <input type="text" placeholder="Seu contato..." onChange={(e) => setContato(e.target.value)} required />
          <button className="btn-gb" style={{ width: '100%', marginTop: '10px' }}>Solicitar Nova Senha</button>
        </form>
        {mensagem && <p style={{ marginTop: '15px', color: 'var(--gb-green)', fontWeight: 'bold' }}>{mensagem}</p>}
        <br />
        <a href="/" style={{ color: 'gray', textDecoration: 'none' }}>← Voltar ao Login</a>
      </div>
    </div>
  );
};

export default RecuperarSenha;