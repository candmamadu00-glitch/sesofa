import React from 'react';
import { useNavigate } from 'react-router-dom';

const Selecao = () => {
  const navigate = useNavigate();

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f0f0f0' }}>
      <h1 style={{ color: 'var(--gb-black)', marginBottom: '30px' }}>Bem-vindo ao <span style={{color: 'var(--gb-green)'}}>SESOFA</span></h1>
      <p style={{ marginBottom: '40px', fontWeight: 'bold' }}>Escolha o portal de acesso:</p>
      
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
        {/* Card Cliente - Passa o tipo 'cliente' */}
        <div onClick={() => navigate('/login', { state: { portal: 'cliente' } })} style={cardStyle('var(--gb-green)')}>
          <h2 style={{ color: 'white' }}>PORTAL DO CLIENTE</h2>
          <p style={{ color: 'white' }}>Acesse sua contabilidade e negócios</p>
        </div>

        {/* Card Administrador - Passa o tipo 'admin' */}
        <div onClick={() => navigate('/login', { state: { portal: 'admin' } })} style={cardStyle('var(--gb-red)')}>
          <h2 style={{ color: 'white' }}>PORTAL GESTÃO</h2>
          <p style={{ color: 'white' }}>Área restrita para administradores (Dembah & Seco)</p>
        </div>
      </div>
    </div>
  );
};

const cardStyle = (color) => ({
  background: color,
  padding: '40px',
  borderRadius: '15px',
  width: '280px',
  textAlign: 'center',
  cursor: 'pointer',
  boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
  transition: '0.3s'
});

export default Selecao;