import React, { useState, useEffect } from 'react';
import { X, MessageCircle, Monitor, Smartphone, Apple } from 'lucide-react';

const ProjetoX = () => {
  const [aberto, setAberto] = useState(false);
  const [passo, setPasso] = useState('boasvindas'); 
  const [dispositivoDetectado, setDispositivoDetectado] = useState('');

  useEffect(() => {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    if (/android/i.test(userAgent)) {
      setDispositivoDetectado('android');
    } else if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
      setDispositivoDetectado('ios');
    } else {
      setDispositivoDetectado('pc');
    }
  }, []);

  const renderizarConteudo = () => {
    switch (passo) {
      case 'boasvindas':
        return (
          <>
            <p>Olá! Eu sou a <strong>Projeto X</strong>, sua assistente virtual. 🤖✨</p>
            <p>Percebi que você está usando um <strong>{dispositivoDetectado === 'pc' ? 'Computador' : dispositivoDetectado === 'ios' ? 'iPhone' : 'Android'}</strong>.</p>
            <p>Quer que eu te ensine a instalar nosso App agora?</p>
            <button style={btnStyle} onClick={() => setPasso(dispositivoDetectado)}>Sim, me ajude!</button>
            <button style={btnSecundario} onClick={() => setPasso('escolher')}>Ver para outros aparelhos</button>
          </>
        );

      case 'escolher':
        return (
          <>
            <p>Claro! Para qual dispositivo você quer as instruções?</p>
            <button style={btnOption} onClick={() => setPasso('android')}><Smartphone size={16}/> Android</button>
            <button style={btnOption} onClick={() => setPasso('ios')}><Apple size={16}/> iPhone (iOS)</button>
            <button style={btnOption} onClick={() => setPasso('pc')}><Monitor size={16}/> Computador (Windows/Mac)</button>
            <button style={btnLink} onClick={() => setPasso('boasvindas')}>Voltar</button>
          </>
        );

      case 'android':
        return (
          <>
            <h4 style={{margin: '0 0 10px', color: '#009E49'}}>Instalando no Android 🤖</h4>
            <ol style={{paddingLeft: '20px', fontSize: '14px'}}>
              <li>Toque nos <strong>3 pontinhos</strong> (menu) no topo do navegador.</li>
              <li>Procure a opção <strong>"Instalar aplicativo"</strong> ou "Adicionar à tela inicial".</li>
              <li>Confirme clicando em <strong>Instalar</strong>.</li>
            </ol>
            <p>Pronto! O ícone vai aparecer junto com seus apps.</p>
            <button style={btnStyle} onClick={() => setAberto(false)}>Entendi, obrigado!</button>
            <button style={btnLink} onClick={() => setPasso('escolher')}>Voltar</button>
          </>
        );

      case 'ios':
        return (
          <>
             <h4 style={{margin: '0 0 10px', color: '#007AFF'}}>Instalando no iPhone 🍎</h4>
             <ol style={{paddingLeft: '20px', fontSize: '14px'}}>
              <li>Toque no botão de <strong>Compartilhar</strong> (quadrado com seta pra cima).</li>
              <li>Role para baixo e toque em <strong>"Adicionar à Tela de Início"</strong>.</li>
              <li>Clique em <strong>Adicionar</strong> no topo.</li>
            </ol>
            <button style={btnStyle} onClick={() => setAberto(false)}>Entendi, obrigado!</button>
            <button style={btnLink} onClick={() => setPasso('escolher')}>Voltar</button>
          </>
        );

      case 'pc':
        return (
          <>
            <h4 style={{margin: '0 0 10px', color: '#0078D4'}}>Instalando no PC 💻</h4>
             <ol style={{paddingLeft: '20px', fontSize: '14px'}}>
              <li>Olhe para a barra de endereço (onde fica o link do site).</li>
              <li>No canto direito, clique no ícone de <strong>Computador com uma setinha</strong> (ou um sinal de +).</li>
              <li>Clique em <strong>Instalar</strong>.</li>
            </ol>
            <button style={btnStyle} onClick={() => setAberto(false)}>Vou fazer agora!</button>
            <button style={btnLink} onClick={() => setPasso('escolher')}>Voltar</button>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999, fontFamily: 'Arial, sans-serif' }}>
      {aberto && (
        <div style={salaoStyle}>
          <div style={headerStyle}>
            <span style={{fontWeight: 'bold'}}>Projeto X</span>
            <X size={18} style={{cursor: 'pointer'}} onClick={() => setAberto(false)} />
          </div>
          <div style={corpoStyle}>
            {renderizarConteudo()}
          </div>
        </div>
      )}

      <div onClick={() => setAberto(!aberto)} style={avatarContainer} className="avatar-animado">
        <img 
          src="/avatar.png" 
          onError={(e) => {e.target.style.display='none';}} 
          alt="Avatar" 
          style={{width: '100%', height: '100%', objectFit: 'cover'}} 
        />
        <MessageCircle size={30} color="white" style={{position: 'absolute', zIndex: -1}} />
        <div style={onlineStatus}></div>
      </div>
    </div>
  );
};

// ESTILOS
const salaoStyle = { marginBottom: '15px', width: '300px', backgroundColor: 'white', borderRadius: '15px', boxShadow: '0 5px 20px rgba(0,0,0,0.2)', overflow: 'hidden', animation: 'fadeIn 0.3s ease-in-out' };
const headerStyle = { backgroundColor: '#111', color: 'var(--gb-yellow, #FFD700)', padding: '12px 15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--gb-red, red)' };
const corpoStyle = { padding: '15px', color: '#333', fontSize: '15px', lineHeight: '1.5' };
const avatarContainer = { width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#111', border: '3px solid var(--gb-green, green)', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', position: 'relative', boxShadow: '0 4px 10px rgba(0,0,0,0.3)', overflow: 'hidden' };
const onlineStatus = { position: 'absolute', bottom: '2px', right: '2px', width: '12px', height: '12px', backgroundColor: '#00ff00', borderRadius: '50%', border: '2px solid white' };
const btnStyle = { width: '100%', padding: '10px', backgroundColor: '#111', color: 'var(--gb-yellow, #FFD700)', border: 'none', borderRadius: '5px', marginTop: '10px', cursor: 'pointer', fontWeight: 'bold' };
const btnSecundario = { ...btnStyle, backgroundColor: '#f0f0f0', color: '#333', marginTop: '5px' };
const btnOption = { display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '10px', background: 'white', border: '1px solid #ddd', borderRadius: '5px', marginTop: '8px', cursor: 'pointer', textAlign: 'left' };
const btnLink = { background: 'none', border: 'none', color: '#666', textDecoration: 'underline', cursor: 'pointer', fontSize: '12px', marginTop: '10px', display: 'block', width: '100%' };

export default ProjetoX;
