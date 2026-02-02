import React from 'react';
import { MessageCircle, ArrowLeft, Lock } from 'lucide-react';

const RecuperarSenha = () => {
  // Número do Suporte (Coloquei o do Seco que estava no outro arquivo, pode mudar se quiser)
  const numeroWhatsApp = "245966793435"; 
  const mensagem = encodeURIComponent("Olá, esqueci minha senha de acesso ao SESOFA e preciso de ajuda para redefinir.");

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#f4f7f6', alignItems: 'center', justifyContent: 'center' }}>
      
      <div style={{ background: 'white', padding: '40px', borderRadius: '15px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', width: '90%', maxWidth: '450px', textAlign: 'center' }}>
        
        <div style={{ background: '#fff3cd', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto' }}>
          <Lock size={30} color="#856404" />
        </div>

        <h2 style={{ color: '#333', marginBottom: '10px' }}>Recuperação de Acesso</h2>
        
        <p style={{ color: '#666', lineHeight: '1.6', marginBottom: '30px' }}>
          Por motivos de segurança, a redefinição de senha é feita diretamente com nosso time de suporte administrativo.
        </p>

        <a 
          href={`https://wa.me/${numeroWhatsApp}?text=${mensagem}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '10px',
            background: '#25D366', 
            color: 'white', 
            padding: '15px', 
            borderRadius: '8px', 
            textDecoration: 'none', 
            fontWeight: 'bold',
            fontSize: '16px',
            marginBottom: '20px',
            transition: '0.3s'
          }}
        >
          <MessageCircle size={20} />
          Falar com Suporte no WhatsApp
        </a>

        <div style={{ borderTop: '1px solid #eee', paddingTop: '20px' }}>
          <a href="/login" style={{ color: '#666', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', fontSize: '14px' }}>
            <ArrowLeft size={16} /> Voltar para o Login
          </a>
        </div>

      </div>
    </div>
  );
};

export default RecuperarSenha;