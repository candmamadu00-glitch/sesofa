import React from 'react';
import { useNavigate } from 'react-router-dom';

const Selecao = () => {
  const navigate = useNavigate();

  // Cores fixas
  const colors = {
    green: '#009E49', // Verde Guiné
    red: '#CE1126',   // Vermelho Guiné
    yellow: '#FCD116',// Amarelo Guiné
    black: '#000000',
    white: '#FFFFFF'
  };

  // Estilo base dos cartões
  const baseCardStyle = {
    padding: '40px',
    borderRadius: '15px',
    width: '280px',
    textAlign: 'center',
    cursor: 'pointer',
    boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
    transition: 'transform 0.2s',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '200px' // Garante que fiquem do mesmo tamanho
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f4f4f4', fontFamily: 'Arial, sans-serif' }}>

      <h1 style={{ color: colors.black, marginBottom: '30px', fontSize: '2rem' }}>
        Bem-vindo ao <span style={{ color: colors.green, fontWeight: 'bold' }}>SESOFA</span>
      </h1>

      <p style={{ marginBottom: '40px', fontWeight: 'bold', color: '#555' }}>Escolha o portal de acesso:</p>

      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>

        {/* Card Cliente */}
        <div
          onClick={() => navigate('/login', { state: { portal: 'cliente' } })}
          style={{ ...baseCardStyle, background: colors.green }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <h2 style={{ color: 'white', marginBottom: '10px' }}>SOU CLIENTE</h2>
          <p style={{ color: 'white', fontSize: '14px' }}>Acesse sua contabilidade e negócios</p>
        </div>

        {/* Card Administrador */}
        <div
          onClick={() => navigate('/login', { state: { portal: 'admin' } })}
          style={{ ...baseCardStyle, background: colors.black }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <h2 style={{ color: 'white', marginBottom: '10px' }}>SOU GESTOR</h2>
          <p style={{ color: 'white', fontSize: '14px' }}>Área restrita (Dembah & Seco)</p>
        </div>

      </div>

      <div style={{ marginTop: '60px' }}>
        <p style={{ fontSize: '12px', color: '#999' }}>Sistema Seguro - Mamadu Projects © 2026</p>
      </div>

    </div>
  );
};

export default Selecao;