import React, { useState } from 'react';
import api from '../api';
import { useNavigate, useLocation, Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isAdminPortal = location.state?.portal === 'admin';

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // CORREÇÃO AQUI: Removemos o "/auth" pois o api.js já tem ele
      const res = await api.post('/login', { email, senha });
      const user = res.data.user;

      if (isAdminPortal && user.role !== 'admin') {
        alert("⛔ ACESSO NEGADO!\n\nVocê é um Cliente, não pode acessar o Painel de Gestão.\nPor favor, use o Portal do Cliente.");
        setLoading(false);
        return;
      }

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('userId', user.id);
      localStorage.setItem('userName', user.nome);
      localStorage.setItem('userRole', user.role);

      if (user.role === 'admin') {
        navigate('/painel-admin');
      } else {
        navigate('/painel-cliente');
      }

    } catch (err) {
      alert(err.response?.data?.error || "Falha na conexão. Verifique seus dados.");
      console.error("Erro no login:", err);
    } finally {
      setLoading(false);
    }
  };

  const themeColor = isAdminPortal ? '#CE1126' : '#009E49';

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#000' }}>
      <div style={{ width: '20px', background: '#CE1126' }}></div>
      <div style={{ width: '20px', background: '#FCD116' }}></div>
      <div style={{ width: '20px', background: '#009E49' }}></div>

      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f4f4f4' }}>
        <div style={{ background: 'white', padding: '40px', borderRadius: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>

          <h1 style={{ textAlign: 'center', color: themeColor }}>
            {isAdminPortal ? 'SESOFA GESTÃO' : 'SESOFA CLIENTE'}
          </h1>
          <p style={{ textAlign: 'center', color: '#666', marginBottom: '20px' }}>
            {isAdminPortal ? 'Acesso Restrito - Administradores' : 'Contabilidade e Negócios'}
          </p>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <input
              type="email"
              placeholder={isAdminPortal ? "Email Corporativo" : "Seu Email"}
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
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                background: themeColor,
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                fontWeight: 'bold',
                cursor: loading ? 'wait' : 'pointer',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? 'VERIFICANDO...' : 'ENTRAR NO SISTEMA'}
            </button>
          </form>

          {!isAdminPortal && (
            <div style={{ marginTop: '20px', textAlign: 'center' }}>
              <Link to="/recuperar" style={{ color: '#CE1126', textDecoration: 'none', fontSize: '14px' }}>
                Esqueceu a senha?
              </Link>
              <br />
              <span style={{ fontSize: '14px', display: 'block', marginTop: '10px' }}>
                Não tem conta? <Link to="/cadastro" style={{ color: '#009E49', fontWeight: 'bold' }}>Cadastre-se aqui</Link>
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