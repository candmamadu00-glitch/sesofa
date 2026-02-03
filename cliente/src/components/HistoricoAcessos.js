import React, { useState, useEffect } from 'react';
import api from '../api';
import { Clock, User, Calendar, Monitor, Smartphone, RefreshCw } from 'lucide-react'; // Adicionado RefreshCw

const HistoricoAcessos = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarLogs();
  }, []);

  const carregarLogs = async () => {
    setLoading(true); // Mostra carregando ao clicar
    try {
      const res = await api.get('/admin/logs');
      setLogs(res.data);
    } catch (err) {
      console.error("Erro ao carregar histórico", err);
    } finally {
      setLoading(false);
    }
  };

  const formatarData = (dataIso) => {
    const data = new Date(dataIso);
    return data.toLocaleDateString('pt-BR');
  };

  const formatarHora = (dataIso) => {
    const data = new Date(dataIso);
    return data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #009E49', paddingBottom: '10px', marginBottom: '20px' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
            <Clock size={24} color="#009E49" />
            Histórico de Acessos
        </h3>
        <button 
            onClick={carregarLogs} 
            style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#009E49', display: 'flex', alignItems: 'center', gap: '5px' }}
            title="Atualizar Lista"
        >
            <RefreshCw size={20} className={loading ? "spin" : ""} /> 
            {loading ? " Carregando..." : " Atualizar"}
        </button>
      </div>

      {loading && logs.length === 0 ? (
        <p>Carregando registros...</p>
      ) : logs.length === 0 ? (
        <p>Nenhum acesso registrado ainda.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f5f5f5', color: '#333', textAlign: 'left' }}>
                <th style={thStyle}><User size={16}/> Usuário</th>
                <th style={thStyle}>Email</th>
                <th style={thStyle}><Monitor size={16}/> Dispositivo</th>
                <th style={thStyle}><Calendar size={16}/> Data</th>
                <th style={thStyle}><Clock size={16}/> Hora</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, index) => (
                <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={tdStyle}><strong>{log.nome}</strong></td>
                  <td style={tdStyle}>{log.email}</td>
                  <td style={tdStyle}>
                    <span style={{ 
                      display: 'flex', alignItems: 'center', gap: '5px',
                      color: log.dispositivo === 'Computador' ? '#0078D4' : '#CE1126' 
                    }}>
                      {log.dispositivo === 'Computador' ? <Monitor size={14}/> : <Smartphone size={14}/>}
                      {log.dispositivo || 'Desconhecido'}
                    </span>
                  </td>
                  <td style={tdStyle}>{formatarData(log.data)}</td>
                  {/* CORREÇÃO: Mesclei os estilos aqui */}
                  <td style={{...tdStyle, color: '#666'}}>{formatarHora(log.data)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {/* Pequena animação CSS para o botão de refresh */}
      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

const thStyle = { padding: '12px', fontSize: '14px', fontWeight: 'bold', color: '#555' };
const tdStyle = { padding: '12px', fontSize: '14px', color: '#333' };

export default HistoricoAcessos;