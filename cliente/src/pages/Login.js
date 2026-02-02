import React, { useState } from 'react';
import api from '../api'; 
import { useNavigate, useLocation, Link } from 'react-router-dom'; // Adicionei o Link

const Login = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false); // Adicionei estado de loading
  const navigate = useNavigate();
  const location = useLocation();

  const isAdminPortal = location.state?.portal === 'admin';

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); // Ativa o loading
    try {
      const res = await api.post('/login', { email, senha });

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('userId', res.data.user.id);
      localStorage.setItem('userName', res.data.user.nome);
      localStorage.setItem('userRole', res.data.user.role);

      if (res.data.user.role === 'admin') {
        navigate('/painel-admin');
      } else {
        navigate('/painel-cliente');
      }
    } catch (err) {
      alert(err.response?.data?.error || "Falha na conexão. Verifique seus dados.");
      console.error("Erro no login:", err);
    } finally {
      setLoading(false); // Desativa o loading
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#000' }}>
       <div style={{ width: '20px', background: 'var(--gb-red)' }}></div>
       <div style={{ width: '20px', background: 'var(--gb-yellow)' }}></div>
       <div style={{ width: '20px', background: 'var(--gb-green)' }}></div>

       <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f4f4f4' }}>
          <div style={{ background: 'white', padding: '40px', borderRadius: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>
            <h1 style={{ textAlign: 'center', color: isAdminPortal ? 'var(--gb-red)' : 'var(--gb-green)' }}>
              {isAdminPortal ? 'SESOFA GESTÃO' : 'SESOFA'}
            </h1>
            <p style={{ textAlign: 'center', color: '#666' }}>
              {isAdminPortal ? 'Acesso Restrito - Administradores' : 'Contabilidade e Negócios'}
            </p>
            
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
              <input 
                type="email" 
                placeholder="Gmail Profissional" 
                onChange={(e) => setEmail(e.target.value)} 
                style={{ padding: '12px', borderRadius: '5px', border: '1px solid #ddd' }} 
                required 
              />
              <input 
                type="password" 
                placeholder="Senha" 
                onChange={(e) => setSenha(e.target.value)} 
                style={{ padding: '12px', borderRadius: '5px', border: '1px solid #ddd' }} 
                required 
              />
              <button 
                type="submit" 
                className="btn-gb" 
                disabled={loading}
                style={{ 
                  width: '100%', 
                  background: isAdminPortal ? 'var(--gb-red)' : 'var(--gb-green)',
                  cursor: loading ? 'wait' : 'pointer',
                  opacity: loading ? 0.7 : 1
                }}
              >
                {loading ? 'ENTRANDO...' : 'ENTRAR NO SISTEMA'}
              </button>
            </form>
            
            {!isAdminPortal && (
              <div style={{ marginTop: '20px', textAlign: 'center' }}>
                {/* Usando Link do react-router para ser mais rápido */}
                <Link to="/recuperar" style={{ color: 'var(--gb-red)', textDecoration: 'none', fontSize: '14px' }}>
                   Esqueceu a senha?
                </Link>
                <br />
                <span style={{ fontSize: '14px', display:'block', marginTop:'10px' }}>
                   Não tem conta? <Link to="/register" style={{ color: 'var(--gb-green)' }}>Cadastre-se aqui</Link>
                </span>
              </div>
            )}

            <div style={{ marginTop: '20px', textAlign: 'center', borderTop: '1px solid #eee', paddingTop: '15px' }}>
                <Link to="/" style={{ fontSize: '12px', color: '#999', textDecoration: 'none' }}>← Voltar para seleção de portal</Link>
            </div>
          </div>
       </div>
    </div>
  );
};

export default Login;